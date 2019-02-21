const { ConsumerGroupStream } = require('kafka-node'),
  { Duplex } = require('stream'),
  { Builder } = require('../../builder'),
  Case = require('case'),
  $ = require('steeltoe');


class Consumer extends Builder.Source {
  constructor(options) {
    super(Duplex);
    this._name = $(options)('name')();
    if (this._name === undefined) {
      throw Error('Topic cannot be undefined');
    }
    this._name = Case.snake(this._name);
  }

  build(app) {
    const src = this;
    const Klass = this._build();
    this._duplexStream = new Klass({
      objectMode: true,
      readableObjectMode: true,
      write(data, encoding, callback) {
        this.push({ data: data });
        callback();
      },
      read(size) {
      }
    });
  }

  downstream() {
    if (this._duplexStream === undefined) {
      throw Error('Upstream is undefined');
    }
    return this._duplexStream;
  }

  name() {
    return this._name;
  }

  write(data) {
    this._duplexStream.write(data);
  }

  shutdown() {
    this._duplexStream.destroy();
  }
}

module.exports = (options) => {
  return new Consumer(options);
}
