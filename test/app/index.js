const { App, Pipelines, Kafka, Stream } = require('../../index');
const pipeline = Pipelines();

pipeline.source(Stream.consumer({ name: 'process' }))
  .flow((data, err, next) => {
    let num = parseInt(data.num);
    Object.assign(data, { num: num + 1 });
    // throw new Error('Kaka punjabi');
    next(data, err);
  })
  .flow((data, err, next) => {
    let num = parseInt(data.num);
    Object.assign(data, { num: num - 1 });
    next(data, err);
  })
  .sink(Kafka.producer({ topic: 'log' }));

pipeline.sourceCommitable(Kafka.consumer({ topic: 'log', errorStrategy: 'reset' }))
  .flow((data, err, next) => {
    err = new Error('Kaka punjabi');
    next(data, err);
  })
  .sink((data, err, next) => {
    console.log(JSON.stringify(data));
    next(data, err);
  })

const app = App('test', {
  kafka: {
    kafkaHost: 'kafka:9092',
    protocol: ['roundrobin'],
    asyncPush: false,
    fromOffset: 'earliest'
  }
});

app.add(pipeline);

for (let i = 0; i < 1; i++) {
  app.writeStream('process', { num: i });
}