const BaseMixin = require('./base');

module.exports = Base => class Flowable extends BaseMixin(Base) {
  constructor(_options, _fn){
    const options = Object.assign({}, {
        allowHalfOpen: true,
        writableObjectMode: true,
        readableObjectMode: true
      }, _options);
    
    super(options);
    if(!this._isDuplex()) {
      throw Error('Flow stream should be Duplex');
    }

    this._fn= _fn;
  }

  _isFlotable() {
    return true;
  }
};

