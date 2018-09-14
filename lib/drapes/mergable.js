module.exports = Base => class Mergable extends Base {
  constructor(options) {
    super(options);
    this.upStreams = [];
    if(typeof this._isStream !== 'function') {
      throw Error('Margble stream should implement BaseProtocol');
    } else if(!this._isWritable()) {
      throw Error('Margble stream should be Writable');
    }
  }

  addUpstrem(stream) {
    stream.pipe(this);
    this.upStreams.push(stream);
  }
}
