# ==============================================================================
#  This file defines the controller and the properties of the canvas
# ==============================================================================

Color =
  GRID: "#211"
  BACKGROUND: "#fff"
  # WALL: "#a99"
  # WALL: "#a11"
  # WALL: "#e60"
  WALL: "#200"
  GROUND: "#622"
  DOOR: "#400"
  DOOR: "#844"
  DEBUG: "#0F0"
  # START_POINT: "#4A3"
  # START_POINT: "#160"
  # START_POINT: "#150"
  START_POINT: "#450"
  # START_POINT: "#540"

wall = ['NONE', 'TILE', 'COMPOSED']

class CanvasController

  constructor: (@id) -> @canvas = $('#' + @id)[0].getContext("2d")

  getWidth: () -> parseInt $('#' + @id).attr("width")

  calculateTileSize: (numberOfTiles) -> @getWidth() // numberOfTiles

  calculateGridWidth: (tileSize) -> tileSize // 10

  calculateWallSize: (tileSize) -> tileSize // 3

  drawMap: (tilemap, drawGrid = true, showWalls = true) ->
    tileSize = @calculateTileSize(tilemap.width)
    @canvas.fillStyle = Color.BACKGROUND
    @canvas.fillRect(0, 0, @getWidth(), @getWidth())
    for y in [0...tilemap.height] then for x in [0...tilemap.width]
      switch tilemap[x][y]
        when Tile.FIRST_ROOM then @drawTile(x, y, tileSize, Color.START_POINT)
        when Tile.GROUND then @drawTile(x, y, tileSize, Color.GROUND)
        when Tile.WALL
          if wall[showWalls] is 'TILE'
            @drawTile(x, y, tileSize, Color.WALL)
          else if wall[showWalls] is 'COMPOSED'
            @drawWall(x, y, tileSize, Color.WALL, tilemap)
        when Tile.DOOR then @drawTile(x, y, tileSize, Color.DOOR)
    @drawGrid(tilemap) if drawGrid

  drawTile: (x, y, size, value) ->
    @canvas.fillStyle = value
    @canvas.fillRect(x * size, y * size, size, size)

  drawWall: (x, y, size, value, tilemap) ->
    flags =
      north: not tilemap.is(x, y - 1, 1, 1, Tile.EMPTY) and
             not tilemap.is(x, y - 1, 1, 1, Tile.WALL) and y > 1
      south: not tilemap.is(x, y + 1, 1, 1, Tile.EMPTY) and
             not tilemap.is(x, y + 1, 1, 1, Tile.WALL)and y < tilemap.height - 1
      east: not tilemap.is(x + 1, y, 1, 1, Tile.EMPTY) and
            not tilemap.is(x + 1, y, 1, 1, Tile.WALL) and x < tilemap.width - 1
      west: not tilemap.is(x - 1, y, 1, 1, Tile.EMPTY) and
            not tilemap.is(x - 1, y, 1, 1, Tile.WALL) and x > 1
      northwest: not tilemap.is(x - 1, y - 1, 1, 1, Tile.EMPTY) and
                 not tilemap.is(x - 1, y - 1, 1, 1, Tile.WALL) and
                 y > 1 and x > 1
      northeast: not tilemap.is(x + 1, y - 1, 1, 1, Tile.EMPTY) and
                 not tilemap.is(x + 1, y - 1, 1, 1, Tile.WALL) and
                 y > 1 and x < tilemap.width - 1
      southwest: not tilemap.is(x - 1, y + 1, 1, 1, Tile.EMPTY) and
                 not tilemap.is(x - 1, y + 1, 1, 1, Tile.WALL) and
                 y < tilemap.height - 1 and x > 1
      southeast: not tilemap.is(x + 1, y + 1, 1, 1, Tile.EMPTY) and
                 not tilemap.is(x + 1, y + 1, 1, 1, Tile.WALL) and
                 y < tilemap.height - 1 and x < tilemap.width - 1
    wallSize = @calculateWallSize(size)
    @canvas.fillStyle = value
    @canvas.fillRect(x*size, y*size, size, wallSize) if flags.north
    @canvas.fillRect(x*size, (y+1)*size-wallSize, size, wallSize) if flags.south
    @canvas.fillRect((x+1)*size-wallSize, y*size, wallSize, size) if flags.east
    @canvas.fillRect(x*size, y*size, wallSize, size) if flags.west
    @canvas.fillRect(x*size, y*size, wallSize, wallSize) if flags.northwest
    @canvas.fillRect((x+1)*size-wallSize, y*size,
        wallSize, wallSize) if flags.northeast
    @canvas.fillRect((x+1)*size-wallSize, (y+1)*size-wallSize,
        wallSize, wallSize) if flags.southeast
    @canvas.fillRect(x * size, (y + 1) * size - wallSize,
        wallSize, wallSize) if flags.southwest

  drawGrid: (tilemap) ->
    tileSize = @calculateTileSize(tilemap.width)
    @canvas.beginPath()
    @canvas.strokeStyle = Color.GRID
    for x in [0..tilemap.width]  # We assume tilemap to be squared
      @canvas.moveTo(x * tileSize, 0)
      @canvas.lineTo(x * tileSize, tilemap.width * tileSize)
      @canvas.moveTo(0, x * tileSize)
      @canvas.lineTo(tilemap.width * tileSize, x * tileSize)
    @canvas.lineWidth = @calculateGridWidth(tileSize)
    @canvas.stroke()
    @canvas.closePath()

# Make CanvasController available globally
this.CanvasController = CanvasController
this.wallStyle = wall
