const { Base } = require('../../lib/protocols'),
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

class NoStream extends mixin(NotStream).with(Base) {
  constructor(options) {
    super(options);
  }
}

class WritableBaseMixing extends mixin(Writable).with(Base) {
  constructor(options) {
    super(options);
  }
}

class RedableBaseMixing extends mixin(Readable).with(Base) {
  constructor(options) {
    super(options);
  }
}


class DuplexBaseMixing extends mixin(Duplex).with(Base) {
  constructor(options) {
    super(options);
  }
  _write(data, encoding, callback) {
    this.push(data);
    callback(null, data);
  }
  _read() { }
}


describe('base', function () {
  describe('constructor', function () {
    it('Check if it is a stream', function () {
      should.throw(() => new NoStream());
    })
    it('Check if stream has base mixing', function () {
      should.throw(() => new NoBaseMixing());
    })
    it('Check for Duplex stream', function () {
      should.not.throw(() => new DuplexBaseMixing());
    })
    it('Check for Readable stream', function () {
      should.not.throw(() => new RedableBaseMixing());
    })
    it('Check for Writable stream', function () {
      should.not.throw(() => new WritableBaseMixing());
    })
  });

  describe('base stream', function () {
    it('Check for Stream', function () {
      const stream = new RedableBaseMixing();
      expect(true, stream._isStream());
    });
  });

  describe('base stream', function () {
    it('Checks for Readable Stream', function () {
      const stream = new RedableBaseMixing();
      expect(true, stream._isReadable());
      expect(false, stream._isWritable());
      expect(false, stream._isDuplex());
      expect(false, stream._isFlowable());
      expect(false, stream._isSoureceable());
      expect(false, stream._isSinkable());
      expect(false, stream._isMergable());
      expect(false, stream._isForkable());
      expect(false, stream._isParallel());
      expect(false, stream._isTransform());
      expect(false, stream._isDuplex());
    });

    it('Checks for Writable Stream', function () {
      const stream = new WritableBaseMixing();
      expect(false, stream._isReadable());
      expect(true, stream._isWritable());
      expect(false, stream._isDuplex());
      expect(false, stream._isFlowable());
      expect(false, stream._isSoureceable());
      expect(false, stream._isSinkable());
      expect(false, stream._isMergable());
      expect(false, stream._isForkable());
      expect(false, stream._isParallel());
      expect(false, stream._isTransform());
      expect(false, stream._isDuplex());
    });

    it('Checks for Duplex Stream', function () {
      const stream = new WritableBaseMixing();
      expect(false, stream._isReadable());
      expect(false, stream._isWritable());
      expect(true, stream._isDuplex());
      expect(false, stream._isFlowable());
      expect(false, stream._isSoureceable());
      expect(false, stream._isSinkable());
      expect(false, stream._isMergable());
      expect(false, stream._isForkable());
      expect(false, stream._isParallel());
      expect(false, stream._isTransform());
      expect(false, stream._isDuplex());
    });
  });

});