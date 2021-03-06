const { Source, Flow, Sink } = require('../builder').Builder,
  { Lambda } = require('../implementations');
_ = require('lodash');

const State = {
  created: 0,
  initiated: 1,
  finalized: 2,
  built: 3
}

class PipelineBuilder {
  constructor() {
    this.nodes = [];
    this.state = State.created;
    this.tansaction = null;
  }

  source(builder) {
    if (this.state == State.created) {
      if (!builder instanceof Source) {
        throw Error('Source builder expected')
      }
      this.nodes.push(builder);
      this.state = State.initiated;
    }
    return this;
  }

  sourceCommitable(builder) {
    if (this.state == State.created) {
      if (!builder instanceof Source) {
        throw Error('Source builder expected')
      }
      this.nodes.push(builder);
      this.tansaction = builder;
      this.state = State.initiated;
    }
    return this;
  }

  flow(builderOrlambda) {
    if (this.state == State.initiated) {
      if (builderOrlambda instanceof Flow) {
        this.nodes.push(builderOrlambda);
      } else if (_.isFunction(builderOrlambda)) {
        this.nodes.push(Lambda.flow(builderOrlambda));
      } else {
        throw Error('Sink builder expected');
      }
    }
    return this;
  }

  sink(builderOrlambda) {
    if (this.state == State.initiated) {
      if (builderOrlambda instanceof Sink) {
        this.nodes.push(builderOrlambda);
      } else if (_.isFunction(builderOrlambda)) {
        this.nodes.push(Lambda.sink(builderOrlambda));
      } else {
        throw Error('Sink builder expected');
      }
    }
    return this;
  }

  _pipeline(nodes) {
    const nodeSize = nodes.length;
    for (let i = 0; i < nodeSize - 1; i++) {
      const upstream = nodes[i].downstream();
      const downstream = nodes[i + 1].upstream();
      upstream.pipe(downstream);
    }
  }

  _shutdown() {
    const nodeSize = this.nodes.length;
    for (let i = 0; i < nodeSize ; i++) {
      if(i< nodeSize-1){
        const upstream = this.nodes[i].downstream();
        const downstream = this.nodes[i + 1].upstream();
        upstream.unpipe(downstream);
      }
      this.nodes[i].shutdown();
    }
  }

  _build(app) {
    const _pipeline = this;
    const name = this._name();
    this.nodes.forEach((builder) => {
      if (builder instanceof Source) {
        if (_pipeline.tansaction !== null) {
          builder.buildCommit(app);
        } else {
          builder.build(app);
        }
      } else if (builder instanceof Flow) {
        builder.build(app, name);
      } else if (builder instanceof Sink) {
        let trans = _pipeline.tansaction;
        builder.build(trans, app, name);
      }
    });
    this._pipeline(this.nodes);
  }

  _name() {
    if (!_.isEmpty(this.nodes)
      && this.nodes[0] instanceof Source) {
      return this.nodes[0].name();
    }
    return null;
  }

  _write(data) {
    if (!_.isEmpty(this.nodes)
      && this.nodes[0] instanceof Source) {
      return this.nodes[0].write(data);
    }
  }
}

module.exports = () => {
  return new PipelineBuilder();
}