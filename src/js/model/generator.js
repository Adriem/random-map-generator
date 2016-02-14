
/* Default values for the generator */
var Defaults, Generator, Room, State, callCallback, generate,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Defaults = {
  MAP_SIZE: 10,
  NUMBER_OF_ROOMS: 15,
  TILES_PER_UNIT: 3,
  INITIAL_ROOM_WIDTH: 1,
  INITIAL_ROOM_HEIGHT: 1,
  MIN_ROOM_SIZE: 1,
  MAX_ROOM_SIZE: 2,
  MIN_ROOM_AREA: 1,
  MAX_ROOM_AREA: 6,
  RATIO_RESTRICTION: 0.5
};


/*
  This class represents a room that will be part of the map. It is defined by
  two coordinates in the space, a width and a height. It can also have some
  attributes and some references to its neighbours.
 */

Room = (function() {
  function Room(x1, y1, width1, height1, id, attrs, neighbours) {
    this.x = x1;
    this.y = y1;
    this.width = width1;
    this.height = height1;
    this.id = id;
    this.attrs = attrs != null ? attrs : {};
    this.neighbours = neighbours != null ? neighbours : [];
  }

  Room.prototype.getExits = function() {
    var i;
    return [].concat((function() {
      var j, ref, results;
      results = [];
      for (i = j = 0, ref = this.width; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(Direction.NORTH + (i * 4));
      }
      return results;
    }).call(this), (function() {
      var j, ref, results;
      results = [];
      for (i = j = 0, ref = this.width; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(Direction.SOUTH + (i * 4));
      }
      return results;
    }).call(this), (function() {
      var j, ref, results;
      results = [];
      for (i = j = 0, ref = this.height; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(Direction.EAST + (i * 4));
      }
      return results;
    }).call(this), (function() {
      var j, ref, results;
      results = [];
      for (i = j = 0, ref = this.height; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(Direction.WEST + (i * 4));
      }
      return results;
    }).call(this));
  };

  Room.prototype.getAvailableExits = function() {
    var door, j, len, ref, results;
    ref = this.getExits();
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      door = ref[j];
      if (this.neighbours[door] == null) {
        results.push(door);
      }
    }
    return results;
  };

  Room.prototype.getArea = function() {
    return this.width * this.height;
  };

  Room.prototype.collidesWith = function(room) {
    return !(this.x > room.x + room.width || room.x > this.x + this.width) && !(this.y > room.y + room.height || room.y > this.y + this.height);
  };

  Room.prototype.clone = function() {
    var attrsClone, key, neighbour, neighboursClone, ref, value;
    attrsClone = {};
    ref = this.attrs;
    for (key in ref) {
      value = ref[key];
      attrsClone[key] = value;
    }
    neighboursClone = (function() {
      var j, len, ref1, results;
      ref1 = this.neighbours;
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        neighbour = ref1[j];
        results.push(neighbour);
      }
      return results;
    }).call(this);
    return new Room(this.x, this.y, this.width, this.height, this.id, attrsClone, neighboursClone);
  };

  return Room;

})();


/*
  This class represents the state of the generator on a given moment. It
  contains a list with the rooms that have been generated, a list with the
  rooms that are waiting to be expanded and a tile map that represents the
  current distribution of the rooms
 */

State = (function() {
  function State(rooms, frontier, width, height) {
    this.rooms = rooms != null ? rooms : [];
    this.frontier = frontier != null ? frontier : [];
    if ((width != null) && (height != null)) {
      this.collisionMap = new Tilemap(width, height, false);
    }
  }

  State.prototype.getSteps = function() {
    return this.rooms.length - 1;
  };

  State.prototype.addRoom = function(room) {
    this.rooms.push(room);
    this.frontier.push(room);
    if (this.collisionMap != null) {
      return this.collisionMap.set(room.x, room.y, room.width, room.height, true);
    }
  };

  State.prototype.hasRoomFor = function(room) {
    var j, len, otherRoom, ref;
    if (this.collisionMap != null) {
      return this.collisionMap.is(room.x, room.y, room.width, room.height, false);
    } else {
      ref = this.rooms;
      for (j = 0, len = ref.length; j < len; j++) {
        otherRoom = ref[j];
        if (otherRoom.collidesWith(room)) {
          return false;
        }
      }
      return true;
    }
  };

  State.prototype.clone = function() {
    var newInstance, room;
    newInstance = new State((function() {
      var j, len, ref, results;
      ref = this.rooms;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        room = ref[j];
        results.push(room.clone());
      }
      return results;
    }).call(this), (function() {
      var j, len, ref, results;
      ref = this.frontier;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        room = ref[j];
        results.push(room.clone());
      }
      return results;
    }).call(this));
    if (this.collisionMap != null) {
      newInstance.collisionMap = this.collisionMap.clone();
    }
    return newInstance;
  };

  return State;

})();


/*
  This class will provide functions to generate content randomly based on
  the given properties.
 */

