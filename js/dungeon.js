GRID_COLOR = "rgba(255, 255, 255, 0.4)"
TILE_SIZE   = 400 / 64
DRAW_GRID = true;

var TileMap = function(w, h, c) {
	this.w = w;
	this.h = h;
	this.c = c;

	this.clear(this.c);
	if (DRAW_GRID) this.drawGrid();
}
TileMap.prototype.clear = function (c) {
	this.c.fillStyle = "#000"
	this.c.fillRect(0, 0, this.w*TILE_SIZE, this.h*TILE_SIZE)
}
TileMap.prototype.drawGrid = function() {
    this.c.beginPath();
    this.c.strokeStyle = GRID_COLOR;
    this.c.lineWidth = 0.5
    for (var i = 0; i < MAP_SIZE; i++) {
        this.c.moveTo(i * TILE_SIZE, 0)
        this.c.lineTo(i * TILE_SIZE, MAP_SIZE * TILE_SIZE)
        this.c.moveTo(0, i * TILE_SIZE)
        this.c.lineTo(MAP_SIZE * TILE_SIZE, i * TILE_SIZE)
    }
    this.c.stroke()
    this.c.closePath()
}