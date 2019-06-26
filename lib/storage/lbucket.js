const level = require('level');
const path = require('path');
const leveDBoptions = {
  keyEncoding: 'binary',
  valueEncoding: 'json'
};
const Collection = require('./collection');
const getDbPath = paths => path.join(__dirname, paths);

module.exports = class LBucket {
  constructor({ bucktId, groups }) {
    this.bucktId = bucktId;
    this.groups = groups || [];
    this.mbckt = level(getDbPath(bucktId), leveDBoptions);
    this.resultbckt = level(getDbPath(`${bucktId}!!results`), leveDBoptions);
    this._bucktsRefs = new Map();
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
    ref = level(getDbPath(`${this.bucktId}!!${bcktName}`), leveDBoptions);
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
    let resultbckt = level(getDbPath(`${this.bucktId}${name}!!results`), leveDBoptions);
    return new Promise((rsv, rjt) => {
      const itr = db.iterator()
      let next = () => {
        itr.next(async(err, key, value) => {
          if (err || key === undefined || value === undefined) {
            return itr.end(function (err2) {
              result.argdata = new Collection(resultbckt.iterator());
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

  reduce(fnc, aggrigator) {
    return new Promise((rsv, rjt) => {
      const itr = this.db.iterator()
      let next = () => {
        itr.next((err, key, value) => {
          if (err || key === undefined || value === undefined) {
            return itr.end(function (err2) {
              rsv(aggrigator);
            })
          }
          fnc(value, aggrigator)
          next();
        })
      }
      next();
    })
  }
}