Generator = (function() {
  var getOppositeDirection, getSpawnChance;

  function Generator(numberOfRooms, properties) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
    this.remainingRooms = numberOfRooms;
    this.minRoomSize = (ref = properties.minRoomSize) != null ? ref : Defaults.MIN_ROOM_SIZE;
    this.maxRoomSize = (ref1 = properties.maxRoomSize) != null ? ref1 : Defaults.MAX_ROOM_SIZE;
    this.minRoomArea = (ref2 = properties.minRoomArea) != null ? ref2 : Math.pow(this.minRoomSize, 2);
    this.maxRoomArea = (ref3 = properties.maxRoomArea) != null ? ref3 : Math.pow(this.maxRoomSize, 2);
    this.ratioRestr = (ref4 = properties.ratioRestriction) != null ? ref4 : 0;
    this.mapWidth = (ref5 = properties.width) != null ? ref5 : this.maxRoomSize * numberOfRooms;
    this.mapHeight = (ref6 = properties.height) != null ? ref6 : this.maxRoomSize * numberOfRooms;
    this.initialRoomWidth = (ref7 = properties.initialRoomWidth) != null ? ref7 : Defaults.INITIAL_ROOM_WIDTH;
    this.initialRoomHeight = (ref8 = properties.initialRoomHeight) != null ? ref8 : Defaults.INITIAL_ROOM_HEIGHT;
  }

  Generator.prototype.generateInitialRoom = function() {
    var x, y;
    x = random.value(this.mapWidth * 0.30, this.mapWidth * 0.70);
    y = random.value(this.mapHeight * 0.30, this.mapHeight * 0.70);
    return new Room(x, y, this.initialRoomWidth, this.initialRoomHeight, 0);
  };

  Generator.prototype.generateInitialState = function() {
    return new State([], [], this.mapWidth, this.mapHeight);
  };

  Generator.prototype.generateNeighbour = function(room, door, state) {
    var availableAreas, candidates, candidatesGrouped, j, len, ref, selectedGroup;
    candidates = this.generatePossibleNeighbours(room, door, state);
    if (candidates.length > 0 && random.test(getSpawnChance(state))) {
      availableAreas = [];
      candidatesGrouped = [];
      for (j = 0, len = candidates.length; j < len; j++) {
        room = candidates[j];
        if (ref = room.getArea(), indexOf.call(availableAreas, ref) < 0) {
          availableAreas.push(room.getArea());
          candidatesGrouped[availableAreas.indexOf(room.getArea())] = [];
        }
        candidatesGrouped[availableAreas.indexOf(room.getArea())].push(room);
      }
      selectedGroup = candidatesGrouped[random.value(0, candidatesGrouped.length)];
      return selectedGroup[random.value(0, selectedGroup.length)];
    }
  };

  Generator.prototype.generatePossibleNeighbours = function(room, door, state) {
    var candidate, candidates, doorOnNeighbour, height, j, k, l, offset, offsetMax, ref, ref1, ref2, ref3, ref4, ref5, width, x, y;
    candidates = [];
    for (height = j = ref = this.minRoomSize, ref1 = this.maxRoomSize; ref <= ref1 ? j <= ref1 : j >= ref1; height = ref <= ref1 ? ++j : --j) {
      for (width = k = ref2 = this.minRoomSize, ref3 = this.maxRoomSize; ref2 <= ref3 ? k <= ref3 : k >= ref3; width = ref2 <= ref3 ? ++k : --k) {
        if (!(this.validMeasures(width, height))) {
          continue;
        }
        offsetMax = door % 2 === 0 ? width : height;
        for (offset = l = ref4 = 1 - offsetMax; ref4 <= 0 ? l <= 0 : l >= 0; offset = ref4 <= 0 ? ++l : --l) {
          ref5 = (function() {
            switch (door % 4) {
              case Direction.NORTH:
                return [room.x + Math.floor(door / 4) + offset, room.y - height];
              case Direction.SOUTH:
                return [room.x + Math.floor(door / 4) + offset, room.y + room.height];
              case Direction.EAST:
                return [room.x + room.width, room.y + Math.floor(door / 4) + offset];
              case Direction.WEST:
                return [room.x - width, room.y + Math.floor(door / 4) + offset];
            }
          })(), x = ref5[0], y = ref5[1];
          candidate = new Room(x, y, width, height, state.getSteps() + 1);
          doorOnNeighbour = 4 * offset * (-1) + getOppositeDirection(door);
          candidate.neighbours[doorOnNeighbour] = room.id;
          if (state.hasRoomFor(candidate)) {
            candidates.push(candidate);
          }
        }
      }
    }
    return candidates;
  };

  Generator.prototype.validMeasures = function(width, height) {
    return height * width <= this.maxRoomArea && height * width >= this.minRoomArea && width / height >= this.ratioRestr && height / width >= this.ratioRestr;
  };

  getOppositeDirection = function(door) {
    return ((door % 4) + 2) % 4;
  };

  getSpawnChance = function(state) {
    if (state.frontier.length === 0) {
      return 100;
    } else {
      return 75;
    }
  };

  return Generator;

})();


/*
  This is the function that will generate the map. It takes a width, a height,
  the number of rooms to generate, the properties of the generator and a
  callback to be executed on each step.
 */

