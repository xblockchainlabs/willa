const Pipeline = require('./pipeline');

module.exports = () => {
  return {
    pipelines: [],
    _create: function () {
      let pipeline = Pipeline();
      this.pipelines.push(pipeline);
      return pipeline;
    },
    source: function (param) {
      return this._create().source(param);
    },
    sourceCommitable: function (param) {
      return this._create().sourceCommitable(param);
    },
    _map: function () {
      return this.pipelines.map((pipeline) => {
        const name = pipeline._name();
        return { name: name, pipeline: pipeline };
      });
    },
    _build: function (app) {
      this.pipelines.forEach((pipeline) => {
        pipeline._build(app);
      });
    }
  };
}
