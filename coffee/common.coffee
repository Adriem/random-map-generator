# DEFAULT PARAMS
@MAP_SIZE = 50
@CANVAS_SIZE = 400
@TILE_SIZE = () -> CANVAS_SIZE / MAP_SIZE
@GRID_WIDTH = () -> CANVAS_SIZE / 1
@SHOW_GRID = true
@SHOW_WALLS = true
@SHOW_DOORS = true
@ALGORYTHM = "BSP"

# TILE COLORS
@color =
  GRID: "#444"
  BACKGROUND: "#000"
  WALL: "#833"
  GROUND: "#CCC"
  DOOR: "#66B"

# TILE VALUES
@tile =
  NULL: -1
  GROUND: 0
  DOOR: 1
  WALL: 2

@utils =
  randomTest: (val = 0.5) ->
    if val < 1 then Math.random() < val else Math.random() * 100 < val

  randomValue: (min, max) ->
    unless max?
      max = min
      min = 0
    if min >= max then min else Math.floor(Math.random() * (max - min) + min)

class @Point
  constructor: (@x, @y) ->

class @Rect
  constructor: (@x, @y, @w, @h) ->
    @center = new Point(@x + @w // 2, @y + @h // 2)

class @Path
  constructor: (@start, @end) ->

class @TileMap
  constructor: (@w, @h) ->
    @tilemap = []
    for i in [0...@h]
      @tilemap[i] = []
      for j in [0...@w]
        @tilemap[i][j] = tile.NULL

  drawPoint: (point, fillTile = tile.GROUND) ->
    @tilemap[point.y][point.x] = tile

  drawRect: (rect, fillTile = tile.GROUND) ->
    for i in [rect.y...(rect.y + rect.h)]
      for j in [rect.x...(rect.x + rect.w)]
        @tilemap[i][j] = fillTile

  drawPath: (path, fillTile = tile.GROUND) ->
    x1 = if path.start.x < path.end.x then path.start.x else path.end.x
    x2 = if path.start.x < path.end.x then path.end.x else path.start.x
    y1 = if path.start.y < path.end.y then path.start.y else path.end.y
    y2 = if path.start.y < path.end.y then path.end.y else path.start.y
    #pathTile[path.start.x] = fillTile for pathTile in @tilemap[y1..y2]
    #pathTile = fillTile for pathTile in @tilemap[path.end.y][x1..x2]
    @tilemap[index][path.start.x] = fillTile for index in [y1..y2]
    @tilemap[path.end.y][index] = fillTile for index in [x1..x2]


    undefined # Avoiding push operations and wrong return

  drawWalls: () ->
    for i in [1...(@tilemap.length - 1)]
      for j in [1...(@tilemap.length - 1)] when @tilemap[i][j] isnt tile.NULL and
      @tilemap[i][j] isnt tile.WALL
        for n in [-1..1]
          for m in [-1..1] when @tilemap[i+m][j+n] is tile.NULL
            @tilemap[i+m][j+n] = tile.WALL
    undefined # Avoiding push operations and wrong return

  paintGrid: (c) ->
    tileSize = TILE_SIZE()
    c.beginPath()
    c.strokeStyle = color.GRID
    c.lineWidth = 1
    for i in [0...@w]
      c.moveTo(i * tileSize, 0)
      c.lineTo(i * tileSize, MAP_SIZE * tileSize)
      c.moveTo(0, i * tileSize)
      c.lineTo(MAP_SIZE * tileSize, i * tileSize)
    c.stroke()
    c.closePath()

  paint: (c) ->
    tileSize = TILE_SIZE()
    c.fillStyle = color.BACKGROUND
    c.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    for row, i in @tilemap
      for col, j in @tilemap[i]
        switch @tilemap[i][j]
          when tile.GROUND then c.fillStyle = color.GROUND
          when tile.DOOR
            c.fillStyle = if SHOW_DOORS then color.DOOR else color.GROUND
          when tile.WALL
            c.fillStyle = if SHOW_WALLS then color.WALL else color.BACKGROUND
          else c.fillStyle = color.BACKGROUND
        c.fillRect(j * tileSize, i * tileSize, tileSize, tileSize)

    @paintGrid(c) if SHOW_GRID
