// Generated by CoffeeScript 1.9.2
(function() {
  var hasProp = {}.hasOwnProperty;

  this.mapParams = {
    mapSize: 50,
    canvasSize: 400,
    showGrid: true,
    showDoors: true,
    showWalls: true,
    debugMode: false
  };

  this.TILE_SIZE = function() {
    return mapParams.canvasSize / mapParams.mapSize;
  };

  this.color = {
    GRID: "#444",
    BACKGROUND: "#000",
    WALL: "#833",
    GROUND: "#CCC",
    DOOR: "#66B",
    DEBUG: "#0F0"
  };

  this.tile = {
    NULL: -1,
    GROUND: 0,
    DOOR: 1,
    WALL: 2,
    DEBUG: -128
  };

  this.random = {
    test: function(val) {
      if (val == null) {
        val = 0.5;
      }
      if (val < 1) {
        return Math.random() < val;
      } else {
        return Math.random() * 100 < val;
      }
    },
    value: function(min, max) {
      if (max == null) {
        max = min;
        min = 0;
      }
      if (min >= max) {
        return min;
      } else {
        return Math.floor(Math.random() * (max - min) + min);
      }
    }
  };

  this.Point = (function() {
    function Point(x, y) {
      this.x = x;
      this.y = y;
    }

    return Point;

  })();

  this.Rect = (function() {
    function Rect(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.center = new Point(this.x + Math.floor(this.w / 2), this.y + Math.floor(this.h / 2));
    }

    return Rect;

  })();

  this.Path = (function() {
    function Path(start, end) {
      this.start = start;
      this.end = end;
    }

    return Path;

  })();

  this.TileMap = (function() {
    function TileMap(w, h) {
      var i, j, k, l, ref, ref1;
      this.w = w;
      this.h = h;
      this.debug = {};
      this.tilemap = [];
      for (i = k = 0, ref = this.h; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        this.tilemap[i] = [];
        for (j = l = 0, ref1 = this.w; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
          this.tilemap[i][j] = tile.NULL;
        }
      }
    }

    TileMap.prototype.drawPoint = function(point, fillTile) {
      if (fillTile == null) {
        fillTile = tile.GROUND;
      }
      return this.tilemap[point.y][point.x] = fillTile;
    };

    TileMap.prototype.drawRect = function(rect, fillTile) {
      var i, j, k, ref, ref1, results;
      if (fillTile == null) {
        fillTile = tile.GROUND;
      }
      results = [];
      for (i = k = ref = rect.y, ref1 = rect.y + rect.h; ref <= ref1 ? k < ref1 : k > ref1; i = ref <= ref1 ? ++k : --k) {
        results.push((function() {
          var l, ref2, ref3, results1;
          results1 = [];
          for (j = l = ref2 = rect.x, ref3 = rect.x + rect.w; ref2 <= ref3 ? l < ref3 : l > ref3; j = ref2 <= ref3 ? ++l : --l) {
            results1.push(this.tilemap[i][j] = fillTile);
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    TileMap.prototype.drawPath = function(path, fillTile) {
      var index, k, l, ref, ref1, ref2, ref3, x1, x2, y1, y2;
      if (fillTile == null) {
        fillTile = tile.GROUND;
      }
      x1 = path.start.x < path.end.x ? path.start.x : path.end.x;
      x2 = path.start.x < path.end.x ? path.end.x : path.start.x;
      y1 = path.start.y < path.end.y ? path.start.y : path.end.y;
      y2 = path.start.y < path.end.y ? path.end.y : path.start.y;
      for (index = k = ref = y1, ref1 = y2; ref <= ref1 ? k <= ref1 : k >= ref1; index = ref <= ref1 ? ++k : --k) {
        this.tilemap[index][path.start.x] = fillTile;
      }
      for (index = l = ref2 = x1, ref3 = x2; ref2 <= ref3 ? l <= ref3 : l >= ref3; index = ref2 <= ref3 ? ++l : --l) {
        this.tilemap[path.end.y][index] = fillTile;
      }
      return void 0;
    };

    TileMap.prototype.removeDeadEnds = function() {
      var connections, current, k, l, m, n, next, ref, ref1;
      for (m = k = 1, ref = this.tilemap.length - 1; 1 <= ref ? k < ref : k > ref; m = 1 <= ref ? ++k : --k) {
        for (n = l = 1, ref1 = this.tilemap.length - 1; 1 <= ref1 ? l < ref1 : l > ref1; n = 1 <= ref1 ? ++l : --l) {
          if (!(this.tilemap[m][n] !== tile.NULL)) {
            continue;
          }
          current = {
            i: m,
            j: n
          };
          while (current != null) {
            next = {};
            connections = 0;
            if (this.tilemap[current.i - 1][current.j] !== tile.NULL) {
              connections++;
              next.i = current.i - 1;
              next.j = current.j;
            }
            if (this.tilemap[current.i + 1][current.j] !== tile.NULL) {
              connections++;
              next.i = current.i + 1;
              next.j = current.j;
            }
            if (this.tilemap[current.i][current.j - 1] !== tile.NULL) {
              connections++;
              next.i = current.i;
              next.j = current.j - 1;
            }
            if (this.tilemap[current.i][current.j + 1] !== tile.NULL) {
              connections++;
              next.i = current.i;
              next.j = current.j + 1;
            }
            if (connections > 1) {
              current = null;
            } else {
              this.tilemap[current.i][current.j] = tile.NULL;
              current = next;
            }
          }
        }
      }
      return void 0;
    };

    TileMap.prototype.optimiseDoors = function() {
      var i, j, k, l, ref, ref1, ref2, ref3, ref4, ref5;
      for (i = k = 1, ref = this.tilemap.length - 1; 1 <= ref ? k < ref : k > ref; i = 1 <= ref ? ++k : --k) {
        for (j = l = 1, ref1 = this.tilemap.length - 1; 1 <= ref1 ? l < ref1 : l > ref1; j = 1 <= ref1 ? ++l : --l) {
          if (!(this.tilemap[i][j] !== tile.NULL)) {
            continue;
          }
          if ((this.tilemap[i - 1][j] === (ref2 = this.tilemap[i + 1][j]) && ref2 === tile.DOOR) && (this.tilemap[i][j - 1] === (ref3 = this.tilemap[i][j + 1]) && ref3 === tile.NULL)) {
            this.tilemap[i - 1][j] = tile.GROUND;
            this.tilemap[i][j] = tile.DOOR;
            this.tilemap[i + 1][j] = tile.GROUND;
          }
          if ((this.tilemap[i][j - 1] === (ref4 = this.tilemap[i][j + 1]) && ref4 === tile.DOOR) && (this.tilemap[i - 1][j] === (ref5 = this.tilemap[i + 1][j]) && ref5 === tile.NULL)) {
            this.tilemap[i][j - 1] = tile.GROUND;
            this.tilemap[i][j] = tile.DOOR;
            this.tilemap[i][j + 1] = tile.GROUND;
          }
        }
      }
      return void 0;
    };

    TileMap.prototype.drawWalls = function() {
      var i, j, k, l, m, n, o, p, ref, ref1;
      for (i = k = 1, ref = this.tilemap.length - 1; 1 <= ref ? k < ref : k > ref; i = 1 <= ref ? ++k : --k) {
        for (j = l = 1, ref1 = this.tilemap.length - 1; 1 <= ref1 ? l < ref1 : l > ref1; j = 1 <= ref1 ? ++l : --l) {
          if (this.tilemap[i][j] !== tile.NULL && this.tilemap[i][j] !== tile.WALL) {
            for (n = o = -1; o <= 1; n = ++o) {
              for (m = p = -1; p <= 1; m = ++p) {
                if (this.tilemap[i + m][j + n] === tile.NULL) {
                  this.tilemap[i + m][j + n] = tile.WALL;
                }
              }
            }
          }
        }
      }
      return void 0;
    };

    TileMap.prototype.paintGrid = function(c) {
      var i, k, ref, tileSize;
      tileSize = TILE_SIZE();
      c.beginPath();
      c.strokeStyle = color.GRID;
      c.lineWidth = 1;
      for (i = k = 0, ref = this.w; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        c.moveTo(i * tileSize, 0);
        c.lineTo(i * tileSize, mapParams.mapSize * tileSize);
        c.moveTo(0, i * tileSize);
        c.lineTo(mapParams.mapSize * tileSize, i * tileSize);
      }
      c.stroke();
      return c.closePath();
    };

    TileMap.prototype.paint = function(c) {
      var col, i, j, k, key, l, len, len1, ref, ref1, ref2, results, row, tileSize, value;
      tileSize = TILE_SIZE();
      c.fillStyle = color.BACKGROUND;
      c.fillRect(0, 0, mapParams.canvasSize, mapParams.canvasSize);
      ref = this.tilemap;
      for (i = k = 0, len = ref.length; k < len; i = ++k) {
        row = ref[i];
        ref1 = this.tilemap[i];
        for (j = l = 0, len1 = ref1.length; l < len1; j = ++l) {
          col = ref1[j];
          switch (this.tilemap[i][j]) {
            case tile.GROUND:
              c.fillStyle = color.GROUND;
              break;
            case tile.DOOR:
              c.fillStyle = mapParams.showDoors ? color.DOOR : color.GROUND;
              break;
            case tile.WALL:
              c.fillStyle = mapParams.showWalls ? color.WALL : color.BACKGROUND;
              break;
            case tile.DEBUG:
              c.fillStyle = mapParams.debugMode ? color.DEBUG : color.BACKGROUND;
              break;
            default:
              c.fillStyle = color.BACKGROUND;
          }
          c.fillRect(j * tileSize, i * tileSize, tileSize, tileSize);
        }
      }
      if (mapParams.showGrid) {
        this.paintGrid(c);
      }
      if (mapParams.debugMode) {
        ref2 = this.debug;
        results = [];
        for (key in ref2) {
          if (!hasProp.call(ref2, key)) continue;
          value = ref2[key];
          results.push(value.paint(c));
        }
        return results;
      }
    };

    return TileMap;

  })();

}).call(this);

//# sourceMappingURL=common.js.map
