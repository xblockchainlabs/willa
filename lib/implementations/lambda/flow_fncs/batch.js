const { ProducerStream } = require('kafka-node'),
  { Readable, Duplex } = require('stream'),
  { Builder } = require('../../builder'),
  { Local } = requiere('../.../storage')
  $ = require('steeltoe');

class Producer extends Builder.Flow {
  constructor(timeout,lambda) {
    super();
    this._lambda = lambda;
    this._timeout = timeout;
  }

  build(app) {
    this.upStream = _buildUpstream();
    this.downStream = _buildDownStream();   
  }

  _buildUpstream() {
    const Klass = this._buildFnc(Writable);
    const trans = this;
    return new Klass({
      objectMode: true,
      write(message, encoding, callback) {
        if (!_.isEmpty(message.error)) {
          return callback();
        }
        trans._lambda(message.data, message.error, function (data, error = null) {
          if (!_.isEmpty(transaction)) {
            if (error) {
              transaction.rollback(message);
              return callback();
            }
            transaction.commit(message);
          }
          callback();
        });
      }
    });
  }

  _buildDownStream() {
    const Klass = this._buildFnc(Duplex);
    const trans = this;
    return new Klass({
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
    if (this._downStream === undefined) {
      throw Error('Downstream is undefined');
    }
    return this._downStream;
  }

  upstream() {
    if (this._upStream === undefined) {
      throw Error('Upstream is undefined');
    }
    return this._upStream;
  }

  shutdown() {
    this._downStream.destroy();
    this._upStream.destroy();
  }
}

module.exports = (options) => {
  return new Producer(options);
}
