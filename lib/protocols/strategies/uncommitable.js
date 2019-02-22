module.exports = Base => class Uncommitable extends Base {
  constructor(options) {
    super(options);
    if (!this._isRevertable()) {
      throw Error('Uncommitable can only applied to Revertable streams');
    }
    this._uncommit =  options._uncommit;
  }

  _isUncommitable() {
    return true;
  }

  uncommit(...params) {
    if(!this._uncommit){
      let klass = this.constructor.name;
      process.emitWarning('Uncommit method required', {
        detail: `${klass} doesn't implemented _uncommit() method.`
      });
      return;
    }
    return this._uncommit(...params);
  }
};