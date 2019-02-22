module.exports = Base => class Resetable extends Base {
  constructor(options) {
    super(options);
    if (!this._isRevertable()) {
      throw Error('Resetable can only applied to Revertable streams');
    }

    this._reset =  options._reset;
  }
  _isResetable() {
    return true;
  }

  reset(...params) {
    if(!this._reset){
      let klass = this.constructor.name;
      process.emitWarning('Reset method required', {
        detail: `${klass} doesn't implemented _reset() method.`
      });
      return;
    }
    return this._reset(...params);
  }
};