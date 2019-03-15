const _ = require('lodash')
  Events = require('events');

class Local {
  constructor(options) {
    this._setAttributes(options.attributes, options.groupBy); 
    this._groupBy = options.groupBy || null;
    this._intcrimenter = 0;
    this._tupels  =  new Map();
    this._events = new Events();
    this._buckts = [[]]
  }

  _incriment() {
    if(this._intcrimenter<0) {
      throw 'Storage has been closed';
    }
    if(this._intcrimenter> 100000) {
      this._intcrimenter = 0;
    }
    this._intcrimenter++;
    return this._intcrimenter.toString(36)
  }

  _setAttributes(attributes, groupBy) {
    if(!!attributes) {
      const _group = groupBy || [];
      this._attributes = _.union(_.castArray(attributes),_.castArray(_group))
    } else {
      this._attributes = null;
    }
  }

  _currentBucket() {
    return this._buckts[0];
  }

  _getLastBucket() {
    const lastBucket = this._buckts.pop();
    if(!this._groupBy) {
     return lastBucket;
    } else {
      const self = this;
      const result = _.groupBy(lastBucket, function(obj) {
         if( _.isArray(self._groupBy)) {
          return self._groupBy.reduce((accumulator, key) => {
              if(accumulator === ""){
                return lastBucket[key];
              }
              const val = obj[key] || "na";
              return accumulator +'-'+ val;
            },"");
        } else if(!!self._groupBy) {
           const val = obj[self._groupBy] || "na";
           return val;
        }
      })
      return result;
    }
  }

  moveBucket() {
    this._buckts.unshift([]);
    this._events.emit('bucketMoved', this._getLastBucket());
  }

  add(obj) {
    try {
      const id = this._incriment();
      console.log(id)
      let viewObj;
      this._tupels.set(id, obj);

      if(!!this._attributes) {
        viewObj =  _.pick(obj, this._attributes);
      } else {
        viewObj = _.clone(obj);
      }

      viewObj['id'] = id;
      viewObj['groups'] = _.castArray(this._groupBy);
      this._currentBucket().push(viewObj);
    } catch (err) {
      this._events.emit('writeError', err)
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
      return id.map(_id => this._pop)
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
  unwind() {
    this._events.removeAllListeners();
    this._tupels.clear();
    this._intcrimenter = -1;
    this._tupels = undefined;
    this._buckets =  undefined;
  }

}

const l = new Local({
  groupBy: 'e',
  attributes: 'b'
});

l.on('writeError', err => {
  console.log('\n Oh No:', err, '\n') ;
})

l.on('bucketMoved', bucket => {
  _(bucket).values().forEach( g => g.forEach( t => console.log('\n', l.pop(t.id), '\n') ));
})

l.add({'e': 'rocket', 'b': 'bucket', 'c': 'to'})
l.add({'e': 'rocket', 'b': 'packet', 'c': 'from'})

l.moveBucket();

l.add({'e': 'rocket', 'b': 'moon', 'c': 'to'})
l.add({'e': 'bus', 'b': 'atlanta', 'c': 'from'})
l.add({'e': 'bus', 'b': 'delhi', 'c': 'from'})

l.moveBucket();
l.unwind();

l.add({'e': 'bus', 'b': 'patna', 'c': 'from'});
l.moveBucket();