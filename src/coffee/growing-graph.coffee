###
# ==============================================================================
#  Author: Adrian Moreno (admoreno@outlook.com)
# ------------------------------------------------------------------------------
# This algorythm generates a room on a random position and starts generating
# the neighbours from there. Generated rooms can be:
#
#   +--- 0 ---+   +--- 0 ---+--- 4 ---+   +--- 0 ---+   +--- 0 ---+--- 4 ---+
#   |         |   |                   |   |         |   |                   |
#   3         1   3                   1   3         1   3                   1
#   |         |   |                   |   |         |   |                   |
#   +--- 2 ---+   +--- 2 ---+--- 6 ---+   +         +   +         +         +
#     (1 x 1)            (2 x 1)          |         |   |                   |
#                                         7         5   7                   5
#                                         |         |   |                   |
#                                         +--- 2 ---+   +--- 2 ---+--- 6 ---+
#                                           (1 x 2)            (2 x 2)
# ==============================================================================
###

#  COMMON
# ==============================================================================

random =
  test: (val = 0.5) ->
    if val < 1 then Math.random() < val else Math.random() * 100 < val

  value: (min, max) ->
    unless max?
      max = min
      min = 0
    if min >= max then min else Math.floor(Math.random() * (max - min) + min)

  shuffle: (array) -> array

clone = (original) -> original
  # return original if not original? or typeof original isnt 'object'
  # cloned = new original.constructor()
  # # cloned[key] = clone(original[key]) for own key of original
  # for own key of original
    # console.log original
    # console.log key
    # cloned[key] = clone(original[key])
  # return cloned

class Point
  constructor: (x, y) ->
    this.x = x
    this.y = y
    this[0] = x
    this[1] = y
    this.length = 2

class Tilemap
  constructor: (@width, @height, value = null) ->
    this.tilemap = ( value for j in [0...@height] for i in [0...@width] )
  get: (x, y) ->
    if not y? then this.tilemap[x[0]][x[1]]
    else if typeof x is typeof y is 'number' then this.tilemap[x][y]
    else this.tilemap[x][y] for y in [x[1]..y[1]] for x in [x[0]..y[0]]
  set: (x, y, value) ->
    if not value? then this.tilemap[x[0]][x[1]] = y
    else if not y? then this.tilemap[x[0]][x[1]] = value
    else if typeof x is typeof y is 'number' then this.tilemap[x][y] = value
    else this.tilemap[i][j] = value for j in [x[1]..y[1]] for i in [x[0]..y[0]]
  is: (x, y, value) ->
    if not value? then this.tilemap[x[0]][x[1]] is y
    else if not y? then this.tilemap[x[0]][x[1]] is value
    else if typeof x is typeof y is 'number' then this.tilemap[x][y] = value
    else
      for i in [x[0]..y[0]]
        for j in [x[1]..y[1]] when this.tilemap[i][j] isnt value
          return false
      return true


# HELPERS
# ==============================================================================
getDoorFlags = (doorIndex) ->
  north : doorIndex % 4 is 0
  south : doorIndex % 4 is 2
  east  : doorIndex % 4 is 1
  west  : doorIndex % 4 is 3
  up    : doorIndex < 4 and doorIndex % 2 is 1
  left  : doorIndex < 4 and doorIndex % 2 is 0
  down  : doorIndex > 4 and doorIndex % 2 is 1
  right : doorIndex > 4 and doorIndex % 2 is 0

