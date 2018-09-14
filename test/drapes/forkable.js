const { BaseMixin } = require('../../lib/protocols'),
      { ForkableMixin } = require('../../lib/drapes'),
      { Duplex, Writable, Readable} = require('stream'),
      { mixin } = require('../../lib/utils')
      chai = require('chai'),
      expect = chai.expect,
      should = chai.should();


// dummy base class for non stream forkable classes
class NotStream {
  constuct(options) {
    // this is not a stream
  }
}

class NoStreamForkable extends mixin(NotStream).with(BaseMixin, ForkableMixin) {
  constructor(options) {
    super(options);
  }
}

class NoBaseMixingForkable extends mixin(Duplex).with(ForkableMixin) {
  constructor(options) {
    super(options);
  }
}

class WritableBaseMixingForkable extends mixin(Writable).with(BaseMixin,ForkableMixin) {
  constructor(options) {
    super(options);
  }
}

class RedableBaseMixingForkable extends mixin(Readable).with(BaseMixin,ForkableMixin) {
  constructor(options) {
    super(options);
  }
}


class DuplexBaseMixingForkable extends mixin(Duplex).with(BaseMixin,ForkableMixin) {
  constructor(options) {
    super(options);
  }
  _write(data, encoding, callback) {
    this.push(data);
    callback(null, data);
  }
  _read() {}
}

describe('forkable', function() {
  describe('constructor', function() {
    it('Check if it is a stream', function(){
      should.throw(() => { new NoStreamForkable() });
    })
    it('Check if stream has base mixing', function(){
      should.throw(() => { new NoBaseMixingForkable() });
    })
    it('Check for Duplex stream', function(){
      should.throw(() => { new WritableBaseMixingForkable()});
      should.throw(() => { new RedableBaseMixingForkable()});
      should.not.throw(() => { new DuplexBaseMixingForkable() });
    })
  });
  describe('forking', function() {
    it('Check for forked outputs with similar consumers', function(){
      var result1 = [],
          result2 = [];

      let consumer1 = new Writable ({
        objectMode: true,
        write(data, encoding, callback) {
          result1.push(data);
          callback(null, data);
        }
      });

      let consumer2 = new Writable ({
        objectMode: true,
        write(data, encoding, callback) {
          result2.push(data);
          callback(null, data);          
        }
      });

      let producer = new DuplexBaseMixingForkable({
        objectMode: true,
        allowHalfOpen: false
      });

      let a = producer.fork(),
          b = producer.fork();

      a.pipe(consumer1);
      b.pipe(consumer2);
      
      producer.write(1);
      producer.write(2);
      producer.write(3);
      producer.end();

      setImmediate(() => {
         expect(result1).eql(result2);
      });

    });
  });
});
