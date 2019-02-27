const { Base, Flowable } = require('../../lib/protocols'),
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

class NoStreamFlowable extends mixin(NotStream).with(Base, Flowable) {
  constructor(options) {
    super(options);
  }
}

class NoBaseMixingFlowable extends mixin(Duplex).with(Flowable) {
  constructor(options) {
    super(options);
  }
}

class WritableBaseMixingFlowable extends mixin(Writable).with(Base, Flowable) {
  constructor(options) {
    super(options);
  }
}

class RedableBaseMixingFlowable extends mixin(Readable).with(Base, Flowable) {
  constructor(options) {
    super(options);
  }
}


class DuplexBaseMixingFlowable extends mixin(Duplex).with(Base, Flowable) {
  constructor(options) {
    super(options);
  }
  _write(data, encoding, callback) {
    this.push(data);
    callback(null, data);
  }
  _read() { }
}


describe('flowable', function () {
  describe('constructor', function () {
    it('Check if it is a stream', function () {
      should.throw(() => new NoStreamFlowable());
    })
    it('Check if stream has base mixing', function () {
      should.throw(() => new NoBaseMixingFlowable());
    })
    it('Check for Duplex stream', function () {
      should.not.throw(() => new DuplexBaseMixingFlowable());
    })
    it('Check for Readable stream', function () {
      should.throw(() => new RedableBaseMixingFlowable());
    })
    it('Check for Writable stream', function () {
      should.throw(() => new WritableBaseMixingFlowable());
    })
  });

  describe('flowable', function () {
    it('Check is stream is Flowable ', function () {
      const stream = new DuplexBaseMixingFlowable();
      expect(true, stream._isFlowable());
    });
  });
});