generate = function(numberOfRooms, properties, onStepCallback) {
  var door, generator, initialRoom, j, len, newRoom, ref, remainingRooms, room, state;
  generator = new Generator(numberOfRooms, properties);
  initialRoom = generator.generateInitialRoom();
  state = generator.generateInitialState();
  state.addRoom(initialRoom);
  remainingRooms = numberOfRooms - 1;
  callCallback(generator, state, onStepCallback);
  while (remainingRooms > 0 && state.frontier.length > 0) {
    room = state.frontier.shift();
    ref = random.shuffle(room.getAvailableExits());
    for (j = 0, len = ref.length; j < len; j++) {
      door = ref[j];
      if (!(remainingRooms > 0)) {
        continue;
      }
      state = state.clone();
      room = state.rooms[room.id];
      newRoom = generator.generateNeighbour(room, door, state);
      if (newRoom != null) {
        room.neighbours[door] = newRoom.id;
        state.addRoom(newRoom);
        remainingRooms--;
        callCallback(generator, state, onStepCallback);
      }
    }
  }
  return new Map(generator.mapWidth, generator.mapHeight, state.clone().rooms);
};

callCallback = function(generator, state, callback) {
  if (callback != null) {
    return callback(new Map(generator.mapWidth, generator.mapHeight, state.clone().rooms), state.getSteps());
  }
};


/* EXPORT FUNCTIONS */

