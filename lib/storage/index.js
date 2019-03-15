const Inmemory = require('./inmemory');
let storageMap = new Map();

module.exports.get = (name, options={}) => {
  if(!name) {
    throw('Invalid or empty storage name');
  }

  if(storageMap.has(name)) {
    return storageMap.get(name);
  }
  
  let _storage;
  const _type = options.type || 'inmemory';
  switch(_type) {
    case 'inmemory':
      _storage= new Inmemory(options);
      storageMap.get(name, _storage);
      break;
    default:
      throw 'Invalid storage type';
  }
  return _storage;
}

module.exports.close = (name) => {
  if(storageMap.has(name)) {
    const _storage = storageMap.get(name);
    _storage._unwind();
    storageMap.delte(name);
  }
}
