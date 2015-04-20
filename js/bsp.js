var ITERATIONS = 4
var RATIO_RESTR = 0.45
var SIZE_RESTR = 5
var PARTITION_LEVEL = 2
var SECTOR_MIN_SIZE = 0
var ROOM_REDUCTION_RATIO = 0.4
var SECTOR_MIN_SIZE = 9;//SIZE_RESTR / (1-2*ROOM_REDUCTION_RATIO);
var SECTOR_MAX_SIZE = 32;
var BIG_ROOM_CHANCE = 25;
var ROOM_DELETING_RATIO = 40;
var DOOR_CHANCE = 60;
var DOOR_ON_CORRIDOR_CHANCE = 0;
var PATH_COMPLEXITY = 1;

var Sector = function (x, y, w, h) {
    Rect.call(this, x, y, w, h);
    this.room = undefined;
}
Sector.prototype = Object.create(Rect.prototype);
Sector.prototype.constructor = Sector;
Sector.prototype.growRoom = function () {
    var x, y, w, h
    x = this.x + randomValue(2, Math.min(Math.floor(this.w*ROOM_REDUCTION_RATIO), 
            Math.floor(this.h*ROOM_REDUCTION_RATIO)))
    y = this.y + x - this.x
    w = this.w - 2*(x - this.x)
    h = this.h - 2*(y - this.y)
    this.room = new Room(x, y, w, h)
}

var split = function (sector, horizontalDirection, steps) {
    horizontalDirection = horizontalDirection !== undefined ? horizontalDirection : randomTest();
    steps = steps !== undefined ? steps : PARTITION_LEVEL;
    
    var div1, div2, restriction;
    if (horizontalDirection) {
        
        //If too narrow to split in this direction, try to split in another direction
        if (sector.h/sector.w < 2*RATIO_RESTR) return split(sector, !horizontalDirection, steps);
        
        //If must stop splitting
        if (steps === 0 || (sector.h < SECTOR_MAX_SIZE && randomTest(BIG_ROOM_CHANCE)) ||
                sector.h < 2*SECTOR_MIN_SIZE) return [sector];
        
        //Split
        restriction = Math.max(SECTOR_MIN_SIZE, Math.ceil(sector.h*RATIO_RESTR));
        div1 = new  Sector(sector.x, sector.y, sector.w, 
                randomValue(restriction, sector.h - restriction));
        div2 = new Sector(sector.x, sector.y + div1.h, sector.w, sector.h - div1.h);

    } else {
       
        //If too narrow to split in this direction, try to split in another direction
        if (sector.w/sector.h < 2*RATIO_RESTR) return split(sector, !horizontalDirection, steps);
        
        //If must stop splitting
        if(steps === 0 || (sector.h < SECTOR_MAX_SIZE && randomTest(BIG_ROOM_CHANCE)) ||
                sector.w < 2*SECTOR_MIN_SIZE) return [sector];
        
        //Split
        restriction = Math.max(SECTOR_MIN_SIZE, Math.ceil(sector.w*RATIO_RESTR));
        div1 = new  Sector(sector.x, sector.y, 
                randomValue(restriction, sector.w - restriction, sector.h), sector.h);
        div2 = new Sector(sector.x + div1.w, sector.y, sector.w - div1.w, sector.h);
    }
    return split(div1, !horizontalDirection, steps-1).concat(split(div2, !horizontalDirection, steps-1));
}

var Tree = function(node) {
    this.node = node
    this.childs = undefined
}
Object.defineProperty(Tree.prototype, "leafs", {
    get: function() {
        if (this.childs === undefined) return [this];
        var retVal = [];
        for(var i=0; i<this.childs.length; i++) {
            retVal = retVal.concat(this.childs[i].leafs);
        }
        return retVal;
    }
});
Tree.prototype.grow = function (iterations, splitFunc) {
    if (iterations !== 0) {
        var childNodes = splitFunc(this.node);
        if(childNodes !== undefined) {
            this.childs = [];
            for (var i=0; i<childNodes.length; i++) 
                this.childs.push(new Tree(childNodes[i]).grow(iterations-1, splitFunc));
        }
    }
    return this;
}
Tree.prototype.kill = function () {
    this.node = undefined;
    this.childs = undefined;
}
Tree.prototype.removeDeadLeafs = function() {
    if (this.childs !== undefined) {
        for (var i=0; i<this.childs.length; i++) {
            this.childs[i].removeDeadLeafs();
            if ((this.childs[i].childs === undefined && this.childs[i].node === undefined)
                    || (this.childs[i].childs !== undefined && this.childs[i].childs.length < 1)) {
                this.childs.splice(i, 1);
                i--;
            }
        }
    }
}
Tree.prototype.getNodeList = function() {
    var array = [];
    if (this.childs !== undefined) {
        for (var i=0; i<this.childs.length; i++) {
            array = array.concat(this.childs[i].getNodeList());
        }
    }
    return array.concat([this.node]);
}

