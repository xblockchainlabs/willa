const _ = require('lodash'),
  Events = require('events'),
  maxRecordSize = 200000;

const level = require('level');
const path = require('path');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'willadb');
const leveDBoptions = {
  keyEncoding: 'binary',
  valueEncoding: 'json'
};
const cuid = require('cuid');
const db = level(dbPath, leveDBoptions);

const LBucket = require("./lbucket");

module.exports = class LevelDb {
  constructor(options) {
    this._maxBucketSize = options.number || Math.floor(maxRecordSize / 2);
    this._timeout = options.timeout;
    this._timerRef;
    this._active = true;
    this._error = null;
    if (this._maxBucketSize > maxRecordSize / 2) {
      throw `Bucket size cannot be larger than ${maxRecordSize / 2}`;
    }
    this._groupBy = (!!options.groupBy) ? _.castArray(options.groupBy) : [];
    this._setAttributes(options.attributes, this._groupBy);
    this._intcrimenter = 0;
    this._events = new Events();
    this._bucktsRefs = new Map();
    this._bucktsCount = new Map();
    let newbuckt = cuid();
    db.put('_buckts', { ids: [newbuckt] });
    this._bucktsRefs.set(newbuckt, new LBucket({ bucktId: newbuckt, groups: this._groupBy }));
    this._bucktsCount.set(newbuckt, 0);
    this._setTimer();
  }

  _setTimer() {
    if (!!this._timeout) {
      this._timerRef = this._timer();
    }
  }

  _timer() {
    return setTimeout(() => {
      this._currentBucket()
        .then(r => {
          if (this._bucktsCount.get(r) > 0) {
            this.next();
          }
          clearTimeout(this._timerRef);
          this._setTimer();
        })
    }, this._timeout);
  }

  _incriment() {
    if (this._intcrimenter < 0) {
      throw 'Storage has been closed';
    }
    if (this._intcrimenter > maxRecordSize) {
      this._intcrimenter = 0;
    }
    this._intcrimenter++;
    return this._intcrimenter.toString(36);
  }

  _setAttributes(attributes, groupBy) {
    if (!!attributes) {
      this._attributes = _.union(_.castArray(attributes), groupBy);
    } else {
      this._attributes = null;
    }
  }

  _currentBucket() {
    return db.get('_buckts')
      .then(buckts => buckts.ids[0])
      .catch(err => console.log(err));
  }

  _getLastBucket() {
    let bckt;
    return db.get('_buckts')
      .then(buckts => {
        bckt = buckts.ids.pop();
        return buckts;
      })
      .then(buckts => db.put('_buckts', buckts))
      .then(() => bckt)
      .catch(err => console.log(err));
  }

  _flushBucket(error) {
    this._active = false;
    this._error = error;
    clearTimeout(this._timerRef);
    this._getLastBucket()
      .then(bckt => {
        this._events.emit('next', this._bucktsRefs.get(bckt));
      })
  }

  _moveBucket() {
    let bucktId = cuid();
    db.get('_buckts')
      .then(buckts => {
        buckts.ids.unshift(bucktId);
        return db.put('_buckts', buckts);
      })
      .then(() => {
        this._bucktsRefs.set(bucktId, new LBucket({ bucktId }));
        this._bucktsCount.set(bucktId, 0);
      })
    this._getLastBucket()
      .then(bckt => {
        this._events.emit('next', this._bucktsRefs.get(bckt));
      })

  }

  next() {
    this._moveBucket();
  }

  add(obj) {
    if (_.isError(obj.error) && this._active) {
      this._flushBucket(obj.error);
    } else if (!this._active) {
      console.error(`can't store store inactive`);
    } else {
      try {
        const id = this._incriment();
        db.put(id, obj);
        this._addToBucket(id, obj.data); // promise bnana hai kya
      } catch (err) {
        this._flushBucket(error);
      }
    }
  }

  _addToBucket(id, data) {
    let viewObj;
    let moveBucket;
    let bucktRefs;
    let bucktId;
    if (!!this._attributes) {
      viewObj = _.pick(data, this._attributes);
    } else {
      viewObj = _.clone(data);
    }
    viewObj['id'] = id;
    viewObj['groups'] = this._groupBy;
    this._currentBucket()
      .then(buckt => {
        bucktId = buckt;
        let count = this._bucktsCount.get(buckt);
        count = count + 1;
        this._bucktsCount.set(buckt, count);
        if (count >= this._maxBucketSize) {
          moveBucket = true;
        }
        bucktRefs = this._bucktsRefs.get(buckt);
        return bucktRefs.add(viewObj);
      })
      .then(() => {
        if (moveBucket) {
          this._moveBucket();
        }
      })
  }

  _pop(id) {
    let tuple = null;
    db.get(id)
      .then(t => {
        tuple = t;
        return
      })
      .then(() => db.del(id))
      .then(() => {
        return tuple;
      })
      .catch(err => console.log(err));
  }

  pop(id) {
    if (_.isArray(id)) {
      return id.map(_id => this._pop(_id))
    } else if (!!id) {
      return this._pop(id)
    }
    return null;
  }

  //events
  on(name, fnc) {
    this._events.on(name, fnc);
  }

  //unwind
  _unwind() {
    this._events.emit('closing');
    this._events.removeAllListeners();
    this._intcrimenter = -1;
    // level.desto
  }
}
