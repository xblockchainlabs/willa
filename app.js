const { KafkaClient } = require('kafka-node'),
  Case = require('case'),
  _ = require('lodash'),
  $ =  require('steeltoe');

class App {
  constructor(name, options) {
    this.pipelines = new Map();
    this._setKafka(name,$(options)('kafka')());
  }

  _setKafka(name, kafkaOptions){
    let kafkaConf = Object.assign({}, this._kafkaDefalutConf(), kafkaOptions);
    this.kafka = {
      client: this._kafkaClient(kafkaConf),
      options: this._kafkaCGOption(name, kafkaConf)
    }
  }

  _kafkaDefalutConf() {
    return {
      kafkaHost: 'localhost:9092',
      sessionTimeout: 25000,
      protocol: ['roundrobin'],
      asyncPush: false,
      fromOffset: 'latest'
    }
  }

  _kafkaClient(conf) {
    return new KafkaClient({kafkaHost: conf.kafkaHost });
  }

  _kafkaCGOption(name, conf) {
    const groupID = Case.snake('willa_'+name);
    return Object.assign({}, conf, { groupId: groupID });
  }

  add(pipelines) {
    if( $(pipelines)('_map')() !== undefined
        && _.isFunction(pipelines._map)){
      pipelines._map().forEach((pipe) => 
        this._setPipeline(pipe.name, pipe.pipeline));
      pipelines._build(this);
    }
  }

  writeStream(name,data) {
    const _name = Case.snake(name);
    const pipeline = this.pipelines.get(_name);
    pipeline._write(data);
  }

  _setPipeline(name, pipeline) {
    if( name!== undefined && 
      !this.pipelines.has(name)) {
      this.pipelines.set(name, pipeline);
    } else {
      throw Error(`Pipeline name conflict at ${name}`);
    }
  }
}

let app = null;

module.exports = (name, options) => {
  if(app== null){
    app = new App(name, options);
  }
  return app
}