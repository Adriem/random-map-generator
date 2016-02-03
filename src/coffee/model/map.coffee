# ==============================================================================
#  This file contains some classes and utilities to work with rooms and maps
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
  This class represents a room in the map. The rom is defined by a point in a
  2D space (representing its upper-left corner), its width and its height. It
  is also linked to its neighbours, so it can be treated as a node in a graph.
###

class Room

  constructor: (x, y, width, height, neighbours, id, special, state = 'open') ->
    this.origin = new Point(x, y)
    this.p2 = new Point(x + width - 1, y + height - 1)
    this.state = 'open'
    this.special = special
    this.width = width
    this.height = height
    this.id = id
    # If no neighbours are provided, initialize the array with null objects
    this.neighbours = neighbours ? ( null for i in [0...8] )

  getExits: () ->
    [].push(
      (for i in [0...this.width]
        (Direction.NORTH + (i*4); Direction.SOUTH + (i*4))),
      (for i in [0..this.height]
        (Direction.EAST + (i*4); Direction.WEST + (i*4)))
    )

  hasExit: (exit) ->
    ((exit % 4 is Direction.NORTH or exit % 4 is Direction.SOUTH) and
      exit // 4 < this.width) or
    ((exit % 4 is Direction.EAST or exit % 4 is Direction.WEST) and
      exit // 4 < this.height)

  getAvailableExits: () ->
    # Return an array with the indexes of unused exits of the room
    door for neighbour, door in this.neighbours when this.hasExit(door) and
                                                     not neighbour?

  clone: () -> new Room(
      @origin[0], @origin[1], @width, @height, (n for n in this.neighbours),
      @id, @special, @state
    )

  isContainedIn: (array) ->
    for item in array
      return true if item.origin[0] is this.origin[0] and
                     item.origin[1] is this.origin[1] and
                     item.width is this.width and item.height is this.height
    return false


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
    origin = new Point(room.origin[0]*tilesPerUnit, room.origin[1]*tilesPerUnit)
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
this.Direction = Direction
this.Tile = Tile
this.Room = Room
this.Map  = Map
