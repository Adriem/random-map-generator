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

###
  This class represents a room that will be part of the map. It is defined by
  two coordinates in the space, a width and a height. It can also have some
  attributes and some references to its neighbours.
###

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

  # Returns the area of the room
  getArea: -> @width * @height

  # Return true if given room collides with this room
  collidesWith: (room) ->
    not (@x > room.x + room.width or room.x > @x + @width) and
    not (@y > room.y + room.height or room.y > @y + @height)

  # Generate a deep copy of this room
  clone: ->
    attrsClone = {}
    attrsClone[key] = value for key, value of @attrs
    neighboursClone = (neighbour for neighbour in @neighbours)
    new Room(@x, @y, @width, @height, @id, attrsClone, neighboursClone)

# ------------------------------------------------------------------------------

###
  This class represents the state of the generator on a given moment. It
  contains a list with the rooms that have been generated, a list with the
  rooms that are waiting to be expanded and a tile map that represents the
  current distribution of the rooms
###

class State

  constructor: (@rooms = [], @frontier = [], width, height) ->
    if width? and height? then @collisionMap = new Tilemap(width, height, false)

  # Return the number of steps given until this state
  getSteps: -> @rooms.length - 1

  # Add a new room to this state
  addRoom: (room) ->
    @rooms.push(room)
    @frontier.push(room)
    @collisionMap.set(room.x, room.y, room.width, room.height, true) if @collisionMap?

  # Checks if a room can be added without colliding with existing rooms
  hasRoomFor: (room) ->
    if @collisionMap?
      return @collisionMap.is(room.x, room.y, room.width, room.height, false)
    else
      return false for otherRoom in @rooms when otherRoom.collidesWith(room)
      return true

  # Generate a deep clone of this state
  clone: ->
    newInstance = new State(
      room.clone() for room in @rooms,
      room.clone() for room in @frontier
    )
    newInstance.collisionMap = @collisionMap.clone() if @collisionMap?
    return newInstance

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
    new State([], [], @mapWidth, @mapHeight)

  generateNeighbour: (room, door, state) ->
    candidates = @generatePossibleNeighbours(room, door, state)
    if candidates.length > 0 and random.test(getSpawnChance(state))
      # Group candidates by area
      availableAreas = []
      candidatesGrouped = []
      for room in candidates
        unless room.getArea() in availableAreas
          availableAreas.push(room.getArea())
          candidatesGrouped[availableAreas.indexOf(room.getArea())] = []
        candidatesGrouped[availableAreas.indexOf(room.getArea())].push(room)
      # Randomly select candidate
      selectedGroup = candidatesGrouped[random.value(0, candidatesGrouped.length)]
      selectedGroup[random.value(0, selectedGroup.length)]

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
  getSpawnChance = (state) ->
    if state.frontier.length is 0 then 100 else 75

# ------------------------------------------------------------------------------

###
  This is the function that will generate the map. It takes a width, a height,
  the number of rooms to generate, the properties of the generator and a
  callback to be executed on each step.
###

generate = (numberOfRooms, properties, onStepCallback) ->

  # Initialize generator
  generator = new Generator(numberOfRooms, properties)

  # Generate initial state
  initialRoom = generator.generateInitialRoom()
  state = generator.generateInitialState()
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
