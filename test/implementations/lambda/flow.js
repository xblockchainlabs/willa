const { Lambda } = require('./../../../lib/implementations'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('flow', function () {
  const flow = Lambda.flow();
  it('Check for calling flow', function () {
    should.not.throw(() => Lambda.flow());
  })
  it('Check for upstream not defined when acessing downstream', function () {
    should.throw(() => flow.downstream());
  })
  it('Check for upstream not defined when acessing upstream', function () {
    should.throw(() => flow.upstream());
  })
  it('Check for upstream not defined when acessing shutdown', function () {
    should.throw(() => flow.shutdown());
  })
});