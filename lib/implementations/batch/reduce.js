const Batch  = require('./batch.js'),
   _ = require('lodash');

class BatchReduce extends Batch {
  constructor(options, lambda, aggrigator) {
    super(options, lambda, aggrigator);
  }

  _aggrigation(data, lambda, aggrigator={}) {
    return data.reduce(lambda, aggrigator);
  }
}

module.exports = (options, lambda, aggrigator) => {
  return new BatchReduce(options, lambda, aggrigator);
}
