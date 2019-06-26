const { App, Pipelines, Stream, Batch } = require('../');
const pipeline = Pipelines();
const country = ['india','china'];
const countries = ['japan','barmuda'];

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

  // pipeline.source(Stream.consumer({ name: 'process' }))
 // .flow((data, err, next) => {
//   let num = parseInt(data.num);
//   Object.assign(data, { num: num + 1 , from : countries[Math.floor(Math.random() * country.length)]});
  //   Object.assign(data, { to : countries[Math.floor(Math.random() * country.length)]});
//   // throw new Error('Kaka punjabi');
//   next(data, err);
// })
  // .flow(Batch.reduce({ number: 5, timeout: 30000, groupBy: "from", attributes: ["num", "to"]}, 
  //   (aggtr ,data) => {
  //     let num = parseInt(data.num);
  //     aggtr.number += num;
  //     return aggtr;
  // }, { number:0}))
  // .sink((data, err, next) => {
//   console.log("\n\n Reduced: \n", JSON.stringify(data, null, 3));
//   next(data, err);
// });


  pipeline.source(Stream.consumer({ name: 'process-mapper' }))
.flow((data, err, next) => {
    let num = parseInt(data.num);
    Object.assign(data, { num: num + 1 , from : country[Math.floor(Math.random() * country.length)]});
  Object.assign(data, { to : country[Math.floor(Math.random() * country.length)]});
    // throw new Error('Kaka punjabi');
    next(data, err);
    })
    .flow(Batch.map({ number: 5, timeout: 30000, groupBy: ["to" , "from"], attributes: ["num", "from"] , type: "leveldb" }, 
       (data) => {
        return { "origination": data.from, "volume": data.num};
      })
    )
    .sink(async (data, err, next) => {
       console.log("\n\n Mapped: \n",JSON.stringify(data, null, 3));
  // data.data.forEach(async element => {
  //   for await (const i of element.argdata) {
  //     console.log(i)
  //   }
  // });
  for await (const [key,value] of data.data[0].argdata) {
    console.log(key,value)
  }
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
  // kafka: {
  //   kafkaHost: 'ec2-3-88-35-67.compute-1.amazonaws.com:9092',
  //   protocol: ['roundrobin'],
  //   asyncPush: false,
  //   fromOffset: 'earliest'
  // }
});

app.add(pipeline);

  for (let i = 0; i < 5; i++) {
    // app.writeStream('process', { num: i });
    app.writeStream('process-mapper', { num: i });
}