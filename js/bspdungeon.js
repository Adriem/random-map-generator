var MAP_SIZE = 64
var TILE_SIZE = 400 / MAP_SIZE;
var ITERATIONS = 5
var RATIO_RESTR = 0.45
var RATIO_RESTR_ENABLE = true
var SIZE_RESTR = 5
var SIZE_RESTR_ENABLE = true
var PARTITION_LEVEL = 2
var SECTOR_MIN_SIZE = 0
var ROOM_REDUCTION_RATIO = 3


function randomValue(min, max) {
	min = min !== undefined ? min : 0
	return Math.floor(Math.random() * (max - min) + min)
}

function randomTest(val) {
	return Math.random() * 100 < val
}

var Rect = function(x, y, w, h) {
    this.x = x; //X coordinate
    this.y = y; //Y coordinate
    this.w = w; //Width
    this.h = h; //Height
    this.center = {
        x: this.x + this.w/2,
        y: this.y + this.h/2 
    }
}

var Sector = function () {
    Rect.call(this, x, y, w, h);
	this.room = undefined;
}
Sector.prototype = Object.create(Rect.prototype);
Sector.prototype.constructor = Sector;
Sector.prototype.split = function (sector, horizontalDirection, steps) {
	horizontalDirection = horizontalDirection !== undefined ? horizontalDirection : randomTest(50);
	steps = steps !== undefined ? steps : PARTITION_LEVEL;
	var div1, div2, restriction;
	if (horizontalDirection) {
		if(steps === 0 || sector.h < 2*SECTOR_MIN_SIZE || 
				sector.h/sector.w < 2*RATIO_RESTR) return [sector];
		restriction = Math.max(SECTOR_MIN_SIZE, Math.ceil(sector.h*RATIO_RESTR));
		div1 = new  Sector(sector.x, sector.y, sector.w, 
				randomValue(restriction, sector.h - restriction));
		div2 = new Sector(sector.x, sector.y + div1.h, sector.w, sector.h - div1.h);
	} else {
		if(steps === 0 || sector.w < 2*SECTOR_MIN_SIZE || 
				sector.w/sector.h < 2*RATIO_RESTR) return [sector];
		restriction = Math.max(SECTOR_MIN_SIZE, Math.ceil(sector.w*RATIO_RESTR));
		div1 = new  Sector(sector.x, sector.y, 
				randomValue(restriction, sector.w - restriction, sector.h));
		div2 = new Sector(sector.x + div1.w, sector.y, sector.w - div1.w, sector.h);
	}
	return split(div1, !horizontalDirection, steps-1).concat(split(div2, !horizontalDirection, steps-1));
}
Sector.prototype.growRoom = function () {
	var x, y, w, h
	x = this.x + randomValue(1, Math.min(Math.floor(this.w/ROOM_REDUTCION_RATIO), 
			Math.floor(this.h/ROOM_REDUCTION_RATIO)))
	//y = this.y + random(0, Math.floor(this.h/3))
	//w = this.w - (x - this.x)
	//h = this.h - (y - this.y)
	//w -= random(0, w/3)
	//h -= random(0, h/3)
	y = this.y + x - this.x
	w = this.w - 2*(x - this.x)
	h = this.h - 2*(y - this.y)
	this.room = new Room(x, y, w, h)
}

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
Tree.prototype.grow = function (iterations, splitFunc) {
	if (iterations !== 0) {
		var childNodes = splitFunc(this.node)
		if(childNodes !== undefined) {
			this.childs = []
			for (var i=0; i<childNodes.length; i++) 
				childs.push(new Tree(childNodes[i]).grow)
		}
	}
	return this;
}


var DungeonMap = function(w, h) {
	this.w = w;
	this.h = h;
	this.partitionTree = undefined;
	this.rooms = undefined;
	this.paths = undefined;
	this.tileMap = undefined;

	this.regenerate();
}
DungeonMap.prototype.regenerate = function () {
	partitionTree = new Tree(new Sector(0,0,this.w,this.h)).grow(ITERATIONS,Sector.split);
	rooms = (function(){
		var leafs = this.partitionTree.leafs;
		var rooms = [];
		for (var i=0; i<leafs.length; i++) {
			leafs[i].node.generateRoom();
			rooms.push(leafs[i].node.room);
		}
		return rooms;
	})()
	tileMap = (function(w, h, rooms) {
		var array = []
		for (var i=0; i<h; i++) {
			array [i] = []
			for (var j=0; j<w; j++)
				array [i][j] = TILE_NULL
		} 
		for (var r=0; r<rooms.length; r++) {
			for (var i=r.y; i<r.h; i++)
				for (var j=r.x; j<r.w; j++)
					array[i][j] = TILE_ROOM;
		}
		return array
	})(this.width, this.height, this.rooms)
}