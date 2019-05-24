const { get, close } = require('./../../lib/storage');

const store = get('test', { timeout: 6000 });
let counter = 0;
let _intv;
const interval = (_td) => setInterval(() => {
  console.log("push at gap : " + _td)
  store.add({ data: { id: 1, value: 1 } });
  if (counter === 5) {
    clearInterval(_intv);
    _intv = interval(_td*1.1);
  } else {
    counter++;
  }
}, _td);
_intv = interval(1000);

store.on('next', (data) => {
  console.log(data);
})


