const { mixin } = require('../utils'),
  { Base, Flowable } = require('../protocols');

class FlowBuilder {
  constructor(baseClass) {
    this.baseClass = baseClass;
  }

  _build() {
    return mixin(this.baseClass).with(Base, Flowable);
  }

  _buildFnc(_baseClass, ...classes) {
    const _base = _baseClass;
    const mixinClasses = [Base, ...classes];
    return mixin(_baseClass).with(...mixinClasses);
  }

  _buildCommit(...strategies) {
    const mixinClasses = [Base, Flowable, Revertable, ...strategies]
    return mixin(this.baseClass).with(...mixinClasses);
  }

  build(app) {
    throw Error('Build method is required');
  }

  buildCommit(transaction, app) {
    let klass = this.constructor.name;
    process.emitWarning('Build method required', {
      detail: `${klass} doesn't implemented buildCommit() method. Falling back to default build() method`
    });
    return this.build();
  }

  upstream() {
    throw Error('Upstream not specified')
  }

  downstream() {
    throw Error('Downstream not specified')
  }

  shutdown() {
    let klass = this.constructor.name;
    process.emitWarning('Commit method required', {
      detail: `${klass} doesn't implemented shutdown() method.`
    });
  }
}

module.exports = FlowBuilder;