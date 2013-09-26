var request = require('request')
var async = require('async')
var express = require('express')
var util = require('util')



function Realtime(options){

	if(!options.sender){
		throw new Error('a sender is required')
	}
	this.base = options.base || "http://www.wienerlinien.at/ogd_realtime/monitor"
	this.sender = options.sender
}

Realtime.prototype.GET = function(url,callback){
	url+="&sender="+this.sender

	request(url,{json:true},function(err,result,body){
		if(body && body.message.value=="OK"){
			callback(err,body.data.monitors)
		}else{
			callback(err,body)
		}
	})
}

Realtime.prototype.getMonitorsForRBLS=function(rbls,callback){
	var get = {}
	var qs ="?activateTrafficInfo=stoerungkurz";
	for(var r in rbls){
		qs+="&rbl="+rbls[r]
	}
	this.GET(this.base+qs,callback)
}


module.exports = Realtime





