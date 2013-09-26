var csv = require('csv')
var async = require('async')
var _ = require('underscore')
var fs = require('fs')
//var request = require('request')
//http://data.wien.gv.at/csv/wienerlinien-ogd-haltestellen.csv


var HALTESELLEN_FIELDS = ["HALTESTELLEN_ID","TYP","DIVA","NAME","GEMEINDE","GEMEINDE_ID","WGS84_LAT","WGS84_LON","STAND"]
var LINIEN_FIELDS = ["LINIEN_ID","BEZEICHNUNG","REIHENFOLGE","ECHTZEIT","VERKEHRSMITTEL","STAND"]
var STEIGE_FIELDS = ["STEIG_ID","FK_LINIEN_ID","FK_HALTESTELLEN_ID","RICHTUNG","REIHENFOLGE","RBL_NUMMER","BEREICH","STEIG","STEIG_WGS84_LAT","STEIG_WGS84_LON","STAND"]

var DATA_FILES = [
	{name:'haltestellen',path:'../data/wienerlinien-ogd-haltestellen.csv'},
	{name:'linien',path:'../data/wienerlinien-ogd-linien.csv'},
	{name:'steige',path:'../data/wienerlinien-ogd-steige.csv'}
]

var CACHE = {}
var CACHE_DIR = __dirname+"/../cache/"

function cache(name,data){
	if(!data){

		if(!CACHE[name]){
			try{
				CACHE[name]=require(CACHE_DIR+name)
			}catch(e){

			}
		}
		return CACHE[name]
	}
	fs.writeFileSync(CACHE_DIR+name,"module.exports="+JSON.stringify(data))
}

function readFile(file,callback){
	var data = cache(file.name)
	if(data){
		callback(null,data)
		return;
	}
	var rows = []
	csv()
	.from.path(__dirname+"/"+file.path,{delimiter:';'})
	.to.array( function(data){
		cache(file.name,data.slice(1))
		callback(null,data.slice(1))
	});

}

function readData(files,callback){
	var get ={}
	_.each(files,function(file){
		get[file.name] = function(cb){
			readFile(file,cb)
		}
	})
	async.parallel(get,function(err,data){

		callback(err,data)
	})
}


function filterHaltestellen(s,haltestellen){
	var found = []
	_.each(haltestellen,function(h){
		if(h[3].toLowerCase().indexOf(s) > -1){
			found.push(_.object(HALTESELLEN_FIELDS,h))
		}
	})
	return found
}
function getSteigeForHalteStelle(haltestellenID,steige,linien){
	var found = []
	_.each(steige,function(s){
		if(s[2] == haltestellenID){
			var steig = _.object(STEIGE_FIELDS,s)
				steig.linien=getLinienForSteige(steig.FK_LINIEN_ID,linien)
			found.push(steig)
		}
	})
	return found

}
function getLinienForSteige(linienID,linien){
	var found =[]
	_.each(linien,function(l){
		if(l[0] == linienID){
			found.push(_.object(LINIEN_FIELDS,l))
		}
	})
	return found
}
function getHaltestelle(haltestellenID,haltestellen){
	for(var i in haltestellen){
		if(haltestellen[i][0]===haltestellenID){
			return _.object(HALTESELLEN_FIELDS,haltestellen[i])
		}
	}
}
function getSteig(steigID,steige){
	for(var i in steige){
		if(steige[i][0]===steigID){
			return _.object(STEIGE_FIELDS,steige[i])
		}
	}
}
function getSteigeForLinie(linieID,steige){

}
function getHalteStellenForLinie(linieID,haltestellen,steige,linien){
	var found = []
	_.each(steige,function(s){
		if(s[1]==linieID){
			var haltestelle = getHaltestelle(s[2],haltestellen)
				haltestelle.steige = [getSteig(s[0],steige)]
			found.push(haltestelle)
		}
	})
	return found
}

function filterLinien(s,linien){
	var found = []
	_.each(linien,function(l){
		if(l[1].toLowerCase().indexOf(s.toLowerCase())>-1){
			found.push(_.object(LINIEN_FIELDS,l))
		}
	})
	return found
}

function popuplateHalteStellen(haltestellen,linien,steige){
	var objects = []
	_.each(haltestellen,function(haltestelle){

		haltestelle.steige = getSteigeForHalteStelle(haltestelle.HALTESTELLEN_ID,steige,linien)
		objects.push(haltestelle)
	})
	return objects
}
function popuplateLinien(ls,haltestellen,steige,linien){
	var objects  = []
	_.each(ls,function(linie){
		linie.haltestellen = getHalteStellenForLinie(linie.LINIEN_ID,haltestellen,steige,linien)
		objects.push(linie)
	})
	return objects
}

function getLinien(callback){
	readFile(DATA_FILES[1],function(err,linien){
		var objects = []
		_.each(linien,function(linie){
			objects.push(_.object(LINIEN_FIELDS,linie))
		})
		callback(err,objects)
	})
}

function queryHaltestelle(s,callback){
	readData(DATA_FILES,function(err,data){
		var haltestellen = filterHaltestellen(s,data.haltestellen)
			haltestellen = popuplateHalteStellen(haltestellen,data.linien,data.steige)
		callback(err,haltestellen)
	})
}
function queryLinie(s,callback){
	readData(DATA_FILES,function(err,data){
		var linien = filterLinien(s,data.linien)
			linien = popuplateLinien(linien,data.haltestellen,data.steige,data.linien)
		callback(err,linien)
	})
}

var s = process.argv[2]
var start = Date.now()
/*

queryHaltestelle(s,function(err,data){
	console.log(JSON.stringify(data))
	console.log(Date.now()-start)
})

queryLinie('14A',function(err,data){
	console.log(JSON.stringify(data))
	console.log(Date.now()-start)
})

getLinien(function(err,linien){
	console.log(linien)
})

*/


module.exports = {
	queryHaltestellen:queryHaltestelle,
	queryLinien:queryLinie,
	getLinienList:getLinien
}



