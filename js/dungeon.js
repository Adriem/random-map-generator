GRID_COLOR = "#CCC";
BACKGROUND_COLOR = "#000";
WALL_COLOR = "#777";
GROUND_COLOR = "#333";
DOOR_COLOR = "#522";
TILE_SIZE   = 400 / 64
DRAW_GRID = true;

TILE_NULL = -1;
TILE_GROUND = 0;
TILE_DOOR = 1;
TILE_WALL = 2;

var TileMap = function(w, h, c) {
	this.w = w;
	this.h = h;
	this.c = c;

    this.tilemap = (function(h, w) {
        var arr = [];
        for (var i=0; i<h; i++) {
            arr[i] = [];
            for (var j=0; j<w; j++)
                arr[i][j] = randomValue(0,4) - 1;
        }
        return arr;
    })(this.h, this.w);

	this.clear(this.c);
    this.drawTiles(this.c, this.tilemap);
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