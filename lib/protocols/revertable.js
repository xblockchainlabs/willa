const _ = require('lodash');

module.exports = Base => class Revertable extends Base {
  constructor(options = {}) {
    super(options);
    if (!this._validateStrategy(options.errorStrategy)) {
      throw Error('Error Strategy implementation not found');
    }
    this._revert = this._revertMethod(options.errorStrategy);
    if (!this._isSoureceable()) {
      throw Error('Revertable can only applied to Sourcable streams');
    }
  }

  _isRevertable() {
    return true;
  }

  _isReportable() {
    return false;
  }

  _isResetable() {
    return false;
  }

  _isUncommitable() {
    return false;
  }

  _validateStrategy(strategy) {
    let isvalid;
    switch (strategy) {
      case 'reset':
        isvalid = this._isResetable()
        break;
      case 'uncommit':
        isvalid = this._isUncommitable()
        break;
      case 'report':
        isvalid = this._isReportable()
        break;
      default:
        isvalid = false;
        break;
    }
    return isvalid;
  }

  _revertMethod(strategy) {
    let revertStrategy;
    switch (strategy) {
      case 'reset':
        revertStrategy = this.reset;
        break;
      case 'uncommit':
        revertStrategy = this.uncommit;
        break;
      case 'report':
      default:
        revertStrategy = this.report
        break;
    }
    return revertStrategy;
  }
};
