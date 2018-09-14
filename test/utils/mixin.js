const { mixin } = require('../../lib/utils'),
      chai = require('chai'),
      expect = chai.expect,
      should = chai.should();


const AMixin = Base => class BaseProtocol extends Base {
  constructor() {
    super();
    this.a = 'a string property';
    this.c = 'override c value as string';
    this.d = 10; // override d value as numeric
    this.e = 'A string Value';
  }

  method1() {
    return false;
  }

  method3() {
    return true;
  }
};


const BMixin= Base => class BaseProtocol extends Base {
  constructor() {
    super();
    this.b = 10; // A numeric property
    this.c = [1,2,3]; // override c value as an array
  }

  method2() {
    return true;
  }

  method4() {
    return true;
  }
};


class BaseClass {
  constructor () {
    this.c = 10; // A numeric value
    this.d = 'A string value';
  }

  method3() {
    return false;
  }
};

class ChildClass extends mixin(BaseClass).with(AMixin, BMixin) {
  constructor() {
    super();
    this.e = {}; // override c value as an object
  }

  method4() {
    return false;
  }
};


describe('mixin', function() {
  it('check if class has mixin properties', function(){
    let child = new ChildClass();
    expect(child).to.have.property('a');
    expect(child).to.have.property('b');
    expect(child).to.have.property('c');
    expect(child).to.have.property('d');
    expect(child).to.have.property('e');
  })

  it('check if class has mixin methods', function(){
    let child = new ChildClass();
    expect(child).to.have.property('method1');
    expect(child.method1).to.be.a('function');
    expect(child).to.have.property('method2');
    expect(child.method2).to.be.a('function');
  })

  it('check base class property overridding in mixin class', function(){
    let child = new ChildClass();
    expect(child.c).to.be.an('array');
    expect(child.d).to.be.a('number');
  })

  it('check mixing class property overridding in child class', function(){
    let child = new ChildClass();
    expect(child.e).to.be.an('object');
  })

  it('check base class method overridding in mixin class', function(){
    let child = new ChildClass();
    expect(child).to.have.property('method3');
    expect(child.method3).to.be.a('function');
    expect(child.method3()).is.equal(true);
  })

  it('check mixin class method overridding in child class', function(){
    let child = new ChildClass();
    expect(child).to.have.property('method4');
    expect(child.method4).to.be.a('function');
    expect(child.method4()).is.equal(false);
  })
});