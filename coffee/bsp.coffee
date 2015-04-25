cfg =
  ITERATIONS: 4
  RATIO_RESTR: 0.45
  PARTITION_LEVEL: 2
  ROOM_REDUCTION: 0.4
  ROOM_MIN_SIZE: 5
  SECTOR_MIN_SIZE: 9
  SECTOR_MAX_SIZE: 16
  BIG_ROOM_CHANCE: 25
  ROOM_DELETING_RATIO: 0.4
  DOOR_CHANCE: 60

class Tree
  constructor: (node) ->
    @node = node
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

  grow: (iterations, splitFunction) ->
    if iterations > 0
      childNodes = splitFunction(@node)
      if childNodes? and 0 < childNodes.length <= 1
        @node = childNodes[0]
        # retVal = @grow(iterations-1, splitFunction)
      else if childNodes? and childNodes.length > 1
        for node in childNodes
          @childs.push(new Tree(node).grow(iterations-1, splitFunction))
    @

generateMap = (size) ->
  tilemap = []
  for i in [0...size]
    tilemap[i] = []
    for j in [0...size]
      tilemap[i][j] = TILE_NULL
  tree = new Tree(new Rect(0, 0, size, size)).grow(cfg.ITERATIONS,split)
  rooms = generateRooms(tree, tilemap)
  tree.removeDeadLeafs()
  paths = generatePaths(tree, tilemap)
  tilemap

spawnRoom = (sector) ->
  reduction = Math.min (
    Math.floor (sector.w * cfg.ROOM_REDUCTION),
      Math.floor (sector.h * cfg.ROOM_REDUCTION))
  x = sector.x + randomValue 2, reduction
  y = sector.y + x - sector.x
  w = sector.w - 2 * (x - sector.x)
  h = sector.h - 2 * (y - sector.y)
  new Room x, y, w, h

generateRooms = (tree, tilemap) ->
  rooms = []
  leafs = tree.getLeafs()
  roomsToDelete = Math.round(leafs.length * cfg.ROOM_DELETING_RATIO)
  # Delete some rooms
  for x in [0...roomsToDelete]
    index = randomValue(0, leafs.length)
    leafs[index].kill()
    leafs.splice(index, 1)
  # Generate rooms
  for leaf, i in leafs
    rooms[i] = spawnRoom(leaf.node)
    rooms[i].drawOnMap(tilemap)
  rooms

generatePaths = (tree, tilemap) ->
  paths = []
  sectorList = tree.getNodeList()
  # Connect all nodes
  for _, i in sectorList
    paths.push(new Path(sectorList[i].center,
      sectorList[(i+1) % sectorList.length].center))
  # Paint paths
  path.drawOnMap(tilemap) for path in paths
  paths

split = (sector, horizontalDir = randomTest(50), steps = cfg.PARTITION_LEVEL) ->
  # Split horizontally
  if horizontalDir
    # If too narrow to split in this direction, try to split in another one
    if sector.h/sector.w < 2 * cfg.RATIO_RESTR
      return split(sector, !horizontalDir, steps)
    # If stop splitting
    else if (steps is 0) or
    (sector.h < cfg.SECTOR_MAX_SIZE and randomTest(cfg.BIG_ROOM_CHANCE)) or
    (sector.h < 2*cfg.SECTOR_MIN_SIZE)
      return [sector]
    # Finally split
    else
      restriction = Math.max(cfg.ROOM_MIN_SIZE,
        Math.ceil(sector.h * cfg.RATIO_RESTR))
      div1 = new Rect(sector.x, sector.y, sector.w,
        randomValue(restriction, sector.h - restriction))
      div2 = new Rect(sector.x, sector.y + div1.h, sector.w, sector.h - div1.h)
  # Split vertically
  else
    # If too narrow to split in this direction, try to split in another one
    if sector.w/sector.h < 2 * cfg.RATIO_RESTR
      return split(sector, !horizontalDir, steps)
      # If stop splitting
    else if (steps is 0) or
    (sector.w < cfg.SECTOR_MAX_SIZE and randomTest(cfg.BIG_ROOM_CHANCE)) or
    (sector.w < 2*cfg.SECTOR_MIN_SIZE)
      return [sector]
      # Finally split
    else
      restriction = Math.max(cfg.ROOM_MIN_SIZE,
        Math.ceil(sector.w * cfg.RATIO_RESTR))
      div1 = new Rect(sector.x, sector.y,
        randomValue(restriction, sector.w - restriction), sector.h)
      div2 = new Rect(sector.x + div1.w, sector.y, sector.w - div1.w, sector.h)
  split(div1, !horizontalDir, steps-1).concat(split(div2, !horizontalDir, steps-1))

### EXPORT ###
@COFFE_BSP =
  config: cfg
  generate: generateMap
  Tree: Tree