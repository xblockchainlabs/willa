class Mixin{  
  constructor(baseClass) {
    this.baseClass = baseClass;
  }

  with(...mixins) { 
    return mixins.reduce((reducer, mixin) => mixin(reducer), 
                          this.baseClass);
  }
}

module.exports = (baseClass) => new Mixin(baseClass);