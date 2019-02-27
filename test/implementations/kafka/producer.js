const kafka = require('./../../../lib/implementations/kafka'),
	chai = require('chai'),
	expect = chai.expect,
	should = chai.should();

describe('producer', function () {
	it('Check if no topic is provided', function () {
		should.throw(() => kafka.producer());
	})
	it('Check if topic is provided', function () {
		should.not.throw(() => kafka.producer({ topic: 'log' }));
	})
	it('Check for upstream not defined when acessing downstream', function () {
		const Producer = kafka.producer({ topic: 'log' });
		should.throw(() => Producer.downstream());
	})
	it('Check for upstream not defined when acessing commit', function () {
		const Producer = kafka.producer({ topic: 'log' });
		should.throw(() => Producer.commit());
	})
	it('Check for upstream not defined when acessing rollback', function () {
		const Producer = kafka.producer({ topic: 'log' });
		should.throw(() => Producer.rollback());
	})
	it('Check for upstream not defined when acessing shutdown', function () {
		const Producer = kafka.producer({ topic: 'log' });
		should.throw(() => Producer.shutdown());
	})
});