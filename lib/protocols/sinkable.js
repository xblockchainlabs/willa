const BaseMixin = require('./base');

module.exports = Base => class Sinkable extends Base {
  constructor(options) {
    const _options = {
      objectMode: true
    }
    Object.assign(options, _options);
    super(options);
    if (!this._isWritable()) {
      throw Error('Sink stream should be Writable');
    }
  }
  
  _isSinkable() {
    return true;
  }
};
