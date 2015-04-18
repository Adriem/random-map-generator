var ITERATIONS = 3
var RATIO_RESTR = 0.45
var SIZE_RESTR = 5
var PARTITION_LEVEL = 2
var SECTOR_MIN_SIZE = 0
var ROOM_REDUCTION_RATIO = 0.4
var SECTOR_MIN_SIZE = 9;//SIZE_RESTR / (1-2*ROOM_REDUCTION_RATIO);
var SECTOR_MAX_SIZE = 32;
var BIG_ROOM_CHANCE = 25;
var NO_ROOM_CHANCE = 40;
var DOOR_CHANCE = 60;
var DOOR_ON_CORRIDOR_CHANCE = 0;

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
    this.room = new Rect(x, y, w, h)
}

var split = function (sector, horizontalDirection, steps) {
    horizontalDirection = horizontalDirection !== undefined ? horizontalDirection : randomTest();
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
    if (this.childs !== undefined)
        for (var i=0; i<this.childs.length; i++) {
            this.childs[i].removeDeadLeafs();
            if ((this.childs[i].childs === undefined && this.childs[i].node === undefined)
                    || (this.childs[i].childs !== undefined && this.childs[i].childs.length < 1)) {
                console.log(this.childs[i])
                this.childs.splice(i, 1);
                i--; 
            }
        }
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
    
    //Generate tree
    this.partitionTree = new Tree(new Sector(0,0,this.w,this.h)).grow(ITERATIONS, split);
    
    //Generate rooms
    this.rooms = (function(leafs) {
        var rooms = [];
        for (var i=0; i<leafs.length; i++) 
            if (randomTest(100-NO_ROOM_CHANCE)) {
                leafs[i].node.growRoom();
                rooms.push(leafs[i].node.room);
            } else leafs[i].kill(); //If no room is created, kill the leaf
        return rooms;
    })(this.partitionTree.leafs);

    //Remove dead leafs
    this.partitionTree.removeDeadLeafs();

    console.log(this.partitionTree.leafs);
    console.log(this.partitionTree);

    //Generate paths and remove dead leafs
    this.paths = (function getPaths(tree) {
        var paths = [];
        if (tree.childs !== undefined) {
            for (var i=0; i<tree.childs.length; i++)
                if (tree.childs[i].childs !== undefined || tree.childs[i].node.room !== undefined) {
                    paths = paths.concat(
                        [new Path(tree.node.center, tree.childs[i].node.center)],
                        [new Path(tree.childs[i].node.center, 
                            tree.childs[(i+1)%tree.childs.length].node.center)],
                        getPaths(tree.childs[i])
                    );
                }
        }
        return paths;
    })(this.partitionTree)

    //Generate tilemap
    this.tileMap = (function(w, h, rooms, paths) {
        var array = [];
        //Clear map
        for (var i=0; i<h; i++) {
            array [i] = [];
            for (var j=0; j<w; j++)
                array [i][j] = TILE_NULL;
        }
        //Draw rooms
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
        //Draw paths
        for (var p=0; p<paths.length; p++) {
            var x1, x2, y1, y2;
            x1 = paths[p].start.x < paths[p].end.x ? paths[p].start.x : paths[p].end.x;
            x2 = paths[p].start.x < paths[p].end.x ? paths[p].end.x : paths[p].start.x;
            y1 = paths[p].start.y < paths[p].end.y ? paths[p].start.y : paths[p].end.y;
            y2 = paths[p].start.y < paths[p].end.y ? paths[p].end.y : paths[p].start.y;
            for (var i = y1; i <= y2; i++) {
                array[i][paths[p].start.x] = TILE_GROUND;
                for (var j = -1; j <= 1; j++)
                    for (var k = -1; k <= 1; k++)
                        if (array[i+j][paths[p].start.x+k] === TILE_NULL) 
                            array[i+j][paths[p].start.x+k] = TILE_WALL;
            }
            for (var i = x1; i <= x2; i++) 
                if (array[paths[p].end.y][i] !== TILE_GROUND) {
                    wallsAround = 0;
                    groundAround = 0;
                    pathAround = 0;
                    array[paths[p].end.y][i] = array[paths[p].end.y][i] === TILE_WALL ? 
                        TILE_GROUND : TILE_PATH;
                    for (var j = -1; j <= 1; j++)
                        for (var k = -1; k <= 1; k++)
                            if (array[paths[p].end.y+j][i+k] === TILE_NULL) 
                                array[paths[p].end.y+j][i+k] = TILE_WALL;
                }
            
        }
        //Draw doors
        var wallsAround, groundAround, groundCorners, isRoom;
        for (var i=1; i<h-1; i++)
            for (var j=1; j<w-1; j++)
                if (array[i][j] === TILE_GROUND){
                    wallsAround = 0;
                    groundAround = 0;
                    groundCorners = 0;
                    isRoom = false;
                    if(array[i][j+1] === TILE_WALL) wallsAround += 2;
                    else if(array[i][j+1] === TILE_GROUND) groundAround += 2;
                    if(array[i][j-1] === TILE_WALL) wallsAround += 2;
                    else if(array[i][j-1] === TILE_GROUND) groundAround += 2;
                    if(array[i-1][j] === TILE_WALL) wallsAround += 3;
                    else if(array[i-1][j] === TILE_GROUND) groundAround += 3;
                    if(array[i+1][j] === TILE_WALL) wallsAround += 3;
                    else if(array[i+1][j] === TILE_GROUND) groundAround += 3;
                    if(array[i-1][j-1] === TILE_GROUND) {
                        groundCorners ++;
                        //isRoom = 
                        //    (array[i-2][j-1] === TILE_GROUND || array[i-1][j-2] === TILE_GROUND);
                    }
                    if(array[i-1][j+1] === TILE_GROUND) {
                        groundCorners ++;
                        //isRoom = 
                        //    (array[i-2][j+1] === TILE_GROUND || array[i-1][j+2] === TILE_GROUND);
                    }
                    if(array[i+1][j-1] === TILE_GROUND) {
                        groundCorners ++;
                        //isRoom = 
                        //    (array[i+2][j-1] === TILE_GROUND || array[i+1][j-2] === TILE_GROUND);
                    }
                    if(array[i+1][j+1] === TILE_GROUND) {
                        groundCorners ++;
                        //isRoom = 
                        //    (array[i+2][j+1] === TILE_GROUND || array[i+1][j+2] === TILE_GROUND);
                    }       
                    if(((groundAround === 4 && wallsAround === 6) || 
                            (groundAround === 6 && wallsAround === 4)) 
                            && groundCorners >= 2  && /*(isRoom &&*/ randomTest(DOOR_CHANCE))// ||
                            //(!isRoom && randomTest(DOOR_ON_CORRIDOR_CHANCE))) 
                        array[i][j] = TILE_DOOR;
                }
        return array;
            
    })(this.w, this.h, this.rooms, this.paths);
}