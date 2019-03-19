const Batch  = require('./batch.js'),
  _ = require('lodash');

class BatchMap extends Batch {
  constructor(options, lambda) {
    super(options, lambda);
  }

  _aggrigation(data, lambda) {
    let m = data.map(lambda);
    return m;
  }
}

module.exports = (options, lambda) => {
  return new BatchMap(options, lambda);
}