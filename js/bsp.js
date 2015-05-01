// Generated by CoffeeScript 1.9.2
(function() {
  var Tree, cfg, generateDoors, generateMap, generatePaths, generateRooms, spawnRoom, split;

  cfg = {
    RATIO_RESTR: 0.35,
    PARTITION_LEVEL: 2,
    ROOM_REDUCTION: 0.4,
    ROOM_MIN_SIZE: 5,
    SECTOR_MIN_SIZE: 10,
    MIN_SECTOR_REDUCTION: 2,
    MAX_SECTOR_REDUCTION: 5,
    SECTOR_MAX_SIZE: 16,
    BIG_ROOM_CHANCE: 40,
    ROOM_DELETING_RATIO: 0.4,
    DOOR_CHANCE: 100,
    DRAW_WALLS: true
  };

  Tree = (function() {
    function Tree(node1) {
      this.node = node1;
      this.childs = [];
    }

    Tree.prototype.isEmpty = function() {
      return this.node == null;
    };

    Tree.prototype.isLeaf = function() {
      return this.childs.length === 0;
    };

    Tree.prototype.getLeafs = function() {
      var child, k, len, ref, retVal;
      if (this.isLeaf()) {
        return [this];
      }
      retVal = [];
      ref = this.childs;
      for (k = 0, len = ref.length; k < len; k++) {
        child = ref[k];
        retVal = retVal.concat(child.getLeafs());
      }
      return retVal;
    };

    Tree.prototype.getNodeList = function() {
      var child, k, len, ref, retVal;
      retVal = [this.node];
      ref = this.childs;
      for (k = 0, len = ref.length; k < len; k++) {
        child = ref[k];
        retVal = retVal.concat(child.getNodeList());
      }
      return retVal;
    };

    Tree.prototype.kill = function() {
      this.node = void 0;
      this.childs = [];
      return void 0;
    };

    Tree.prototype.removeDeadLeafs = function() {
      var child, i, k, ref;
      if (!this.isLeaf()) {
        ref = this.childs;
        for (i = k = ref.length - 1; k >= 0; i = k += -1) {
          child = ref[i];
          child.removeDeadLeafs();
          if (child.isLeaf() && child.isEmpty()) {
            this.childs.splice(i, 1);
          }
        }
      }
      return void 0;
    };

    Tree.prototype.grow = function(splitFunction) {
      var childNodes, k, len, node, ref;
      childNodes = splitFunction(this.node);
      if ((childNodes != null) && (0 < (ref = childNodes.length) && ref <= 1)) {
        this.node = childNodes[0];
      } else if ((childNodes != null) && childNodes.length > 1) {
        for (k = 0, len = childNodes.length; k < len; k++) {
          node = childNodes[k];
          this.childs.push(new Tree(node).grow(splitFunction));
        }
      }
      return this;
    };

    Tree.prototype.paint = function(c) {
      var child, k, len, ref, results, tileSize;
      tileSize = TILE_SIZE();
      c.beginPath();
      c.strokeStyle = "#0f0";
      c.lineWidth = 6;
      c.strokeRect(this.node.x * tileSize, this.node.y * tileSize, this.node.w * tileSize, this.node.h * tileSize);
      ref = this.childs;
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        child = ref[k];
        results.push(child.paint(c));
      }
      return results;
    };

    return Tree;

  })();

  generateMap = function(size, c) {
    var paths, rooms, tilemap, tree;
    tilemap = new TileMap(size, size);
    tree = new Tree(new Rect(0, 0, size, size)).grow(split);
    rooms = generateRooms(tree, tilemap);
    tree.removeDeadLeafs();
    paths = generatePaths(tree, tilemap);
    tilemap.removeDeadEnds();
    generateDoors(tilemap.tilemap);
    tilemap.optimiseDoors();
    if (cfg.DRAW_WALLS) {
      tilemap.drawWalls();
    }
    tilemap.debug.tree = tree;
    return tilemap;
  };

  spawnRoom = function(sector) {
    var h, reduction, w, x, y;
    if (sector.w < sector.h) {
      reduction = Math.round(sector.w * cfg.ROOM_REDUCTION);
      w = Math.max(cfg.ROOM_MIN_SIZE, sector.w - 2 * utils.randomValue(2, reduction));
      h = sector.h - (sector.w - w);
    } else {
      reduction = Math.round(sector.h * cfg.ROOM_REDUCTION);
      h = Math.max(cfg.ROOM_MIN_SIZE, sector.h - 2 * utils.randomValue(2, reduction));
      w = sector.w - (sector.h - h);
    }
    x = sector.x + Math.floor((sector.w - w) / 2);
    y = sector.y - sector.x + x;
    return new Rect(x, y, w, h);
  };

  generateRooms = function(tree, tilemap) {
    var i, index, k, l, leaf, leafs, len, ref, rooms, roomsToDelete, x;
    rooms = [];
    leafs = tree.getLeafs();
    roomsToDelete = Math.round(leafs.length * cfg.ROOM_DELETING_RATIO);
    for (x = k = 0, ref = roomsToDelete; 0 <= ref ? k < ref : k > ref; x = 0 <= ref ? ++k : --k) {
      index = utils.randomValue(leafs.length);
      leafs[index].kill();
      leafs.splice(index, 1);
    }
    for (i = l = 0, len = leafs.length; l < len; i = ++l) {
      leaf = leafs[i];
      rooms[i] = spawnRoom(leaf.node);
      tilemap.drawRect(rooms[i]);
    }
    return rooms;
  };

  generatePaths = function(tree, tilemap) {
    var _, i, k, l, len, len1, path, paths, sectorList;
    paths = [];
    sectorList = tree.getNodeList();
    for (i = k = 0, len = sectorList.length; k < len; i = ++k) {
      _ = sectorList[i];
      paths.push(new Path(sectorList[i].center, sectorList[(i + 1) % sectorList.length].center));
    }
    for (l = 0, len1 = paths.length; l < len1; l++) {
      path = paths[l];
      tilemap.drawPath(path);
    }
    return paths;
  };

  generateDoors = function(tilemap) {
    var LOOKAHEAD, doors, i, j, k, l, m, n, o, p, q, ref, ref1, ref10, ref11, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, total;
    LOOKAHEAD = 3;
    doors = [];
    for (i = k = ref = LOOKAHEAD, ref1 = tilemap.length - LOOKAHEAD; ref <= ref1 ? k < ref1 : k > ref1; i = ref <= ref1 ? ++k : --k) {
      for (j = l = ref2 = LOOKAHEAD, ref3 = tilemap[i].length - LOOKAHEAD; ref2 <= ref3 ? l < ref3 : l > ref3; j = ref2 <= ref3 ? ++l : --l) {
        if (!(tilemap[i][j] === tile.GROUND)) {
          continue;
        }
        total = [0, 0, 0, 0];
        if ((tilemap[i - 1][j] === (ref4 = tilemap[i + 1][j]) && ref4 === tile.NULL) && (tilemap[i][j - 1] === (ref5 = tilemap[i][j + 1]) && ref5 === tile.GROUND)) {
          for (n = m = ref6 = -LOOKAHEAD; ref6 <= -1 ? m <= -1 : m >= -1; n = ref6 <= -1 ? ++m : --m) {
            if (tilemap[i - 1][j + n] !== tile.NULL) {
              total[0]++;
            }
            if (tilemap[i + 1][j + n] !== tile.NULL) {
              total[1]++;
            }
          }
          for (n = o = 1, ref7 = LOOKAHEAD; 1 <= ref7 ? o <= ref7 : o >= ref7; n = 1 <= ref7 ? ++o : --o) {
            if (tilemap[i - 1][j + n] !== tile.NULL) {
              total[2]++;
            }
            if (tilemap[i + 1][j + n] !== tile.NULL) {
              total[3]++;
            }
          }
        } else if ((tilemap[i][j - 1] === (ref8 = tilemap[i][j + 1]) && ref8 === tile.NULL) && (tilemap[i - 1][j] === (ref9 = tilemap[i + 1][j]) && ref9 === tile.GROUND)) {
          for (n = p = ref10 = -LOOKAHEAD; ref10 <= -1 ? p <= -1 : p >= -1; n = ref10 <= -1 ? ++p : --p) {
            if (tilemap[i + n][j - 1] !== tile.NULL) {
              total[0]++;
            }
            if (tilemap[i + n][j + 1] !== tile.NULL) {
              total[1]++;
            }
          }
          for (n = q = 1, ref11 = LOOKAHEAD; 1 <= ref11 ? q <= ref11 : q >= ref11; n = 1 <= ref11 ? ++q : --q) {
            if (tilemap[i + n][j - 1] !== tile.NULL) {
              total[2]++;
            }
            if (tilemap[i + n][j + 1] !== tile.NULL) {
              total[3]++;
            }
          }
        }
        if ((total[0] >= LOOKAHEAD || total[1] >= LOOKAHEAD || total[2] >= LOOKAHEAD || total[3] >= LOOKAHEAD) && utils.randomTest(cfg.DOOR_CHANCE)) {
          tilemap[i][j] = tile.DOOR;
          doors.push(new Point(j, i));
        }
      }
    }
    return doors;
  };

  split = function(sector, horizontalDir, steps) {
    var div1, div2, restriction;
    if (horizontalDir == null) {
      horizontalDir = utils.randomTest();
    }
    if (steps == null) {
      steps = cfg.PARTITION_LEVEL;
    }
    if (horizontalDir) {
      if (sector.h / sector.w < 2 * cfg.RATIO_RESTR) {
        return split(sector, !horizontalDir, steps);
      } else if ((steps === 0) || (sector.h < cfg.SECTOR_MAX_SIZE && utils.randomTest(cfg.BIG_ROOM_CHANCE)) || (sector.h < 2 * cfg.SECTOR_MIN_SIZE)) {
        return [sector];
      } else {
        restriction = Math.max(cfg.SECTOR_MIN_SIZE, Math.ceil(sector.h * cfg.RATIO_RESTR));
        div1 = new Rect(sector.x, sector.y, sector.w, utils.randomValue(restriction, sector.h - restriction));
        div2 = new Rect(sector.x, sector.y + div1.h, sector.w, sector.h - div1.h);
      }
    } else {
      if (sector.w / sector.h < 2 * cfg.RATIO_RESTR) {
        return split(sector, !horizontalDir, steps);
      } else if ((steps === 0) || (sector.w < cfg.SECTOR_MAX_SIZE && utils.randomTest(cfg.BIG_ROOM_CHANCE)) || (sector.w < 2 * cfg.SECTOR_MIN_SIZE)) {
        return [sector];
      } else {
        restriction = Math.max(cfg.SECTOR_MIN_SIZE, Math.ceil(sector.w * cfg.RATIO_RESTR));
        div1 = new Rect(sector.x, sector.y, utils.randomValue(restriction, sector.w - restriction), sector.h);
        div2 = new Rect(sector.x + div1.w, sector.y, sector.w - div1.w, sector.h);
      }
    }
    return split(div1, !horizontalDir, steps - 1).concat(split(div2, !horizontalDir, steps - 1));
  };


  /* EXPORT */

  this.bsp = {
    config: cfg,
    generate: generateMap,
    Tree: Tree
  };

}).call(this);

//# sourceMappingURL=bsp.js.map
