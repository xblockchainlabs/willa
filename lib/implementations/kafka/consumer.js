const { ConsumerGroupStream } = require('kafka-node'),
  { Strategies } = require('../../protocols'),
  { Transform } = require('stream'),
  { Builder } = require('../../builder'),
  Case = require('case'),
  $ = require('steeltoe');

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
    this._strategy = $(options)('errorStrategy')() || 'report';
    if (this._topic === undefined) {
      throw Error('Topic cannot be undefined');
    }
  }

  _getTopicStream(Klass) {
    const cons = this;
    return new Klass({
      objectMode: true,
      errorStrategy: this._strategy,
      transform(message, encoding, callback) {
        callback(null, {
          data: JSON.parse(message.value),
          error: null,
          message: message
        });
      },
      _report(message) {
        console.log(message.error);
      },
      _reset(message) {
        cons._app._restart(cons.name());
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
    this._app = app;
    const Klass = this._buildCommit(Strategies.Resetable, Strategies.Reportable);
    this._topicStream = this._getTopicStream(Klass);
    this._consStream = new ConsumerGroupStream(options, this._topic);
    this._consStream.pipe(this._topicStream);
  }

  downstream() {
    if (this._topicStream === undefined) {
      throw Error('Upstream is undefined');
    }
    return this._topicStream;
  }

  name() {
    return this._topic;
  }

  commit(message) {
    if (this._consStream === undefined) {
      throw Error('Upstream is undefined');
    }
    return this._consStream.commit(message.message, true, function (...param) {
      // @todo generate commit log here
    })
  }

  rollback(message) {
    if (this._topicStream === undefined) {
      throw Error('Upstream is undefined');
    }
    this._topicStream._revert(message);
  }


  shutdown() {
    if (this._consStream === undefined || this._topicStream === undefined) {
      throw Error('Upstream is undefined');
    }
    this._consStream.unpipe(this._topicStream);
    this._topicStream.destroy();
    this._consStream.destroy();
  }
}

module.exports = (options) => {
  return new Consumer(options);
}
