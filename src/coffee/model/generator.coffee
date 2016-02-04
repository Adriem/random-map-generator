# ==============================================================================
#  This file contains the functions to randomly generate the map.
# ------------------------------------------------------------------------------
#  Author: Adrian Moreno
# ==============================================================================

### Default values for the generator ###
Defaults =
  MAP_WIDTH: 10
  NUMBER_OF_ROOMS: 15
  TILES_PER_UNIT: 3
  INITIAL_ROOM_WIDTH: 1
  INITIAL_ROOM_HEIGHT: 1
  MIN_ROOM_WIDTH: 1
  MAX_ROOM_WIDTH: 2


### High level map generation algorythm ###
generateMap = (width, height, numberOfRooms = 10, roomProperties = {}, onStepCallback) ->
  state = generateInitialState(width, height,
      roomProperties.initialRoomWidth, roomProperties.initialRoomHeight)
  state.remainingRooms = numberOfRooms - 1  # Take initial room
  if onStepCallback? then onStepCallback(obtainMap(state), state.steps)
  while state.remainingRooms > 0
    state = expandRoomFromFrontier(state, roomProperties, onStepCallback)
  return new Map(state.tilemap.width, state.tilemap.height, state.roomList)

###
  Generate the first state for a map, just by generating a map with given width
  and height and adding a room at a random position on it.
###
generateInitialState = (width, height, firstRoomWidth=1, firstRoomHeight=1) ->
  x = random.value(width * 0.40, width * 0.60)
  y = random.value(height * 0.40, height * 0.60)
  originRoom = new Room(x, y, firstRoomWidth, firstRoomHeight, undefined, 0)
  originRoom.special = 'first room'
  tilemap = new Tilemap(width, height, Tile.EMPTY)
  tilemap.set(originRoom.origin[0], originRoom.origin[1],
      originRoom.width, originRoom.height, Tile.FIRST_ROOM)
  roomList = [originRoom]
  frontier = [originRoom]
  return { roomList: roomList, tilemap: tilemap, frontier: frontier, steps: 0 }

###
  Extract the first room of the frontier and expand it, generating its
  neighbours and adding them to the frontier as well
###
expandRoomFromFrontier = (state, properties, onStepCallback, onRoomExpandedCallback) ->
  _state = cloneState(state)  # Deep copy of _sate for the sake of inmutability
  room = _state.frontier.shift()
  for door, i in random.shuffle(room.getAvailableExits()) when _state.remainingRooms > 0
    _state = cloneState(_state) if i > 0  # Generate new state for each new step
    _room = _state.roomList[room.id]  # Get the reference to room from cloned state
    candidates = getPossibleNeighbours(door, _room, _state.tilemap,
                                       properties.minRoomSize,
                                       properties.maxRoomSize)
    if candidates.length > 0
      newRoom = candidates[random.value(0, candidates.length)]
      newRoom.id = _state.roomList.length
      _room.neighbours[door] = newRoom.id
      _state.roomList.push(newRoom)
      _state.frontier.push(newRoom)
      _state.steps++
      _state.remainingRooms--
      _state.tilemap.set(newRoom.origin[0], newRoom.origin[1],
        newRoom.width, newRoom.height, Tile.GROUND)
      if onStepCallback? then onStepCallback(obtainMap(_state), _state.steps)
  if onRoomExpandedCallback? then onRoomExpandedCallback(obtainMap _state, _state.steps)
  return _state

# Make available globally
this.Defaults = Defaults
this.generate = generateMap


# HELPERS
# ------------------------------------------------------------------------------

# Get a map instance from a state
obtainMap = (state) ->
  new Map(state.tilemap.width, state.tilemap.height, state.roomList)

getOppositeDirection = (door) -> ((door % 4) + 2) % 4

# Deep copy of state
cloneState = (state) ->
  roomList: (room.clone() for room in state.roomList)
  tilemap: clone state.tilemap
  frontier: (room.clone() for room in state.frontier)
  steps: state.steps
  remainingRooms: state.remainingRooms

