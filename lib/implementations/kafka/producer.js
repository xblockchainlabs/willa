const { ProducerStream } = require('kafka-node'),
  { Transform } = require('stream'),
  { Builder } = require('../../builder'),
  Case = require('case'),
  _ = require('lodash'),
  $ = require('steeltoe');

class Producer extends Builder.Sink {
  constructor(options) {
    super(Transform);
    this._topic = $(options)('topic')();
    if (this._topic === undefined) {
      throw Error('Topic cannot be undefined');
    }
    this._topic = Case.snake(this._topic);
  }

  _getTopicStream(Klass, transaction) {
    const prod = this;
    return new Klass({
      objectMode: true,
      transform(message, encoding, callback) {
        if (!_.isEmpty(transaction)) {
          if (message.error) {
            transaction.rollback(message);
            return callback();
          }
          transaction.commit(message);
        }
        return callback(null, {
          topic: prod._topic,
          messages: JSON.stringify(message.data)
        });
      }
    });
  }

  build(transaction, app) {
    const options = Object.assign({}, $(app)('kafka')('options')());
    const Klass = this._build();
    this._topicStream = this._getTopicStream(Klass, transaction);
    this._prodStream = new ProducerStream({ kafkaClient: options });
    this._topicStream.pipe(this._prodStream);
  }

  upstream() {
    if (this._topicStream === undefined) {
      throw Error('topicStream is undefined');
    }
    return this._topicStream;
  }

  shutdown() {
    if (this._topicStream === undefined) {
      throw Error('topicStream is undefined');
    }
    if (this._prodStream === undefined) {
      throw Error('prodStream is undefined');
    }
    this._topicStream.unpipe(this._prodStream);
    this._topicStream.destroy();
    this._prodStream.destroy();
  }
}

module.exports = (options) => {
  return new Producer(options);
}
