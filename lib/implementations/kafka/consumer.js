const { ConsumerGroupStream } = require('kafka-node'),
  { Transform } = require('stream'),
  { Builder } = require('../../builder'),
  Case = require('case'),
  $ =  require('steeltoe');

class Consumer extends Builder.Source {
  constructor(options) {
    super(Transform);
    this._defaultAutoCommitConfig = {
      autoCommit: true,
      autoCommitIntervalMs: 5000,
      fetchMaxWaitMs: 1000
    }
    this._defaultManualCommitConfig = {
      autoCommit: false,
      sessionTimeout: 25000,
      fetchMaxWaitMs: 1000
    }
    this._topic = $(options)('topic')();
    if(this._topic === undefined) {
      throw Error('Topic cannot be undefined');
    }
    this._topic = Case.snake(this._topic);
  }

  _getTopicStream(Klass) {
    return new Klass({
      objectMode: true,
      transform (message, encoding, callback) {
        callback(null,{ 
          data: JSON.parse(message.value),
          error: null,
          message: message
        });
      }
    }); 
  }

  build(app) {
    const options = Object.assign({}, 
        $(app)('kafka')('options')(),
        this._defaultAutoCommitConfig);
    const Klass = this._build();
    this._topicStream = this._getTopicStream(Klass);
    this._consStream = new ConsumerGroupStream(options, this._topic);
    this._consStream.pipe(this._topicStream);
  }

  buildCommit(app) {
    const options = Object.assign({},
      $(app)('kafka')('options')(),
      this._defaultManualCommitConfig);
    const Klass = this._build();
    this._topicStream = this._getTopicStream(Klass);
    this._consStream = new ConsumerGroupStream(options, this._topic);
    this._consStream.pipe(this._topicStream);
  }

  downstream() {
    if(this._topicStream === undefined) {
      throw Error('Upstream is undefined');
    }
    return this._topicStream;
  }
  name() {
    return this._topic;
  }
  commit(message) {
    return this._consStream.commit(message, true, function(...param){
      // @todo generate commit log here
    })
  }
}

module.exports = (options) => {
  return new Consumer(options);
}
