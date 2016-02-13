
/* Default values for the generator */
var Defaults, Generator, Room, State, generate, obtainMap,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Defaults = {
  MAP_SIZE: 10,
  NUMBER_OF_ROOMS: 15,
  TILES_PER_UNIT: 3,
  INITIAL_ROOM_WIDTH: 1,
  INITIAL_ROOM_HEIGHT: 1,
  MIN_ROOM_SIZE: 1,
  MAX_ROOM_SIZE: 2
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
  if (onStepCallback != null) {
    onStepCallback(obtainMap(state.clone()), state.getSteps());
  }
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
        if (onStepCallback != null) {
          onStepCallback(obtainMap(state.clone()), state.getSteps());
        }
      }
    }
  }
  return obtainMap(state);
};

obtainMap = function(state) {
  return new Map(state.collisionMap.width, state.collisionMap.height, state.rooms);
};


/* EXPORT FUNCTIONS */

window.generate = generate;

//# sourceMappingURL=data:application/json;base64,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QXpDLEVBQUE7O0FBR0EsU0FBTSxjQUFBLEdBQWlCLENBQWpCLElBQXVCLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBZixHQUF3QixDQUFyRDtJQUNFLElBQUEsR0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWYsQ0FBQTtBQUNQO0FBQUEsU0FBQSxxQ0FBQTs7WUFBMEQsY0FBQSxHQUFpQjs7O01BRXpFLEtBQUEsR0FBUSxLQUFLLENBQUMsS0FBTixDQUFBO01BQ1IsSUFBQSxHQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsSUFBSSxDQUFDLEVBQUw7TUFFbkIsT0FBQSxHQUFVLFNBQVMsQ0FBQyxpQkFBVixDQUE0QixJQUE1QixFQUFrQyxJQUFsQyxFQUF3QyxLQUF4QztNQUNWLElBQUcsZUFBSDtRQUNFLElBQUksQ0FBQyxVQUFXLENBQUEsSUFBQSxDQUFoQixHQUF3QixPQUFPLENBQUM7UUFDaEMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFkO1FBQ0EsY0FBQTtRQUNBLElBQThELHNCQUE5RDtVQUFBLGNBQUEsQ0FBZSxTQUFBLENBQVUsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFWLENBQWYsRUFBeUMsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUF6QyxFQUFBO1NBSkY7O0FBTkY7RUFGRjtBQWNBLFNBQU8sU0FBQSxDQUFVLEtBQVY7QUEzQkU7O0FBOEJYLFNBQUEsR0FBWSxTQUFDLEtBQUQ7U0FDTixJQUFBLEdBQUEsQ0FBSSxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQXZCLEVBQThCLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBakQsRUFBeUQsS0FBSyxDQUFDLEtBQS9EO0FBRE07OztBQUdaOztBQUNBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCIiwiZmlsZSI6Im1vZGVsL2dlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiMgIFRoaXMgZmlsZSBjb250YWlucyB0aGUgZnVuY3Rpb25zIHRvIHJhbmRvbWx5IGdlbmVyYXRlIHRoZSBtYXAuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgVGhpcyBhbGdvcnl0aG0gZ2VuZXJhdGVzIGEgcm9vbSBvbiBhIHJhbmRvbSBwb3NpdGlvbiBhbmQgc3RhcnRzIGdlbmVyYXRpbmdcclxuIyB0aGUgbmVpZ2hib3VycyBmcm9tIHRoZXJlLiBTb21lIGV4YW1wbGVzIG9mIGdlbmVyYXRlZCByb29tcyBjYW4gYmU6XHJcbiNcclxuIyAgICstLS0gMCAtLS0rICAgKy0tLSAwIC0tLSstLS0gNCAtLS0rICAgKy0tLSAwIC0tLSsgICArLS0tIDAgLS0tKy0tLSA0IC0tLStcclxuIyAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8ICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgIHxcclxuIyAgIDMgICAgICAgICAxICAgMyAgICAgICAgICAgICAgICAgICAxICAgMyAgICAgICAgIDEgICAzICAgICAgICAgICAgICAgICAgIDFcclxuIyAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8ICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgIHxcclxuIyAgICstLS0gMiAtLS0rICAgKy0tLSAyIC0tLSstLS0gNiAtLS0rICAgKyAgICAgICAgICsgICArICAgICAgICAgKyAgICAgICAgICtcclxuIyAgICAgKDEgeCAxKSAgICAgICAgICAgICgyIHggMSkgICAgICAgICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgIHxcclxuIyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgNyAgICAgICAgIDUgICA3ICAgICAgICAgICAgICAgICAgIDVcclxuIyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgIHxcclxuIyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKy0tLSAyIC0tLSsgICArLS0tIDIgLS0tKy0tLSA2IC0tLStcclxuIyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoMSB4IDIpICAgICAgICAgICAgKDIgeCAyKVxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jICBBdXRob3I6IEFkcmlhbiBNb3Jlbm9cclxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiMjIyBEZWZhdWx0IHZhbHVlcyBmb3IgdGhlIGdlbmVyYXRvciAjIyNcclxuRGVmYXVsdHMgPVxyXG4gIE1BUF9TSVpFOiAxMFxyXG4gIE5VTUJFUl9PRl9ST09NUzogMTVcclxuICBUSUxFU19QRVJfVU5JVDogM1xyXG4gIElOSVRJQUxfUk9PTV9XSURUSDogMVxyXG4gIElOSVRJQUxfUk9PTV9IRUlHSFQ6IDFcclxuICBNSU5fUk9PTV9TSVpFOiAxXHJcbiAgTUFYX1JPT01fU0laRTogMlxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiMjI1xyXG4gIFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhIHJvb20gdGhhdCB3aWxsIGJlIHBhcnQgb2YgdGhlIG1hcC4gSXQgaXMgZGVmaW5lZCBieVxyXG4gIHR3byBjb29yZGluYXRlcyBpbiB0aGUgc3BhY2UsIGEgd2lkdGggYW5kIGEgaGVpZ2h0LiBJdCBjYW4gYWxzbyBoYXZlIHNvbWVcclxuICBhdHRyaWJ1dGVzIGFuZCBzb21lIHJlZmVyZW5jZXMgdG8gaXRzIG5laWdoYm91cnMuXHJcbiMjI1xyXG5cclxuY2xhc3MgUm9vbVxyXG4gIGNvbnN0cnVjdG9yOiAoQHgsIEB5LCBAd2lkdGgsIEBoZWlnaHQsIEBpZCwgQGF0dHJzID0ge30sIEBuZWlnaGJvdXJzID0gW10pIC0+XHJcblxyXG4gICMgUmV0dXJuIGFuIGFycmF5IHdpdGggdGhlIGluZGV4ZXMgb2YgYWxsIHRoZSBleGl0cyBvZiB0aGUgcm9vbVxyXG4gIGdldEV4aXRzOiAoKSAtPiBbXS5jb25jYXQoXHJcbiAgICBEaXJlY3Rpb24uTk9SVEggKyAoaSo0KSBmb3IgaSBpbiBbMC4uLkB3aWR0aF0sXHJcbiAgICBEaXJlY3Rpb24uU09VVEggKyAoaSo0KSBmb3IgaSBpbiBbMC4uLkB3aWR0aF0sXHJcbiAgICBEaXJlY3Rpb24uRUFTVCArIChpKjQpIGZvciBpIGluIFswLi4uQGhlaWdodF0sXHJcbiAgICBEaXJlY3Rpb24uV0VTVCArIChpKjQpIGZvciBpIGluIFswLi4uQGhlaWdodF1cclxuICApXHJcblxyXG4gICMgUmV0dXJuIGFuIGFycmF5IHdpdGggdGhlIGluZGV4ZXMgb2YgdW51c2VkIGV4aXRzIG9mIHRoZSByb29tXHJcbiAgZ2V0QXZhaWxhYmxlRXhpdHM6ICgpIC0+IGRvb3IgZm9yIGRvb3IgaW4gQGdldEV4aXRzKCkgd2hlbiBub3QgQG5laWdoYm91cnNbZG9vcl0/XHJcblxyXG4gICMgUmV0dXJucyB0aGUgYXJlYSBvZiB0aGUgcm9vbVxyXG4gIGdldEFyZWE6IC0+IEB3aWR0aCAqIEBoZWlnaHRcclxuXHJcbiAgIyBSZXR1cm4gdHJ1ZSBpZiBnaXZlbiByb29tIGNvbGxpZGVzIHdpdGggdGhpcyByb29tXHJcbiAgY29sbGlkZXNXaXRoOiAocm9vbSkgLT5cclxuICAgIG5vdCAoQHggPiByb29tLnggKyByb29tLndpZHRoIG9yIHJvb20ueCA+IEB4ICsgQHdpZHRoKSBhbmRcclxuICAgIG5vdCAoQHkgPiByb29tLnkgKyByb29tLmhlaWdodCBvciByb29tLnkgPiBAeSArIEBoZWlnaHQpXHJcblxyXG4gICMgR2VuZXJhdGUgYSBkZWVwIGNvcHkgb2YgdGhpcyByb29tXHJcbiAgY2xvbmU6IC0+XHJcbiAgICBhdHRyc0Nsb25lID0ge31cclxuICAgIGF0dHJzQ2xvbmVba2V5XSA9IHZhbHVlIGZvciBrZXksIHZhbHVlIG9mIEBhdHRyc1xyXG4gICAgbmVpZ2hib3Vyc0Nsb25lID0gKG5laWdoYm91ciBmb3IgbmVpZ2hib3VyIGluIEBuZWlnaGJvdXJzKVxyXG4gICAgbmV3IFJvb20oQHgsIEB5LCBAd2lkdGgsIEBoZWlnaHQsIEBpZCwgYXR0cnNDbG9uZSwgbmVpZ2hib3Vyc0Nsb25lKVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiMjI1xyXG4gIFRoaXMgY2xhc3MgcmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgdGhlIGdlbmVyYXRvciBvbiBhIGdpdmVuIG1vbWVudC4gSXRcclxuICBjb250YWlucyBhIGxpc3Qgd2l0aCB0aGUgcm9vbXMgdGhhdCBoYXZlIGJlZW4gZ2VuZXJhdGVkLCBhIGxpc3Qgd2l0aCB0aGVcclxuICByb29tcyB0aGF0IGFyZSB3YWl0aW5nIHRvIGJlIGV4cGFuZGVkIGFuZCBhIHRpbGUgbWFwIHRoYXQgcmVwcmVzZW50cyB0aGVcclxuICBjdXJyZW50IGRpc3RyaWJ1dGlvbiBvZiB0aGUgcm9vbXNcclxuIyMjXHJcblxyXG5jbGFzcyBTdGF0ZVxyXG5cclxuICBjb25zdHJ1Y3RvcjogKEByb29tcyA9IFtdLCBAZnJvbnRpZXIgPSBbXSwgd2lkdGgsIGhlaWdodCkgLT5cclxuICAgIGlmIHdpZHRoPyBhbmQgaGVpZ2h0PyB0aGVuIEBjb2xsaXNpb25NYXAgPSBuZXcgVGlsZW1hcCh3aWR0aCwgaGVpZ2h0LCBmYWxzZSlcclxuXHJcbiAgIyBSZXR1cm4gdGhlIG51bWJlciBvZiBzdGVwcyBnaXZlbiB1bnRpbCB0aGlzIHN0YXRlXHJcbiAgZ2V0U3RlcHM6IC0+IEByb29tcy5sZW5ndGggLSAxXHJcblxyXG4gICMgQWRkIGEgbmV3IHJvb20gdG8gdGhpcyBzdGF0ZVxyXG4gIGFkZFJvb206IChyb29tKSAtPlxyXG4gICAgQHJvb21zLnB1c2gocm9vbSlcclxuICAgIEBmcm9udGllci5wdXNoKHJvb20pXHJcbiAgICBAY29sbGlzaW9uTWFwLnNldChyb29tLngsIHJvb20ueSwgcm9vbS53aWR0aCwgcm9vbS5oZWlnaHQsIHRydWUpIGlmIEBjb2xsaXNpb25NYXA/XHJcblxyXG4gICMgQ2hlY2tzIGlmIGEgcm9vbSBjYW4gYmUgYWRkZWQgd2l0aG91dCBjb2xsaWRpbmcgd2l0aCBleGlzdGluZyByb29tc1xyXG4gIGhhc1Jvb21Gb3I6IChyb29tKSAtPlxyXG4gICAgaWYgQGNvbGxpc2lvbk1hcD9cclxuICAgICAgcmV0dXJuIEBjb2xsaXNpb25NYXAuaXMocm9vbS54LCByb29tLnksIHJvb20ud2lkdGgsIHJvb20uaGVpZ2h0LCBmYWxzZSlcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIGZhbHNlIGZvciBvdGhlclJvb20gaW4gQHJvb21zIHdoZW4gb3RoZXJSb29tLmNvbGxpZGVzV2l0aChyb29tKVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAjIEdlbmVyYXRlIGEgZGVlcCBjbG9uZSBvZiB0aGlzIHN0YXRlXHJcbiAgY2xvbmU6IC0+XHJcbiAgICBuZXdJbnN0YW5jZSA9IG5ldyBTdGF0ZShcclxuICAgICAgcm9vbS5jbG9uZSgpIGZvciByb29tIGluIEByb29tcyxcclxuICAgICAgcm9vbS5jbG9uZSgpIGZvciByb29tIGluIEBmcm9udGllclxyXG4gICAgKVxyXG4gICAgbmV3SW5zdGFuY2UuY29sbGlzaW9uTWFwID0gQGNvbGxpc2lvbk1hcC5jbG9uZSgpIGlmIEBjb2xsaXNpb25NYXA/XHJcbiAgICByZXR1cm4gbmV3SW5zdGFuY2VcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4jIyNcclxuICBUaGlzIGNsYXNzIHdpbGwgcHJvdmlkZSBmdW5jdGlvbnMgdG8gZ2VuZXJhdGUgY29udGVudCByYW5kb21seSBiYXNlZCBvblxyXG4gIHRoZSBnaXZlbiBwcm9wZXJ0aWVzLlxyXG4jIyNcclxuXHJcbmNsYXNzIEdlbmVyYXRvclxyXG5cclxuICBjb25zdHJ1Y3RvcjogKG51bWJlck9mUm9vbXMsIHByb3BlcnRpZXMpIC0+XHJcbiAgICBAcmVtYWluaW5nUm9vbXMgPSBudW1iZXJPZlJvb21zXHJcbiAgICBAbWluUm9vbVNpemUgPSBwcm9wZXJ0aWVzLm1pblJvb21TaXplID8gRGVmYXVsdHMuTUlOX1JPT01fU0laRVxyXG4gICAgQG1heFJvb21TaXplID0gcHJvcGVydGllcy5tYXhSb29tU2l6ZSA/IERlZmF1bHRzLk1BWF9ST09NX1NJWkVcclxuICAgIEBtaW5Sb29tQXJlYSA9IHByb3BlcnRpZXMubWluUm9vbUFyZWEgPyBAbWluUm9vbVNpemUgKiogMlxyXG4gICAgQG1heFJvb21BcmVhID0gcHJvcGVydGllcy5tYXhSb29tQXJlYSA/IEBtYXhSb29tU2l6ZSAqKiAyXHJcbiAgICBAcmF0aW9SZXN0ciAgPSBwcm9wZXJ0aWVzLnJhdGlvUmVzdHJpY3Rpb24gPyAwXHJcbiAgICBAbWFwV2lkdGggPSBwcm9wZXJ0aWVzLndpZHRoID8gQG1heFJvb21TaXplICogbnVtYmVyT2ZSb29tc1xyXG4gICAgQG1hcEhlaWdodCA9IHByb3BlcnRpZXMuaGVpZ2h0ID8gQG1heFJvb21TaXplICogbnVtYmVyT2ZSb29tc1xyXG4gICAgQGluaXRpYWxSb29tV2lkdGggPSBwcm9wZXJ0aWVzLmluaXRpYWxSb29tV2lkdGggPyBEZWZhdWx0cy5JTklUSUFMX1JPT01fV0lEVEhcclxuICAgIEBpbml0aWFsUm9vbUhlaWdodCA9IHByb3BlcnRpZXMuaW5pdGlhbFJvb21IZWlnaHQgPyBEZWZhdWx0cy5JTklUSUFMX1JPT01fSEVJR0hUXHJcblxyXG4gIGdlbmVyYXRlSW5pdGlhbFJvb206IC0+XHJcbiAgICB4ID0gcmFuZG9tLnZhbHVlKEBtYXBXaWR0aCAqIDAuMzAsIEBtYXBXaWR0aCAqIDAuNzApXHJcbiAgICB5ID0gcmFuZG9tLnZhbHVlKEBtYXBIZWlnaHQgKiAwLjMwLCBAbWFwSGVpZ2h0ICogMC43MClcclxuICAgIG5ldyBSb29tKHgsIHksIEBpbml0aWFsUm9vbVdpZHRoLCBAaW5pdGlhbFJvb21IZWlnaHQsIDApXHJcblxyXG4gIGdlbmVyYXRlSW5pdGlhbFN0YXRlOiAtPlxyXG4gICAgbmV3IFN0YXRlKFtdLCBbXSwgQG1hcFdpZHRoLCBAbWFwSGVpZ2h0KVxyXG5cclxuICBnZW5lcmF0ZU5laWdoYm91cjogKHJvb20sIGRvb3IsIHN0YXRlKSAtPlxyXG4gICAgY2FuZGlkYXRlcyA9IEBnZW5lcmF0ZVBvc3NpYmxlTmVpZ2hib3Vycyhyb29tLCBkb29yLCBzdGF0ZSlcclxuICAgIGlmIGNhbmRpZGF0ZXMubGVuZ3RoID4gMCBhbmQgcmFuZG9tLnRlc3QoZ2V0U3Bhd25DaGFuY2Uoc3RhdGUpKVxyXG4gICAgICAjIEdyb3VwIGNhbmRpZGF0ZXMgYnkgYXJlYVxyXG4gICAgICBhdmFpbGFibGVBcmVhcyA9IFtdXHJcbiAgICAgIGNhbmRpZGF0ZXNHcm91cGVkID0gW11cclxuICAgICAgZm9yIHJvb20gaW4gY2FuZGlkYXRlc1xyXG4gICAgICAgIHVubGVzcyByb29tLmdldEFyZWEoKSBpbiBhdmFpbGFibGVBcmVhc1xyXG4gICAgICAgICAgYXZhaWxhYmxlQXJlYXMucHVzaChyb29tLmdldEFyZWEoKSlcclxuICAgICAgICAgIGNhbmRpZGF0ZXNHcm91cGVkW2F2YWlsYWJsZUFyZWFzLmluZGV4T2Yocm9vbS5nZXRBcmVhKCkpXSA9IFtdXHJcbiAgICAgICAgY2FuZGlkYXRlc0dyb3VwZWRbYXZhaWxhYmxlQXJlYXMuaW5kZXhPZihyb29tLmdldEFyZWEoKSldLnB1c2gocm9vbSlcclxuICAgICAgIyBSYW5kb21seSBzZWxlY3QgY2FuZGlkYXRlXHJcbiAgICAgIHNlbGVjdGVkR3JvdXAgPSBjYW5kaWRhdGVzR3JvdXBlZFtyYW5kb20udmFsdWUoMCwgY2FuZGlkYXRlc0dyb3VwZWQubGVuZ3RoKV1cclxuICAgICAgc2VsZWN0ZWRHcm91cFtyYW5kb20udmFsdWUoMCwgc2VsZWN0ZWRHcm91cC5sZW5ndGgpXVxyXG5cclxuICBnZW5lcmF0ZVBvc3NpYmxlTmVpZ2hib3VyczogKHJvb20sIGRvb3IsIHN0YXRlKSAtPlxyXG4gICAgY2FuZGlkYXRlcyA9IFtdXHJcbiAgICAjIEdlbmVyYXRlIHJvb21zIGZvciBhbGwgdGhlIHBvc3NpYmxlIHNpemVzXHJcbiAgICBmb3IgaGVpZ2h0IGluIFtAbWluUm9vbVNpemUuLkBtYXhSb29tU2l6ZV1cclxuICAgICAgZm9yIHdpZHRoIGluIFtAbWluUm9vbVNpemUuLkBtYXhSb29tU2l6ZV0gd2hlbiBAdmFsaWRNZWFzdXJlcyh3aWR0aCwgaGVpZ2h0KVxyXG4gICAgICAgICMgSXRlcmF0ZSBhbGwgb3ZlciB0aGUgcG9zc2libGUgcG9zaXRpb25zIHRoZSByb29tIGNvdWxkIGJlXHJcbiAgICAgICAgb2Zmc2V0TWF4ID0gaWYgZG9vciAlIDIgaXMgMCB0aGVuIHdpZHRoIGVsc2UgaGVpZ2h0XHJcbiAgICAgICAgZm9yIG9mZnNldCBpbiBbMSAtIG9mZnNldE1heC4uMF1cclxuICAgICAgICAgICMgQ2FsY3VsYXRlIGNhbmRpZGF0ZSdzIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICBbeCwgeV0gPSBzd2l0Y2ggZG9vciAlIDRcclxuICAgICAgICAgICAgd2hlbiBEaXJlY3Rpb24uTk9SVEhcclxuICAgICAgICAgICAgICBbcm9vbS54ICsgZG9vciAvLyA0ICsgb2Zmc2V0LCByb29tLnkgLSBoZWlnaHRdXHJcbiAgICAgICAgICAgIHdoZW4gRGlyZWN0aW9uLlNPVVRIXHJcbiAgICAgICAgICAgICAgW3Jvb20ueCArIGRvb3IgLy8gNCArIG9mZnNldCwgcm9vbS55ICsgcm9vbS5oZWlnaHRdXHJcbiAgICAgICAgICAgIHdoZW4gRGlyZWN0aW9uLkVBU1RcclxuICAgICAgICAgICAgICBbcm9vbS54ICsgcm9vbS53aWR0aCwgcm9vbS55ICsgZG9vciAvLyA0ICsgb2Zmc2V0XVxyXG4gICAgICAgICAgICB3aGVuIERpcmVjdGlvbi5XRVNUXHJcbiAgICAgICAgICAgICAgW3Jvb20ueCAtIHdpZHRoLCByb29tLnkgKyBkb29yIC8vIDQgKyBvZmZzZXRdXHJcbiAgICAgICAgICAjIEdlbmVyYXRlIHRoZSBjYW5kaWRhdGVcclxuICAgICAgICAgIGNhbmRpZGF0ZSA9IG5ldyBSb29tKHgsIHksIHdpZHRoLCBoZWlnaHQsIHN0YXRlLmdldFN0ZXBzKCkgKyAxKVxyXG4gICAgICAgICAgIyBBZGQgcm9vbSB0byBjYW5kaWRhdGUncyBuZWlnaGJvdXJzXHJcbiAgICAgICAgICBkb29yT25OZWlnaGJvdXIgPSA0ICogb2Zmc2V0ICogKC0xKSArIGdldE9wcG9zaXRlRGlyZWN0aW9uKGRvb3IpXHJcbiAgICAgICAgICBjYW5kaWRhdGUubmVpZ2hib3Vyc1tkb29yT25OZWlnaGJvdXJdID0gcm9vbS5pZFxyXG4gICAgICAgICAgIyBBZGQgdGhlIGRvb3IgdG8gdGhlIGNhbmRpZGF0ZXMgaWYgaXQgZG9lc24ndCBjb2xsaWRlIHdpdGggYW55dGhpbmdcclxuICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaChjYW5kaWRhdGUpIGlmIHN0YXRlLmhhc1Jvb21Gb3IoY2FuZGlkYXRlKVxyXG4gICAgcmV0dXJuIGNhbmRpZGF0ZXNcclxuXHJcbiAgdmFsaWRNZWFzdXJlczogKHdpZHRoLCBoZWlnaHQpIC0+IGhlaWdodCAqIHdpZHRoIDw9IEBtYXhSb29tQXJlYSBhbmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ICogd2lkdGggPj0gQG1pblJvb21BcmVhIGFuZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCAvIGhlaWdodCA+PSBAcmF0aW9SZXN0ciBhbmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IC8gd2lkdGggPj0gQHJhdGlvUmVzdHJcclxuXHJcbiAgIyBQUklWQVRFIEhFTFBFUlNcclxuICBnZXRPcHBvc2l0ZURpcmVjdGlvbiA9IChkb29yKSAtPiAoKGRvb3IgJSA0KSArIDIpICUgNFxyXG4gIGdldFNwYXduQ2hhbmNlID0gKHN0YXRlKSAtPlxyXG4gICAgaWYgc3RhdGUuZnJvbnRpZXIubGVuZ3RoIGlzIDAgdGhlbiAxMDAgZWxzZSA3NVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiMjI1xyXG4gIFRoaXMgaXMgdGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBnZW5lcmF0ZSB0aGUgbWFwLiBJdCB0YWtlcyBhIHdpZHRoLCBhIGhlaWdodCxcclxuICB0aGUgbnVtYmVyIG9mIHJvb21zIHRvIGdlbmVyYXRlLCB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2VuZXJhdG9yIGFuZCBhXHJcbiAgY2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgb24gZWFjaCBzdGVwLlxyXG4jIyNcclxuXHJcbmdlbmVyYXRlID0gKG51bWJlck9mUm9vbXMsIHByb3BlcnRpZXMsIG9uU3RlcENhbGxiYWNrKSAtPlxyXG5cclxuICAjIEluaXRpYWxpemUgZ2VuZXJhdG9yXHJcbiAgZ2VuZXJhdG9yID0gbmV3IEdlbmVyYXRvcihudW1iZXJPZlJvb21zLCBwcm9wZXJ0aWVzKVxyXG5cclxuICAjIEdlbmVyYXRlIGluaXRpYWwgc3RhdGVcclxuICBpbml0aWFsUm9vbSA9IGdlbmVyYXRvci5nZW5lcmF0ZUluaXRpYWxSb29tKClcclxuICBzdGF0ZSA9IGdlbmVyYXRvci5nZW5lcmF0ZUluaXRpYWxTdGF0ZSgpXHJcbiAgc3RhdGUuYWRkUm9vbShpbml0aWFsUm9vbSlcclxuICByZW1haW5pbmdSb29tcyA9IG51bWJlck9mUm9vbXMgLSAxICAjIFRha2UgaW5pdGlhbCByb29tXHJcbiAgb25TdGVwQ2FsbGJhY2sob2J0YWluTWFwKHN0YXRlLmNsb25lKCkpLCBzdGF0ZS5nZXRTdGVwcygpKSBpZiBvblN0ZXBDYWxsYmFjaz9cclxuXHJcbiAgIyBHZW5lcmF0ZSByb29tcyByYW5kb21seVxyXG4gIHdoaWxlIHJlbWFpbmluZ1Jvb21zID4gMCBhbmQgc3RhdGUuZnJvbnRpZXIubGVuZ3RoID4gMFxyXG4gICAgcm9vbSA9IHN0YXRlLmZyb250aWVyLnNoaWZ0KClcclxuICAgIGZvciBkb29yIGluIHJhbmRvbS5zaHVmZmxlKHJvb20uZ2V0QXZhaWxhYmxlRXhpdHMoKSkgd2hlbiByZW1haW5pbmdSb29tcyA+IDBcclxuICAgICAgIyBDb3B5IHRoZSBvYmplY3RzIGFuZCB1cGRhdGUgcmVmZXJlbmNlcyBvbiBlYWNoIHN0ZXBcclxuICAgICAgc3RhdGUgPSBzdGF0ZS5jbG9uZSgpXHJcbiAgICAgIHJvb20gPSBzdGF0ZS5yb29tc1tyb29tLmlkXVxyXG4gICAgICAjIEdlbmVyYXRlIG5ldyByb29tXHJcbiAgICAgIG5ld1Jvb20gPSBnZW5lcmF0b3IuZ2VuZXJhdGVOZWlnaGJvdXIocm9vbSwgZG9vciwgc3RhdGUpXHJcbiAgICAgIGlmIG5ld1Jvb20/XHJcbiAgICAgICAgcm9vbS5uZWlnaGJvdXJzW2Rvb3JdID0gbmV3Um9vbS5pZFxyXG4gICAgICAgIHN0YXRlLmFkZFJvb20obmV3Um9vbSlcclxuICAgICAgICByZW1haW5pbmdSb29tcy0tXHJcbiAgICAgICAgb25TdGVwQ2FsbGJhY2sob2J0YWluTWFwKHN0YXRlLmNsb25lKCkpLCBzdGF0ZS5nZXRTdGVwcygpKSBpZiBvblN0ZXBDYWxsYmFjaz9cclxuXHJcbiAgcmV0dXJuIG9idGFpbk1hcChzdGF0ZSlcclxuXHJcblxyXG5vYnRhaW5NYXAgPSAoc3RhdGUpIC0+XHJcbiAgbmV3IE1hcChzdGF0ZS5jb2xsaXNpb25NYXAud2lkdGgsIHN0YXRlLmNvbGxpc2lvbk1hcC5oZWlnaHQsIHN0YXRlLnJvb21zKVxyXG5cclxuIyMjIEVYUE9SVCBGVU5DVElPTlMgIyMjXHJcbndpbmRvdy5nZW5lcmF0ZSA9IGdlbmVyYXRlXHJcbiJdfQ==