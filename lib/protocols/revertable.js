const _ = require('lodash');

module.exports = Base => class Revertable extends Base {
  constructor(options) {
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
    switch (strategy) {
      case 'reset':
        return this._isResetable()
        break;
      case 'uncommit':
        return this._isUncommitable()
        break;
      case 'report':
        return this._isReportable()
        break;
      default:
        return false;
        break;
    }
  }

  _revertMethod(strategy) {
    switch (strategy) {
      case 'reset':
        return this.reset
        break;
      case 'uncommit':
        return this.uncommit
        break;
      case 'report':
      default:
        return this.report
        break;
    }
  }
};
