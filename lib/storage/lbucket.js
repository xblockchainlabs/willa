const level = require('level');
const path = require('path');
const leveDBoptions = {
  keyEncoding: 'binary',
  valueEncoding: 'json'
};
const Collection = require('./collection');
const getDbPath = (id, ppath) => path.join(ppath, id);
const fs = require('fs-extra');

const $_terminated = Symbol.for("terminated");
const iterable = async function* iterable(it) {
  while (true) {
    const next = await new Promise((r, x) => {
      it.next(function (err, key, value) {
        if (arguments.length === 0) r(undefined);
        if (err === null && key === undefined && value === undefined) r(undefined);
        if (err) x(err);
        r({ key: key, value: value });
      });
    });
    if (next === undefined) { break; }
    if ((yield next) === $_terminated) {
      await new Promise((r, x) => it.end((e) => (e ? x(x) : r())));
      return;
    }
  }
}

module.exports = class LBucket {
  constructor({ bucktId, groups, path }) {
    this._path = path;
    this.bucktId = bucktId;
    this.groups = groups || [];
    this.mbckt = level(getDbPath(bucktId, this._path), leveDBoptions);
    this._bucktsRefs = new Map();
  }

  destroy() {
    this._bucktsRefs.forEach((v, k) => {
      fs.remove(getDbPath(`${this.bucktId}!!${k}`, this._path), (err) => {
        if (err)
          console.log(`Error Deleting ref bucket ${this.bucktId}!!${k} : ${err}`);
      });
    });
    fs.remove(getDbPath(`${this.bucktId}`, this._path), (err) => {
      if (err)
        console.log(`Error Deleting ref bucket ${this.bucktId}!!${k} : ${err}`);
    });
  }

  _getBucketName(groups, value) {
    return groups.reduce((accumulator, key) => {
      if (accumulator === "") {
        return value[key];
      }
      const val = value[key] || "na";
      return accumulator + '-' + val;
    }, "");
  }

  _crtGrpBckt(bcktName) {
    let ref;
    this.mbckt.put(bcktName, `${this.bucktId}!!${bcktName}`);
    ref = level(getDbPath(`${this.bucktId}!!${bcktName}`, this._path), leveDBoptions);
    this._bucktsRefs.set(bcktName, ref);
    return ref;
  }

  add(obj) {
    let grpBcktRef;
    const grpBcktName = this._getBucketName(obj.groups, obj);
    if (!this._bucktsRefs.has(grpBcktName)) {
      grpBcktRef = this._crtGrpBckt(grpBcktName);
    }
    grpBcktRef = this._bucktsRefs.get(grpBcktName);
    return grpBcktRef.put(obj.id, obj);
  }

  _map(name, db, fnc) {
    let result = { argdata: null, ids: [], groupedBy: {} };
    let resultbckt = level(getDbPath(`${this.bucktId}${name}!!results`, this._path), leveDBoptions);
    let self = this;
    return new Promise((rsv, rjt) => {
      const itr = db.iterator()
      let next = () => {
        itr.next(async (err, key, value) => {
          if (err || key === undefined || value === undefined) {
            return itr.end(function (err2) {
              result.argdata = new Collection(iterable(resultbckt.iterator()));
              self.destroy();
              rsv(result);
            })
          }
          result.ids.push(value.id);
          await resultbckt.put(value.id, fnc(value));
          if (this.groups.length > 0) {
            this.groups.forEach(key => {
              result.groupedBy[key] = value[key]
            });
          }
          next();
        })
      }
      next();
    })
  }

  map(fnc) {
    return new Promise((rsv, rjt) => {
      var grpBcktsRefs = this._bucktsRefs[Symbol.iterator]();
      let result = [];
      for (let [key, value] of grpBcktsRefs) {
        result.push(this._map(key, value, fnc));
      }
      Promise.all(result)
        .then(r => {
          rsv(r);
        })
        .catch(e => {
          console.log(e);
        })

    })
  }

  _reduce(db, fnc, aggrigator) {
    let result = { argdata: null, ids: [], groupedBy: {} };
    let self = this;
    return new Promise((rsv, rjt) => {
      const itr = db.iterator()
      let next = () => {
        itr.next(async (err, key, value) => {
          if (err || key === undefined || value === undefined) {
            return itr.end(function (err2) {
              self.destroy();
              result.argdata = aggrigator;
              rsv(result);
            })
          }
          result.ids.push(value.id);
          fnc(aggrigator, value);
          if (this.groups.length > 0) {
            this.groups.forEach(key => {
              result.groupedBy[key] = value[key]
            });
          }
          next();
        })
      }
      next();
    })
  }

  reduce(fnc, aggrigator) {
    return new Promise((rsv, rjt) => {
      var grpBcktsRefs = this._bucktsRefs[Symbol.iterator]();
      let result = [];
      for (let [key, value] of grpBcktsRefs) {
        result.push(this._reduce(value, fnc, _.clone(aggrigator)));
      }
      Promise.all(result)
        .then(r => {
          rsv(r);
        })
        .catch(e => {
          console.log(e);
        })

    })
  }
}