window.generate = generate;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZGVsL2dlbmVyYXRvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQW9CQTtBQUFBLElBQUEsd0RBQUE7RUFBQTs7QUFDQSxRQUFBLEdBQ0U7RUFBQSxRQUFBLEVBQVUsRUFBVjtFQUNBLGVBQUEsRUFBaUIsRUFEakI7RUFFQSxjQUFBLEVBQWdCLENBRmhCO0VBR0Esa0JBQUEsRUFBb0IsQ0FIcEI7RUFJQSxtQkFBQSxFQUFxQixDQUpyQjtFQUtBLGFBQUEsRUFBZSxDQUxmO0VBTUEsYUFBQSxFQUFlLENBTmY7RUFPQSxhQUFBLEVBQWUsQ0FQZjtFQVFBLGFBQUEsRUFBZSxDQVJmO0VBU0EsaUJBQUEsRUFBbUIsR0FUbkI7Ozs7QUFhRjs7Ozs7O0FBTU07RUFDUyxjQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsTUFBVCxFQUFpQixPQUFqQixFQUEwQixFQUExQixFQUErQixLQUEvQixFQUE0QyxVQUE1QztJQUFDLElBQUMsQ0FBQSxJQUFEO0lBQUksSUFBQyxDQUFBLElBQUQ7SUFBSSxJQUFDLENBQUEsUUFBRDtJQUFRLElBQUMsQ0FBQSxTQUFEO0lBQVMsSUFBQyxDQUFBLEtBQUQ7SUFBSyxJQUFDLENBQUEsd0JBQUQsUUFBUztJQUFJLElBQUMsQ0FBQSxrQ0FBRCxhQUFjO0VBQTFEOztpQkFHYixRQUFBLEdBQVUsU0FBQTtBQUFNLFFBQUE7V0FBQSxFQUFFLENBQUMsTUFBSDs7QUFDZDtXQUFpQyxtRkFBakM7cUJBQUEsU0FBUyxDQUFDLEtBQVYsR0FBa0IsQ0FBQyxDQUFBLEdBQUUsQ0FBSDtBQUFsQjs7aUJBRGM7O0FBRWQ7V0FBaUMsbUZBQWpDO3FCQUFBLFNBQVMsQ0FBQyxLQUFWLEdBQWtCLENBQUMsQ0FBQSxHQUFFLENBQUg7QUFBbEI7O2lCQUZjOztBQUdkO1dBQWdDLG9GQUFoQztxQkFBQSxTQUFTLENBQUMsSUFBVixHQUFpQixDQUFDLENBQUEsR0FBRSxDQUFIO0FBQWpCOztpQkFIYzs7QUFJZDtXQUFnQyxvRkFBaEM7cUJB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Y2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgIFRoaXMgZmlsZSBjb250YWlucyB0aGUgZnVuY3Rpb25zIHRvIHJhbmRvbWx5IGdlbmVyYXRlIHRoZSBtYXAuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBUaGlzIGFsZ29yeXRobSBnZW5lcmF0ZXMgYSByb29tIG9uIGEgcmFuZG9tIHBvc2l0aW9uIGFuZCBzdGFydHMgZ2VuZXJhdGluZ1xuIyB0aGUgbmVpZ2hib3VycyBmcm9tIHRoZXJlLiBTb21lIGV4YW1wbGVzIG9mIGdlbmVyYXRlZCByb29tcyBjYW4gYmU6XG4jXG4jICAgKy0tLSAwIC0tLSsgICArLS0tIDAgLS0tKy0tLSA0IC0tLSsgICArLS0tIDAgLS0tKyAgICstLS0gMCAtLS0rLS0tIDQgLS0tK1xuIyAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8ICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgIHxcbiMgICAzICAgICAgICAgMSAgIDMgICAgICAgICAgICAgICAgICAgMSAgIDMgICAgICAgICAxICAgMyAgICAgICAgICAgICAgICAgICAxXG4jICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgIHwgICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgfFxuIyAgICstLS0gMiAtLS0rICAgKy0tLSAyIC0tLSstLS0gNiAtLS0rICAgKyAgICAgICAgICsgICArICAgICAgICAgKyAgICAgICAgICtcbiMgICAgICgxIHggMSkgICAgICAgICAgICAoMiB4IDEpICAgICAgICAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8XG4jICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA3ICAgICAgICAgNSAgIDcgICAgICAgICAgICAgICAgICAgNVxuIyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgIHxcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICstLS0gMiAtLS0rICAgKy0tLSAyIC0tLSstLS0gNiAtLS0rXG4jICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgxIHggMikgICAgICAgICAgICAoMiB4IDIpXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgQXV0aG9yOiBBZHJpYW4gTW9yZW5vXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4jIyMgRGVmYXVsdCB2YWx1ZXMgZm9yIHRoZSBnZW5lcmF0b3IgIyMjXG5EZWZhdWx0cyA9XG4gIE1BUF9TSVpFOiAxMFxuICBOVU1CRVJfT0ZfUk9PTVM6IDE1XG4gIFRJTEVTX1BFUl9VTklUOiAzXG4gIElOSVRJQUxfUk9PTV9XSURUSDogMVxuICBJTklUSUFMX1JPT01fSEVJR0hUOiAxXG4gIE1JTl9ST09NX1NJWkU6IDFcbiAgTUFYX1JPT01fU0laRTogMlxuICBNSU5fUk9PTV9BUkVBOiAxXG4gIE1BWF9ST09NX0FSRUE6IDZcbiAgUkFUSU9fUkVTVFJJQ1RJT046IDAuNVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4jIyNcbiAgVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgcm9vbSB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgbWFwLiBJdCBpcyBkZWZpbmVkIGJ5XG4gIHR3byBjb29yZGluYXRlcyBpbiB0aGUgc3BhY2UsIGEgd2lkdGggYW5kIGEgaGVpZ2h0LiBJdCBjYW4gYWxzbyBoYXZlIHNvbWVcbiAgYXR0cmlidXRlcyBhbmQgc29tZSByZWZlcmVuY2VzIHRvIGl0cyBuZWlnaGJvdXJzLlxuIyMjXG5cbmNsYXNzIFJvb21cbiAgY29uc3RydWN0b3I6IChAeCwgQHksIEB3aWR0aCwgQGhlaWdodCwgQGlkLCBAYXR0cnMgPSB7fSwgQG5laWdoYm91cnMgPSBbXSkgLT5cblxuICAjIFJldHVybiBhbiBhcnJheSB3aXRoIHRoZSBpbmRleGVzIG9mIGFsbCB0aGUgZXhpdHMgb2YgdGhlIHJvb21cbiAgZ2V0RXhpdHM6ICgpIC0+IFtdLmNvbmNhdChcbiAgICBEaXJlY3Rpb24uTk9SVEggKyAoaSo0KSBmb3IgaSBpbiBbMC4uLkB3aWR0aF0sXG4gICAgRGlyZWN0aW9uLlNPVVRIICsgKGkqNCkgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdLFxuICAgIERpcmVjdGlvbi5FQVNUICsgKGkqNCkgZm9yIGkgaW4gWzAuLi5AaGVpZ2h0XSxcbiAgICBEaXJlY3Rpb24uV0VTVCArIChpKjQpIGZvciBpIGluIFswLi4uQGhlaWdodF1cbiAgKVxuXG4gICMgUmV0dXJuIGFuIGFycmF5IHdpdGggdGhlIGluZGV4ZXMgb2YgdW51c2VkIGV4aXRzIG9mIHRoZSByb29tXG4gIGdldEF2YWlsYWJsZUV4aXRzOiAoKSAtPiBkb29yIGZvciBkb29yIGluIEBnZXRFeGl0cygpIHdoZW4gbm90IEBuZWlnaGJvdXJzW2Rvb3JdP1xuXG4gICMgUmV0dXJucyB0aGUgYXJlYSBvZiB0aGUgcm9vbVxuICBnZXRBcmVhOiAtPiBAd2lkdGggKiBAaGVpZ2h0XG5cbiAgIyBSZXR1cm4gdHJ1ZSBpZiBnaXZlbiByb29tIGNvbGxpZGVzIHdpdGggdGhpcyByb29tXG4gIGNvbGxpZGVzV2l0aDogKHJvb20pIC0+XG4gICAgbm90IChAeCA+IHJvb20ueCArIHJvb20ud2lkdGggb3Igcm9vbS54ID4gQHggKyBAd2lkdGgpIGFuZFxuICAgIG5vdCAoQHkgPiByb29tLnkgKyByb29tLmhlaWdodCBvciByb29tLnkgPiBAeSArIEBoZWlnaHQpXG5cbiAgIyBHZW5lcmF0ZSBhIGRlZXAgY29weSBvZiB0aGlzIHJvb21cbiAgY2xvbmU6IC0+XG4gICAgYXR0cnNDbG9uZSA9IHt9XG4gICAgYXR0cnNDbG9uZVtrZXldID0gdmFsdWUgZm9yIGtleSwgdmFsdWUgb2YgQGF0dHJzXG4gICAgbmVpZ2hib3Vyc0Nsb25lID0gKG5laWdoYm91ciBmb3IgbmVpZ2hib3VyIGluIEBuZWlnaGJvdXJzKVxuICAgIG5ldyBSb29tKEB4LCBAeSwgQHdpZHRoLCBAaGVpZ2h0LCBAaWQsIGF0dHJzQ2xvbmUsIG5laWdoYm91cnNDbG9uZSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuIyMjXG4gIFRoaXMgY2xhc3MgcmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgdGhlIGdlbmVyYXRvciBvbiBhIGdpdmVuIG1vbWVudC4gSXRcbiAgY29udGFpbnMgYSBsaXN0IHdpdGggdGhlIHJvb21zIHRoYXQgaGF2ZSBiZWVuIGdlbmVyYXRlZCwgYSBsaXN0IHdpdGggdGhlXG4gIHJvb21zIHRoYXQgYXJlIHdhaXRpbmcgdG8gYmUgZXhwYW5kZWQgYW5kIGEgdGlsZSBtYXAgdGhhdCByZXByZXNlbnRzIHRoZVxuICBjdXJyZW50IGRpc3RyaWJ1dGlvbiBvZiB0aGUgcm9vbXNcbiMjI1xuXG5jbGFzcyBTdGF0ZVxuXG4gIGNvbnN0cnVjdG9yOiAoQHJvb21zID0gW10sIEBmcm9udGllciA9IFtdLCB3aWR0aCwgaGVpZ2h0KSAtPlxuICAgIGlmIHdpZHRoPyBhbmQgaGVpZ2h0PyB0aGVuIEBjb2xsaXNpb25NYXAgPSBuZXcgVGlsZW1hcCh3aWR0aCwgaGVpZ2h0LCBmYWxzZSlcblxuICAjIFJldHVybiB0aGUgbnVtYmVyIG9mIHN0ZXBzIGdpdmVuIHVudGlsIHRoaXMgc3RhdGVcbiAgZ2V0U3RlcHM6IC0+IEByb29tcy5sZW5ndGggLSAxXG5cbiAgIyBBZGQgYSBuZXcgcm9vbSB0byB0aGlzIHN0YXRlXG4gIGFkZFJvb206IChyb29tKSAtPlxuICAgIEByb29tcy5wdXNoKHJvb20pXG4gICAgQGZyb250aWVyLnB1c2gocm9vbSlcbiAgICBAY29sbGlzaW9uTWFwLnNldChyb29tLngsIHJvb20ueSwgcm9vbS53aWR0aCwgcm9vbS5oZWlnaHQsIHRydWUpIGlmIEBjb2xsaXNpb25NYXA/XG5cbiAgIyBDaGVja3MgaWYgYSByb29tIGNhbiBiZSBhZGRlZCB3aXRob3V0IGNvbGxpZGluZyB3aXRoIGV4aXN0aW5nIHJvb21zXG4gIGhhc1Jvb21Gb3I6IChyb29tKSAtPlxuICAgIGlmIEBjb2xsaXNpb25NYXA/XG4gICAgICByZXR1cm4gQGNvbGxpc2lvbk1hcC5pcyhyb29tLngsIHJvb20ueSwgcm9vbS53aWR0aCwgcm9vbS5oZWlnaHQsIGZhbHNlKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZSBmb3Igb3RoZXJSb29tIGluIEByb29tcyB3aGVuIG90aGVyUm9vbS5jb2xsaWRlc1dpdGgocm9vbSlcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgIyBHZW5lcmF0ZSBhIGRlZXAgY2xvbmUgb2YgdGhpcyBzdGF0ZVxuICBjbG9uZTogLT5cbiAgICBuZXdJbnN0YW5jZSA9IG5ldyBTdGF0ZShcbiAgICAgIHJvb20uY2xvbmUoKSBmb3Igcm9vbSBpbiBAcm9vbXMsXG4gICAgICByb29tLmNsb25lKCkgZm9yIHJvb20gaW4gQGZyb250aWVyXG4gICAgKVxuICAgIG5ld0luc3RhbmNlLmNvbGxpc2lvbk1hcCA9IEBjb2xsaXNpb25NYXAuY2xvbmUoKSBpZiBAY29sbGlzaW9uTWFwP1xuICAgIHJldHVybiBuZXdJbnN0YW5jZVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4jIyNcbiAgVGhpcyBjbGFzcyB3aWxsIHByb3ZpZGUgZnVuY3Rpb25zIHRvIGdlbmVyYXRlIGNvbnRlbnQgcmFuZG9tbHkgYmFzZWQgb25cbiAgdGhlIGdpdmVuIHByb3BlcnRpZXMuXG4jIyNcblxuY2xhc3MgR2VuZXJhdG9yXG5cbiAgY29uc3RydWN0b3I6IChudW1iZXJPZlJvb21zLCBwcm9wZXJ0aWVzKSAtPlxuICAgIEByZW1haW5pbmdSb29tcyA9IG51bWJlck9mUm9vbXNcbiAgICBAbWluUm9vbVNpemUgPSBwcm9wZXJ0aWVzLm1pblJvb21TaXplID8gRGVmYXVsdHMuTUlOX1JPT01fU0laRVxuICAgIEBtYXhSb29tU2l6ZSA9IHByb3BlcnRpZXMubWF4Um9vbVNpemUgPyBEZWZhdWx0cy5NQVhfUk9PTV9TSVpFXG4gICAgQG1pblJvb21BcmVhID0gcHJvcGVydGllcy5taW5Sb29tQXJlYSA/IEBtaW5Sb29tU2l6ZSAqKiAyXG4gICAgQG1heFJvb21BcmVhID0gcHJvcGVydGllcy5tYXhSb29tQXJlYSA/IEBtYXhSb29tU2l6ZSAqKiAyXG4gICAgQHJhdGlvUmVzdHIgID0gcHJvcGVydGllcy5yYXRpb1Jlc3RyaWN0aW9uID8gMFxuICAgIEBtYXBXaWR0aCA9IHByb3BlcnRpZXMud2lkdGggPyBAbWF4Um9vbVNpemUgKiBudW1iZXJPZlJvb21zXG4gICAgQG1hcEhlaWdodCA9IHByb3BlcnRpZXMuaGVpZ2h0ID8gQG1heFJvb21TaXplICogbnVtYmVyT2ZSb29tc1xuICAgIEBpbml0aWFsUm9vbVdpZHRoID0gcHJvcGVydGllcy5pbml0aWFsUm9vbVdpZHRoID8gRGVmYXVsdHMuSU5JVElBTF9ST09NX1dJRFRIXG4gICAgQGluaXRpYWxSb29tSGVpZ2h0ID0gcHJvcGVydGllcy5pbml0aWFsUm9vbUhlaWdodCA/IERlZmF1bHRzLklOSVRJQUxfUk9PTV9IRUlHSFRcblxuICBnZW5lcmF0ZUluaXRpYWxSb29tOiAtPlxuICAgIHggPSByYW5kb20udmFsdWUoQG1hcFdpZHRoICogMC4zMCwgQG1hcFdpZHRoICogMC43MClcbiAgICB5ID0gcmFuZG9tLnZhbHVlKEBtYXBIZWlnaHQgKiAwLjMwLCBAbWFwSGVpZ2h0ICogMC43MClcbiAgICBuZXcgUm9vbSh4LCB5LCBAaW5pdGlhbFJvb21XaWR0aCwgQGluaXRpYWxSb29tSGVpZ2h0LCAwKVxuXG4gIGdlbmVyYXRlSW5pdGlhbFN0YXRlOiAtPlxuICAgIG5ldyBTdGF0ZShbXSwgW10sIEBtYXBXaWR0aCwgQG1hcEhlaWdodClcblxuICBnZW5lcmF0ZU5laWdoYm91cjogKHJvb20sIGRvb3IsIHN0YXRlKSAtPlxuICAgIGNhbmRpZGF0ZXMgPSBAZ2VuZXJhdGVQb3NzaWJsZU5laWdoYm91cnMocm9vbSwgZG9vciwgc3RhdGUpXG4gICAgaWYgY2FuZGlkYXRlcy5sZW5ndGggPiAwIGFuZCByYW5kb20udGVzdChnZXRTcGF3bkNoYW5jZShzdGF0ZSkpXG4gICAgICAjIEdyb3VwIGNhbmRpZGF0ZXMgYnkgYXJlYVxuICAgICAgYXZhaWxhYmxlQXJlYXMgPSBbXVxuICAgICAgY2FuZGlkYXRlc0dyb3VwZWQgPSBbXVxuICAgICAgZm9yIHJvb20gaW4gY2FuZGlkYXRlc1xuICAgICAgICB1bmxlc3Mgcm9vbS5nZXRBcmVhKCkgaW4gYXZhaWxhYmxlQXJlYXNcbiAgICAgICAgICBhdmFpbGFibGVBcmVhcy5wdXNoKHJvb20uZ2V0QXJlYSgpKVxuICAgICAgICAgIGNhbmRpZGF0ZXNHcm91cGVkW2F2YWlsYWJsZUFyZWFzLmluZGV4T2Yocm9vbS5nZXRBcmVhKCkpXSA9IFtdXG4gICAgICAgIGNhbmRpZGF0ZXNHcm91cGVkW2F2YWlsYWJsZUFyZWFzLmluZGV4T2Yocm9vbS5nZXRBcmVhKCkpXS5wdXNoKHJvb20pXG4gICAgICAjIFJhbmRvbWx5IHNlbGVjdCBjYW5kaWRhdGVcbiAgICAgIHNlbGVjdGVkR3JvdXAgPSBjYW5kaWRhdGVzR3JvdXBlZFtyYW5kb20udmFsdWUoMCwgY2FuZGlkYXRlc0dyb3VwZWQubGVuZ3RoKV1cbiAgICAgIHNlbGVjdGVkR3JvdXBbcmFuZG9tLnZhbHVlKDAsIHNlbGVjdGVkR3JvdXAubGVuZ3RoKV1cblxuICBnZW5lcmF0ZVBvc3NpYmxlTmVpZ2hib3VyczogKHJvb20sIGRvb3IsIHN0YXRlKSAtPlxuICAgIGNhbmRpZGF0ZXMgPSBbXVxuICAgICMgR2VuZXJhdGUgcm9vbXMgZm9yIGFsbCB0aGUgcG9zc2libGUgc2l6ZXNcbiAgICBmb3IgaGVpZ2h0IGluIFtAbWluUm9vbVNpemUuLkBtYXhSb29tU2l6ZV1cbiAgICAgIGZvciB3aWR0aCBpbiBbQG1pblJvb21TaXplLi5AbWF4Um9vbVNpemVdIHdoZW4gQHZhbGlkTWVhc3VyZXMod2lkdGgsIGhlaWdodClcbiAgICAgICAgIyBJdGVyYXRlIGFsbCBvdmVyIHRoZSBwb3NzaWJsZSBwb3NpdGlvbnMgdGhlIHJvb20gY291bGQgYmVcbiAgICAgICAgb2Zmc2V0TWF4ID0gaWYgZG9vciAlIDIgaXMgMCB0aGVuIHdpZHRoIGVsc2UgaGVpZ2h0XG4gICAgICAgIGZvciBvZmZzZXQgaW4gWzEgLSBvZmZzZXRNYXguLjBdXG4gICAgICAgICAgIyBDYWxjdWxhdGUgY2FuZGlkYXRlJ3MgY29vcmRpbmF0ZXNcbiAgICAgICAgICBbeCwgeV0gPSBzd2l0Y2ggZG9vciAlIDRcbiAgICAgICAgICAgIHdoZW4gRGlyZWN0aW9uLk5PUlRIXG4gICAgICAgICAgICAgIFtyb29tLnggKyBkb29yIC8vIDQgKyBvZmZzZXQsIHJvb20ueSAtIGhlaWdodF1cbiAgICAgICAgICAgIHdoZW4gRGlyZWN0aW9uLlNPVVRIXG4gICAgICAgICAgICAgIFtyb29tLnggKyBkb29yIC8vIDQgKyBvZmZzZXQsIHJvb20ueSArIHJvb20uaGVpZ2h0XVxuICAgICAgICAgICAgd2hlbiBEaXJlY3Rpb24uRUFTVFxuICAgICAgICAgICAgICBbcm9vbS54ICsgcm9vbS53aWR0aCwgcm9vbS55ICsgZG9vciAvLyA0ICsgb2Zmc2V0XVxuICAgICAgICAgICAgd2hlbiBEaXJlY3Rpb24uV0VTVFxuICAgICAgICAgICAgICBbcm9vbS54IC0gd2lkdGgsIHJvb20ueSArIGRvb3IgLy8gNCArIG9mZnNldF1cbiAgICAgICAgICAjIEdlbmVyYXRlIHRoZSBjYW5kaWRhdGVcbiAgICAgICAgICBjYW5kaWRhdGUgPSBuZXcgUm9vbSh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBzdGF0ZS5nZXRTdGVwcygpICsgMSlcbiAgICAgICAgICAjIEFkZCByb29tIHRvIGNhbmRpZGF0ZSdzIG5laWdoYm91cnNcbiAgICAgICAgICBkb29yT25OZWlnaGJvdXIgPSA0ICogb2Zmc2V0ICogKC0xKSArIGdldE9wcG9zaXRlRGlyZWN0aW9uKGRvb3IpXG4gICAgICAgICAgY2FuZGlkYXRlLm5laWdoYm91cnNbZG9vck9uTmVpZ2hib3VyXSA9IHJvb20uaWRcbiAgICAgICAgICAjIEFkZCB0aGUgZG9vciB0byB0aGUgY2FuZGlkYXRlcyBpZiBpdCBkb2Vzbid0IGNvbGxpZGUgd2l0aCBhbnl0aGluZ1xuICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaChjYW5kaWRhdGUpIGlmIHN0YXRlLmhhc1Jvb21Gb3IoY2FuZGlkYXRlKVxuICAgIHJldHVybiBjYW5kaWRhdGVzXG5cbiAgdmFsaWRNZWFzdXJlczogKHdpZHRoLCBoZWlnaHQpIC0+IGhlaWdodCAqIHdpZHRoIDw9IEBtYXhSb29tQXJlYSBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCAqIHdpZHRoID49IEBtaW5Sb29tQXJlYSBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoIC8gaGVpZ2h0ID49IEByYXRpb1Jlc3RyIGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IC8gd2lkdGggPj0gQHJhdGlvUmVzdHJcblxuICAjIFBSSVZBVEUgSEVMUEVSU1xuICBnZXRPcHBvc2l0ZURpcmVjdGlvbiA9IChkb29yKSAtPiAoKGRvb3IgJSA0KSArIDIpICUgNFxuICBnZXRTcGF3bkNoYW5jZSA9IChzdGF0ZSkgLT5cbiAgICBpZiBzdGF0ZS5mcm9udGllci5sZW5ndGggaXMgMCB0aGVuIDEwMCBlbHNlIDc1XG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiMjI1xuICBUaGlzIGlzIHRoZSBmdW5jdGlvbiB0aGF0IHdpbGwgZ2VuZXJhdGUgdGhlIG1hcC4gSXQgdGFrZXMgYSB3aWR0aCwgYSBoZWlnaHQsXG4gIHRoZSBudW1iZXIgb2Ygcm9vbXMgdG8gZ2VuZXJhdGUsIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnZW5lcmF0b3IgYW5kIGFcbiAgY2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgb24gZWFjaCBzdGVwLlxuIyMjXG5cbmdlbmVyYXRlID0gKG51bWJlck9mUm9vbXMsIHByb3BlcnRpZXMsIG9uU3RlcENhbGxiYWNrKSAtPlxuXG4gICMgSW5pdGlhbGl6ZSBnZW5lcmF0b3JcbiAgZ2VuZXJhdG9yID0gbmV3IEdlbmVyYXRvcihudW1iZXJPZlJvb21zLCBwcm9wZXJ0aWVzKVxuXG4gICMgR2VuZXJhdGUgaW5pdGlhbCBzdGF0ZVxuICBpbml0aWFsUm9vbSA9IGdlbmVyYXRvci5nZW5lcmF0ZUluaXRpYWxSb29tKClcbiAgc3RhdGUgPSBnZW5lcmF0b3IuZ2VuZXJhdGVJbml0aWFsU3RhdGUoKVxuICBzdGF0ZS5hZGRSb29tKGluaXRpYWxSb29tKVxuICByZW1haW5pbmdSb29tcyA9IG51bWJlck9mUm9vbXMgLSAxICAjIFRha2UgaW5pdGlhbCByb29tXG4gIGNhbGxDYWxsYmFjayhnZW5lcmF0b3IsIHN0YXRlLCBvblN0ZXBDYWxsYmFjaylcblxuICAjIEdlbmVyYXRlIHJvb21zIHJhbmRvbWx5XG4gIHdoaWxlIHJlbWFpbmluZ1Jvb21zID4gMCBhbmQgc3RhdGUuZnJvbnRpZXIubGVuZ3RoID4gMFxuICAgIHJvb20gPSBzdGF0ZS5mcm9udGllci5zaGlmdCgpXG4gICAgZm9yIGRvb3IgaW4gcmFuZG9tLnNodWZmbGUocm9vbS5nZXRBdmFpbGFibGVFeGl0cygpKSB3aGVuIHJlbWFpbmluZ1Jvb21zID4gMFxuICAgICAgIyBDb3B5IHRoZSBvYmplY3RzIGFuZCB1cGRhdGUgcmVmZXJlbmNlcyBvbiBlYWNoIHN0ZXBcbiAgICAgIHN0YXRlID0gc3RhdGUuY2xvbmUoKVxuICAgICAgcm9vbSA9IHN0YXRlLnJvb21zW3Jvb20uaWRdXG4gICAgICAjIEdlbmVyYXRlIG5ldyByb29tXG4gICAgICBuZXdSb29tID0gZ2VuZXJhdG9yLmdlbmVyYXRlTmVpZ2hib3VyKHJvb20sIGRvb3IsIHN0YXRlKVxuICAgICAgaWYgbmV3Um9vbT9cbiAgICAgICAgcm9vbS5uZWlnaGJvdXJzW2Rvb3JdID0gbmV3Um9vbS5pZFxuICAgICAgICBzdGF0ZS5hZGRSb29tKG5ld1Jvb20pXG4gICAgICAgIHJlbWFpbmluZ1Jvb21zLS1cbiAgICAgICAgY2FsbENhbGxiYWNrKGdlbmVyYXRvciwgc3RhdGUsIG9uU3RlcENhbGxiYWNrKVxuXG4gIHJldHVybiBuZXcgTWFwKGdlbmVyYXRvci5tYXBXaWR0aCwgZ2VuZXJhdG9yLm1hcEhlaWdodCwgc3RhdGUuY2xvbmUoKS5yb29tcylcblxuY2FsbENhbGxiYWNrID0gKGdlbmVyYXRvciwgc3RhdGUsIGNhbGxiYWNrKSAtPlxuICBpZiBjYWxsYmFjaz8gdGhlbiBjYWxsYmFjayhcbiAgICBuZXcgTWFwKGdlbmVyYXRvci5tYXBXaWR0aCwgZ2VuZXJhdG9yLm1hcEhlaWdodCwgc3RhdGUuY2xvbmUoKS5yb29tcyksXG4gICAgc3RhdGUuZ2V0U3RlcHMoKVxuICApXG5cblxuIyMjIEVYUE9SVCBGVU5DVElPTlMgIyMjXG53aW5kb3cuZ2VuZXJhdGUgPSBnZW5lcmF0ZVxuIl19