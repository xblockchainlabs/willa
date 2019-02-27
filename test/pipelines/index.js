const Pipeline = require('./../../lib/pipelines'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('pipeline', function () {
  it('Check for calling pipeline', function () {
    should.not.throw(() => Pipeline());
  })
  it('Check for calling source', function () {
    pipeline = Pipeline();
    should.not.throw(() => pipeline.source());
  })
  it('Check for calling source', function () {
    pipeline = Pipeline();
    should.not.throw(() => pipeline.sourceCommitable());
  })
  // it('Check for upstream not defined when acessing downstream', function () {
  //   should.throw(() => flow.downstream());
  // })
  // it('Check for upstream not defined when acessing upstream', function () {
  //   should.throw(() => flow.upstream());
  // })
  // it('Check for upstream not defined when acessing shutdown', function () {
  //   should.throw(() => flow.shutdown());
  // })
});