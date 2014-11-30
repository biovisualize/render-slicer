var expect = chai.expect;

describe('Render-queue', function() {

	function range(n){
		return Array.apply(null, Array(n)).map(function(d, i){ return i; });
	}

	var data;

	before(function() {
		data = range(40);
	});

	after(function() {
		data = null;
	});

	it('properly wraps a function', function() {
		var queuedFunc = renderQueue(function(){ });
		queuedFunc(data);
	});

	it('calls the function for every data point', function(done) {
		var count = 0;
		var queuedFunc = renderQueue(function(){
			count++;
			if(count === data.length){
				expect(count).to.equal(40);
				done();
			}
		});
		queuedFunc(data);
	});

	it('passes the data point to the wrapped function', function(done) {
		var count = 0;
		var queuedFunc = renderQueue(function(d){
			expect(d).to.equal(count);
			count++;
			if(count === data.length) done();
		});
		queuedFunc(data);
	});

	it('can pass an object as data point', function(done) {
		var dataObject = [{key: 'a', value: 0}, {key: 'b', value: 1}]
		var count = 0;
		var queuedFunc = renderQueue(function(d){
			expect(d.value).to.equal(count);
			count++;
			if(count === dataObject.length) done();
		});
		queuedFunc(dataObject);
	});

	it('calls onDone() when finished', function(done) {
		var queuedFunc = renderQueue(function(){ })
			.onDone(function(){
				expect(queuedFunc.remaining()).to.equal(0);
				done();
			});
		queuedFunc(data);
	});

	it('calls onChunkDone() when a chunk is finished', function(done) {
		var queuedFunc = renderQueue(function(){ })
			.onChunkDone(function(d){
				expect(queuedFunc.remaining()).to.equal(0);
				done();
			});
		queuedFunc(data);
	});

	it('uses a default chunk size of 1000', function(done) {
		var data = range(1000);
		var count = 0;
		var queuedFunc = renderQueue(function(){ })
			.onChunkDone(function(d){
				count++;
				expect(count).to.equal(1);
			});
		queuedFunc(data);

		queuedFunc = renderQueue(function(){ })
			.onChunkDone(function(d){
				count++;
				if(count === 2) done();
			});
		data = range(1001);
		queuedFunc(data);
	});

	it('sets the chunk size, number of data entries to be rendered each frame', function(done) {
		var count = 0;
		var queuedFunc = renderQueue(function(){ })
			.rate(2)
			.onChunkDone(function(d){
				count++;
				if(count === data.length / 2) done();
			});
		queuedFunc(data);
	});

	it('gets the chunk size', function() {
		var queuedFunc = renderQueue(function(){ })
			.rate(2);
		expect(queuedFunc.rate()).to.equal(2);
	});

	it('can use remaining() to calculate progress percentage', function(done) {
		var count = 0;
		var expectedProgress = [25, 50, 75, 100];
		var queuedFunc = renderQueue(function(){ })
			.rate(10)
			.onChunkDone(function(d){
				var percentageRemaining = 100 - (queuedFunc.remaining() / data.length) * 100;
				expect(percentageRemaining).to.equal(expectedProgress[count]);
				count++;
				if(percentageRemaining === 100) done();
			});
		queuedFunc(data);
	});

	it('can use count() to calculate progress percentage', function(done) {
		var queuedFunc = renderQueue(function(){ })
			.rate(10)
			.onFrameDone(function(){
				var progress = queuedFunc.count() / data.length * 100;
				if(progress === 100){
					done();
				}
			});
		queuedFunc(data);
	});

	it('stops and replaces the current queue when called with new data', function(done) {
		var count = 0;
		var queuedFunc = renderQueue(function(){ })
			.rate(10)
			.onChunkDone(function(){
				count++;
				if(queuedFunc.remaining() === 0){
					expect(count).to.equal(2);
					done()
				}
			});
		queuedFunc(data);
		queuedFunc(range(5))
	});

	it('stops the current queue using invalidate()', function(done) {
		var count = 0;
		var queuedFunc = renderQueue(function(){ })
			.rate(10)
			.onChunkDone(function(){
				count++;
				if(queuedFunc.remaining() === 30){
					expect(count).to.equal(1);
					done()
				}
			});
		queuedFunc(data);
		queuedFunc.invalidate();
	});

	it('calls onStart() before the first render', function(done) {
		var isStarted = false;
		var queuedFunc = renderQueue(function(){ })
			.onStart(function(){
				isStarted = true;
			})
			.onFrameDone(function(){
				expect(isStarted).to.be.true;
				done()
			});
		queuedFunc(data);
	});

	it('adds new data and continue rendering', function(done) {
		var count = 0;
		var queuedFunc = renderQueue(function(){ })
			.onFrameDone(function(){
				count++;
				if(count > 40) done();
			});
		queuedFunc(data);
		queuedFunc.add([40, 41]);
	});

});