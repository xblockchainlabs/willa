module.exports = Base => class Flowable extends Base {
  constructor(_options, _fn) {
    const options = Object.assign({}, {
      allowHalfOpen: true,
      writableObjectMode: true,
      readableObjectMode: true
    }, _options);

    super(options);
    this._fn = _fn;
  }

  _isFlowable() {
    return true;
  }
};

