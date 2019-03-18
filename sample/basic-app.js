const { App, Pipelines, Kafka, Stream, Flowfunc } = require('../');
const pipeline = Pipelines();

// pipeline.source(Stream.consumer({ name: 'process' }))
//   .flow((data, err, next) => {
//     let num = parseInt(data.num);
//     Object.assign(data, { num: num + 1 });
//     console.log("hi");
//     // throw new Error('Kaka punjabi');
//     next(data, err);
//   })
//   .flow(Flowfunc.batch({ number: 5, timeout: 30000 }, (data, err, next) => {
//     console.log("...",data);
//     let num = parseInt(data.num);
//     Object.assign(data, { num: num - 1 });
//     return data;
//   }))
//   .flow((data, err, next) => {
//     console.log('LKLKL',data);
//     // throw new Error('Kaka punjabi');
//     next(data, err);
//   })
//   .sink(Kafka.producer({ topic: 'log' }));

  pipeline.source(Stream.consumer({ name: 'process' }))
  .flow((data, err, next) => {
    let num = parseInt(data.num);
    Object.assign(data, { num: num + 1 });
    // throw new Error('Kaka punjabi');
    next(data, err);
  })
  .flow(Flowfunc.batch({ number: 5, timeout: 30000 }, (argData={},data) => {
    let num = parseInt(data.data.num);
    Object.assign(argData, { num: num + 1 });
    return argData;
  }))
  .sink((data, err, next) => {
    console.log(JSON.stringify(data));
    next(data, err);
  });

// pipeline.sourceCommitable(Kafka.consumer({ topic: 'log' }))
//   .flow((data, err, next) => {
//     next(data, err);
//   })
//   .sink((data, err, next) => {
//     console.log(JSON.stringify(data));
//     next(data, err);
//   })

const app = App('test', {
  kafka: {
    kafkaHost: 'ec2-3-88-35-67.compute-1.amazonaws.com:9092',
    protocol: ['roundrobin'],
    asyncPush: false,
    fromOffset: 'earliest'
  }
});

app.add(pipeline);

for (let i = 0; i < 7; i++) {
  app.writeStream('process', { num: i });
}