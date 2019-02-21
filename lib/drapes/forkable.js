const { Duplex } = require('stream');

module.exports = Base => class Forkable extends Base {
  constructor(options) {
    super(options);
    this.downStreams = [];
    if (typeof this._isStream !== 'function') {
      throw Error('Margble stream should implement BaseProtocol');
    } else if (!this._isDuplex()) {
      throw Error('Margble stream should be Duplex');
    }
  }

  fork() {
    return this._fork();
  }

  _fork() {
    let forked = new Duplex({
      objectMode: true,
      allowHalfOpen: false,
      write(data, encoding, callback) {
        this.push(data);
        callback(null, data);
      },
      read() { }
    });
    this.downStreams.push(forked);
    this.pipe(forked);
    //forked.pause();
    return forked;
  }

}