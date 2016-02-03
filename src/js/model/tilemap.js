var Point, Tilemap,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

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

window.Point = Point;

window.Tilemap = Tilemap;

//# sourceMappingURL=data:application/json;base64,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QUFMLEdBQWMsTUFBbEMsRUFIRjs7QUFERjtBQUtBLFdBQU8sSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDO0VBTk47O29CQVFYLEtBQUEsR0FBTyxTQUFBO0FBQ0wsUUFBQTtJQUFBLFdBQUEsR0FBa0IsSUFBQSxPQUFBLENBQVEsSUFBQyxDQUFBLEtBQVQsRUFBZ0IsSUFBQyxDQUFBLE1BQWpCO0FBQ2xCLFNBQUEsOENBQUE7O0FBQUEsV0FBQSwrQ0FBQTs7UUFBQSxXQUFZLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFmLEdBQW9CO0FBQXBCO0FBQUE7QUFDQSxXQUFPO0VBSEY7Ozs7R0F2Q2E7O0FBNkN0QixNQUFNLENBQUMsS0FBUCxHQUFlOztBQUNmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6Im1vZGVsL3RpbGVtYXAuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4jICBUaGlzIGZpbGUgY29udGFpbnMgc29tZSBjbGFzc2VzIGFuZCB1dGlsaXRpZXMgdG8gd29yayB3aXRoIHRpbGVtYXBzXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgIEF1dGhvcjogQWRyaWFuIE1vcmVub1xyXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuIyBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSBwb2ludCBlaXRoZXIgYXMgYW4gYXJyYXkgYW5kIGFzIGFuIG9iamVjdCB3aXRoXHJcbiMgZmllbGRzIHgsIHkgYW5kIHogKHdoZW4gYXZhaWxhYmxlKVxyXG5jbGFzcyBQb2ludCBleHRlbmRzIEFycmF5XHJcbiAgY29uc3RydWN0b3I6ICh2YWx1ZXMuLi4pIC0+XHJcbiAgICBAcHVzaCB2YWx1ZSBmb3IgdmFsdWUgaW4gdmFsdWVzXHJcblxyXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAneCcsXHJcbiAgICBnZXQ6ICgpIC0+IEBbMF1cclxuICAgIHNldDogKHZhbHVlKSAtPlxyXG4gICAgICBAcHVzaCBudWxsIHdoaWxlIG5vdCBAbGVuZ3RoID4gMFxyXG4gICAgICBAWzBdID0gdmFsdWVcclxuXHJcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICd5JyxcclxuICAgIGdldDogKCkgLT4gQFsxXVxyXG4gICAgc2V0OiAodmFsdWUpIC0+XHJcbiAgICAgIEBwdXNoIG51bGwgd2hpbGUgbm90IEBsZW5ndGggPiAxXHJcbiAgICAgIEBbMV0gPSB2YWx1ZVxyXG5cclxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ3onLFxyXG4gICAgZ2V0OiAoKSAtPiBAWzJdXHJcbiAgICBzZXQ6ICh2YWx1ZSkgLT5cclxuICAgICAgQHB1c2ggbnVsbCB3aGlsZSBub3QgQGxlbmd0aCA+IDJcclxuICAgICAgQFsyXSA9IHZhbHVlXHJcblxyXG5cclxuIyBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSB0aWxlIG1hcCBhcyBhIDJEIGFycmF5LCBhZGRpbmcgc29tZSB1c2VmdWwgbWV0aG9kc1xyXG5jbGFzcyBUaWxlbWFwIGV4dGVuZHMgQXJyYXlcclxuXHJcbiAgY29uc3RydWN0b3I6ICh3aWR0aCwgaGVpZ2h0LCB2YWx1ZSA9IG51bGwpIC0+XHJcbiAgICB0aGlzLnB1c2godmFsdWUgZm9yIGogaW4gWzAuLi5oZWlnaHRdKSBmb3IgaSBpbiBbMC4uLndpZHRoXVxyXG5cclxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ3dpZHRoJyxcclxuICAgIGdldDogKCkgLT4gIHRoaXMubGVuZ3RoXHJcblxyXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnaGVpZ2h0JyxcclxuICAgIGdldDogKCkgLT4gdGhpc1swXS5sZW5ndGhcclxuXHJcbiAgZ2V0OiAoeCwgeSwgd2lkdGggPSAxLCBoZWlnaHQgPSAxKSAtPlxyXG4gICAgdGhpc1tfeF1bX3ldIGZvciBfeSBpbiBbeS4uLnkgKyBoZWlnaHRdIGZvciBfeCBpbiBbeC4uLnggKyB3aWR0aF1cclxuXHJcbiAgc2V0OiAoeCwgeSwgd2lkdGggPSAxLCBoZWlnaHQgPSAxLCB2YWx1ZSkgLT5cclxuICAgIHRoaXNbX3hdW195XSA9IHZhbHVlIGZvciBfeSBpbiBbeS4uLnkgKyBoZWlnaHRdIGZvciBfeCBpbiBbeC4uLnggKyB3aWR0aF1cclxuXHJcbiAgaXM6ICh4LCB5LCB3aWR0aCA9IDEsIGhlaWdodCA9IDEsIHZhbHVlKSAtPlxyXG4gICAgcmV0dXJuIGZhbHNlIGlmIHggKyB3aWR0aCA+IHRoaXMud2lkdGggb3IgeSArIGhlaWdodCA+IHRoaXMuaGVpZ2h0IG9yIHggPCAwIG9yIHkgPCAwXHJcbiAgICBmb3IgX3ggaW4gW3guLi54ICsgd2lkdGhdXHJcbiAgICAgIGZvciBfeSBpbiBbeS4uLnkgKyBoZWlnaHRdIHdoZW4gdGhpc1tfeF1bX3ldIGlzbnQgdmFsdWVcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHNldFdpZHRoOiAod2lkdGgsIHZhbHVlID0gbnVsbCkgLT5cclxuICAgIGlmIHdpZHRoID4gdGhpcy53aWR0aFxyXG4gICAgICB0aGlzLnB1c2godmFsdWUgZm9yIGkgaW4gWzAuLi50aGlzLmhlaWdodF0pIHdoaWxlIHdpZHRoID4gdGhpcy53aWR0aFxyXG4gICAgZWxzZVxyXG4gICAgICB0aGlzLnNwbGljZSh3aWR0aCwgdGhpcy53aWR0aCAtIHdpZHRoKVxyXG4gICAgcmV0dXJuIHRoaXMud2lkdGhcclxuXHJcbiAgc2V0SGVpZ2h0OiAoaGVpZ2h0LCB2YWx1ZSA9IG51bGwpIC0+XHJcbiAgICBmb3IgeCBpbiBbMC4uLnRoaXMud2lkdGhdXHJcbiAgICAgIGlmIGhlaWdodCA+IHRoaXMuaGVpZ2h0XHJcbiAgICAgICAgdGhpc1t4XS5wdXNoIHZhbHVlIHdoaWxlIGhlaWdodCA+IHRoaXNbeF0ud2lkdGhcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHRoaXMuc3BsaWNlKGhlaWdodCwgdGhpcy5oZWlnaHQgLSBoZWlnaHQpXHJcbiAgICByZXR1cm4gdGhpc1swXS5oZWlnaHRcclxuXHJcbiAgY2xvbmU6ICgpIC0+XHJcbiAgICBuZXdJbnN0YW5jZSA9IG5ldyBUaWxlbWFwKEB3aWR0aCwgQGhlaWdodClcclxuICAgIG5ld0luc3RhbmNlW3hdW3ldID0gdmFsdWUgZm9yIHZhbHVlLCB5IGluIHJvdyBmb3Igcm93LCB4IGluIHRoaXNcclxuICAgIHJldHVybiBuZXdJbnN0YW5jZVxyXG5cclxuIyBNYWtlIGNsYXNzZXMgYXZhaWxhYmxlIGdsb2JhbGx5XHJcbndpbmRvdy5Qb2ludCA9IFBvaW50XHJcbndpbmRvdy5UaWxlbWFwID0gVGlsZW1hcFxyXG4iXX0=