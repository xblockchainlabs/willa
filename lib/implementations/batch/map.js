const Batch = require('./batch.js'),
  _ = require('lodash');
const Collection = require('../../storage/collection');
const Lbucket = require('./../../storage/lbucket');

class BatchMap extends Batch {
  constructor(options, lambda) {
    super(options, lambda);
  }

  _aggrigation(data, lambda) {
    return new Promise((rsv, rjt) => {
      if (data instanceof Lbucket) {
        let m = data.map(lambda)
        rsv(m);
      } else {
        let m = { argdata: null, ids: [] };
        m.argdata = new Collection(data.map(lambda));
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

module.exports = (options, lambda) => {
  return new BatchMap(options, lambda);
}