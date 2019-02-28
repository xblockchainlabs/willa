const { Base, Soureceable } = require('../../lib/protocols'),
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

class NoStreamSoureceable extends mixin(NotStream).with(Base, Soureceable) {
  constructor(options) {
    super(options);
  }
}

class NoBaseMixingSoureceable extends mixin(Duplex).with(Soureceable) {
  constructor(options) {
    super(options);
  }
}

class WritableBaseMixingSoureceable extends mixin(Writable).with(Base, Soureceable) {
  constructor(options) {
    super(options);
  }
}

class RedableBaseMixingSoureceable extends mixin(Readable).with(Base, Soureceable) {
  constructor(options) {
    super(options);
  }
}


class DuplexBaseMixingSoureceable extends mixin(Duplex).with(Base, Soureceable) {
  constructor(options) {
    super(options);
  }
  _write(data, encoding, callback) {
    this.push(data);
    callback(null, data);
  }
  _read() { }
}


describe('soureceable', function () {
  describe('constructor', function () {
    it('Check if it is a stream', function () {
      should.throw(() => new NoStreamSoureceable());
    })
    it('Check if stream has base mixing', function () {
      should.throw(() => new NoBaseMixingSoureceable());
    })
    it('Check for Duplex stream', function () {
      should.not.throw(() => new DuplexBaseMixingSoureceable());
    })
    it('Check for Readable stream', function () {
      should.not.throw(() => new RedableBaseMixingSoureceable());
    })
    it('Check for Writable stream', function () {
      should.throw(() => new WritableBaseMixingSoureceable());
    })
  });

  describe('soureceable', function () {
    it('Check is stream is soureceable ', function () {
      const stream = new RedableBaseMixingSoureceable();
      expect(true, stream._isSoureceable());
    });
  });
});