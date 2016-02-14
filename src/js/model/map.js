var Direction, Map, Point, Tile, Tilemap,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Tile = {
  EMPTY: 0,
  OCCUPIED: 1,
  GROUND: 1,
  WALL: -1,
  DOOR: -2,
  FIRST_ROOM: 2,
  TREASURE_ROOM: 3,
  SECRET_ROOM: 4
};

Direction = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};


/*
  This class represents a point either as an array and as an object with
  fields x, y and z (when available)
 */

Point = (function(superClass) {
  extend(Point, superClass);

  function Point() {
    var k, len, value, values;
    values = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    for (k = 0, len = values.length; k < len; k++) {
      value = values[k];
      this.push(value);
    }
  }

  Object.defineProperty(Point.prototype, 'x', {
    get: function() {
      return this[0];
    },
    set: function(value) {
      while (!this.length > 0) {
        this.push(null);
      }
      return this[0] = value;
    }
  });

  Object.defineProperty(Point.prototype, 'y', {
    get: function() {
      return this[1];
    },
    set: function(value) {
      while (!this.length > 1) {
        this.push(null);
      }
      return this[1] = value;
    }
  });

  Object.defineProperty(Point.prototype, 'z', {
    get: function() {
      return this[2];
    },
    set: function(value) {
      while (!this.length > 2) {
        this.push(null);
      }
      return this[2] = value;
    }
  });

  return Point;

})(Array);


/*
  This class represents a tile map as a 2D array, adding some useful methods
 */

