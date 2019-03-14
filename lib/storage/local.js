const _= require('lodash');

class Local {
  constructor(options) {
    this._setAttributes(options.attributes, options.groupBy); 
    this._groupBy = options.groupBy || null;
    this._collection = []
  }

  _setAttributes(attributes, groupBy) {
    if(!!attributes) {
      const _group = groupBy || [];
      this._attributes = _.union(_.castArray(attributes),_.castArray(_group))
    } else {
      this._attributes = null;
    }
  }

  add(obj) {
    if(!!this._attributes) {
      console.log('Trying to push', _.pick(obj, this._attributes))
      this._collection.push(_.pick(obj, this._attributes));
    } else {
      console.log('Trying to push', obj)
      this._collection.push(obj);
    }
  }

  get() {
    if(!this._groupBy) {
     return this._collection;
    } else {
      const self = this;
      const result = _.groupBy(this._collection, function(obj) {
         if( _.isArray(self._groupBy)) {
          return self._groupBy.reduce((accumulator, key) => {
              if(accumulator === ""){
                return self._collection[key];
              }
              const val = obj[key] || "na";
              return accumulator +'-'+ val;
            },"");
        } else if(!!self._groupBy) {
          console.log(obj);
           const val = obj[self._groupBy] || "na";
           return val;
        }
      })
      return result;
    }
    
  }
}

const l = new Local({
  groupBy: 'e',
  attributes: 'b'
});

l.add({'e': 'rocket', 'b': 'bucket', 'c': 'to'})
l.add({'e': 'rocket', 'b': 'packet', 'c': 'from'})

console.log(JSON.stringify(l.get()))