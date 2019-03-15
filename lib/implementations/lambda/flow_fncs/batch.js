const { ProducerStream } = require('kafka-node'),
  { Readable, Duplex, Writable } = require('stream'),
  { Builder } = require('../../../builder'),
  store = require('./../../../storage');
$ = require('steeltoe');

class Producer extends Builder.Flow {
  constructor(options = {}, lambda) {
    super();
    this._lambda = lambda;
    this._store = store.get("process name", options);
    this._timeout = options.timeout;
  }

  build(app) {
    const self = this;
    this._upStream = this._buildUpstream();
    this._downStream = this._buildDownStream();
    this._store.on('next', batchData => self._process);
  }

  _process(batchData) {
    let data, error;
    try {
      if (_.isArray(batchData)) {
        data = this._processGroup(batchData);
      } else if (_.isArrayLikeObject(batchData)) {
        data = _(batchData).values().map(this._processGroup)
      }
    } catch (err) {
      error = err;
    } finally {
      const message = { aggrigated: true, data: data, error: error };
      this._downStream.write(message);
    }
  }

  _processGroup(groupData) {
    let result = { argdata: null, ids: [], groupedBy: {} };
    result.argdata = dataset.reduce(this._lambda);
    result.ids = dataset.map(data => data.id);
    groupData.groups.map(key => {
      if (!!groupData[key]) {
        result.groupedBy[key] = groupData[key];
      }
    })
    return result;
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
        trans._store.add(message);
        callback();
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
    this._store.close();
    this._downStream.destroy();
    this._upStream.destroy();
  }
}

module.exports = (options) => {
  return new Producer(options);
}
