# ==============================================================================
#  This file contains some classes and utilities to work with maps
# ------------------------------------------------------------------------------
#  Author: Adrian Moreno
# ==============================================================================

Tile =
  EMPTY    : 0
  OCCUPIED : 1
  GROUND: 1
  WALL: -1
  DOOR: -2
  FIRST_ROOM: 2
  TREASURE_ROOM: 3
  SECRET_ROOM: 4

Direction =
  NORTH : 0
  EAST  : 1
  SOUTH : 2
  WEST  : 3

###
  This class represents a point either as an array and as an object with
  fields x, y and z (when available)
###
class Point extends Array
  constructor: (values...) ->
    @push value for value in values

  Object.defineProperty @prototype, 'x',
    get: () -> @[0]
    set: (value) ->
      @push null while not @length > 0
      @[0] = value

  Object.defineProperty @prototype, 'y',
    get: () -> @[1]
    set: (value) ->
      @push null while not @length > 1
      @[1] = value

  Object.defineProperty @prototype, 'z',
    get: () -> @[2]
    set: (value) ->
      @push null while not @length > 2
      @[2] = value

###
  This class represents a tile map as a 2D array, adding some useful methods
###
class Tilemap extends Array

  constructor: (width, height, value = null) ->
    this.push(value for j in [0...height]) for i in [0...width]

  Object.defineProperty @prototype, 'width',
    get: () ->  this.length

  Object.defineProperty @prototype, 'height',
    get: () -> this[0].length

  get: (x, y, width = 1, height = 1) ->
    this[_x][_y] for _y in [y...y + height] for _x in [x...x + width]

  set: (x, y, width = 1, height = 1, value) ->
    this[_x][_y] = value for _y in [y...y + height] for _x in [x...x + width]

  is: (x, y, width = 1, height = 1, value) ->
    return false if x + width > this.width or y + height > this.height or x < 0 or y < 0
    for _x in [x...x + width]
      for _y in [y...y + height] when this[_x][_y] isnt value
        return false
    return true

  setWidth: (width, value = null) ->
    if width > this.width
      this.push(value for i in [0...this.height]) while width > this.width
    else
      this.splice(width, this.width - width)
    return this.width

  setHeight: (height, value = null) ->
    for x in [0...this.width]
      if height > this.height
        this[x].push value while height > this[x].width
      else
        this.splice(height, this.height - height)
    return this[0].height

  clone: () ->
    newInstance = new Tilemap(@width, @height)
    newInstance[x][y] = value for value, y in row for row, x in this
    return newInstance

###
  This class represents the hole map. It is defined by a height, a width and
  a list of rooms.
###
class Map

  constructor: (@width, @height, @roomList) ->

  getTilemap: (tilesPerUnit) ->
    tilesPerUnit++  # Leave space for walls
    tilemap = new Tilemap(
      (this.width * tilesPerUnit) + 1,
      (this.height * tilesPerUnit) + 1,
      Tile.EMPTY
    )
    paintRoom(room, tilemap, tilesPerUnit) for room, i in this.roomList
    return tilemap

  # Private helper
  paintRoom = (room, tilemap, tilesPerUnit) ->
    # Convert dimensions and coordinates
    origin = new Point(room.x*tilesPerUnit, room.y*tilesPerUnit)
    width = room.width * tilesPerUnit
    height = room.height * tilesPerUnit
    # Paint floor
    if room.special is 'first room'
      tilemap.set(origin[0] + 1, origin[1] + 1, width, height, Tile.FIRST_ROOM)
    else if room.special is 'treasure room'
      tilemap.set(origin[0] + 1, origin[1] + 1, width, height, Tile.TREASURE_ROOM)
    else if room.special is 'secret room'
      tilemap.set(origin[0] + 1, origin[1] + 1, width, height, Tile.SECRET_ROOM)
    else tilemap.set(origin[0] + 1, origin[1] + 1, width, height, Tile.GROUND)
    # Paint walls
    tilemap.set(origin[0], origin[1], width + 1, 1, Tile.WALL)          # North
    tilemap.set(origin[0], origin[1] + height, width + 1, 1, Tile.WALL) # South
    tilemap.set(origin[0] + width, origin[1], 1, height + 1, Tile.WALL) # East
    tilemap.set(origin[0], origin[1], 1, height + 1, Tile.WALL)         # West
    # Paint doors
    for neighbour, door in room.neighbours when neighbour?
      doorOffset = ((door // 4) * tilesPerUnit) + (tilesPerUnit // 2)
      switch (door % 4)
        when Direction.NORTH
          tilemap[origin[0] + doorOffset][origin[1]] = Tile.DOOR
        when Direction.SOUTH
          tilemap[origin[0] + doorOffset][origin[1] + height] = Tile.DOOR
        when Direction.EAST
          tilemap[origin[0] + width][origin[1] + doorOffset] = Tile.DOOR
        when Direction.WEST
          tilemap[origin[0]][origin[1] + doorOffset] = Tile.DOOR


# Make elements available globally
window.Tile = Tile
window.Direction = Direction
window.Point = Point
window.Tilemap = Tilemap
window.Map  = Map
