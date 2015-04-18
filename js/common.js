//GLOBAL OPTIONS
var MAP_SIZE = 64;
var TILE_SIZE   = 400 / MAP_SIZE
var DRAW_GRID = true;
var ALGORYTHM = "BSP";

//TILE COLORS
var GRID_COLOR = "#777";
var BACKGROUND_COLOR = "#000";
var WALL_COLOR = "#833";
var GROUND_COLOR = "#CCC";
var DOOR_COLOR = "#522";

//TILE VALUES
var TILE_NULL = -1;
var TILE_GROUND = 0;
var TILE_DOOR = 1;
var TILE_WALL = 2;

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
        x: this.x + Math.floor(this.w/2),
        y: this.y + Math.floor(this.h/2) 
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
                    case TILE_NULL: //Fall through
                    default: color = BACKGROUND_COLOR; break;
                }
                c.fillStyle = color;
                c.fillRect(j*TILE_SIZE, i*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}