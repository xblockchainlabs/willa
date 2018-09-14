const { ProducerStream } = require('kafka-node'),
  { Transform } = require('stream'),
  { Builder } = require('../../builder'),
  $ =  require('steeltoe');

class Producer extends Builder.Flow {
  constructor(lambda) {
    super(Transform);
    this._lambda = lambda;
  }

  build(app) {
    const Klass = this._build();
    const trans = this;
    this._transformStream = new Klass({
      objectMode: true,
      transform (message, encoding, callback) {
        trans._lambda(message.data, message.error, function(data, error=null) {
          Object.assign(message,{ data: data, error: error });
          callback(null, message);
        });
      }
    }); 
  }

  downstream() {
    if(this._transformStream === undefined) {
      throw Error('Downstream is undefined');
    }
    return this._transformStream;
  }

  upstream() {
    if(this._transformStream === undefined) {
      throw Error('Upstream is undefined');
    }
    return this._transformStream;
  }
}

module.exports = (options) => {
  return new Producer(options);
}
