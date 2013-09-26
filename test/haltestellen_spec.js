var mocha = require('mocha')
var should = require('should')

var Haltestellen = require('../lib/haltestellen')

describe('Haltestellen',function(){

	describe('getLinienlist',function(){

		it('should return an array of all haltestellen',function(done){
			Haltestellen.getLinienList(function(err,linien){
				linien.should.be.an.instanceOf(Array)
				linien[0].LINIEN_ID.should.be.ok
				linien[0].LINIEN_ID.should.not.equal('LINIEN_ID')
				done()
			})
		})
	})

	describe('queryHaltestellen',function(){
		it('should return an empty array if no haltestelle was found',function(done){
			Haltestellen.queryHaltestellen("nosuchhaltestelleinvienna",function(err,haltestellen){
				haltestellen.should.be.an.instanceOf(Array)
				haltestellen.length.should.equal(0)
				done()
			})
		})
		it('should return a list of haltestellen that match the query',function(done){
			Haltestellen.queryHaltestellen("burggasse",function(err,haltestellen){
				haltestellen.should.be.an.instanceOf(Array)
				haltestellen[0].HALTESTELLEN_ID.should.be.ok
				haltestellen[0].HALTESTELLEN_ID.should.not.equal('HALTESTELLEN_ID')

				done()
			})

		})
		it('should include all the Steige of a Haltestelle',function(done){
			Haltestellen.queryHaltestellen("burggasse",function(err,haltestellen){
				var haltestelle = haltestellen[0]
				haltestelle.steige.should.be.an.instanceOf(Array)
				var steig = haltestelle.steige[0]
				steig.STEIG_ID.should.be.ok
				done()
			})
		})
		it('should include the linien for each steig of a Haltestelle',function(done){
			Haltestellen.queryHaltestellen("burggasse",function(err,haltestellen){
				var haltestelle = haltestellen[0]
				var steig = haltestelle.steige[0]
				steig.linien.should.be.an.instanceOf(Array)
				var linie = steig.linien[0]
				linie.LINIEN_ID.should.be.ok
				done()
			})
		})
	})

	describe('queryLinien',function(){
		it('should return an empty array if no line is found',function(done){
			Haltestellen.queryLinien("notfound",function(err,linien){
				linien.should.be.an.instanceOf(Array)
				linien.length.should.equal(0)
				done()
			})
		})
		it('should return a list of linien with their all haltestellen and their respecitve steige',function(){
			Haltestellen.queryLinien("14a",function(err,linien){
				linien.should.be.an.instanceOf(Array)
				var linie = linien[0]
				linie.haltestellen.should.be.an.instanceOf(Array)
				var haltestelle = linie.haltestellen[0]
				haltestelle.steige.should.be.an.instanceOf(Array)
				var steig = haltestelle.steige[0]
				steig.FK_LINIEN_ID.should.equal(linie.LINIEN_ID)
			})
		})
	})
})