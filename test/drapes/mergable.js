const { BaseMixin } = require('../../lib/protocols'),
      { MergableMixin } = require('../../lib/drapes'),
      { Duplex, Writable, Readable} = require('stream'),
      chai = require('chai'),
      should = chai.should();


// dummy base class for non stream forkable classes
class NotStream {
  constuct(options) {
    // this is not a stream
  }
}

class NoStreamMergable extends MergableMixin(BaseMixin(NotStream)) {
  constructor(options) {
    super(options);
  }
}

class NoBaseMixingMergable extends MergableMixin(Duplex) {
  constructor(options) {
    super(options);
  }
}

class WritableBaseMixingMergable extends MergableMixin(BaseMixin(Writable)) {
  constructor(options) {
    super(options);
  }
}

class RedableBaseMixingMergable extends MergableMixin(BaseMixin(Readable)) {
  constructor(options) {
    super(options);
  }
}

describe('mergable', function() {
  it('check if it is a stream', function(){
    should.throw(() => { new NoStreamMergable() });
  })
  it('check if stream has base mixing', function(){
    should.throw(() => { new NoBaseMixingMergable() });
  })
  it('check for Writable stream', function(){
    should.not.throw(() => { new WritableBaseMixingMergable()});
    should.throw(() => { new RedableBaseMixingMergable()});
  })
});
