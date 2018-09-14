
const stream = require('stream');

module.exports = Base => class BaseProtocol extends Base {
  constructor (options) {
    super(options);
    if (new.target === BaseProtocol) {
      throw new Error("Cannot construct Base Drape instances directly");
    }
    if(!this._isStream()) {
      throw Error('Base protocol can only extend stream.Stream class');
    } 
  }

  _isStream () {
    return this instanceof stream.Stream;
  }

  _isReadable () {
    return typeof this._read === 'function' && typeof this._readableState === 'object';
  }

  _isWritable () {
    return typeof this._write === 'function' && typeof this._writableState === 'object';
  }

  _isDuplex () {
    return this._isReadable() && this._isWritable();
  }

  _isTransform () {
    return this._isDuplex() && this._transform === 'function';
  }

  _isMergable () {
    return this._merge === 'function';
  }

  _isForkable () {
    return this._fork === 'function';
  }

  _isParallel () {
    return this._parallelize === 'function';
  }

  _isFlowable () {
    return false;
  }

  _isSoureceable () {
    return false;
  }

  _isSinkable () {
    return false;
  }
}