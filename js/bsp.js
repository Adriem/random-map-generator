var ITERATIONS = 3
var RATIO_RESTR = 0.45
var SIZE_RESTR = 5
var PARTITION_LEVEL = 2
var SECTOR_MIN_SIZE = 0
var ROOM_REDUCTION_RATIO = 0.4
var SECTOR_MIN_SIZE = 9;//SIZE_RESTR / (1-2*ROOM_REDUCTION_RATIO);
var SECTOR_MAX_SIZE = 32;
var BIG_ROOM_CHANCE = 25;
var NO_ROOM_CHANCE = 25;

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
    //y = this.y + random(0, Math.floor(this.h/3))
    //w = this.w - (x - this.x)
    //h = this.h - (y - this.y)
    //w -= random(0, w/3)
    //h -= random(0, h/3)
    y = this.y + x - this.x
    w = this.w - 2*(x - this.x)
    h = this.h - 2*(y - this.y)
    this.room = new Rect(x, y, w, h)
}

var split = function (sector, horizontalDirection, steps) {
    horizontalDirection = horizontalDirection !== undefined ? horizontalDirection : randomTest(50);
    steps = steps !== undefined ? steps : PARTITION_LEVEL;
    
    var div1, div2, restriction;
    if (horizontalDirection) {
        
        //If too narrow to split in this direction, try to split in another direction
        if (sector.h/sector.w < 2*RATIO_RESTR) return split(sector, !horizontalDirection, steps);
        
        //If must stop splitting
        if (steps === 0 ||  (sector.h < SECTOR_MAX_SIZE && randomTest(BIG_ROOM_CHANCE)) ||
                sector.h < 2*SECTOR_MIN_SIZE) return [sector];
        
        //Split
        restriction = Math.max(SECTOR_MIN_SIZE, Math.ceil(sector.h*RATIO_RESTR));
        div1 = new  Sector(sector.x, sector.y, sector.w, 
                randomValue(restriction, sector.h - restriction));
        div2 = new Sector(sector.x, sector.y + div1.h, sector.w, sector.h - div1.h);

    } else {
        if (sector.w/sector.h < 2*RATIO_RESTR) return split(sector, !horizontalDirection, steps);
        if(steps === 0 || (sector.h < SECTOR_MAX_SIZE && randomTest(BIG_ROOM_CHANCE)) ||
                sector.w < 2*SECTOR_MIN_SIZE) return [sector];
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
        if (this.childs === undefined) return randomTest(NO_ROOM_CHANCE) ? [] : [this.node];
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

var BSPMap = function(w, h) {
    this.w = w;
    this.h = h;
    this.partitionTree = undefined;
    this.rooms = undefined;
    this.paths = undefined;
    this.tileMap = undefined;

    this.regenerate();
}
BSPMap.prototype.regenerate = function () {
    this.partitionTree = new Tree(new Sector(0,0,this.w,this.h)).grow(ITERATIONS, split);
    this.rooms = (function(leafs) {
        var rooms = [];
        for (var i=0; i<leafs.length; i++) {
            leafs[i].growRoom();
            rooms.push(leafs[i].room);
        }
        return rooms;
    })(this.partitionTree.leafs);
    this.tileMap = (function(w, h, rooms) {
        var array = [];
        for (var i=0; i<h; i++) {
            array [i] = [];
            for (var j=0; j<w; j++)
                array [i][j] = TILE_NULL;
        }
        for (var r=0; r<rooms.length; r++) {
            for (var i=rooms[r].y; i<rooms[r].y + rooms[r].h; i++)
                for (var j=rooms[r].x; j<rooms[r].x + rooms[r].w; j++){
                    array[i][j] = TILE_GROUND;
                }
            for (var i=rooms[r].y-1; i<=rooms[r].y + rooms[r].h; i++) 
                array[i][rooms[r].x - 1] = TILE_WALL;
            for (var i=rooms[r].y-1; i<=rooms[r].y + rooms[r].h; i++) 
                array[i][rooms[r].x + rooms[r].w] = TILE_WALL;
            for (var i=rooms[r].x-1; i<=rooms[r].x + rooms[r].w; i++)
                array[rooms[r].y-1][i] = TILE_WALL;
            for (var i=rooms[r].x-1; i<=rooms[r].x + rooms[r].w; i++) 
                array[rooms[r].y + rooms[r].h][i] = TILE_WALL;
        }
        /*for (var i=1; i<h-1; i++)
            for (var j=1; j<w-1; j++)
                if (array[i][j] === TILE_GROUND) {
                    if (array[i-1][j-1] === TILE_NULL) array[i-1][j-1] =  TILE_WALL;
                    if (array[i-1][j] === TILE_NULL) array[i-1][j] =  TILE_WALL;
                    if (array[i-1][j+1] === TILE_NULL) array[i-1][j+1] =  TILE_WALL;
                    if (array[i][j-1] === TILE_NULL) array[i-1][j-1] =  TILE_WALL;
                    if (array[i][j+1] === TILE_NULL) array[i-1][j+1] =  TILE_WALL;
                    if (array[i+1][j-1] === TILE_NULL) array[i+1][j-1] =  TILE_WALL;
                    if (array[i+1][j] === TILE_NULL) array[i+1][j] =  TILE_WALL;
                    if (array[i+1][j+1] === TILE_NULL) array[i+1][j+1] =  TILE_WALL;
                }*/
        return array;
    })(this.w, this.h, this.rooms);
}