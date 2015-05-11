cfg =
  RATIO_RESTR: 0.45
  PARTITION_LEVEL: 2
  ROOM_REDUCTION: 0.3
  MIN_ROOM_SIZE: 5
  MAX_ROOM_SIZE: 20
  MIN_SECTOR_REDUCTION: 2
  MIN_SECTOR_SIZE: 10
  MAX_SECTOR_SIZE: 24
  BIG_ROOM_CHANCE: 60
  ROOM_DELETING_RATIO: 0.4
  DOOR_CHANCE: 100

class Tree
  constructor: (@node) ->
    @childs = []

  isEmpty: ->
    not @node?

  isLeaf: ->
    @childs.length is 0

  getLeafs: ->
    return [@] if @isLeaf()
    retVal = []
    retVal = retVal.concat(child.getLeafs()) for child in @childs
    retVal

  getNodeList: ->
    retVal = [@node]
    retVal = retVal.concat child.getNodeList() for child in @childs
    retVal

  kill: ->
    @node = undefined
    @childs = []
    undefined # Avoiding wrong return

  removeDeadLeafs: ->
    unless @isLeaf()
      for child, i in @childs by -1
        child.removeDeadLeafs()
        @childs.splice i, 1 if child.isLeaf() and child.isEmpty()
    undefined # Avoiding push operations and wrong return

  grow: (splitFunction) ->
    childNodes = splitFunction(@node)
    if childNodes? and 0 < childNodes.length <= 1
      @node = childNodes[0]
      # retVal = @grow(iterations-1, splitFunction)
    else if childNodes? and childNodes.length > 1
      for node in childNodes
        @childs.push(new Tree(node).grow(splitFunction))
    @

  paint: (c) ->
    tileSize = TILE_SIZE()
    c.beginPath()
    c.strokeStyle = "#0f0"
    c.lineWidth = 6
    c.strokeRect(@node.x * tileSize, @node.y * tileSize,
      @node.w * tileSize, @node.h * tileSize)
    child.paint(c) for child in @childs

generateMap = (size) ->
  cfg.MIN_SECTOR_SIZE = cfg.MIN_ROOM_SIZE * 2
  cfg.MAX_SECTOR_SIZE = cfg.MAX_ROOM_SIZE + 2 * cfg.MIN_SECTOR_REDUCTION
  tilemap = new TileMap(size, size)
  tree = new Tree(new Rect(0, 0, size, size)).grow(split)
  rooms = generateRooms(tree, tilemap)
  tree.removeDeadLeafs()
  paths = generatePaths(tree, tilemap)
  tilemap.removeDeadEnds()
  generateDoors(tilemap.tilemap)
  tilemap.optimiseDoors()
  tilemap.drawWalls()
  tilemap.debug.tree = tree
  tilemap

spawnRoom = (sector) ->
  if sector.w < sector.h
    w = random.value(cfg.MIN_ROOM_SIZE, sector.w - 2*cfg.MIN_SECTOR_REDUCTION)
    h = sector.h - (sector.w - w)
  else
    h = random.value(cfg.MIN_ROOM_SIZE, sector.h - 2*cfg.MIN_SECTOR_REDUCTION)
    w = sector.w - (sector.h - h)
  x = sector.x + (sector.w - w) // 2
  y = sector.y - sector.x + x
  new Rect x, y, w, h

generateRooms = (tree, tilemap) ->
  rooms = []
  leafs = tree.getLeafs()
  roomsToDelete = Math.round(leafs.length * cfg.ROOM_DELETING_RATIO)
  # Delete some rooms
  for x in [0...roomsToDelete]
    index = random.value(leafs.length)
    leafs[index].kill()
    leafs.splice(index, 1)
  # Generate rooms
  for leaf, i in leafs
    rooms[i] = spawnRoom(leaf.node)
    tilemap.drawRect(rooms[i])
  rooms

generatePaths = (tree, tilemap) ->
  paths = []
  sectorList = tree.getNodeList()
  # Connect all nodes
  for _, i in sectorList
    paths.push(new Path(sectorList[i].center,
      sectorList[(i+1) % sectorList.length].center))
  # Paint paths
  tilemap.drawPath(path) for path in paths
  paths

