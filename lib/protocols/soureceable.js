const BaseMixin = require('./base');

module.exports = Base => class Soureceable extends Base {
  constructor(options) {
    const _options = {
      objectMode: true
    }
    Object.assign(options, _options);
    super(options);
    if (!this._isReadable()) {
      throw Error('Source stream should be Readable');
    }
  }

  _isSoureceable() {
    return true;
  }
};
