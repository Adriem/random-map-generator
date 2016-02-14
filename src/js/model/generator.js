
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZGVsL2dlbmVyYXRvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQW9CQTtBQUFBLElBQUEsd0RBQUE7RUFBQTs7QUFDQSxRQUFBLEdBQ0U7RUFBQSxRQUFBLEVBQVUsRUFBVjtFQUNBLGVBQUEsRUFBaUIsRUFEakI7RUFFQSxjQUFBLEVBQWdCLENBRmhCO0VBR0Esa0JBQUEsRUFBb0IsQ0FIcEI7RUFJQSxtQkFBQSxFQUFxQixDQUpyQjtFQUtBLGFBQUEsRUFBZSxDQUxmO0VBTUEsYUFBQSxFQUFlLENBTmY7RUFPQSxhQUFBLEVBQWUsQ0FQZjtFQVFBLGFBQUEsRUFBZSxDQVJmO0VBU0EsaUJBQUEsRUFBbUIsR0FUbkI7Ozs7QUFhRjs7Ozs7O0FBTU07RUFDUyxjQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsTUFBVCxFQUFpQixPQUFqQixFQUEwQixFQUExQixFQUErQixLQUEvQixFQUE0QyxVQUE1QztJQUFDLElBQUMsQ0FBQSxJQUFEO0lBQUksSUFBQyxDQUFBLElBQUQ7SUFBSSxJQUFDLENBQUEsUUFBRDtJQUFRLElBQUMsQ0FBQSxTQUFEO0lBQVMsSUFBQyxDQUFBLEtBQUQ7SUFBSyxJQUFDLENBQUEsd0JBQUQsUUFBUztJQUFJLElBQUMsQ0FBQSxrQ0FBRCxhQUFjO0VBQTFEOztpQkFHYixRQUFBLEdBQVUsU0FBQTtBQUFNLFFBQUE7V0FBQSxFQUFFLENBQUMsTUFBSDs7QUFDZDtXQUFpQyxtRkFBakM7cUJBQUEsU0FBUyxDQUFDLEtBQVYsR0FBa0IsQ0FBQyxDQUFBLEdBQUUsQ0FBSDtBQUFsQjs7aUJBRGM7O0FBRWQ7V0FBaUMsbUZBQWpDO3FCQUFBLFNBQVMsQ0FBQyxLQUFWLEdBQWtCLENBQUMsQ0FBQSxHQUFFLENBQUg7QUFBbEI7O2lCQUZjOztBQUdkO1dBQWdDLG9GQUFoQztxQkFBQSxTQUFTLENBQUMsSUFBVixHQUFpQixDQUFDLENBQUEsR0FBRSxDQUFIO0FBQWpCOztpQkFIYzs7QUFJZDtXQUFnQyxvRkFBaEM7cUJB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Y2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuIyAgVGhpcyBmaWxlIGNvbnRhaW5zIHRoZSBmdW5jdGlvbnMgdG8gcmFuZG9tbHkgZ2VuZXJhdGUgdGhlIG1hcC5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBUaGlzIGFsZ29yeXRobSBnZW5lcmF0ZXMgYSByb29tIG9uIGEgcmFuZG9tIHBvc2l0aW9uIGFuZCBzdGFydHMgZ2VuZXJhdGluZ1xyXG4jIHRoZSBuZWlnaGJvdXJzIGZyb20gdGhlcmUuIFNvbWUgZXhhbXBsZXMgb2YgZ2VuZXJhdGVkIHJvb21zIGNhbiBiZTpcclxuI1xyXG4jICAgKy0tLSAwIC0tLSsgICArLS0tIDAgLS0tKy0tLSA0IC0tLSsgICArLS0tIDAgLS0tKyAgICstLS0gMCAtLS0rLS0tIDQgLS0tK1xyXG4jICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgIHwgICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgfFxyXG4jICAgMyAgICAgICAgIDEgICAzICAgICAgICAgICAgICAgICAgIDEgICAzICAgICAgICAgMSAgIDMgICAgICAgICAgICAgICAgICAgMVxyXG4jICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgIHwgICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgfFxyXG4jICAgKy0tLSAyIC0tLSsgICArLS0tIDIgLS0tKy0tLSA2IC0tLSsgICArICAgICAgICAgKyAgICsgICAgICAgICArICAgICAgICAgK1xyXG4jICAgICAoMSB4IDEpICAgICAgICAgICAgKDIgeCAxKSAgICAgICAgICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgfFxyXG4jICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA3ICAgICAgICAgNSAgIDcgICAgICAgICAgICAgICAgICAgNVxyXG4jICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgfFxyXG4jICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArLS0tIDIgLS0tKyAgICstLS0gMiAtLS0rLS0tIDYgLS0tK1xyXG4jICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgxIHggMikgICAgICAgICAgICAoMiB4IDIpXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgIEF1dGhvcjogQWRyaWFuIE1vcmVub1xyXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuIyMjIERlZmF1bHQgdmFsdWVzIGZvciB0aGUgZ2VuZXJhdG9yICMjI1xyXG5EZWZhdWx0cyA9XHJcbiAgTUFQX1NJWkU6IDEwXHJcbiAgTlVNQkVSX09GX1JPT01TOiAxNVxyXG4gIFRJTEVTX1BFUl9VTklUOiAzXHJcbiAgSU5JVElBTF9ST09NX1dJRFRIOiAxXHJcbiAgSU5JVElBTF9ST09NX0hFSUdIVDogMVxyXG4gIE1JTl9ST09NX1NJWkU6IDFcclxuICBNQVhfUk9PTV9TSVpFOiAyXHJcbiAgTUlOX1JPT01fQVJFQTogMVxyXG4gIE1BWF9ST09NX0FSRUE6IDZcclxuICBSQVRJT19SRVNUUklDVElPTjogMC41XHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyMjXHJcbiAgVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgcm9vbSB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgbWFwLiBJdCBpcyBkZWZpbmVkIGJ5XHJcbiAgdHdvIGNvb3JkaW5hdGVzIGluIHRoZSBzcGFjZSwgYSB3aWR0aCBhbmQgYSBoZWlnaHQuIEl0IGNhbiBhbHNvIGhhdmUgc29tZVxyXG4gIGF0dHJpYnV0ZXMgYW5kIHNvbWUgcmVmZXJlbmNlcyB0byBpdHMgbmVpZ2hib3Vycy5cclxuIyMjXHJcblxyXG5jbGFzcyBSb29tXHJcbiAgY29uc3RydWN0b3I6IChAeCwgQHksIEB3aWR0aCwgQGhlaWdodCwgQGlkLCBAYXR0cnMgPSB7fSwgQG5laWdoYm91cnMgPSBbXSkgLT5cclxuXHJcbiAgIyBSZXR1cm4gYW4gYXJyYXkgd2l0aCB0aGUgaW5kZXhlcyBvZiBhbGwgdGhlIGV4aXRzIG9mIHRoZSByb29tXHJcbiAgZ2V0RXhpdHM6ICgpIC0+IFtdLmNvbmNhdChcclxuICAgIERpcmVjdGlvbi5OT1JUSCArIChpKjQpIGZvciBpIGluIFswLi4uQHdpZHRoXSxcclxuICAgIERpcmVjdGlvbi5TT1VUSCArIChpKjQpIGZvciBpIGluIFswLi4uQHdpZHRoXSxcclxuICAgIERpcmVjdGlvbi5FQVNUICsgKGkqNCkgZm9yIGkgaW4gWzAuLi5AaGVpZ2h0XSxcclxuICAgIERpcmVjdGlvbi5XRVNUICsgKGkqNCkgZm9yIGkgaW4gWzAuLi5AaGVpZ2h0XVxyXG4gIClcclxuXHJcbiAgIyBSZXR1cm4gYW4gYXJyYXkgd2l0aCB0aGUgaW5kZXhlcyBvZiB1bnVzZWQgZXhpdHMgb2YgdGhlIHJvb21cclxuICBnZXRBdmFpbGFibGVFeGl0czogKCkgLT4gZG9vciBmb3IgZG9vciBpbiBAZ2V0RXhpdHMoKSB3aGVuIG5vdCBAbmVpZ2hib3Vyc1tkb29yXT9cclxuXHJcbiAgIyBSZXR1cm5zIHRoZSBhcmVhIG9mIHRoZSByb29tXHJcbiAgZ2V0QXJlYTogLT4gQHdpZHRoICogQGhlaWdodFxyXG5cclxuICAjIFJldHVybiB0cnVlIGlmIGdpdmVuIHJvb20gY29sbGlkZXMgd2l0aCB0aGlzIHJvb21cclxuICBjb2xsaWRlc1dpdGg6IChyb29tKSAtPlxyXG4gICAgbm90IChAeCA+IHJvb20ueCArIHJvb20ud2lkdGggb3Igcm9vbS54ID4gQHggKyBAd2lkdGgpIGFuZFxyXG4gICAgbm90IChAeSA+IHJvb20ueSArIHJvb20uaGVpZ2h0IG9yIHJvb20ueSA+IEB5ICsgQGhlaWdodClcclxuXHJcbiAgIyBHZW5lcmF0ZSBhIGRlZXAgY29weSBvZiB0aGlzIHJvb21cclxuICBjbG9uZTogLT5cclxuICAgIGF0dHJzQ2xvbmUgPSB7fVxyXG4gICAgYXR0cnNDbG9uZVtrZXldID0gdmFsdWUgZm9yIGtleSwgdmFsdWUgb2YgQGF0dHJzXHJcbiAgICBuZWlnaGJvdXJzQ2xvbmUgPSAobmVpZ2hib3VyIGZvciBuZWlnaGJvdXIgaW4gQG5laWdoYm91cnMpXHJcbiAgICBuZXcgUm9vbShAeCwgQHksIEB3aWR0aCwgQGhlaWdodCwgQGlkLCBhdHRyc0Nsb25lLCBuZWlnaGJvdXJzQ2xvbmUpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyMjXHJcbiAgVGhpcyBjbGFzcyByZXByZXNlbnRzIHRoZSBzdGF0ZSBvZiB0aGUgZ2VuZXJhdG9yIG9uIGEgZ2l2ZW4gbW9tZW50LiBJdFxyXG4gIGNvbnRhaW5zIGEgbGlzdCB3aXRoIHRoZSByb29tcyB0aGF0IGhhdmUgYmVlbiBnZW5lcmF0ZWQsIGEgbGlzdCB3aXRoIHRoZVxyXG4gIHJvb21zIHRoYXQgYXJlIHdhaXRpbmcgdG8gYmUgZXhwYW5kZWQgYW5kIGEgdGlsZSBtYXAgdGhhdCByZXByZXNlbnRzIHRoZVxyXG4gIGN1cnJlbnQgZGlzdHJpYnV0aW9uIG9mIHRoZSByb29tc1xyXG4jIyNcclxuXHJcbmNsYXNzIFN0YXRlXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAoQHJvb21zID0gW10sIEBmcm9udGllciA9IFtdLCB3aWR0aCwgaGVpZ2h0KSAtPlxyXG4gICAgaWYgd2lkdGg/IGFuZCBoZWlnaHQ/IHRoZW4gQGNvbGxpc2lvbk1hcCA9IG5ldyBUaWxlbWFwKHdpZHRoLCBoZWlnaHQsIGZhbHNlKVxyXG5cclxuICAjIFJldHVybiB0aGUgbnVtYmVyIG9mIHN0ZXBzIGdpdmVuIHVudGlsIHRoaXMgc3RhdGVcclxuICBnZXRTdGVwczogLT4gQHJvb21zLmxlbmd0aCAtIDFcclxuXHJcbiAgIyBBZGQgYSBuZXcgcm9vbSB0byB0aGlzIHN0YXRlXHJcbiAgYWRkUm9vbTogKHJvb20pIC0+XHJcbiAgICBAcm9vbXMucHVzaChyb29tKVxyXG4gICAgQGZyb250aWVyLnB1c2gocm9vbSlcclxuICAgIEBjb2xsaXNpb25NYXAuc2V0KHJvb20ueCwgcm9vbS55LCByb29tLndpZHRoLCByb29tLmhlaWdodCwgdHJ1ZSkgaWYgQGNvbGxpc2lvbk1hcD9cclxuXHJcbiAgIyBDaGVja3MgaWYgYSByb29tIGNhbiBiZSBhZGRlZCB3aXRob3V0IGNvbGxpZGluZyB3aXRoIGV4aXN0aW5nIHJvb21zXHJcbiAgaGFzUm9vbUZvcjogKHJvb20pIC0+XHJcbiAgICBpZiBAY29sbGlzaW9uTWFwP1xyXG4gICAgICByZXR1cm4gQGNvbGxpc2lvbk1hcC5pcyhyb29tLngsIHJvb20ueSwgcm9vbS53aWR0aCwgcm9vbS5oZWlnaHQsIGZhbHNlKVxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gZmFsc2UgZm9yIG90aGVyUm9vbSBpbiBAcm9vbXMgd2hlbiBvdGhlclJvb20uY29sbGlkZXNXaXRoKHJvb20pXHJcbiAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICMgR2VuZXJhdGUgYSBkZWVwIGNsb25lIG9mIHRoaXMgc3RhdGVcclxuICBjbG9uZTogLT5cclxuICAgIG5ld0luc3RhbmNlID0gbmV3IFN0YXRlKFxyXG4gICAgICByb29tLmNsb25lKCkgZm9yIHJvb20gaW4gQHJvb21zLFxyXG4gICAgICByb29tLmNsb25lKCkgZm9yIHJvb20gaW4gQGZyb250aWVyXHJcbiAgICApXHJcbiAgICBuZXdJbnN0YW5jZS5jb2xsaXNpb25NYXAgPSBAY29sbGlzaW9uTWFwLmNsb25lKCkgaWYgQGNvbGxpc2lvbk1hcD9cclxuICAgIHJldHVybiBuZXdJbnN0YW5jZVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiMjI1xyXG4gIFRoaXMgY2xhc3Mgd2lsbCBwcm92aWRlIGZ1bmN0aW9ucyB0byBnZW5lcmF0ZSBjb250ZW50IHJhbmRvbWx5IGJhc2VkIG9uXHJcbiAgdGhlIGdpdmVuIHByb3BlcnRpZXMuXHJcbiMjI1xyXG5cclxuY2xhc3MgR2VuZXJhdG9yXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAobnVtYmVyT2ZSb29tcywgcHJvcGVydGllcykgLT5cclxuICAgIEByZW1haW5pbmdSb29tcyA9IG51bWJlck9mUm9vbXNcclxuICAgIEBtaW5Sb29tU2l6ZSA9IHByb3BlcnRpZXMubWluUm9vbVNpemUgPyBEZWZhdWx0cy5NSU5fUk9PTV9TSVpFXHJcbiAgICBAbWF4Um9vbVNpemUgPSBwcm9wZXJ0aWVzLm1heFJvb21TaXplID8gRGVmYXVsdHMuTUFYX1JPT01fU0laRVxyXG4gICAgQG1pblJvb21BcmVhID0gcHJvcGVydGllcy5taW5Sb29tQXJlYSA/IEBtaW5Sb29tU2l6ZSAqKiAyXHJcbiAgICBAbWF4Um9vbUFyZWEgPSBwcm9wZXJ0aWVzLm1heFJvb21BcmVhID8gQG1heFJvb21TaXplICoqIDJcclxuICAgIEByYXRpb1Jlc3RyICA9IHByb3BlcnRpZXMucmF0aW9SZXN0cmljdGlvbiA/IDBcclxuICAgIEBtYXBXaWR0aCA9IHByb3BlcnRpZXMud2lkdGggPyBAbWF4Um9vbVNpemUgKiBudW1iZXJPZlJvb21zXHJcbiAgICBAbWFwSGVpZ2h0ID0gcHJvcGVydGllcy5oZWlnaHQgPyBAbWF4Um9vbVNpemUgKiBudW1iZXJPZlJvb21zXHJcbiAgICBAaW5pdGlhbFJvb21XaWR0aCA9IHByb3BlcnRpZXMuaW5pdGlhbFJvb21XaWR0aCA/IERlZmF1bHRzLklOSVRJQUxfUk9PTV9XSURUSFxyXG4gICAgQGluaXRpYWxSb29tSGVpZ2h0ID0gcHJvcGVydGllcy5pbml0aWFsUm9vbUhlaWdodCA/IERlZmF1bHRzLklOSVRJQUxfUk9PTV9IRUlHSFRcclxuXHJcbiAgZ2VuZXJhdGVJbml0aWFsUm9vbTogLT5cclxuICAgIHggPSByYW5kb20udmFsdWUoQG1hcFdpZHRoICogMC4zMCwgQG1hcFdpZHRoICogMC43MClcclxuICAgIHkgPSByYW5kb20udmFsdWUoQG1hcEhlaWdodCAqIDAuMzAsIEBtYXBIZWlnaHQgKiAwLjcwKVxyXG4gICAgbmV3IFJvb20oeCwgeSwgQGluaXRpYWxSb29tV2lkdGgsIEBpbml0aWFsUm9vbUhlaWdodCwgMClcclxuXHJcbiAgZ2VuZXJhdGVJbml0aWFsU3RhdGU6IC0+XHJcbiAgICBuZXcgU3RhdGUoW10sIFtdLCBAbWFwV2lkdGgsIEBtYXBIZWlnaHQpXHJcblxyXG4gIGdlbmVyYXRlTmVpZ2hib3VyOiAocm9vbSwgZG9vciwgc3RhdGUpIC0+XHJcbiAgICBjYW5kaWRhdGVzID0gQGdlbmVyYXRlUG9zc2libGVOZWlnaGJvdXJzKHJvb20sIGRvb3IsIHN0YXRlKVxyXG4gICAgaWYgY2FuZGlkYXRlcy5sZW5ndGggPiAwIGFuZCByYW5kb20udGVzdChnZXRTcGF3bkNoYW5jZShzdGF0ZSkpXHJcbiAgICAgICMgR3JvdXAgY2FuZGlkYXRlcyBieSBhcmVhXHJcbiAgICAgIGF2YWlsYWJsZUFyZWFzID0gW11cclxuICAgICAgY2FuZGlkYXRlc0dyb3VwZWQgPSBbXVxyXG4gICAgICBmb3Igcm9vbSBpbiBjYW5kaWRhdGVzXHJcbiAgICAgICAgdW5sZXNzIHJvb20uZ2V0QXJlYSgpIGluIGF2YWlsYWJsZUFyZWFzXHJcbiAgICAgICAgICBhdmFpbGFibGVBcmVhcy5wdXNoKHJvb20uZ2V0QXJlYSgpKVxyXG4gICAgICAgICAgY2FuZGlkYXRlc0dyb3VwZWRbYXZhaWxhYmxlQXJlYXMuaW5kZXhPZihyb29tLmdldEFyZWEoKSldID0gW11cclxuICAgICAgICBjYW5kaWRhdGVzR3JvdXBlZFthdmFpbGFibGVBcmVhcy5pbmRleE9mKHJvb20uZ2V0QXJlYSgpKV0ucHVzaChyb29tKVxyXG4gICAgICAjIFJhbmRvbWx5IHNlbGVjdCBjYW5kaWRhdGVcclxuICAgICAgc2VsZWN0ZWRHcm91cCA9IGNhbmRpZGF0ZXNHcm91cGVkW3JhbmRvbS52YWx1ZSgwLCBjYW5kaWRhdGVzR3JvdXBlZC5sZW5ndGgpXVxyXG4gICAgICBzZWxlY3RlZEdyb3VwW3JhbmRvbS52YWx1ZSgwLCBzZWxlY3RlZEdyb3VwLmxlbmd0aCldXHJcblxyXG4gIGdlbmVyYXRlUG9zc2libGVOZWlnaGJvdXJzOiAocm9vbSwgZG9vciwgc3RhdGUpIC0+XHJcbiAgICBjYW5kaWRhdGVzID0gW11cclxuICAgICMgR2VuZXJhdGUgcm9vbXMgZm9yIGFsbCB0aGUgcG9zc2libGUgc2l6ZXNcclxuICAgIGZvciBoZWlnaHQgaW4gW0BtaW5Sb29tU2l6ZS4uQG1heFJvb21TaXplXVxyXG4gICAgICBmb3Igd2lkdGggaW4gW0BtaW5Sb29tU2l6ZS4uQG1heFJvb21TaXplXSB3aGVuIEB2YWxpZE1lYXN1cmVzKHdpZHRoLCBoZWlnaHQpXHJcbiAgICAgICAgIyBJdGVyYXRlIGFsbCBvdmVyIHRoZSBwb3NzaWJsZSBwb3NpdGlvbnMgdGhlIHJvb20gY291bGQgYmVcclxuICAgICAgICBvZmZzZXRNYXggPSBpZiBkb29yICUgMiBpcyAwIHRoZW4gd2lkdGggZWxzZSBoZWlnaHRcclxuICAgICAgICBmb3Igb2Zmc2V0IGluIFsxIC0gb2Zmc2V0TWF4Li4wXVxyXG4gICAgICAgICAgIyBDYWxjdWxhdGUgY2FuZGlkYXRlJ3MgY29vcmRpbmF0ZXNcclxuICAgICAgICAgIFt4LCB5XSA9IHN3aXRjaCBkb29yICUgNFxyXG4gICAgICAgICAgICB3aGVuIERpcmVjdGlvbi5OT1JUSFxyXG4gICAgICAgICAgICAgIFtyb29tLnggKyBkb29yIC8vIDQgKyBvZmZzZXQsIHJvb20ueSAtIGhlaWdodF1cclxuICAgICAgICAgICAgd2hlbiBEaXJlY3Rpb24uU09VVEhcclxuICAgICAgICAgICAgICBbcm9vbS54ICsgZG9vciAvLyA0ICsgb2Zmc2V0LCByb29tLnkgKyByb29tLmhlaWdodF1cclxuICAgICAgICAgICAgd2hlbiBEaXJlY3Rpb24uRUFTVFxyXG4gICAgICAgICAgICAgIFtyb29tLnggKyByb29tLndpZHRoLCByb29tLnkgKyBkb29yIC8vIDQgKyBvZmZzZXRdXHJcbiAgICAgICAgICAgIHdoZW4gRGlyZWN0aW9uLldFU1RcclxuICAgICAgICAgICAgICBbcm9vbS54IC0gd2lkdGgsIHJvb20ueSArIGRvb3IgLy8gNCArIG9mZnNldF1cclxuICAgICAgICAgICMgR2VuZXJhdGUgdGhlIGNhbmRpZGF0ZVxyXG4gICAgICAgICAgY2FuZGlkYXRlID0gbmV3IFJvb20oeCwgeSwgd2lkdGgsIGhlaWdodCwgc3RhdGUuZ2V0U3RlcHMoKSArIDEpXHJcbiAgICAgICAgICAjIEFkZCByb29tIHRvIGNhbmRpZGF0ZSdzIG5laWdoYm91cnNcclxuICAgICAgICAgIGRvb3JPbk5laWdoYm91ciA9IDQgKiBvZmZzZXQgKiAoLTEpICsgZ2V0T3Bwb3NpdGVEaXJlY3Rpb24oZG9vcilcclxuICAgICAgICAgIGNhbmRpZGF0ZS5uZWlnaGJvdXJzW2Rvb3JPbk5laWdoYm91cl0gPSByb29tLmlkXHJcbiAgICAgICAgICAjIEFkZCB0aGUgZG9vciB0byB0aGUgY2FuZGlkYXRlcyBpZiBpdCBkb2Vzbid0IGNvbGxpZGUgd2l0aCBhbnl0aGluZ1xyXG4gICAgICAgICAgY2FuZGlkYXRlcy5wdXNoKGNhbmRpZGF0ZSkgaWYgc3RhdGUuaGFzUm9vbUZvcihjYW5kaWRhdGUpXHJcbiAgICByZXR1cm4gY2FuZGlkYXRlc1xyXG5cclxuICB2YWxpZE1lYXN1cmVzOiAod2lkdGgsIGhlaWdodCkgLT4gaGVpZ2h0ICogd2lkdGggPD0gQG1heFJvb21BcmVhIGFuZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQgKiB3aWR0aCA+PSBAbWluUm9vbUFyZWEgYW5kXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoIC8gaGVpZ2h0ID49IEByYXRpb1Jlc3RyIGFuZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQgLyB3aWR0aCA+PSBAcmF0aW9SZXN0clxyXG5cclxuICAjIFBSSVZBVEUgSEVMUEVSU1xyXG4gIGdldE9wcG9zaXRlRGlyZWN0aW9uID0gKGRvb3IpIC0+ICgoZG9vciAlIDQpICsgMikgJSA0XHJcbiAgZ2V0U3Bhd25DaGFuY2UgPSAoc3RhdGUpIC0+XHJcbiAgICBpZiBzdGF0ZS5mcm9udGllci5sZW5ndGggaXMgMCB0aGVuIDEwMCBlbHNlIDc1XHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyMjXHJcbiAgVGhpcyBpcyB0aGUgZnVuY3Rpb24gdGhhdCB3aWxsIGdlbmVyYXRlIHRoZSBtYXAuIEl0IHRha2VzIGEgd2lkdGgsIGEgaGVpZ2h0LFxyXG4gIHRoZSBudW1iZXIgb2Ygcm9vbXMgdG8gZ2VuZXJhdGUsIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnZW5lcmF0b3IgYW5kIGFcclxuICBjYWxsYmFjayB0byBiZSBleGVjdXRlZCBvbiBlYWNoIHN0ZXAuXHJcbiMjI1xyXG5cclxuZ2VuZXJhdGUgPSAobnVtYmVyT2ZSb29tcywgcHJvcGVydGllcywgb25TdGVwQ2FsbGJhY2spIC0+XHJcblxyXG4gICMgSW5pdGlhbGl6ZSBnZW5lcmF0b3JcclxuICBnZW5lcmF0b3IgPSBuZXcgR2VuZXJhdG9yKG51bWJlck9mUm9vbXMsIHByb3BlcnRpZXMpXHJcblxyXG4gICMgR2VuZXJhdGUgaW5pdGlhbCBzdGF0ZVxyXG4gIGluaXRpYWxSb29tID0gZ2VuZXJhdG9yLmdlbmVyYXRlSW5pdGlhbFJvb20oKVxyXG4gIHN0YXRlID0gZ2VuZXJhdG9yLmdlbmVyYXRlSW5pdGlhbFN0YXRlKClcclxuICBzdGF0ZS5hZGRSb29tKGluaXRpYWxSb29tKVxyXG4gIHJlbWFpbmluZ1Jvb21zID0gbnVtYmVyT2ZSb29tcyAtIDEgICMgVGFrZSBpbml0aWFsIHJvb21cclxuICBjYWxsQ2FsbGJhY2soZ2VuZXJhdG9yLCBzdGF0ZSwgb25TdGVwQ2FsbGJhY2spXHJcblxyXG4gICMgR2VuZXJhdGUgcm9vbXMgcmFuZG9tbHlcclxuICB3aGlsZSByZW1haW5pbmdSb29tcyA+IDAgYW5kIHN0YXRlLmZyb250aWVyLmxlbmd0aCA+IDBcclxuICAgIHJvb20gPSBzdGF0ZS5mcm9udGllci5zaGlmdCgpXHJcbiAgICBmb3IgZG9vciBpbiByYW5kb20uc2h1ZmZsZShyb29tLmdldEF2YWlsYWJsZUV4aXRzKCkpIHdoZW4gcmVtYWluaW5nUm9vbXMgPiAwXHJcbiAgICAgICMgQ29weSB0aGUgb2JqZWN0cyBhbmQgdXBkYXRlIHJlZmVyZW5jZXMgb24gZWFjaCBzdGVwXHJcbiAgICAgIHN0YXRlID0gc3RhdGUuY2xvbmUoKVxyXG4gICAgICByb29tID0gc3RhdGUucm9vbXNbcm9vbS5pZF1cclxuICAgICAgIyBHZW5lcmF0ZSBuZXcgcm9vbVxyXG4gICAgICBuZXdSb29tID0gZ2VuZXJhdG9yLmdlbmVyYXRlTmVpZ2hib3VyKHJvb20sIGRvb3IsIHN0YXRlKVxyXG4gICAgICBpZiBuZXdSb29tP1xyXG4gICAgICAgIHJvb20ubmVpZ2hib3Vyc1tkb29yXSA9IG5ld1Jvb20uaWRcclxuICAgICAgICBzdGF0ZS5hZGRSb29tKG5ld1Jvb20pXHJcbiAgICAgICAgcmVtYWluaW5nUm9vbXMtLVxyXG4gICAgICAgIGNhbGxDYWxsYmFjayhnZW5lcmF0b3IsIHN0YXRlLCBvblN0ZXBDYWxsYmFjaylcclxuXHJcbiAgcmV0dXJuIG5ldyBNYXAoZ2VuZXJhdG9yLm1hcFdpZHRoLCBnZW5lcmF0b3IubWFwSGVpZ2h0LCBzdGF0ZS5jbG9uZSgpLnJvb21zKVxyXG5cclxuY2FsbENhbGxiYWNrID0gKGdlbmVyYXRvciwgc3RhdGUsIGNhbGxiYWNrKSAtPlxyXG4gIGlmIGNhbGxiYWNrPyB0aGVuIGNhbGxiYWNrKFxyXG4gICAgbmV3IE1hcChnZW5lcmF0b3IubWFwV2lkdGgsIGdlbmVyYXRvci5tYXBIZWlnaHQsIHN0YXRlLmNsb25lKCkucm9vbXMpLFxyXG4gICAgc3RhdGUuZ2V0U3RlcHMoKVxyXG4gIClcclxuXHJcblxyXG4jIyMgRVhQT1JUIEZVTkNUSU9OUyAjIyNcclxud2luZG93LmdlbmVyYXRlID0gZ2VuZXJhdGVcclxuIl19