# DEFAULT PARAMS
@MAP_SIZE = 50
@CANVAS_SIZE = 400
@TILE_SIZE = () -> CANVAS_SIZE / MAP_SIZE
@DRAW_GRID = true
@DRAW_WALLS = true
@ALGORYTHM = "BSP"

# TILE COLORS
@color =
  GRID: "#444"
  BACKGROUND: "#000"
  WALL: "#833"
  GROUND: "#CCC"
  DOOR: "#228"

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
  constructor: (x, y) ->
    @x = x
    @y = y

class @Rect
  constructor: (x, y, w, h) ->
    @x = x
    @y = y
    @w = w
    @h = h
    @center = new Point(@x + @w // 2, @y + @h // 2)

class @Path
  constructor: (start, end) ->
    @start = start
    @end = end

class @TileMap
  constructor: (w, h) ->
    @w = w
    @h = h
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
    if path.start.x < path.end.x then x1 = path.start.x else x1 = path.end.x
    if path.start.x < path.end.x then x2 = path.end.x else x2 = path.start.x
    if path.start.y < path.end.y then y1 = path.start.y else y1 = path.end.y
    if path.start.y < path.end.y then y2 = path.end.y else y2 = path.start.y
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

  paint: (c) ->
    tileSize = TILE_SIZE()
    c.fillStyle = color.BACKGROUND
    c.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    for row, i in @tilemap
      for col, j in @tilemap[i]
        switch @tilemap[i][j]
          when tile.GROUND then c.fillStyle = color.GROUND
          when tile.WALL then c.fillStyle = color.WALL
          when tile.DOOR then c.fillStyle = color.DOOR
          else c.fillStyle = color.BACKGROUND
        c.fillRect(j * tileSize, i * tileSize, tileSize, tileSize)
    if DRAW_GRID
      c.beginPath()
      c.strokeStyle = color.GRID
      c.lineWidth = 0.5
      for i in [0...MAP_SIZE]
        c.moveTo(i * tileSize, 0)
        c.lineTo(i * tileSize, MAP_SIZE * tileSize)
        c.moveTo(0, i * tileSize)
        c.lineTo(MAP_SIZE * tileSize, i * tileSize)
      c.stroke()
      c.closePath()