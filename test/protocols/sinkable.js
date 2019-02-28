const { Base, Sinkable } = require('../../lib/protocols'),
  { Duplex, Writable, Readable } = require('stream'),
  { mixin } = require('../../lib/utils'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

class NotStream {
  constuct(options) {
    // this is not a stream
  }
}

class NoStreamSinkable extends mixin(NotStream).with(Base, Sinkable) {
  constructor(options) {
    super(options);
  }
}

class NoBaseMixingSinkable extends mixin(Duplex).with(Sinkable) {
  constructor(options) {
    super(options);
  }
}

class WritableBaseMixingSinkable extends mixin(Writable).with(Base, Sinkable) {
  constructor(options) {
    super(options);
  }
}

class RedableBaseMixingSinkable extends mixin(Readable).with(Base, Sinkable) {
  constructor(options) {
    super(options);
  }
}


class DuplexBaseMixingSinkable extends mixin(Duplex).with(Base, Sinkable) {
  constructor(options) {
    super(options);
  }
  _write(data, encoding, callback) {
    this.push(data);
    callback(null, data);
  }
  _read() { }
}


describe('sinkable', function () {
  describe('constructor', function () {
    it('Check if it is a stream', function () {
      should.throw(() => new NoStreamSinkable());
    })
    it('Check if stream has base mixing', function () {
      should.throw(() => new NoBaseMixingSinkable());
    })
    it('Check for Duplex stream', function () {
      should.not.throw(() => new DuplexBaseMixingSinkable());
    })
    it('Check for Readable stream', function () {
      should.throw(() => new RedableBaseMixingSinkable());
    })
    it('Check for Writable stream', function () {
      should.not.throw(() => new WritableBaseMixingSinkable());
    })
  });

  describe('sinkable', function () {
    it('Check is stream is sinkable ', function () {
      const stream = new WritableBaseMixingSinkable();
      expect(true, stream._isSinkable());
    });
  });
});