const { Stream } = require('../../../lib/implementations'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

  describe('consumer', function () {
    it('Check if no name is provided', function () {
      should.throw(() => Stream.consumer());
    })
    it('Check if name is provided', function () {
      should.not.throw(() => Stream.consumer({ name: 'log' }));
    })
    it('Check if name is current', function () {
      const Consumer = Stream.consumer({ name: 'log' });
      expect('log' === Consumer.name());
    })
    it('Check for upstream not defined when acessing downstream', function () {
      const Consumer = Stream.consumer({ name: 'log' });
      should.throw(() => Consumer.downstream());
    })
    it('Check for upstream not defined when acessing write', function () {
      const Consumer = Stream.consumer({ name: 'log' });
      should.throw(() => Consumer.write());
    })
    it('Check for upstream not defined when acessing shutdown', function () {
      const Consumer = Stream.consumer({ name: 'log' });
      should.throw(() => Consumer.shutdown());
    })
  });