const { ProducerStream } = require('kafka-node'),
  { Readable, Duplex, Writable } = require('stream'),
  { Builder } = require('../../builder'),
  store = require('../../storage');
$ = require('steeltoe');

module.exports = class Batch extends Builder.Flow {
  constructor(options, lambda, aggrigator = {}) {
    super();
    if (new.target === Batch) {
      throw new Error('Cannot construct Batch instances directly');
    }
    this._storeOptions =  _.pick(options, ["number", "groupBy", "attributes", "timeout"]);
    this._lambda = lambda;
    this._timeout = options.timeout;
    this._aggrigator = aggrigator
  }

  build(app, name ) {
    const self = this;
    this._name = name;
    this._store = store.get(this._name , this._storeOptions);
    this._upStream = this._buildUpstream();
    this._downStream = this._buildDownStream();
    this._store.on('next', (batchData) => { self._process(batchData) });
  }

  _process(batchData) {
    let data, error;
    try {
      if (_.isArray(batchData)) {
        data = this._processGroup(batchData);
      } else {
        data = _.values(batchData).map(batchData => this._processGroup(batchData))
      }
    } catch (err) {
      error = err;
    } finally {
      const message = { aggrigated: true, data: data, error: error };
      this._downStream.write(message);
    }
  }

  _processGroup(groupData) {
    let result = { argdata: null, ids: [] };
    result.argdata = this._aggrigation(groupData,this._lambda, _.clone(this._aggrigator));
    result.ids = groupData.map(data => data.id);
    if(_.isArray(groupData) &&  groupData.length > 0){
      const data = groupData[0];
      if(!_.isEmpty(data)) {
        data.groups.map(key => {
          if(_.isUndefined(result.groupedBy)) {
            result.groupedBy = {};
          }
          if (!!data[key]) {
            result.groupedBy[key] = data[key];
          }
        });
      }
    }
    return result;
  }

  _aggrigation(data, lambda, aggrigator={}) {
    throw "_aggrigation() method is not implimented"
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
