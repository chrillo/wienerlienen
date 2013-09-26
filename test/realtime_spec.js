var mocha = require('mocha')
var should = require('should')
var Realtime = require('../lib/realtime')
var sinon = require('sinon')

describe('realtime',function(){

	describe('Constructor',function(){

		it('should require a sender',function(done){

			var r = new Realtime({sender:'some sender'})

			var test = function(){
				var r = new Realtime({})
			}
			test.should.throw();

			done()
		})
	})
	describe('getMonitorsForRBLS',function(){
		it('should build a query url and fetch the results from the realtime api',function(done){
			var realtime = new Realtime({sender:'some sender'})
			var spy =  sinon.spy();
			realtime.GET = function(url,cb){
				spy()
				cb()
			}
			realtime.getMonitorsForRBLS([770],function(err,monitors){
				spy.calledOnce.should.be.ok
				done()
			})
		})


	})


})