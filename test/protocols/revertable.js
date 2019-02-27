const { Base, Soureceable, Revertable } = require('../../lib/protocols'),
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

class NoStreamRevertable extends mixin(NotStream).with(Base, Soureceable, Revertable) {
  constructor(options) {
    super(options);
  }
}

class NoBaseMixingRevertable extends mixin(Duplex).with(Revertable) {
  constructor(options) {
    super(options);
  }
}

class WritableBaseMixingRevertable extends mixin(Writable).with(Base, Soureceable, Revertable) {
  constructor(options) {
    super(options);
  }
}

class RedableBaseMixingRevertable extends mixin(Readable).with(Base, Soureceable, Revertable) {
  constructor(options) {
    super(options);
  }
}


class DuplexBaseMixingRevertable extends mixin(Duplex).with(Base, Soureceable, Revertable) {
  constructor(options) {
    super(options);
  }
  _write(data, encoding, callback) {
    this.push(data);
    callback(null, data);
  }
  _read() { }
}


describe('revertable', function () {
  describe('constructor', function () {
    it('Check if it is a stream', function () {
      should.throw(() => new NoStreamRevertable());
    })
    it('Check if stream has base mixing', function () {
      should.throw(() => new NoBaseMixingRevertable());
    })
    it('Check for Duplex stream', function () {
      should.throw(() => new DuplexBaseMixingRevertable());
    })
    it('Check for Readable stream', function () {
      should.throw(() => new RedableBaseMixingRevertable());
    })
    it('Check for Writable stream', function () {
      should.throw(() => new WritableBaseMixingRevertable());
    })
  });

  describe('revertable', function () {
    it('Check if no error Strategy is provided', function () {
      should.throw(() => new DuplexBaseMixingRevertable());
    });
    it('Check if invalid error Strategy is provided', function () {
      should.throw(() => new DuplexBaseMixingRevertable({ errorStrategy: 'report' }));
    });
  });
});