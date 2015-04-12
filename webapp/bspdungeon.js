var MAP_SIZE = 64
var TILE_SIZE = 400 / MAP_SIZE
var ITERATIONS = 5
var RATIO_RESTR = 0.45
var RATIO_RESTR_ENABLE = true
var SIZE_RESTR = 5
var SIZE_RESTR_ENABLE = true
var PARTITION_LEVEL = 2
var SECTOR_MIN_SIZE = 0


function randomValue(min, max) {
	min = min !== undefined ? min : 0
	return Math.floor(Math.random() * (max - min) + min)
}

function randomTest(val) {
	return Math.random() * 100 < val
}

var Sector = function () {
	this.room = undefined
}
Sector.prototype.split = function() {
	return this.room
}
/*Sector.prototype.splitStep = function (sector, horizontalDirection, steps) {
	if ((SIZE_RESTR_ENABLE && (sector.w < SECTOR_MIN_SIZE || 
			sector.h < SECTOR_MIN_SIZE)) || steps === 0) return [sector]
	var div1, div2
	if (horizontalDirection) { 		//HorizontalSplit
		do {
			div1 = new Sector(sector.x, sector.y, )
		} while (RATIO_RESTR_ENABLE && (div1.h/div.w < RATIO_RESTR || 
				div1.w/div1.h < RATIO_RESTR || div2/))
	}
}*/

var Tree = function(node) {
	this.node = node
	this.childs = undefined
}
Object.defineProperty(Tree.prototype, "leafs", {
	get: function() {
		if (this.childs === undefined) return [this.node]
		var retVal = []
		for(var i=0; i<this.childs; i++) {
			retVal = retVal.concat(this.childs[i].getLeafs())
		}
		return retVal
	}
});
Tree.prototype.grow = function (iterations) {
	if (iterations !== 0) {
		var childNodes = this.node.split()
		if(childNodes !== undefined) {
			this.childs = []
			for (var i=0; i<childNodes.length; i++) 
				childs.push(new Tree(childNodes[i]).grow)
		}
	}
	return this;
}





var DungMap = function(w, h, c) {
	this.w = w;
	this.h = h;
	this.c = c;
	this.partitionTree = undefined
	this.rooms = undefined
	this.paths = undefined
	this.tileMap = undefined

	this.clear(this.c)
}
DungMap.prototype.clear = function (c) {
	c.fillStyle = "#000"
	c.fillRect(0, 0, this.w*TILE_SIZE, this.h*TILE_SIZE)
}