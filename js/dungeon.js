var TileMap = function(w, h, c) {
	this.w = w;
	this.h = h;
	this.c = c;

	this.clear(this.c)
}
TileMap.prototype.clear = function (c) {
	c.fillStyle = "#000"
	c.fillRect(0, 0, this.w*TILE_SIZE, this.h*TILE_SIZE)
}