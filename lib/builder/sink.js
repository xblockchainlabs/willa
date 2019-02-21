const { mixin } = require('../utils'),
  { Base, Sinkable } = require('../protocols');

class SinkBuilder {
  constructor(baseClass) {
    this.baseClass = baseClass;
  }

  _build() {
    return mixin(this.baseClass).with(Base, Sinkable);
  }

  build(transaction, app) {
    throw Error('Build method is required');
  }

  upstream() {
    throw Error('Upstream not specified')
  }

  shutdown() {
    let klass = this.constructor.name;
    process.emitWarning('Commit method required', {
      detail: `${klass} doesn't implemented shutdown() method.`
    });
  }
}

module.exports = SinkBuilder;