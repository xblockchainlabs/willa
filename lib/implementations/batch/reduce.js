const Batch = require('./batch.js'),
  _ = require('lodash');
  const Lbucket = require('./../../storage/lbucket');
class BatchReduce extends Batch {
  constructor(options, lambda, aggrigator) {
    super(options, lambda, aggrigator);
  }

  _aggrigation(data, lambda, aggrigator = {}) {
    return new Promise((rsv, rjt) => {
      if (data instanceof Lbucket) {
        let m = data.reduce(lambda, aggrigator);
        rsv(m);
      } else {
        let m = { argdata: null, ids: [] };
        m.argdata = data.reduce(lambda, aggrigator);
        m.ids = data.map(data => data.id);
        if (_.isArray(data) && data.length > 0) {
          const d = data[0];
          if (!_.isEmpty(d)) {
            d.groups.map(key => {
              if (_.isUndefined(m.groupedBy)) {
                m.groupedBy = {};
              }
              if (!!d[key]) {
                m.groupedBy[key] = d[key];
              }
            });
          }
        }
        rsv(m);
      }
    })
  }
}

module.exports = (options, lambda, aggrigator) => {
  return new BatchReduce(options, lambda, aggrigator);
}
