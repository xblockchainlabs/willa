const _ = require('lodash'),
  Events = require('events'),
  maxRecordSize = 200000;

module.exports = class Inmemory {
  constructor(options) {
    this._maxBucketSize = options.number || Math.floor(maxRecordSize/2);
    if(this._maxBucketSize > maxRecordSize/2) {
      throw `Bucket size cannot be larger than ${maxRecordSize/2}`;
    }
    this._groupBy = (!!options.groupBy)? _.castArray(options.groupBy) : [];
    this._setAttributes(options.attributes, this._groupBy); 
    this._intcrimenter = 0;
    this._tupels  =  new Map();
    this._events = new Events();
    this._buckts = [[]];
  }

  _incriment() {
    if(this._intcrimenter<0) {
      throw 'Storage has been closed';
    }
    if(this._intcrimenter > maxRecordSize) {
      this._intcrimenter = 0;
    }
    this._intcrimenter++;
    return this._intcrimenter.toString(36);
  }

  _setAttributes(attributes, groupBy) {
    if(!!attributes) {
      this._attributes = _.union(_.castArray(attributes),groupBy);
    } else {
      this._attributes = null;
    }
  }

  _currentBucket() {
    return this._buckts[0];
  }

  _getLastBucket() {
    const lastBucket = this._buckts.pop();
    if(_.isEmpty(this._groupBy)) {
      return lastBucket;
    } else {
      const self = this;
      const result = _.groupBy(lastBucket, function(obj) {
        if( _.isArray(self._groupBy)) {
          return self._groupBy.reduce((accumulator, key) => {
              if(accumulator === ""){
                return obj[key];
              }
              const val = obj[key] || "na";
              return accumulator +'-'+ val;
            },"");
        }
      });
      return result;
    }
  }

  _moveBucket() {
    this._buckts.unshift([]);
    this._events.emit('next', this._getLastBucket());
  }

  next() {
    this._moveBucket();
  }

  add(obj) {
    try {
      const id = this._incriment();
      this._tupels.set(id, obj);
      this._addToBucket(id,obj.data);
    } catch (err) {
      this._events.emit('error', err)
    }
  }

  _addToBucket(id,data) {
    let viewObj;
    if(!!this._attributes) {
      viewObj = _.pick(data, this._attributes);
    } else {
      viewObj = _.clone(data);
    }

    viewObj['id'] = id;
    viewObj['groups'] = this._groupBy;
    this._currentBucket().push(viewObj);
    if(this._currentBucket().length >= this._maxBucketSize) {
      this._moveBucket();
    }
  }

  _pop(id) {
    let tuple = null;
    if(this._tupels.has(id)) {
      tuple = this._tupels.get(id);
      this._tupels.delete(id);
    }
    return tuple;
  }

  pop(id) {
    if(_.isArray(id)) {
      return id.map(_id => this._pop(_id))
    } else if(!!id) {
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
    this._tupels.clear();
    this._intcrimenter = -1;
    this._tupels = null;
    this._buckets =  null;
  }
}
