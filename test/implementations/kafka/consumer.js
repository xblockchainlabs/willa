const kafka = require('./../../../lib/implementations/kafka'),
	chai = require('chai'),
	expect = chai.expect,
	should = chai.should();

describe('consumer', function () {
	it('Check if no topic is provided', function () {
		should.throw(() => kafka.consumer());
	})
	it('Check if topic is provided', function () {
		should.not.throw(() => kafka.consumer({ topic: 'log' }));
	})
	it('Check if topic name is current', function () {
		const Consumer = kafka.consumer({ topic: 'log' });
		expect('log' === Consumer.name());
	})
	it('Check for upstream not defined when acessing downstream', function () {
		const Consumer = kafka.consumer({ topic: 'log' });
		should.throw(() => Consumer.downstream());
	})
	it('Check for upstream not defined when acessing commit', function () {
		const Consumer = kafka.consumer({ topic: 'log' });
		should.throw(() => Consumer.commit());
	})
	it('Check for upstream not defined when acessing rollback', function () {
		const Consumer = kafka.consumer({ topic: 'log' });
		should.throw(() => Consumer.rollback());
	})
	it('Check for upstream not defined when acessing shutdown', function () {
		const Consumer = kafka.consumer({ topic: 'log' });
		should.throw(() => Consumer.shutdown());
	})
});