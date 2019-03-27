const { get, close } = require('./../lib/storage');

const store = get('test');

setInterval(() => {
    store.add({value:1});
}, 1000);

setInterval(() => {
    console.log("-----------")
    store.next();
}, 10000);


store.on('next',(data)=>{
    console.log(data);
})