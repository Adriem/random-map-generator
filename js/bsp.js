/* USING SINGLETON PATTERN */
var BSP = (function(){

    var config = {
        ITERATIONS: 4,      //Max depth of the tree
        RATIO_RESTR: 0.45,  //Ratio restriction of the rooms
        SIZE_RESTR: 5,      //Min size of a room
        PARTITION_LEVEL: 2, //Partitions in each iteration
        ROOM_REDUCTION: 0.4,
        SECTOR_MIN_SIZE: 9,//SIZE_RESTR / (1-2*ROOM_REDUCTION_RATIO);
        SECTOR_MAX_SIZE: 32,
        BIG_ROOM_CHANCE: 25,
        ROOM_DELETING_RATIO: 0.40,
        DOOR_CHANCE: 60,
        DOOR_ON_CORRIDOR_CHANCE: 0,
        PATH_COMPLEXITY: 1
    }

    /* SECTOR OBJECT */
    var Sector = function (x, y, w, h) {
        Rect.call(this, x, y, w, h);
        this.room = undefined;
    }
    Sector.prototype = Object.create(Rect.prototype);

    Sector.prototype.constructor = Sector;

    Sector.prototype.growRoom = function () {
        var x, y, w, h;
        x = this.x + randomValue(2, Math.min(
            Math.floor(this.w*config.ROOM_REDUCTION),
            Math.floor(this.h*config.ROOM_REDUCTION)
        ));
        y = this.y + x - this.x;
        w = this.w - 2*(x - this.x);
        h = this.h - 2*(y - this.y);
        this.room = new Room(x, y, w, h);
    }

    /* TREE OBJECT */
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

    Tree.prototype.getNodeList = function() {
        var array = [];
        if (this.childs !== undefined) {
            for (var i=0; i<this.childs.length; i++) {
                array = array.concat(this.childs[i].getNodeList());
            }
        }
        return array.concat([this.node]);
    }

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
                if ((this.childs[i].childs === undefined &&
                    this.childs[i].node === undefined) ||
                    (this.childs[i].childs !== undefined &&
                    this.childs[i].childs.length < 1)) {
                    this.childs.splice(i, 1);
                    i--;
                }
            }
        }
    }

    /* GENERATION FUNCTIONS */
    var generateMap = function(size) {
        var tilemap, tree, rooms, paths;
        //Initialize tilemap
        tilemap = [];
        for (var i = 0; i < size; i++) {
            tilemap [i] = [];
            for (var j = 0; j < size; j++) tilemap [i][j] = TILE_NULL;
        }
        //Generate stuff
        console.log(config.PARTITION_LEVEL);
        tree = new Tree(new Sector(0,0,size,size)).
            grow(config.ITERATIONS, split);
        console.log(tree)
        rooms = generateRooms(tree, tilemap);
        tree.removeDeadLeafs();
        paths = generatePaths(tree, tilemap);
        return tilemap;
    }

    var generateRooms = function(tree, tilemap) { //TODO ENSURE QUALITY
        var rooms = [],
            leafs = tree.leafs,
            roomsToDelete = Math.round(leafs.length * config.ROOM_DELETING_RATIO);
        // Delete some rooms
        for (var i=0; i<roomsToDelete; i++) {
            var index = randomValue(0, leafs.length);
            leafs[index].kill();
            leafs.splice(index, 1);
        }
        // Generate rooms
        for (var i=0; i<leafs.length; i++) {
            leafs[i].node.growRoom();
            rooms.push(leafs[i].node.room);
        }
        // Paint rooms in tilemap
        for (var r=0; r<rooms.length; r++) {
            rooms[r].drawOnMap(tilemap);
        }
        return rooms;
    }

    var generatePaths = function(tree, tilemap) {
        var paths = [],
            sectorList = tree.getNodeList();
        //Connect all nodes in the tree
        for (var i=0; i<sectorList.length-1; i++) {
            paths.push(new Path(sectorList[i].center, sectorList[i+1].center));
        }
        //Manually close the graph
        paths.push(new Path(
                sectorList[sectorList.length-1].center,
                sectorList[0].center)
        );
        //Paint paths in tilemap
        for (var p=0; p<paths.length; p++) {
            paths[p].drawOnMap(tilemap);
        }
        return paths;
    }

    var generateDoors = function(){ //FIXME PLS
        //Draw doors
        /*var wallsAround, groundAround, groundCorners, isRoom;
         for (var i=1; i<this.h-1; i++) {
         for (var j=1; j<this.w-1; j++) {
         if (this.tileMap[i][j] === TILE_GROUND){
         wallsAround = 0;
         groundAround = 0;
         groundCorners = 0;
         isRoom = false;
         if(this.tileMap[i][j+1] === TILE_WALL) wallsAround += 2;
         else if(this.tileMap[i][j+1] === TILE_GROUND) groundAround += 2;
         if(this.tileMap[i][j-1] === TILE_WALL) wallsAround += 2;
         else if(this.tileMap[i][j-1] === TILE_GROUND) groundAround += 2;
         if(this.tileMap[i-1][j] === TILE_WALL) wallsAround += 3;
         else if(this.tileMap[i-1][j] === TILE_GROUND) groundAround += 3;
         if(this.tileMap[i+1][j] === TILE_WALL) wallsAround += 3;
         else if(this.tileMap[i+1][j] === TILE_GROUND) groundAround += 3;
         if(this.tileMap[i-1][j-1] === TILE_GROUND) {
         groundCorners ++;
         //isRoom =
         //    (array[i-2][j-1] === TILE_GROUND || array[i-1][j-2] === TILE_GROUND);
         }
         if(this.tileMap[i-1][j+1] === TILE_GROUND) {
         groundCorners ++;
         //isRoom =
         //    (array[i-2][j+1] === TILE_GROUND || array[i-1][j+2] === TILE_GROUND);
         }
         if(this.tileMap[i+1][j-1] === TILE_GROUND) {
         groundCorners ++;
         //isRoom =
         //    (array[i+2][j-1] === TILE_GROUND || array[i+1][j-2] === TILE_GROUND);
         }
         if(this.tileMap[i+1][j+1] === TILE_GROUND) {
         groundCorners ++;
         //isRoom =
         //    (array[i+2][j+1] === TILE_GROUND || array[i+1][j+2] === TILE_GROUND);
         }
         if(((groundAround === 4 && wallsAround === 6) ||
         (groundAround === 6 && wallsAround === 4)) &&
         groundCorners >= 2  && /*(isRoom*//* && randomTest(DOOR_CHANCE))// ||
         //(!isRoom && randomTest(DOOR_ON_CORRIDOR_CHANCE)))
         this.tileMap[i][j] = TILE_DOOR;
         }
         }
         }*/
    }

    var split = function (sector, horizontalDirection, steps) {
        horizontalDirection = horizontalDirection !== undefined ? horizontalDirection : randomTest();
        steps = steps !== undefined ? steps : config.PARTITION_LEVEL;

        var div1, div2, restriction;
        if (horizontalDirection) {
            //If too narrow to split in this direction, try to split in another direction
            if (sector.h/sector.w < 2*config.RATIO_RESTR)
                return split(sector, !horizontalDirection, steps);
            //If must stop splitting
            if (steps === 0 || (sector.h < config.SECTOR_MAX_SIZE && randomTest(config.BIG_ROOM_CHANCE)) ||
                sector.h < 2*config.SECTOR_MIN_SIZE) return [sector];
            //Split
            restriction = Math.max(config.SECTOR_MIN_SIZE, Math.ceil(sector.h*config.RATIO_RESTR));
            div1 = new  Sector(sector.x, sector.y, sector.w,
                randomValue(restriction, sector.h - restriction));
            div2 = new Sector(sector.x, sector.y + div1.h, sector.w, sector.h - div1.h);
        } else {
            //If too narrow to split in this direction, try to split in another direction
            if (sector.w/sector.h < 2*config.RATIO_RESTR)
                return split(sector, !horizontalDirection, steps);
            //If must stop splitting
            if (steps === 0 || (sector.h < config.SECTOR_MAX_SIZE && randomTest(config.BIG_ROOM_CHANCE)) ||
                sector.w < 2*config.SECTOR_MIN_SIZE) return [sector];
            //Split
            restriction = Math.max(config.SECTOR_MIN_SIZE, Math.ceil(sector.w*config.RATIO_RESTR));
            div1 = new  Sector(sector.x, sector.y,
                randomValue(restriction, sector.w - restriction, sector.h), sector.h);
            div2 = new Sector(sector.x + div1.w, sector.y, sector.w - div1.w, sector.h);
        }
        return split(div1, !horizontalDirection, steps-1).concat(split(div2, !horizontalDirection, steps-1));
    }

//PUBLIC API
    return {
        config:config,
        generateMap: generateMap
    }

})();

