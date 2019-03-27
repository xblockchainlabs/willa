const { ProducerStream } = require('kafka-node'),
  { Writable } = require('stream'),
  { Builder } = require('../../builder'),
  store = require('./../../storage');
  _ = require('lodash');
$ = require('steeltoe');

class Producer extends Builder.Sink {
  constructor(lambda) {
    super(Writable);
    this._lambda = lambda;
  }

  build(transaction, app, name) {
    const Klass = this._build();
    const trans = this;
    this._name = name;
    this._writeStream = new Klass({
      objectMode: true,
      write(message, encoding, callback) {
        if (!_.isEmpty(message.error)) {
          return callback();
        }
        if (message.data.aggrigated) {
          let storage = store.get(name);
          if ($(message)('data')('data')() && _.isArrayLike(message.data.data)) {
            message.data.data.forEach(x => (storage.pop(x.ids)));
          } else if ($ (message)('data')('data')('ids')()) {
            storage.pop(message.data.data.ids);
          }
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

  upstream() {
    if (this._writeStream === undefined) {
      throw Error('writeStream is undefined');
    }
    return this._writeStream;
  }

  shutdown() {
    if (this._writeStream === undefined) {
      throw Error('writeStream is undefined');
    }
    this._writeStream.destroy();
  }
}

module.exports = (options) => {
  return new Producer(options);
}
