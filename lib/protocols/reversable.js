const BaseMixin = require('./base');

module.exports = Base => class Reversable extends Base {
  constructor(options) {
    const _options = {
      errorStrategy: true
    }
    Object.assign(options, _options);
    super(options);
    console.log(this._isSoureceable())
    if (!this._isSoureceable()) {
      throw Error('Reversable can only applied to Sourcable streams');
    }
  }
  _isReversable() {
    return true;
  }
};
