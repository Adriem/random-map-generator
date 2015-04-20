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
    //Initialize map
    this.tileMap = [];
    for (var i=0; i<this.h; i++) {
        this.tileMap [i] = [];
        for (var j=0; j<this.w; j++) this.tileMap [i][j] = TILE_NULL;
    }
    //Generate stuff
    this.partitionTree = new Tree(new Sector(0,0,this.w,this.h)).grow(ITERATIONS, split);
    this.generateRooms();
    this.partitionTree.removeDeadLeafs();
    this.generatePaths();
    //this.generateDoors();

}

BSPMap.prototype.generateRooms = function() { //TODO ENSURE QUALITY
    var leafs, roomsToDelete, index;
    this.rooms = [];
    leafs = this.partitionTree.leafs;
    roomsToDelete = Math.round(leafs.length * ROOM_DELETING_RATIO / 100);
    //Delete some rooms
    for (var i=0; i<roomsToDelete; i++) {
        index = randomValue(0, leafs.length);
        leafs[index].kill();
        leafs.splice(index, 1);
    }
    //Generate rooms
    for (var i=0; i<leafs.length; i++) {
        leafs[i].node.growRoom();
        this.rooms.push(leafs[i].node.room);
    }
    //Paint rooms in tilemap
    for (var r=0; r<this.rooms.length; r++) {
        this.rooms[r].drawOnMap(this.tileMap);
    }
}

BSPMap.prototype.generatePaths = function(tree) {
    this.paths = [];
    var sectorList = this.partitionTree.getNodeList();
    for (var i=0; i<sectorList.length-1; i++) {
        this.paths.push(
            new Path(sectorList[i].center, sectorList[i+1].center)
        );
    }
    //Manually close the graph
    this.paths.push(new Path(
            sectorList[sectorList.length-1].center,
            sectorList[0].center)
    );
    //Paint paths in tilemap
    for (var p=0; p<this.paths.length; p++) {
        this.paths[p].drawOnMap(this.tileMap);
    }
}

BSPMap.prototype.generateDoors = function(){ //FIXME PLS
    //Draw doors
    var wallsAround, groundAround, groundCorners, isRoom;
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
                        groundCorners >= 2  && /*(isRoom &&*/ randomTest(DOOR_CHANCE))// ||
                        //(!isRoom && randomTest(DOOR_ON_CORRIDOR_CHANCE))) 
                    this.tileMap[i][j] = TILE_DOOR;
            }
        }
    }
}