Tilemap = (function(superClass) {
  extend(Tilemap, superClass);

  function Tilemap(width, height, value) {
    var i, j, k, ref;
    if (value == null) {
      value = null;
    }
    for (i = k = 0, ref = width; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      this.push((function() {
        var l, ref1, results;
        results = [];
        for (j = l = 0, ref1 = height; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
          results.push(value);
        }
        return results;
      })());
    }
  }

  Object.defineProperty(Tilemap.prototype, 'width', {
    get: function() {
      return this.length;
    }
  });

  Object.defineProperty(Tilemap.prototype, 'height', {
    get: function() {
      return this[0].length;
    }
  });

  Tilemap.prototype.get = function(x, y, width, height) {
    var _x, _y, k, ref, ref1, results;
    if (width == null) {
      width = 1;
    }
    if (height == null) {
      height = 1;
    }
    results = [];
    for (_x = k = ref = x, ref1 = x + width; ref <= ref1 ? k < ref1 : k > ref1; _x = ref <= ref1 ? ++k : --k) {
      results.push((function() {
        var l, ref2, ref3, results1;
        results1 = [];
        for (_y = l = ref2 = y, ref3 = y + height; ref2 <= ref3 ? l < ref3 : l > ref3; _y = ref2 <= ref3 ? ++l : --l) {
          results1.push(this[_x][_y]);
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  Tilemap.prototype.set = function(x, y, width, height, value) {
    var _x, _y, k, ref, ref1, results;
    if (width == null) {
      width = 1;
    }
    if (height == null) {
      height = 1;
    }
    results = [];
    for (_x = k = ref = x, ref1 = x + width; ref <= ref1 ? k < ref1 : k > ref1; _x = ref <= ref1 ? ++k : --k) {
      results.push((function() {
        var l, ref2, ref3, results1;
        results1 = [];
        for (_y = l = ref2 = y, ref3 = y + height; ref2 <= ref3 ? l < ref3 : l > ref3; _y = ref2 <= ref3 ? ++l : --l) {
          results1.push(this[_x][_y] = value);
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  Tilemap.prototype.is = function(x, y, width, height, value) {
    var _x, _y, k, l, ref, ref1, ref2, ref3;
    if (width == null) {
      width = 1;
    }
    if (height == null) {
      height = 1;
    }
    if (x + width > this.width || y + height > this.height || x < 0 || y < 0) {
      return false;
    }
    for (_x = k = ref = x, ref1 = x + width; ref <= ref1 ? k < ref1 : k > ref1; _x = ref <= ref1 ? ++k : --k) {
      for (_y = l = ref2 = y, ref3 = y + height; ref2 <= ref3 ? l < ref3 : l > ref3; _y = ref2 <= ref3 ? ++l : --l) {
        if (this[_x][_y] !== value) {
          return false;
        }
      }
    }
    return true;
  };

  Tilemap.prototype.setWidth = function(width, value) {
    var i;
    if (value == null) {
      value = null;
    }
    if (width > this.width) {
      while (width > this.width) {
        this.push((function() {
          var k, ref, results;
          results = [];
          for (i = k = 0, ref = this.height; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
            results.push(value);
          }
          return results;
        }).call(this));
      }
    } else {
      this.splice(width, this.width - width);
    }
    return this.width;
  };

  Tilemap.prototype.setHeight = function(height, value) {
    var k, ref, x;
    if (value == null) {
      value = null;
    }
    for (x = k = 0, ref = this.width; 0 <= ref ? k < ref : k > ref; x = 0 <= ref ? ++k : --k) {
      if (height > this.height) {
        while (height > this[x].width) {
          this[x].push(value);
        }
      } else {
        this.splice(height, this.height - height);
      }
    }
    return this[0].height;
  };

  Tilemap.prototype.clone = function() {
    var k, l, len, len1, newInstance, row, value, x, y;
    newInstance = new Tilemap(this.width, this.height);
    for (x = k = 0, len = this.length; k < len; x = ++k) {
      row = this[x];
      for (y = l = 0, len1 = row.length; l < len1; y = ++l) {
        value = row[y];
        newInstance[x][y] = value;
      }
    }
    return newInstance;
  };

  return Tilemap;

})(Array);


/*
  This class represents the hole map. It is defined by a height, a width and
  a list of rooms.
 */

Map = (function() {
  var paintRoom;

  function Map(width1, height1, roomList) {
    this.width = width1;
    this.height = height1;
    this.roomList = roomList;
  }

  Map.prototype.getTilemap = function(tilesPerUnit) {
    var i, k, len, ref, room, tilemap;
    tilesPerUnit++;
    tilemap = new Tilemap((this.width * tilesPerUnit) + 1, (this.height * tilesPerUnit) + 1, Tile.EMPTY);
    ref = this.roomList;
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      room = ref[i];
      paintRoom(room, tilemap, tilesPerUnit);
    }
    return tilemap;
  };

  paintRoom = function(room, tilemap, tilesPerUnit) {
    var door, doorOffset, height, k, len, neighbour, origin, ref, results, width;
    origin = new Point(room.x * tilesPerUnit, room.y * tilesPerUnit);
    width = room.width * tilesPerUnit;
    height = room.height * tilesPerUnit;
    if (room.special === 'first room') {
      tilemap.set(origin[0] + 1, origin[1] + 1, width, height, Tile.FIRST_ROOM);
    } else if (room.special === 'treasure room') {
      tilemap.set(origin[0] + 1, origin[1] + 1, width, height, Tile.TREASURE_ROOM);
    } else if (room.special === 'secret room') {
      tilemap.set(origin[0] + 1, origin[1] + 1, width, height, Tile.SECRET_ROOM);
    } else {
      tilemap.set(origin[0] + 1, origin[1] + 1, width, height, Tile.GROUND);
    }
    tilemap.set(origin[0], origin[1], width + 1, 1, Tile.WALL);
    tilemap.set(origin[0], origin[1] + height, width + 1, 1, Tile.WALL);
    tilemap.set(origin[0] + width, origin[1], 1, height + 1, Tile.WALL);
    tilemap.set(origin[0], origin[1], 1, height + 1, Tile.WALL);
    ref = room.neighbours;
    results = [];
    for (door = k = 0, len = ref.length; k < len; door = ++k) {
      neighbour = ref[door];
      if (!(neighbour != null)) {
        continue;
      }
      doorOffset = ((Math.floor(door / 4)) * tilesPerUnit) + (Math.floor(tilesPerUnit / 2));
      switch (door % 4) {
        case Direction.NORTH:
          results.push(tilemap[origin[0] + doorOffset][origin[1]] = Tile.DOOR);
          break;
        case Direction.SOUTH:
          results.push(tilemap[origin[0] + doorOffset][origin[1] + height] = Tile.DOOR);
          break;
        case Direction.EAST:
          results.push(tilemap[origin[0] + width][origin[1] + doorOffset] = Tile.DOOR);
          break;
        case Direction.WEST:
          results.push(tilemap[origin[0]][origin[1] + doorOffset] = Tile.DOOR);
          break;
        default:
          results.push(void 0);
      }
    }
    return results;
  };

  return Map;

})();

window.Tile = Tile;

window.Direction = Direction;

window.Point = Point;

window.Tilemap = Tilemap;

window.Map = Map;

//# sourceMappingURL=data:application/json;base64,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QyxHQUE2QyxJQUFJLENBQUM7QUFEL0M7QUFEUCxhQUdPLFNBQVMsQ0FBQyxLQUhqQjt1QkFJSSxPQUFRLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLFVBQVosQ0FBd0IsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksTUFBWixDQUFoQyxHQUFzRCxJQUFJLENBQUM7QUFEeEQ7QUFIUCxhQUtPLFNBQVMsQ0FBQyxJQUxqQjt1QkFNSSxPQUFRLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLEtBQVosQ0FBbUIsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksVUFBWixDQUEzQixHQUFxRCxJQUFJLENBQUM7QUFEdkQ7QUFMUCxhQU9PLFNBQVMsQ0FBQyxJQVBqQjt1QkFRSSxPQUFRLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUCxDQUFXLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLFVBQVosQ0FBbkIsR0FBNkMsSUFBSSxDQUFDO0FBRC9DO0FBUFA7O0FBQUE7QUFGRjs7RUFuQlU7Ozs7OztBQWlDZCxNQUFNLENBQUMsSUFBUCxHQUFjOztBQUNkLE1BQU0sQ0FBQyxTQUFQLEdBQW1COztBQUNuQixNQUFNLENBQUMsS0FBUCxHQUFlOztBQUNmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOztBQUNqQixNQUFNLENBQUMsR0FBUCxHQUFjIiwiZmlsZSI6Im1vZGVsL21hcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jICBUaGlzIGZpbGUgY29udGFpbnMgc29tZSBjbGFzc2VzIGFuZCB1dGlsaXRpZXMgdG8gd29yayB3aXRoIG1hcHNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICBBdXRob3I6IEFkcmlhbiBNb3Jlbm9cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cblRpbGUgPVxuICBFTVBUWSAgICA6IDBcbiAgT0NDVVBJRUQgOiAxXG4gIEdST1VORDogMVxuICBXQUxMOiAtMVxuICBET09SOiAtMlxuICBGSVJTVF9ST09NOiAyXG4gIFRSRUFTVVJFX1JPT006IDNcbiAgU0VDUkVUX1JPT006IDRcblxuRGlyZWN0aW9uID1cbiAgTk9SVEggOiAwXG4gIEVBU1QgIDogMVxuICBTT1VUSCA6IDJcbiAgV0VTVCAgOiAzXG5cbiMjI1xuICBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSBwb2ludCBlaXRoZXIgYXMgYW4gYXJyYXkgYW5kIGFzIGFuIG9iamVjdCB3aXRoXG4gIGZpZWxkcyB4LCB5IGFuZCB6ICh3aGVuIGF2YWlsYWJsZSlcbiMjI1xuY2xhc3MgUG9pbnQgZXh0ZW5kcyBBcnJheVxuICBjb25zdHJ1Y3RvcjogKHZhbHVlcy4uLikgLT5cbiAgICBAcHVzaCB2YWx1ZSBmb3IgdmFsdWUgaW4gdmFsdWVzXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICd4JyxcbiAgICBnZXQ6ICgpIC0+IEBbMF1cbiAgICBzZXQ6ICh2YWx1ZSkgLT5cbiAgICAgIEBwdXNoIG51bGwgd2hpbGUgbm90IEBsZW5ndGggPiAwXG4gICAgICBAWzBdID0gdmFsdWVcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ3knLFxuICAgIGdldDogKCkgLT4gQFsxXVxuICAgIHNldDogKHZhbHVlKSAtPlxuICAgICAgQHB1c2ggbnVsbCB3aGlsZSBub3QgQGxlbmd0aCA+IDFcbiAgICAgIEBbMV0gPSB2YWx1ZVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAneicsXG4gICAgZ2V0OiAoKSAtPiBAWzJdXG4gICAgc2V0OiAodmFsdWUpIC0+XG4gICAgICBAcHVzaCBudWxsIHdoaWxlIG5vdCBAbGVuZ3RoID4gMlxuICAgICAgQFsyXSA9IHZhbHVlXG5cbiMjI1xuICBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSB0aWxlIG1hcCBhcyBhIDJEIGFycmF5LCBhZGRpbmcgc29tZSB1c2VmdWwgbWV0aG9kc1xuIyMjXG5jbGFzcyBUaWxlbWFwIGV4dGVuZHMgQXJyYXlcblxuICBjb25zdHJ1Y3RvcjogKHdpZHRoLCBoZWlnaHQsIHZhbHVlID0gbnVsbCkgLT5cbiAgICB0aGlzLnB1c2godmFsdWUgZm9yIGogaW4gWzAuLi5oZWlnaHRdKSBmb3IgaSBpbiBbMC4uLndpZHRoXVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnd2lkdGgnLFxuICAgIGdldDogKCkgLT4gIHRoaXMubGVuZ3RoXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICdoZWlnaHQnLFxuICAgIGdldDogKCkgLT4gdGhpc1swXS5sZW5ndGhcblxuICBnZXQ6ICh4LCB5LCB3aWR0aCA9IDEsIGhlaWdodCA9IDEpIC0+XG4gICAgdGhpc1tfeF1bX3ldIGZvciBfeSBpbiBbeS4uLnkgKyBoZWlnaHRdIGZvciBfeCBpbiBbeC4uLnggKyB3aWR0aF1cblxuICBzZXQ6ICh4LCB5LCB3aWR0aCA9IDEsIGhlaWdodCA9IDEsIHZhbHVlKSAtPlxuICAgIHRoaXNbX3hdW195XSA9IHZhbHVlIGZvciBfeSBpbiBbeS4uLnkgKyBoZWlnaHRdIGZvciBfeCBpbiBbeC4uLnggKyB3aWR0aF1cblxuICBpczogKHgsIHksIHdpZHRoID0gMSwgaGVpZ2h0ID0gMSwgdmFsdWUpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIHggKyB3aWR0aCA+IHRoaXMud2lkdGggb3IgeSArIGhlaWdodCA+IHRoaXMuaGVpZ2h0IG9yIHggPCAwIG9yIHkgPCAwXG4gICAgZm9yIF94IGluIFt4Li4ueCArIHdpZHRoXVxuICAgICAgZm9yIF95IGluIFt5Li4ueSArIGhlaWdodF0gd2hlbiB0aGlzW194XVtfeV0gaXNudCB2YWx1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHNldFdpZHRoOiAod2lkdGgsIHZhbHVlID0gbnVsbCkgLT5cbiAgICBpZiB3aWR0aCA+IHRoaXMud2lkdGhcbiAgICAgIHRoaXMucHVzaCh2YWx1ZSBmb3IgaSBpbiBbMC4uLnRoaXMuaGVpZ2h0XSkgd2hpbGUgd2lkdGggPiB0aGlzLndpZHRoXG4gICAgZWxzZVxuICAgICAgdGhpcy5zcGxpY2Uod2lkdGgsIHRoaXMud2lkdGggLSB3aWR0aClcbiAgICByZXR1cm4gdGhpcy53aWR0aFxuXG4gIHNldEhlaWdodDogKGhlaWdodCwgdmFsdWUgPSBudWxsKSAtPlxuICAgIGZvciB4IGluIFswLi4udGhpcy53aWR0aF1cbiAgICAgIGlmIGhlaWdodCA+IHRoaXMuaGVpZ2h0XG4gICAgICAgIHRoaXNbeF0ucHVzaCB2YWx1ZSB3aGlsZSBoZWlnaHQgPiB0aGlzW3hdLndpZHRoXG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuc3BsaWNlKGhlaWdodCwgdGhpcy5oZWlnaHQgLSBoZWlnaHQpXG4gICAgcmV0dXJuIHRoaXNbMF0uaGVpZ2h0XG5cbiAgY2xvbmU6ICgpIC0+XG4gICAgbmV3SW5zdGFuY2UgPSBuZXcgVGlsZW1hcChAd2lkdGgsIEBoZWlnaHQpXG4gICAgbmV3SW5zdGFuY2VbeF1beV0gPSB2YWx1ZSBmb3IgdmFsdWUsIHkgaW4gcm93IGZvciByb3csIHggaW4gdGhpc1xuICAgIHJldHVybiBuZXdJbnN0YW5jZVxuXG4jIyNcbiAgVGhpcyBjbGFzcyByZXByZXNlbnRzIHRoZSBob2xlIG1hcC4gSXQgaXMgZGVmaW5lZCBieSBhIGhlaWdodCwgYSB3aWR0aCBhbmRcbiAgYSBsaXN0IG9mIHJvb21zLlxuIyMjXG5jbGFzcyBNYXBcblxuICBjb25zdHJ1Y3RvcjogKEB3aWR0aCwgQGhlaWdodCwgQHJvb21MaXN0KSAtPlxuXG4gIGdldFRpbGVtYXA6ICh0aWxlc1BlclVuaXQpIC0+XG4gICAgdGlsZXNQZXJVbml0KysgICMgTGVhdmUgc3BhY2UgZm9yIHdhbGxzXG4gICAgdGlsZW1hcCA9IG5ldyBUaWxlbWFwKFxuICAgICAgKHRoaXMud2lkdGggKiB0aWxlc1BlclVuaXQpICsgMSxcbiAgICAgICh0aGlzLmhlaWdodCAqIHRpbGVzUGVyVW5pdCkgKyAxLFxuICAgICAgVGlsZS5FTVBUWVxuICAgIClcbiAgICBwYWludFJvb20ocm9vbSwgdGlsZW1hcCwgdGlsZXNQZXJVbml0KSBmb3Igcm9vbSwgaSBpbiB0aGlzLnJvb21MaXN0XG4gICAgcmV0dXJuIHRpbGVtYXBcblxuICAjIFByaXZhdGUgaGVscGVyXG4gIHBhaW50Um9vbSA9IChyb29tLCB0aWxlbWFwLCB0aWxlc1BlclVuaXQpIC0+XG4gICAgIyBDb252ZXJ0IGRpbWVuc2lvbnMgYW5kIGNvb3JkaW5hdGVzXG4gICAgb3JpZ2luID0gbmV3IFBvaW50KHJvb20ueCp0aWxlc1BlclVuaXQsIHJvb20ueSp0aWxlc1BlclVuaXQpXG4gICAgd2lkdGggPSByb29tLndpZHRoICogdGlsZXNQZXJVbml0XG4gICAgaGVpZ2h0ID0gcm9vbS5oZWlnaHQgKiB0aWxlc1BlclVuaXRcbiAgICAjIFBhaW50IGZsb29yXG4gICAgaWYgcm9vbS5zcGVjaWFsIGlzICdmaXJzdCByb29tJ1xuICAgICAgdGlsZW1hcC5zZXQob3JpZ2luWzBdICsgMSwgb3JpZ2luWzFdICsgMSwgd2lkdGgsIGhlaWdodCwgVGlsZS5GSVJTVF9ST09NKVxuICAgIGVsc2UgaWYgcm9vbS5zcGVjaWFsIGlzICd0cmVhc3VyZSByb29tJ1xuICAgICAgdGlsZW1hcC5zZXQob3JpZ2luWzBdICsgMSwgb3JpZ2luWzFdICsgMSwgd2lkdGgsIGhlaWdodCwgVGlsZS5UUkVBU1VSRV9ST09NKVxuICAgIGVsc2UgaWYgcm9vbS5zcGVjaWFsIGlzICdzZWNyZXQgcm9vbSdcbiAgICAgIHRpbGVtYXAuc2V0KG9yaWdpblswXSArIDEsIG9yaWdpblsxXSArIDEsIHdpZHRoLCBoZWlnaHQsIFRpbGUuU0VDUkVUX1JPT00pXG4gICAgZWxzZSB0aWxlbWFwLnNldChvcmlnaW5bMF0gKyAxLCBvcmlnaW5bMV0gKyAxLCB3aWR0aCwgaGVpZ2h0LCBUaWxlLkdST1VORClcbiAgICAjIFBhaW50IHdhbGxzXG4gICAgdGlsZW1hcC5zZXQob3JpZ2luWzBdLCBvcmlnaW5bMV0sIHdpZHRoICsgMSwgMSwgVGlsZS5XQUxMKSAgICAgICAgICAjIE5vcnRoXG4gICAgdGlsZW1hcC5zZXQob3JpZ2luWzBdLCBvcmlnaW5bMV0gKyBoZWlnaHQsIHdpZHRoICsgMSwgMSwgVGlsZS5XQUxMKSAjIFNvdXRoXG4gICAgdGlsZW1hcC5zZXQob3JpZ2luWzBdICsgd2lkdGgsIG9yaWdpblsxXSwgMSwgaGVpZ2h0ICsgMSwgVGlsZS5XQUxMKSAjIEVhc3RcbiAgICB0aWxlbWFwLnNldChvcmlnaW5bMF0sIG9yaWdpblsxXSwgMSwgaGVpZ2h0ICsgMSwgVGlsZS5XQUxMKSAgICAgICAgICMgV2VzdFxuICAgICMgUGFpbnQgZG9vcnNcbiAgICBmb3IgbmVpZ2hib3VyLCBkb29yIGluIHJvb20ubmVpZ2hib3VycyB3aGVuIG5laWdoYm91cj9cbiAgICAgIGRvb3JPZmZzZXQgPSAoKGRvb3IgLy8gNCkgKiB0aWxlc1BlclVuaXQpICsgKHRpbGVzUGVyVW5pdCAvLyAyKVxuICAgICAgc3dpdGNoIChkb29yICUgNClcbiAgICAgICAgd2hlbiBEaXJlY3Rpb24uTk9SVEhcbiAgICAgICAgICB0aWxlbWFwW29yaWdpblswXSArIGRvb3JPZmZzZXRdW29yaWdpblsxXV0gPSBUaWxlLkRPT1JcbiAgICAgICAgd2hlbiBEaXJlY3Rpb24uU09VVEhcbiAgICAgICAgICB0aWxlbWFwW29yaWdpblswXSArIGRvb3JPZmZzZXRdW29yaWdpblsxXSArIGhlaWdodF0gPSBUaWxlLkRPT1JcbiAgICAgICAgd2hlbiBEaXJlY3Rpb24uRUFTVFxuICAgICAgICAgIHRpbGVtYXBbb3JpZ2luWzBdICsgd2lkdGhdW29yaWdpblsxXSArIGRvb3JPZmZzZXRdID0gVGlsZS5ET09SXG4gICAgICAgIHdoZW4gRGlyZWN0aW9uLldFU1RcbiAgICAgICAgICB0aWxlbWFwW29yaWdpblswXV1bb3JpZ2luWzFdICsgZG9vck9mZnNldF0gPSBUaWxlLkRPT1JcblxuXG4jIE1ha2UgZWxlbWVudHMgYXZhaWxhYmxlIGdsb2JhbGx5XG53aW5kb3cuVGlsZSA9IFRpbGVcbndpbmRvdy5EaXJlY3Rpb24gPSBEaXJlY3Rpb25cbndpbmRvdy5Qb2ludCA9IFBvaW50XG53aW5kb3cuVGlsZW1hcCA9IFRpbGVtYXBcbndpbmRvdy5NYXAgID0gTWFwXG4iXX0=