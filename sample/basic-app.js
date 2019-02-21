const { App, Pipelines, Kafka, Stream } = require('../');
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


pipeline.sourceCommitable(Kafka.consumer({ topic: 'log' }))
  .flow((data, err, next) => {
    err = new Error('hello');
    next(data, err);
  })
  .sink((data, err, next) => {
    console.log(JSON.stringify(data));
    next(data, err);
  })

const app = App('test', {
  kafka: {
    kafkaHost: '3.92.2.7:9092',
    protocol: ['roundrobin'],
    asyncPush: false,
    fromOffset: 'earliest'
  }
});

app.add(pipeline);

for (let i = 0; i < 100; i++) {
  app.writeStream('process', { num: i });
}