# ==============================================================================
#  This file contains the functions to randomly generate the map.
# ------------------------------------------------------------------------------
# This algorythm generates a room on a random position and starts generating
# the neighbours from there. Some examples of generated rooms can be:
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
# ------------------------------------------------------------------------------
#  Author: Adrian Moreno
# ==============================================================================

### Default values for the generator ###
Defaults =
  MAP_SIZE: 10
  NUMBER_OF_ROOMS: 15
  TILES_PER_UNIT: 3
  INITIAL_ROOM_WIDTH: 1
  INITIAL_ROOM_HEIGHT: 1
  MIN_ROOM_SIZE: 1
  MAX_ROOM_SIZE: 2

# ------------------------------------------------------------------------------

class Room
  constructor: (@x, @y, @width, @height, @id, @attrs = {}, @neighbours = []) ->

  # Return an array with the indexes of all the exits of the room
  getExits: () -> [].concat(
    Direction.NORTH + (i*4) for i in [0...@width],
    Direction.SOUTH + (i*4) for i in [0...@width],
    Direction.EAST + (i*4) for i in [0...@height],
    Direction.WEST + (i*4) for i in [0...@height]
  )

  # Return an array with the indexes of unused exits of the room
  getAvailableExits: () -> door for door in @getExits() when not @neighbours[door]?

  # Generate a deep copy of this room
  clone: ->
    attrClone = {}
    attrClone[key] = value for key, value of @attrs
    neighboursClone = (neighbour for neighbour in @neighbours)
    new Room(@x, @y, @width, @height, @id, attrClone, neighboursClone)

# ------------------------------------------------------------------------------

###
  This class represents the state of the generator on a given moment. It
  contains a list with the rooms that have been generated, a list with the
  rooms that are waiting to be expanded and a tile map that represents the
  current distribution of the rooms
###

class State

  constructor: (@rooms = [], @frontier = [],
                @collisionMap = new Tilemap(100, 100, false)) ->

  # Return the number of steps given until this state
  getSteps: -> @rooms.length - 1

  # Add a new room to this state
  addRoom: (room) ->
    @rooms.push(room)
    @frontier.push(room)
    @collisionMap.set(room.x, room.y, room.width, room.height, true)

  # Checks if a room can be added without colliding with existing rooms
  hasRoomFor: (room) ->
    @collisionMap.is(room.x, room.y, room.width, room.height, false)

  # Generate a deep clone of this state
  clone: -> new State(
    room.clone() for room in @rooms,
    room.clone() for room in @frontier,
    @collisionMap.clone()
  )

# ------------------------------------------------------------------------------

###
  This class will provide functions to generate content randomly based on
  the given properties.
###

class Generator

  constructor: (numberOfRooms, properties) ->
    @remainingRooms = numberOfRooms
    @minRoomSize = properties.minRoomSize ? Defaults.MIN_ROOM_SIZE
    @maxRoomSize = properties.maxRoomSize ? Defaults.MAX_ROOM_SIZE
    @minRoomArea = properties.minRoomArea ? @minRoomSize ** 2
    @maxRoomArea = properties.maxRoomArea ? @maxRoomSize ** 2
    @ratioRestr  = properties.ratioRestriction ? 0
    @mapWidth = properties.width ? @maxRoomSize * numberOfRooms
    @mapHeight = properties.height ? @maxRoomSize * numberOfRooms
    @initialRoomWidth = properties.initialRoomWidth ? Defaults.INITIAL_ROOM_WIDTH
    @initialRoomHeight = properties.initialRoomHeight ? Defaults.INITIAL_ROOM_HEIGHT

  generateInitialRoom: ->
    x = random.value(@mapWidth * 0.30, @mapWidth * 0.70)
    y = random.value(@mapHeight * 0.30, @mapHeight * 0.70)
    new Room(x, y, @initialRoomWidth, @initialRoomHeight, 0)

  generateInitialState: ->
    new State([], [], new Tilemap(@mapWidth, @mapHeight, false))

  generateNeighbour: (room, door, state) ->
    candidates = @generatePossibleNeighbours(room, door, state)
    candidates[random.value(0, candidates.length)] if candidates.length > 0

  generatePossibleNeighbours: (room, door, state) ->
    candidates = []
    # Generate rooms for all the possible sizes
    for height in [@minRoomSize..@maxRoomSize]
      for width in [@minRoomSize..@maxRoomSize] when @validMeasures(width, height)
        # Iterate all over the possible positions the room could be
        offsetMax = if door % 2 is 0 then width else height
        for offset in [1 - offsetMax..0]
          # Calculate candidate's coordinates
          [x, y] = switch door % 4
            when Direction.NORTH
              [room.x + door // 4 + offset, room.y - height]
            when Direction.SOUTH
              [room.x + door // 4 + offset, room.y + room.height]
            when Direction.EAST
              [room.x + room.width, room.y + door // 4 + offset]
            when Direction.WEST
              [room.x - width, room.y + door // 4 + offset]
          # Generate the candidate
          candidate = new Room(x, y, width, height, state.getSteps() + 1)
          # Add room to candidate's neighbours
          doorOnNeighbour = 4 * offset * (-1) + getOppositeDirection(door)
          candidate.neighbours[doorOnNeighbour] = room.id
          # Add the door to the candidates if it doesn't collide with anything
          candidates.push(candidate) if state.hasRoomFor(candidate)
    return candidates

  validMeasures: (width, height) -> height * width <= @maxRoomArea and
                                    height * width >= @minRoomArea and
                                    width / height >= @ratioRestr and
                                    height / width >= @ratioRestr

  # PRIVATE HELPERS
  getOppositeDirection = (door) -> ((door % 4) + 2) % 4

# ------------------------------------------------------------------------------

###
  This is the function that will generate the map. It takes a width, a height,
  the number of rooms to generate, the properties of the generator and a
  callback to be executed on each step.
###

generate = (numberOfRooms, properties, onStepCallback) ->

  # Initialize generator
  generator = new Generator(numberOfRooms, properties)
  state = generator.generateInitialState()

  # Generate initial state
  initialRoom = generator.generateInitialRoom()
  state.addRoom(initialRoom)
  remainingRooms = numberOfRooms - 1  # Take initial room
  onStepCallback(obtainMap(state.clone()), state.getSteps()) if onStepCallback?

  # Generate rooms randomly
  while remainingRooms > 0 and state.frontier.length > 0
    room = state.frontier.shift()
    for door in random.shuffle(room.getAvailableExits()) when remainingRooms > 0
      # Copy the objects and update references on each step
      state = state.clone()
      room = state.rooms[room.id]
      # Generate new room
      newRoom = generator.generateNeighbour(room, door, state)
      if newRoom?
        room.neighbours[door] = newRoom.id
        state.addRoom(newRoom)
        remainingRooms--
        onStepCallback(obtainMap(state.clone()), state.getSteps()) if onStepCallback?

  return obtainMap(state)


obtainMap = (state) ->
  new Map(state.collisionMap.width, state.collisionMap.height, state.rooms)

### EXPORT FUNCTIONS ###
window.generate = generate