generateDoors = (tilemap) ->
  LOOKAHEAD = 3
  doors = []
  for i in [LOOKAHEAD...tilemap.length-LOOKAHEAD]
    for j in [LOOKAHEAD...tilemap[i].length-LOOKAHEAD] when tilemap[i][j] is tile.GROUND
      total = [0,0,0,0]
      # Horizontal direction
      if tilemap[i-1][j] is tilemap[i+1][j] is tile.NULL and
          tilemap[i][j-1] is tilemap[i][j+1] is tile.GROUND
        for n in [-LOOKAHEAD..-1]
          total[0]++ if tilemap[i-1][j+n] isnt tile.NULL
          total[1]++ if tilemap[i+1][j+n] isnt tile.NULL
        for n in [1..LOOKAHEAD]
          total[2]++ if tilemap[i-1][j+n] isnt tile.NULL
          total[3]++ if tilemap[i+1][j+n] isnt tile.NULL
      # Vertical direction
      else if tilemap[i][j-1] is tilemap[i][j+1] is tile.NULL and
          tilemap[i-1][j] is tilemap[i+1][j] is tile.GROUND
        for n in [-LOOKAHEAD..-1]
          total[0]++ if tilemap[i+n][j-1] isnt tile.NULL
          total[1]++ if tilemap[i+n][j+1] isnt tile.NULL
        for n in [1..LOOKAHEAD]
          total[2]++ if tilemap[i+n][j-1] isnt tile.NULL
          total[3]++ if tilemap[i+n][j+1] isnt tile.NULL
      # If must place room
      if (total[0] >= LOOKAHEAD or total[1] >= LOOKAHEAD or
          total[2] >= LOOKAHEAD or total[3] >= LOOKAHEAD) and
          random.test(cfg.DOOR_CHANCE)
        tilemap[i][j] = tile.DOOR
        doors.push(new Point(j,i))
  doors

split = (sector, horizontalDir = random.test(), steps = cfg.PARTITION_LEVEL) ->
  # Split horizontally
  if horizontalDir
    # If too narrow to split in this direction, try to split in another one
    if sector.h/sector.w < 2 * cfg.RATIO_RESTR
      return split(sector, !horizontalDir, steps)
    # If stop splitting
    else if (steps is 0) or (sector.h < 2*cfg.MIN_SECTOR_SIZE) or
        (sector.h < cfg.MAX_SECTOR_SIZE and random.test(cfg.BIG_ROOM_CHANCE))
      return [sector]
    # Finally split
    else
      restriction = Math.max(cfg.MIN_SECTOR_SIZE,
        Math.ceil(sector.h * cfg.RATIO_RESTR))
      div1 = new Rect(sector.x, sector.y, sector.w,
        random.value(restriction, sector.h - restriction))
      div2 = new Rect(sector.x, sector.y + div1.h, sector.w, sector.h - div1.h)
    # Split vertically
  else
    # If too narrow to split in this direction, try to split in another one
    if sector.w/sector.h < 2 * cfg.RATIO_RESTR
      return split(sector, !horizontalDir, steps)
    # If stop splitting
    else if (steps is 0) or (sector.w < 2*cfg.MIN_SECTOR_SIZE) or
        (sector.w < cfg.MAX_SECTOR_SIZE and random.test(cfg.BIG_ROOM_CHANCE))
      return [sector]
    # Finally split
    else
      restriction = Math.max(cfg.MIN_SECTOR_SIZE,
        Math.ceil(sector.w * cfg.RATIO_RESTR))
      div1 = new Rect(sector.x, sector.y,
        random.value(restriction, sector.w - restriction), sector.h)
      div2 = new Rect(sector.x + div1.w, sector.y, sector.w - div1.w, sector.h)
  split(div1, !horizontalDir, steps-1).concat(split(div2, !horizontalDir, steps-1))

### EXPORT ###
@bsp =
  config: cfg
  generate: generateMap
  Tree: Tree