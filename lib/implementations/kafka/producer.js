const { ProducerStream } = require('kafka-node'),
  { Transform } = require('stream'),
  { Builder } = require('../../builder'),
  Case = require('case'),
  _ =  require('lodash'),
  $ =  require('steeltoe');

class Producer extends Builder.Sink {
  constructor(options) {
    super(Transform);
    this._topic = $(options)('topic')();
    if(this._topic === undefined) {
      throw Error('Topic cannot be undefined');
    }
    this._topic = Case.snake(this._topic);
  }

  _getTopicStream(Klass, transaction) {
    const prod = this;
    return new Klass({
      objectMode: true,
      transform (message, encoding, callback) {
        if( _.isEmpty(message.error)){
          if(!_.isEmpty(transaction)) {
            transaction.commit(message.message);
          }
          return callback(null,{
            topic: prod._topic,
            messages: JSON.stringify(message.data)
          });
        }
        callback();
      }
    }); 
  }

  build(transaction, app) {
    const client = $(app)('kafka')('client')();
    if(!client) {
      throw Error('kafka client is not created');
    }
    const Klass = this._build();
    this._topicStream = this._getTopicStream(Klass, transaction);
    this._prodStream = new ProducerStream({kafkaClient: client});
    this._prodStream.on('ready', function () {
      console.log("Producer is ready")
    });
  
    this._prodStream.on('error', function (err) {console.log("Producer error", err)})
    this._topicStream.pipe(this._prodStream);
  }

  upstream() {
    if(this._topicStream === undefined) {
      throw Error('Upstream is undefined');
    }
    return this._topicStream;
  }
}

module.exports = (options) => {
  return new Producer(options);
}
