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

//# sourceMappingURL=data:application/json;base64,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QUEsTUFBQSxJQUFDLENBQUEsU0FBRCxDQUFXLENBQVgsQ0FBQSxDQUFBO0tBaEJBO0FBaUJBLElBQUEsSUFBK0MsU0FBUyxDQUFDLFNBQXpEO0FBQUE7QUFBQTtXQUFBLFdBQUE7OzBCQUFBO0FBQUEscUJBQUEsS0FBSyxDQUFDLEtBQU4sQ0FBWSxDQUFaLEVBQUEsQ0FBQTtBQUFBO3FCQUFBO0tBbEJLO0VBQUEsQ0E5RlAsQ0FBQTs7aUJBQUE7O0lBbERGLENBQUEiLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyBHTE9CQUwgUEFSQU1FVEVSU1xyXG5AbWFwUGFyYW1zID1cclxuICBtYXBTaXplOiA1MFxyXG4gIGNhbnZhc1NpemU6IDQwMFxyXG4gIHNob3dHcmlkOiB0cnVlXHJcbiAgc2hvd0Rvb3JzOiB0cnVlXHJcbiAgc2hvd1dhbGxzOiB0cnVlXHJcbiAgZGVidWdNb2RlOiBmYWxzZVxyXG5cclxuQFRJTEVfU0laRSA9ICgpIC0+IG1hcFBhcmFtcy5jYW52YXNTaXplIC8gbWFwUGFyYW1zLm1hcFNpemVcclxuXHJcbiMgQ09MT1JTXHJcbkBjb2xvciA9XHJcbiAgR1JJRDogXCIjNDQ0XCJcclxuICBCQUNLR1JPVU5EOiBcIiMwMDBcIlxyXG4gIFdBTEw6IFwiIzgzM1wiXHJcbiAgR1JPVU5EOiBcIiNDQ0NcIlxyXG4gIERPT1I6IFwiIzY2QlwiXHJcbiAgREVCVUc6IFwiIzBGMFwiXHJcblxyXG4jIFRJTEUgVkFMVUVTXHJcbkB0aWxlID1cclxuICBOVUxMOiAtMVxyXG4gIEdST1VORDogMFxyXG4gIERPT1I6IDFcclxuICBXQUxMOiAyXHJcbiAgREVCVUc6IC0xMjhcclxuXHJcbiMgUkFORE9NIFVUSUxJVElFU1xyXG5AcmFuZG9tID1cclxuICB0ZXN0OiAodmFsID0gMC41KSAtPlxyXG4gICAgaWYgdmFsIDwgMSB0aGVuIE1hdGgucmFuZG9tKCkgPCB2YWwgZWxzZSBNYXRoLnJhbmRvbSgpICogMTAwIDwgdmFsXHJcblxyXG4gIHZhbHVlOiAobWluLCBtYXgpIC0+XHJcbiAgICB1bmxlc3MgbWF4P1xyXG4gICAgICBtYXggPSBtaW5cclxuICAgICAgbWluID0gMFxyXG4gICAgaWYgbWluID49IG1heCB0aGVuIG1pbiBlbHNlIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluKVxyXG5cclxuIyBDTEFTU0VTXHJcbmNsYXNzIEBQb2ludFxyXG4gIGNvbnN0cnVjdG9yOiAoQHgsIEB5KSAtPlxyXG5cclxuY2xhc3MgQFJlY3RcclxuICBjb25zdHJ1Y3RvcjogKEB4LCBAeSwgQHcsIEBoKSAtPlxyXG4gICAgQGNlbnRlciA9IG5ldyBQb2ludChAeCArIEB3IC8vIDIsIEB5ICsgQGggLy8gMilcclxuXHJcbmNsYXNzIEBQYXRoXHJcbiAgY29uc3RydWN0b3I6IChAc3RhcnQsIEBlbmQpIC0+XHJcblxyXG5jbGFzcyBAVGlsZU1hcFxyXG4gIGNvbnN0cnVjdG9yOiAoQHcsIEBoKSAtPlxyXG4gICAgQGRlYnVnID0ge31cclxuICAgIEB0aWxlbWFwID0gW11cclxuICAgIGZvciBpIGluIFswLi4uQGhdXHJcbiAgICAgIEB0aWxlbWFwW2ldID0gW11cclxuICAgICAgZm9yIGogaW4gWzAuLi5Ad11cclxuICAgICAgICBAdGlsZW1hcFtpXVtqXSA9IHRpbGUuTlVMTFxyXG5cclxuICBkcmF3UG9pbnQ6IChwb2ludCwgZmlsbFRpbGUgPSB0aWxlLkdST1VORCkgLT5cclxuICAgIEB0aWxlbWFwW3BvaW50LnldW3BvaW50LnhdID0gZmlsbFRpbGVcclxuXHJcbiAgZHJhd1JlY3Q6IChyZWN0LCBmaWxsVGlsZSA9IHRpbGUuR1JPVU5EKSAtPlxyXG4gICAgZm9yIGkgaW4gW3JlY3QueS4uLihyZWN0LnkgKyByZWN0LmgpXVxyXG4gICAgICBmb3IgaiBpbiBbcmVjdC54Li4uKHJlY3QueCArIHJlY3QudyldXHJcbiAgICAgICAgQHRpbGVtYXBbaV1bal0gPSBmaWxsVGlsZVxyXG5cclxuICBkcmF3UGF0aDogKHBhdGgsIGZpbGxUaWxlID0gdGlsZS5HUk9VTkQpIC0+XHJcbiAgICB4MSA9IGlmIHBhdGguc3RhcnQueCA8IHBhdGguZW5kLnggdGhlbiBwYXRoLnN0YXJ0LnggZWxzZSBwYXRoLmVuZC54XHJcbiAgICB4MiA9IGlmIHBhdGguc3RhcnQueCA8IHBhdGguZW5kLnggdGhlbiBwYXRoLmVuZC54IGVsc2UgcGF0aC5zdGFydC54XHJcbiAgICB5MSA9IGlmIHBhdGguc3RhcnQueSA8IHBhdGguZW5kLnkgdGhlbiBwYXRoLnN0YXJ0LnkgZWxzZSBwYXRoLmVuZC55XHJcbiAgICB5MiA9IGlmIHBhdGguc3RhcnQueSA8IHBhdGguZW5kLnkgdGhlbiBwYXRoLmVuZC55IGVsc2UgcGF0aC5zdGFydC55XHJcbiAgICAjcGF0aFRpbGVbcGF0aC5zdGFydC54XSA9IGZpbGxUaWxlIGZvciBwYXRoVGlsZSBpbiBAdGlsZW1hcFt5MS4ueTJdXHJcbiAgICAjcGF0aFRpbGUgPSBmaWxsVGlsZSBmb3IgcGF0aFRpbGUgaW4gQHRpbGVtYXBbcGF0aC5lbmQueV1beDEuLngyXVxyXG4gICAgQHRpbGVtYXBbaW5kZXhdW3BhdGguc3RhcnQueF0gPSBmaWxsVGlsZSBmb3IgaW5kZXggaW4gW3kxLi55Ml1cclxuICAgIEB0aWxlbWFwW3BhdGguZW5kLnldW2luZGV4XSA9IGZpbGxUaWxlIGZvciBpbmRleCBpbiBbeDEuLngyXVxyXG4gICAgdW5kZWZpbmVkICMgQXZvaWRpbmcgcHVzaCBvcGVyYXRpb25zIGFuZCB3cm9uZyByZXR1cm5cclxuXHJcbiAgcmVtb3ZlRGVhZEVuZHM6IC0+XHJcbiAgICBmb3IgbSBpbiBbMS4uLihAdGlsZW1hcC5sZW5ndGggLSAxKV1cclxuICAgICAgZm9yIG4gaW4gWzEuLi4oQHRpbGVtYXAubGVuZ3RoIC0gMSldIHdoZW4gQHRpbGVtYXBbbV1bbl0gaXNudCB0aWxlLk5VTExcclxuICAgICAgICBjdXJyZW50ID0ge2k6bSxqOm59XHJcbiAgICAgICAgd2hpbGUgY3VycmVudD9cclxuICAgICAgICAgIG5leHQgPSB7fVxyXG4gICAgICAgICAgY29ubmVjdGlvbnMgPSAwXHJcbiAgICAgICAgICBpZiBAdGlsZW1hcFtjdXJyZW50LmktMV1bY3VycmVudC5qXSBpc250IHRpbGUuTlVMTFxyXG4gICAgICAgICAgICBjb25uZWN0aW9ucysrXHJcbiAgICAgICAgICAgIG5leHQuaSA9IGN1cnJlbnQuaS0xXHJcbiAgICAgICAgICAgIG5leHQuaiA9IGN1cnJlbnQualxyXG4gICAgICAgICAgaWYgQHRpbGVtYXBbY3VycmVudC5pKzFdW2N1cnJlbnQual0gaXNudCB0aWxlLk5VTExcclxuICAgICAgICAgICAgY29ubmVjdGlvbnMrK1xyXG4gICAgICAgICAgICBuZXh0LmkgPSBjdXJyZW50LmkrMVxyXG4gICAgICAgICAgICBuZXh0LmogPSBjdXJyZW50LmpcclxuICAgICAgICAgIGlmIEB0aWxlbWFwW2N1cnJlbnQuaV1bY3VycmVudC5qLTFdIGlzbnQgdGlsZS5OVUxMXHJcbiAgICAgICAgICAgIGNvbm5lY3Rpb25zKytcclxuICAgICAgICAgICAgbmV4dC5pID0gY3VycmVudC5pXHJcbiAgICAgICAgICAgIG5leHQuaiA9IGN1cnJlbnQuai0xXHJcbiAgICAgICAgICBpZiBAdGlsZW1hcFtjdXJyZW50LmldW2N1cnJlbnQuaisxXSBpc250IHRpbGUuTlVMTFxyXG4gICAgICAgICAgICBjb25uZWN0aW9ucysrXHJcbiAgICAgICAgICAgIG5leHQuaSA9IGN1cnJlbnQuaVxyXG4gICAgICAgICAgICBuZXh0LmogPSBjdXJyZW50LmorMVxyXG4gICAgICAgICAgaWYgY29ubmVjdGlvbnMgPiAxXHJcbiAgICAgICAgICAgIGN1cnJlbnQgPSBudWxsXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIEB0aWxlbWFwW2N1cnJlbnQuaV1bY3VycmVudC5qXSA9IHRpbGUuTlVMTFxyXG4gICAgICAgICAgICBjdXJyZW50ID0gbmV4dFxyXG4gICAgdW5kZWZpbmVkICMgQXZvaWRpbmcgcHVzaCBvcGVyYXRpb25zIGFuZCB3cm9uZyByZXR1cm5cclxuXHJcbiAgb3B0aW1pc2VEb29yczogLT5cclxuICAgIGZvciBpIGluIFsxLi4uKEB0aWxlbWFwLmxlbmd0aCAtIDEpXVxyXG4gICAgICBmb3IgaiBpbiBbMS4uLihAdGlsZW1hcC5sZW5ndGggLSAxKV0gd2hlbiBAdGlsZW1hcFtpXVtqXSBpc250IHRpbGUuTlVMTFxyXG4gICAgICAgIGlmIEB0aWxlbWFwW2ktMV1bal0gaXMgQHRpbGVtYXBbaSsxXVtqXSBpcyB0aWxlLkRPT1IgYW5kXHJcbiAgICAgICAgICAgIEB0aWxlbWFwW2ldW2otMV0gaXMgQHRpbGVtYXBbaV1baisxXSBpcyB0aWxlLk5VTExcclxuICAgICAgICAgIEB0aWxlbWFwW2ktMV1bal0gPSB0aWxlLkdST1VORFxyXG4gICAgICAgICAgQHRpbGVtYXBbaV1bal0gPSB0aWxlLkRPT1JcclxuICAgICAgICAgIEB0aWxlbWFwW2krMV1bal0gPSB0aWxlLkdST1VORFxyXG4gICAgICAgIGlmIEB0aWxlbWFwW2ldW2otMV0gaXMgQHRpbGVtYXBbaV1baisxXSBpcyB0aWxlLkRPT1IgYW5kXHJcbiAgICAgICAgICAgIEB0aWxlbWFwW2ktMV1bal0gaXMgQHRpbGVtYXBbaSsxXVtqXSBpcyB0aWxlLk5VTExcclxuICAgICAgICAgIEB0aWxlbWFwW2ldW2otMV0gPSB0aWxlLkdST1VORFxyXG4gICAgICAgICAgQHRpbGVtYXBbaV1bal0gPSB0aWxlLkRPT1JcclxuICAgICAgICAgIEB0aWxlbWFwW2ldW2orMV0gPSB0aWxlLkdST1VORFxyXG4gICAgdW5kZWZpbmVkICMgQXZvaWRpbmcgcHVzaCBvcGVyYXRpb25zIGFuZCB3cm9uZyByZXR1cm5cclxuXHJcbiAgZHJhd1dhbGxzOiAtPlxyXG4gICAgZm9yIGkgaW4gWzEuLi4oQHRpbGVtYXAubGVuZ3RoIC0gMSldXHJcbiAgICAgIGZvciBqIGluIFsxLi4uKEB0aWxlbWFwLmxlbmd0aCAtIDEpXSB3aGVuIEB0aWxlbWFwW2ldW2pdIGlzbnQgdGlsZS5OVUxMIGFuZFxyXG4gICAgICBAdGlsZW1hcFtpXVtqXSBpc250IHRpbGUuV0FMTFxyXG4gICAgICAgIGZvciBuIGluIFstMS4uMV1cclxuICAgICAgICAgIGZvciBtIGluIFstMS4uMV0gd2hlbiBAdGlsZW1hcFtpK21dW2orbl0gaXMgdGlsZS5OVUxMXHJcbiAgICAgICAgICAgIEB0aWxlbWFwW2krbV1baituXSA9IHRpbGUuV0FMTFxyXG4gICAgdW5kZWZpbmVkICMgQXZvaWRpbmcgcHVzaCBvcGVyYXRpb25zIGFuZCB3cm9uZyByZXR1cm5cclxuXHJcbiAgcGFpbnRHcmlkOiAoYykgLT5cclxuICAgIHRpbGVTaXplID0gVElMRV9TSVpFKClcclxuICAgIGMuYmVnaW5QYXRoKClcclxuICAgIGMuc3Ryb2tlU3R5bGUgPSBjb2xvci5HUklEXHJcbiAgICBjLmxpbmVXaWR0aCA9IDFcclxuICAgIGZvciBpIGluIFswLi4uQHddXHJcbiAgICAgIGMubW92ZVRvKGkgKiB0aWxlU2l6ZSwgMClcclxuICAgICAgYy5saW5lVG8oaSAqIHRpbGVTaXplLCBtYXBQYXJhbXMubWFwU2l6ZSAqIHRpbGVTaXplKVxyXG4gICAgICBjLm1vdmVUbygwLCBpICogdGlsZVNpemUpXHJcbiAgICAgIGMubGluZVRvKG1hcFBhcmFtcy5tYXBTaXplICogdGlsZVNpemUsIGkgKiB0aWxlU2l6ZSlcclxuICAgIGMuc3Ryb2tlKClcclxuICAgIGMuY2xvc2VQYXRoKClcclxuXHJcbiAgcGFpbnQ6IChjKSAtPlxyXG4gICAgdGlsZVNpemUgPSBUSUxFX1NJWkUoKVxyXG4gICAgYy5maWxsU3R5bGUgPSBjb2xvci5CQUNLR1JPVU5EXHJcbiAgICBjLmZpbGxSZWN0KDAsIDAsIG1hcFBhcmFtcy5jYW52YXNTaXplLCBtYXBQYXJhbXMuY2FudmFzU2l6ZSlcclxuICAgIGZvciByb3csIGkgaW4gQHRpbGVtYXBcclxuICAgICAgZm9yIGNvbCwgaiBpbiBAdGlsZW1hcFtpXVxyXG4gICAgICAgIHN3aXRjaCBAdGlsZW1hcFtpXVtqXVxyXG4gICAgICAgICAgd2hlbiB0aWxlLkdST1VORCB0aGVuIGMuZmlsbFN0eWxlID0gY29sb3IuR1JPVU5EXHJcbiAgICAgICAgICB3aGVuIHRpbGUuRE9PUlxyXG4gICAgICAgICAgICBjLmZpbGxTdHlsZSA9IGlmIG1hcFBhcmFtcy5zaG93RG9vcnMgdGhlbiBjb2xvci5ET09SIGVsc2UgY29sb3IuR1JPVU5EXHJcbiAgICAgICAgICB3aGVuIHRpbGUuV0FMTFxyXG4gICAgICAgICAgICBjLmZpbGxTdHlsZSA9IGlmIG1hcFBhcmFtcy5zaG93V2FsbHMgdGhlbiBjb2xvci5XQUxMIGVsc2UgY29sb3IuQkFDS0dST1VORFxyXG4gICAgICAgICAgd2hlbiB0aWxlLkRFQlVHXHJcbiAgICAgICAgICAgIGMuZmlsbFN0eWxlID0gaWYgbWFwUGFyYW1zLmRlYnVnTW9kZSB0aGVuIGNvbG9yLkRFQlVHIGVsc2UgY29sb3IuQkFDS0dST1VORFxyXG4gICAgICAgICAgZWxzZSBjLmZpbGxTdHlsZSA9IGNvbG9yLkJBQ0tHUk9VTkRcclxuICAgICAgICBjLmZpbGxSZWN0KGogKiB0aWxlU2l6ZSwgaSAqIHRpbGVTaXplLCB0aWxlU2l6ZSwgdGlsZVNpemUpXHJcblxyXG4gICAgQHBhaW50R3JpZChjKSBpZiBtYXBQYXJhbXMuc2hvd0dyaWRcclxuICAgIHZhbHVlLnBhaW50KGMpIGZvciBvd24ga2V5LCB2YWx1ZSBvZiBAZGVidWcgaWYgbWFwUGFyYW1zLmRlYnVnTW9kZVxyXG4iXX0=