getPossibleNeighbours = (door, room, tilemap) ->
  # Calculate reference point
  doorFlags = getDoorFlags(door)
  ref =
    if doorFlags.north then new Point(room.p1[0] + door // 4, room.p1[1])
    else if doorFlags.south then new Point(room.p1[0] + door // 4, room.p2[1])
    else if doorFlags.east then new Point(room.p2[0], room.p1[1] + door // 4)
    else if doorFlags.west then new Point(room.p1[0], room.p1[1] + door // 4)
  # Generate posible candidates
  if doorFlags.north then candidates = [
    new Room(                                          #   ___
      new Point(ref[0], ref[1] - 1),                   #   |_|  <- neighbour
      new Point(ref[0], ref[1] - 1),                   #   |_|  <- ref
      ((if i is 2 then room else null) for i in [0..3])#
    ),
    new Room(                                          #  _____
      new Point(ref[0] - 1, ref[1] - 1),               #  |___| <- neigbour
      new Point(ref[0],     ref[1] - 1),               #    |_| <- ref
      ((if i is 6 then room else null) for i in [0..7])#
    ),
    new Room(                                          #  _____
      new Point(ref[0],     ref[1] - 1),               #  |___| <- neighbour
      new Point(ref[0] + 1, ref[1] - 1),               #  |_|   <- ref
      ((if i is 2 then room else null) for i in [0..7])#
    ),
    new Room(                                          #   ___
      new Point(ref[0], ref[1] - 2),                   #   | | <- neighbour
      new Point(ref[0], ref[1] - 1),                   #   |_|
      ((if i is 2 then room else null) for i in [0..7])#   |_| <- ref
    ),
    new Room(                                          #  _____
      new Point(ref[0] - 1, ref[1] - 2),               #  |   | <- neighbour
      new Point(ref[0],     ref[1] - 1),               #  |___|
      ((if i is 6 then room else null) for i in [0..7])#    |_| <- ref
    ),
    new Room(                                          #  _____
      new Point(ref[0],     ref[1] - 2),               #  |   | <-neighbour
      new Point(ref[0] + 1, ref[1] - 1),               #  |___|
      ((if i is 2 then room else null) for i in [0..7])#  |_|   <- ref
    )
  ]
  else if doorFlags.south then candidates = [
    new Room(                                          #   ___
      new Point(ref[0], ref[1] + 1),                   #   |_|  <- ref
      new Point(ref[0], ref[1] + 1),                   #   |_|  <- neighbour
      ((if i is 0 then room else null) for i in [0..7])#
    ),
    new Room(                                          #    ___
      new Point(ref[0] - 1, ref[1] + 1),               #  __|_|  <- ref
      new Point(ref[0],     ref[1] + 1),               #  |___|  <- neighbour
      ((if i is 4 then room else null) for i in [0..7])#
    ),
    new Room(                                          #  ___
      new Point(ref[0],     ref[1] + 1),               #  |_|__  <- ref
      new Point(ref[0] + 1, ref[1] + 1),               #  |___|  <- neighbour
      ((if i is 0 then room else null) for i in [0..7])#
    ),
    new Room(                                          #   ___
      new Point(ref[0],     ref[1] + 1),               #   |_|  <- ref
      new Point(ref[0],     ref[1] + 2),               #   | |
      ((if i is 0 then room else null) for i in [0..7])#   |_|  <- neighbour
    ),
    new Room(                                          #    ___
      new Point(ref[0] - 1, ref[1] + 1),               #  __|_|  <- ref
      new Point(ref[0],     ref[1] + 2),               #  |   |
      ((if i is 4 then room else null) for i in [0..7])#  |___|  <- neighbour
    ),
    new Room(                                          #  ___
      new Point(ref[0],     ref[1] + 1),               #  |_|__  <- ref
      new Point(ref[0] + 1, ref[1] + 2),               #  |   |
      ((if i is 0 then room else null) for i in [0..7])#  |___|  <- neighbour
    )
  ]
  else if doorFlags.east then candidates = [
    new Room(                                          #
      new Point(ref[0] + 1, ref[1]    ),               #        _____
      new Point(ref[0] + 1, ref[1]    ),               # ref -> |_|_| <- neigh
      ((if i is 3 then room else null) for i in [0..7])#
    ),
    new Room(                                          #          ___
      new Point(ref[0] + 1, ref[1] - 1),               #        __| |
      new Point(ref[0] + 1, ref[1]    ),               # ref -> |_|_| <- neigh
      ((if i is 7 then room else null) for i in [0..7])#
    ),
    new Room(                                          #
      new Point(ref[0] + 1, ref[1]    ),               #        _____
      new Point(ref[0] + 1, ref[1] + 1),               # ref -> |_| | <- neigh
      ((if i is 3 then room else null) for i in [0..7])#          |_|
    ),
    new Room(                                          #
      new Point(ref[0] + 1, ref[1]    ),               #        _______
      new Point(ref[0] + 2, ref[1]    ),               # ref -> |_|___| <- neigh
      ((if i is 3 then room else null) for i in [0..7])#
    ),
    new Room(                                          #          _____
      new Point(ref[0] + 1, ref[1] - 1),               #        __|   |
      new Point(ref[0] + 2, ref[1]    ),               # ref -> |_|___| <- neigh
      ((if i is 7 then room else null) for i in [0..7])#
    ),
    new Room(                                          #
      new Point(ref[0] + 1, ref[1]    ),               #        _______
      new Point(ref[0] + 2, ref[1] + 1),               # ref -> |_|   | <- neigh
      ((if i is 3 then room else null) for i in [0..7])#          |___|
    )
  ]
  else if doorFlags.west then candidates = [
    new Room(                                          #
      new Point(ref[0] - 1, ref[1]),                   #          _____
      new Point(ref[0] - 1, ref[1]),                   # neigh -> |_|_| <- ref
      ((if i is 1 then room else null) for i in [0..7])#
    ),
    new Room(                                          #          ___
      new Point(ref[0] - 1, ref[1] - 1),               #          | |__
      new Point(ref[0] - 1, ref[1]),                   # neigh -> |_|_| <- ref
      ((if i is 5 then room else null) for i in [0..7])#
    ),
    new Room(                                          #
      new Point(ref[0] - 1, ref[1]),                   #          _____
      new Point(ref[0] - 1, ref[1] + 1),               # neigh -> | |_| <- ref
      ((if i is 1 then room else null) for i in [0..7])#          |_|
    ),
    new Room(                                          #
      new Point(ref[0] - 2, ref[1]),                   #          _______
      new Point(ref[0] - 1, ref[1]),                   # neigh -> |___|_| <- ref
      ((if i is 1 then room else null) for i in [0..7])#
    ),
    new Room(                                          #          _____
      new Point(ref[0] - 2, ref[1] - 1),               #          |   |__
      new Point(ref[0] - 1, ref[1]),                   # neigh -> |___|_| <- ref
      ((if i is 5 then room else null) for i in [0..7])#
    ),
    new Room(                                          #
      new Point(ref[0] - 2, ref[1]),                   #          _______
      new Point(ref[0] - 1, ref[1] + 1),               # neigh -> |   |_| <- ref
      ((if i is 1 then room else null) for i in [0..7])#          |___|
    )
  ]
  # Return the ones that don't collide
  c for c in candidates when tilemap.is(c.p1, c.p2, Tile.EMPTY)

#  GROWING GRAPH
# ==============================================================================

FIRST_ROOM_WIDTH  = 1
FIRST_ROOM_HEIGHT = 1

Tile =
  EMPTY    : 0
  OCCUPIED : 1
  WALL: -1
  DOOR: -2
  FIRST_ROOM: 1

Direction =
  NORTH : 0
  EAST  : 1
  SOUTH : 2
  WEST  : 3


# ------------------------------------------------------------------------------

###
  This class represents a room in the map. The rom is defined by two points
  in a 2D space and is linked to its neighbours, so it can be treated as a
  node in a graph.
###

class Room

  constructor: (p1, p2, neighbours) ->
    # Normalize the points
    this.p1 = new Point(Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1]))
    this.p2 = new Point(Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1]))
    # If no neighbours are provided, initialize the array with null objects
    this.neighbours = neighbours ? ( null for i in [0...8] )

  getExits: () ->
    [].push(
      (for i in [0..this.p2[0] - this.p1[0]]
        (Direction.NORTH + (i*4); Direction.SOUTH + (i*4))),
      (for i in [0..this.p2[1] - this.p1[1]]
        (Direction.EAST + (i*4); Direction.WEST + (i*4)))
    )

  hasExit: (exit) -> #(exit < 4) or
    ((exit % 4 is Direction.NORTH or exit % 4 is Direction.SOUTH) and
      exit // 4 <= this.p2[0] - this.p1[0]) or
    ((exit % 4 is Direction.EAST or exit % 4 is Direction.WEST) and
      exit // 4 <= this.p2[1] - this.p1[1])

  getAvailableExits: () ->
    # Return an array with the indexes of unused exits of the room
    door for neighbour, door in this.neighbours when this.hasExit(door) and
                                                     not neighbour?

  getUnlinkedVersion: () ->
    return new Room(
      this.p1,
      this.p2,
      ((if n? then true else null) for n in this.neighbours)
    )

  isContainedIn: (array) ->
    for item in array
      return true if item.p1[0] is this.p1[0] and item.p1[1] is this.p1[1] and
                     item.p2[0] is this.p2[0] and item.p2[1] is this.p2[1]
    return false
    

# ------------------------------------------------------------------------------

###
  This class represents the hole map. It is defined by a height, a width and
  a list of rooms.
###

class Map

  constructor: (@width, @height, @roomList) ->

  getRoomList: (room = this.originRoom, visitedRooms = []) ->
    visitedRooms.push(room)
    [room].push(
      for neighbour in room.neighbours when neighbour? and
          visitedRooms.indexOf(neighbour) isnt -1
        this.getRoomList(neighbour, visitedRooms)
    )

  getTileMap: (tilesPerUnit) ->
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
    # Recalculate coordinates
    p1 = new Point(room.p1[0] * tilesPerUnit, room.p1[1] * tilesPerUnit)
    p2 = new Point(
      (room.p2[0] + 1) * tilesPerUnit - 1,
      (room.p2[1] + 1) * tilesPerUnit - 1
    )
    # Paint floor
    tilemap.set(new Point(p1[0] + 1, p1[1] + 1), p2, Tile.OCCUPIED)
    # Paint walls
    tilemap.set( # North wall
      new Point(p1[0], p1[1]), new Point(p2[0] + 1, p1[1]), Tile.WALL)
    tilemap.set( # South wall
      new Point(p1[0], p2[1] + 1), new Point(p2[0] + 1, p2[1] + 1), Tile.WALL)
    tilemap.set( # East wall
      new Point(p2[0] + 1, p1[1]), new Point(p2[0] + 1, p2[1] + 1), Tile.WALL)
    tilemap.set( # West wall
      new Point(p1[0], p1[1]), new Point(p1[0], p2[1] + 1), Tile.WALL)
    # Paint doors
    for neighbour, door in room.neighbours
      doorOffset = ((door // 4) * tilesPerUnit) + (tilesPerUnit // 2)
      if neighbour? and door % 4 is Direction.NORTH
        tilemap.set(new Point(p1[0] + doorOffset, p1[1]), Tile.DOOR)
      else if neighbour? and door % 4 is Direction.SOUTH
        tilemap.set(new Point(p1[0] + doorOffset, p2[1] + 1), Tile.DOOR)
      else if neighbour? and door % 4 is Direction.EAST
        tilemap.set(new Point(p2[0] + 1, p1[1] + doorOffset), Tile.DOOR)
      else if neighbour? and door % 4 is Direction.WEST
        tilemap.set(new Point(p1[0], p1[1] + doorOffset), Tile.DOOR)

# ------------------------------------------------------------------------------

generateInitialState = (width, height, firstRoomWidth, firstRoomHeight) ->
  p1 = new Point(
    random.value(width * 0.40, width * 0.60),
    random.value(height * 0.40, height * 0.60)
  )
  p2 = new Point(p1[0] + firstRoomWidth - 1, p1[1] + firstRoomHeight - 1)
  originRoom = new Room(p1, p2)
  tilemap = new Tilemap(width, height, Tile.EMPTY)
  tilemap.set(p1, p2, Tile.FIRST_ROOM)
  frontier = [originRoom]
  roomList = [originRoom]
  return { roomList: roomList, tilemap: tilemap, frontier: frontier, steps: 0 }

# Expands the first room of the frontier
expandRoomFromFrontier = (_state, onStepCallback) ->
  state = clone(_state)  # Deep copy of _sate for the sake of inmutability
  room = state.frontier.shift()
  for door in random.shuffle(room.getAvailableExits()) when state.remainingRooms > 0
    candidates = getPossibleNeighbours(door, room, state.tilemap)
    if candidates.length > 0
      newRoom = candidates[random.value(0, candidates.length)]
      room.neighbours[door] = newRoom
      state.roomList.push(newRoom)
      state.frontier.push(newRoom)
      state.tilemap.set(newRoom.p1, newRoom.p2, ++state.steps)
      state.remainingRooms--
      if onStepCallback? then onStepCallback(state)
  return state

generateMap = (width, height, numberOfRooms = 10, onStepCallback) ->
  state = generateInitialState(width, height, 1, 1)
  state.remainingRooms = numberOfRooms
  if onStepCallback? then onStepCallback(state)
  while state.remainingRooms > 0
    state = expandRoomFromFrontier(state, onStepCallback)
  return state

obtainMap = (state) ->
  # roomList = getRoomList(state.graph)
  # console.log roomList
  new Map(state.tilemap.width, state.tilemap.height, state.roomList)

### TEST ###

# map = generateMap 10, 10, 15, (state) ->
  # for y in [0...state.tilemap.height]
    # row = ""
    # for x in [0...state.tilemap.width]
      # value = state.tilemap.get(x, y)
      # if x isnt 0 and state.tilemap.get(x-1, y) is value or value is 0 then leftD = " " else leftD = "|"
      # if x isnt state.tilemap.width - 1 and state.tilemap.get(x+1, y) is value or value is 0 then rightD = " " else rightD = "|"
      # if value is state.tilemap.height - 1 or state.tilemap.get(x, y+1) isnt value
        # value = '_'
        # leftD = '_' if leftD is ' '
        # rightD = '_' if rightD is ' '
      # else if value is 0 then value = '·' else value = ' '
      # row += "#{leftD}#{value}#{rightD}"
    # console.log row

printMap = (tilemap) ->
  for y in [0...tilemap.height]
    row = ""
    for x in [0...tilemap.width]
      value = tilemap.get(x, y)
      row += switch value
        when Tile.EMPTY then '··'
        when Tile.WALL then '##'
        when Tile.DOOR then '[]'
        else '  '
    console.log row


map = generateMap 10, 10, 15, (state) ->
  actualMap = obtainMap(state).getTileMap(1)
  printMap actualMap
actualMap = obtainMap(map).getTileMap(3)
printMap actualMap




