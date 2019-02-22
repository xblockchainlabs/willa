module.exports = Base => class Reportable extends Base {
  constructor(options) {
    super(options);
    if (!this._isRevertable()) {
      throw Error('Reportable can only applied to Revertable streams');
    }

    this._report =  options._report;
  }

  _isReportable() {
    return true;
  }

  report(...params) {
    if(!this._report){
      let klass = this.constructor.name;
      process.emitWarning('Report method required', {
        detail: `${klass} doesn't implemented _report() method.`
      });
      return;
    }
    return this._report(...params)
  }
};
