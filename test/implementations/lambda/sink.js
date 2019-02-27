const { Lambda } = require('./../../../lib/implementations'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('sink', function () {
  const sink = Lambda.sink();
  it('Check for calling flow', function () {
    should.not.throw(() => Lambda.sink());
  })
  it('Check for upstream not defined when acessing upstream', function () {
    should.throw(() => sink.upstream());
  })
  it('Check for upstream not defined when acessing shutdown', function () {
    should.throw(() => sink.shutdown());
  })
});