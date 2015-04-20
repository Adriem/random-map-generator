//GLOBAL OPTIONS
var MAP_SIZE = 40;
var TILE_SIZE   = 400 / MAP_SIZE
var DRAW_GRID = true;
var ALGORYTHM = "BSP";

//TILE COLORS
var GRID_COLOR = "#444";
var BACKGROUND_COLOR = "#000";
var WALL_COLOR = "#833";
var GROUND_COLOR = "#CCC";
var DOOR_COLOR = "#228";
var PATH_COLOR = "#522";

//TILE VALUES
var TILE_NULL = -1;
var TILE_GROUND = 0;
var TILE_DOOR = 1;
var TILE_WALL = 2;
var TILE_PATH = 3

function randomValue(min, max) {
    min = min !== undefined ? min : 0
    return Math.floor(Math.random() * (max - min) + min)
}

function randomTest(val) {
    val = val !== undefined ? val : (50);
    return Math.random() * 100 < val;
}

var Point = function(x, y) {
    this.x = x;
    this.y = y;
}

var Rect = function(x, y, w, h) {
    this.x = x; //X coordinate
    this.y = y; //Y coordinate
    this.w = w; //Width
    this.h = h; //Height
    this.center = new Point(
        this.x + Math.floor(this.w/2),
        this.y + Math.floor(this.h/2) 
    );
}

var Room = function (x, y, w, h) {
    Rect.call(this, x, y, w, h);
}
Room.prototype = Object.create(Rect.prototype);
Room.prototype.constructor = Room;
Room.prototype.drawOnMap = function (map) {
    for (var i=this.y; i<this.y + this.h; i++)
        for (var j=this.x; j<this.x + this.w; j++){
            map[i][j] = TILE_GROUND;
        }
    for (var i=this.y-1; i<=this.y + this.h; i++) 
        map[i][this.x - 1] = TILE_WALL;
    for (var i=this.y-1; i<=this.y + this.h; i++) 
        map[i][this.x + this.w] = TILE_WALL;
    for (var i=this.x-1; i<=this.x + this.w; i++)
        map[this.y-1][i] = TILE_WALL;
    for (var i=this.x-1; i<=this.x + this.w; i++) 
        map[this.y + this.h][i] = TILE_WALL;
}


var Path = function(start, end) {
    this.start = start;
    this.end = end;
}
Path.prototype.drawOnMap = function(map) {
    var x1, x2, y1, y2;
    x1 = this.start.x < this.end.x ? this.start.x : this.end.x;
    x2 = this.start.x < this.end.x ? this.end.x : this.start.x;
    y1 = this.start.y < this.end.y ? this.start.y : this.end.y;
    y2 = this.start.y < this.end.y ? this.end.y : this.start.y;
    for (var i = y1; i <= y2; i++) {
        map[i][this.start.x] = TILE_GROUND;
        for (var j = -1; j <= 1; j++)
            for (var k = -1; k <= 1; k++)
                if (map[i+j][this.start.x+k] === TILE_NULL) 
                    map[i+j][this.start.x+k] = TILE_WALL;
    }
    for (var i = x1; i <= x2; i++) {
        map[this.end.y][i] = TILE_GROUND;
        for (var j = -1; j <= 1; j++)
            for (var k = -1; k <= 1; k++)
                if (map[this.end.y+j][i+k] === TILE_NULL) 
                    map[this.end.y+j][i+k] = TILE_WALL;
    }
}


var TileMap = function(w, h, c) {
	this.w = w;
	this.h = h;
	this.c = c;

    this.map = (function(w, h) {
        switch (ALGORYTHM) {
            case "BSP": return new BSPMap(w, h);
            case "Cellular": return undefined;
            case "Perlin": return undefined;
            default: return undefined;
        }
    })(this.w, this.h);

	this.clear(this.c);
    this.drawTiles(this.c, this.map.tileMap);
	if (DRAW_GRID) this.drawGrid(this.c);
}
TileMap.prototype.clear = function (c) {
	c.fillStyle = BACKGROUND_COLOR;
	c.fillRect(0, 0, this.w*TILE_SIZE, this.h*TILE_SIZE)
}
TileMap.prototype.drawGrid = function(c) {
    c.beginPath();
    c.strokeStyle = GRID_COLOR;
    c.lineWidth = 0.5
    for (var i = 0; i < MAP_SIZE; i++) {
        c.moveTo(i * TILE_SIZE, 0)
        c.lineTo(i * TILE_SIZE, MAP_SIZE * TILE_SIZE)
        c.moveTo(0, i * TILE_SIZE)
        c.lineTo(MAP_SIZE * TILE_SIZE, i * TILE_SIZE)
    }
    c.stroke()
    c.closePath()
}
TileMap.prototype.drawTiles = function(c, tilemap) {
    var color; 
    for (var i=0; i<tilemap.length; i++) {
            for (var j=0; j<tilemap[i].length; j++) {
                switch(tilemap[i][j]) {
                    case TILE_GROUND: color = GROUND_COLOR; break;
                    case TILE_WALL: color = WALL_COLOR; break;
                    case TILE_DOOR: color = DOOR_COLOR; break;
                    case TILE_PATH: color = PATH_COLOR; break;
                    case TILE_NULL: //Fall through
                    default: color = BACKGROUND_COLOR; break;
                }
                c.fillStyle = color;
                c.fillRect(j*TILE_SIZE, i*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}