getPossibleNeighbours = (door, room, tilemap, minSize = 1, maxSize = 2) ->
  doorDirection = door % 4
  ref = switch doorDirection
    when Direction.NORTH
      new Point(room.origin[0] + door // 4, room.origin[1])
    when Direction.SOUTH
      new Point(room.origin[0] + door // 4, room.origin[1] + room.height - 1)
    when Direction.EAST
      new Point(room.origin[0] + room.width - 1, room.origin[1] + door // 4)
    when Direction.WEST
      new Point(room.origin[0], room.origin[1] + door // 4)
  candidates = []
  # Generate rooms for all the possible sizes
  for height in [minSize..maxSize] then for width in [minSize..maxSize]
    # Iterate all over the possible positions the room could be
    offsetMax = if doorDirection is Direction.NORTH or doorDirection is Direction.SOUTH then width else height
    for offset in [1 - offsetMax..0]
      console.log door
      # Calculate the door where the room will be linked on the candidate
      doorOnNeighbour = 4 * offset * (-1) + getOppositeDirection(door)
      # Generate the neighbour array for the candidate
      numberOfDoors = Math.max(width, height) * 4
      neighbours = for doorIndex in [0...numberOfDoors]
        if doorIndex is doorOnNeighbour then room.id else null
      # Calculate the origin of the room
      xOrigin = switch doorDirection
        when Direction.EAST then ref[0] + 1
        when Direction.WEST then ref[0] - width
        else ref[0] + offset
      yOrigin = switch doorDirection
        when Direction.NORTH then ref[1] - height
        when Direction.SOUTH then ref[1] + 1
        else ref[1] + offset
      candidate = new Room(xOrigin, yOrigin, width, height, neighbours)
      # Add the door to the candidates if it doesn't collide with anything
      candidates.push(candidate) if tilemap.is(
        candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)
  return candidates





# LEGACY
# ------------------------------------------------------------------------------

getPossibleNeighboursx = (door, room, tilemap, minSize, maxSize) ->
  # Calculate reference point and get candidatos from that position
  switch door % 4
    when Direction.NORTH
      ref = new Point(room.origin[0] + door // 4, room.origin[1])
      getNorthCandidates(ref, room.id, tilemap, minSize, maxSize)
    when Direction.SOUTH
      ref = new Point(room.origin[0] + door // 4, room.origin[1] + room.height - 1)
      getSouthCandidates(ref, room.id, tilemap, minSize, maxSize)
    when Direction.EAST
      ref = new Point(room.origin[0] + room.width - 1, room.origin[1] + door // 4)
      getEastCandidates(ref, room.id, tilemap, minSize, maxSize)
    when Direction.WEST
      ref = new Point(room.origin[0], room.origin[1] + door // 4)
      getWestCandidates(ref, room.id, tilemap, minSize, maxSize)

getNorthCandidates = (ref, room, tilemap, minSize = 1, maxSize = 2) ->
  candidates = []
  for height in [minSize..maxSize] then for width in [minSize..maxSize]
    for xOffset in [1 - width..0]
      doorOnNeighbour = 4 * xOffset * (-1) + Direction.SOUTH
      numberOfDoors = Math.max(width, height) * 4
      neighbours =
        (if door is doorOnNeighbour then room else null) for door in [0...numberOfDoors]
      candidate = new Room(ref[0] + xOffset, ref[1] - height, width, height, neighbours)
      candidates.push candidate if tilemap.is(
        candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)
  return candidates

getSouthCandidates = (ref, room, tilemap, minSize = 1, maxSize = 2) ->
  candidates = []
  for height in [minSize..maxSize] then for width in [minSize..maxSize]
    for xOffset in [1 - width..0]
      doorOnNeighbour = 4 * xOffset * (-1) + Direction.NORTH
      numberOfDoors = Math.max(width, height) * 4
      neighbours =
        (if door is doorOnNeighbour then room else null) for door in [0...numberOfDoors]
      candidate = new Room(ref[0] + xOffset, ref[1] + 1, width, height, neighbours)
      candidates.push candidate if tilemap.is(
        candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)
  return candidates

getEastCandidates = (ref, room, tilemap, minSize = 1, maxSize = 2) ->
  candidates = []
  for width in [minSize..maxSize] then for height in [minSize..maxSize]
    for yOffset in [1 - height..0]
      doorOnNeighbour = 4 * yOffset * (-1) + Direction.WEST
      numberOfDoors = Math.max(width, height) * 4
      neighbours =
        (if door is doorOnNeighbour then room else null) for door in [0...numberOfDoors]
      candidate = new Room(ref[0] + 1, ref[1] + yOffset, width, height, neighbours)
      candidates.push candidate if tilemap.is(
        candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)
  return candidates

getWestCandidates = (ref, room, tilemap, minSize = 1, maxSize = 2) ->
  candidates = []
  for width in [minSize..maxSize] then for height in [minSize..maxSize]
    for yOffset in [1 - height..0]
      doorOnNeighbour = 4 * yOffset * (-1) + Direction.EAST
      numberOfDoors = Math.max(width, height) * 4
      neighbours =
        (if door is doorOnNeighbour then room else null) for door in [0...numberOfDoors]
      candidate = new Room(ref[0] - width, ref[1] + yOffset, width, height, neighbours)
      candidates.push candidate if tilemap.is(
        candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)
  return candidates

