
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
  var getOppositeDirection;

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
    if (candidates.length > 0) {
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

//# sourceMappingURL=data:application/json;base64,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QUV6RSxLQUFBLEdBQVEsS0FBSyxDQUFDLEtBQU4sQ0FBQTtNQUNSLElBQUEsR0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLElBQUksQ0FBQyxFQUFMO01BRW5CLE9BQUEsR0FBVSxTQUFTLENBQUMsaUJBQVYsQ0FBNEIsSUFBNUIsRUFBa0MsSUFBbEMsRUFBd0MsS0FBeEM7TUFDVixJQUFHLGVBQUg7UUFDRSxJQUFJLENBQUMsVUFBVyxDQUFBLElBQUEsQ0FBaEIsR0FBd0IsT0FBTyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxPQUFOLENBQWMsT0FBZDtRQUNBLGNBQUE7UUFDQSxJQUE4RCxzQkFBOUQ7VUFBQSxjQUFBLENBQWUsU0FBQSxDQUFVLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBVixDQUFmLEVBQXlDLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBekMsRUFBQTtTQUpGOztBQU5GO0VBRkY7QUFjQSxTQUFPLFNBQUEsQ0FBVSxLQUFWO0FBM0JFOztBQThCWCxTQUFBLEdBQVksU0FBQyxLQUFEO1NBQ04sSUFBQSxHQUFBLENBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUF2QixFQUE4QixLQUFLLENBQUMsWUFBWSxDQUFDLE1BQWpELEVBQXlELEtBQUssQ0FBQyxLQUEvRDtBQURNOzs7QUFHWjs7QUFDQSxNQUFNLENBQUMsUUFBUCxHQUFrQiIsImZpbGUiOiJtb2RlbC9nZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4jICBUaGlzIGZpbGUgY29udGFpbnMgdGhlIGZ1bmN0aW9ucyB0byByYW5kb21seSBnZW5lcmF0ZSB0aGUgbWFwLlxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFRoaXMgYWxnb3J5dGhtIGdlbmVyYXRlcyBhIHJvb20gb24gYSByYW5kb20gcG9zaXRpb24gYW5kIHN0YXJ0cyBnZW5lcmF0aW5nXHJcbiMgdGhlIG5laWdoYm91cnMgZnJvbSB0aGVyZS4gU29tZSBleGFtcGxlcyBvZiBnZW5lcmF0ZWQgcm9vbXMgY2FuIGJlOlxyXG4jXHJcbiMgICArLS0tIDAgLS0tKyAgICstLS0gMCAtLS0rLS0tIDQgLS0tKyAgICstLS0gMCAtLS0rICAgKy0tLSAwIC0tLSstLS0gNCAtLS0rXHJcbiMgICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgfCAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8XHJcbiMgICAzICAgICAgICAgMSAgIDMgICAgICAgICAgICAgICAgICAgMSAgIDMgICAgICAgICAxICAgMyAgICAgICAgICAgICAgICAgICAxXHJcbiMgICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgfCAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8XHJcbiMgICArLS0tIDIgLS0tKyAgICstLS0gMiAtLS0rLS0tIDYgLS0tKyAgICsgICAgICAgICArICAgKyAgICAgICAgICsgICAgICAgICArXHJcbiMgICAgICgxIHggMSkgICAgICAgICAgICAoMiB4IDEpICAgICAgICAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8XHJcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDcgICAgICAgICA1ICAgNyAgICAgICAgICAgICAgICAgICA1XHJcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8XHJcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICstLS0gMiAtLS0rICAgKy0tLSAyIC0tLSstLS0gNiAtLS0rXHJcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDEgeCAyKSAgICAgICAgICAgICgyIHggMilcclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyAgQXV0aG9yOiBBZHJpYW4gTW9yZW5vXHJcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4jIyMgRGVmYXVsdCB2YWx1ZXMgZm9yIHRoZSBnZW5lcmF0b3IgIyMjXHJcbkRlZmF1bHRzID1cclxuICBNQVBfU0laRTogMTBcclxuICBOVU1CRVJfT0ZfUk9PTVM6IDE1XHJcbiAgVElMRVNfUEVSX1VOSVQ6IDNcclxuICBJTklUSUFMX1JPT01fV0lEVEg6IDFcclxuICBJTklUSUFMX1JPT01fSEVJR0hUOiAxXHJcbiAgTUlOX1JPT01fU0laRTogMVxyXG4gIE1BWF9ST09NX1NJWkU6IDJcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4jIyNcclxuICBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSByb29tIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSBtYXAuIEl0IGlzIGRlZmluZWQgYnlcclxuICB0d28gY29vcmRpbmF0ZXMgaW4gdGhlIHNwYWNlLCBhIHdpZHRoIGFuZCBhIGhlaWdodC4gSXQgY2FuIGFsc28gaGF2ZSBzb21lXHJcbiAgYXR0cmlidXRlcyBhbmQgc29tZSByZWZlcmVuY2VzIHRvIGl0cyBuZWlnaGJvdXJzLlxyXG4jIyNcclxuXHJcbmNsYXNzIFJvb21cclxuICBjb25zdHJ1Y3RvcjogKEB4LCBAeSwgQHdpZHRoLCBAaGVpZ2h0LCBAaWQsIEBhdHRycyA9IHt9LCBAbmVpZ2hib3VycyA9IFtdKSAtPlxyXG5cclxuICAjIFJldHVybiBhbiBhcnJheSB3aXRoIHRoZSBpbmRleGVzIG9mIGFsbCB0aGUgZXhpdHMgb2YgdGhlIHJvb21cclxuICBnZXRFeGl0czogKCkgLT4gW10uY29uY2F0KFxyXG4gICAgRGlyZWN0aW9uLk5PUlRIICsgKGkqNCkgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdLFxyXG4gICAgRGlyZWN0aW9uLlNPVVRIICsgKGkqNCkgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdLFxyXG4gICAgRGlyZWN0aW9uLkVBU1QgKyAoaSo0KSBmb3IgaSBpbiBbMC4uLkBoZWlnaHRdLFxyXG4gICAgRGlyZWN0aW9uLldFU1QgKyAoaSo0KSBmb3IgaSBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgKVxyXG5cclxuICAjIFJldHVybiBhbiBhcnJheSB3aXRoIHRoZSBpbmRleGVzIG9mIHVudXNlZCBleGl0cyBvZiB0aGUgcm9vbVxyXG4gIGdldEF2YWlsYWJsZUV4aXRzOiAoKSAtPiBkb29yIGZvciBkb29yIGluIEBnZXRFeGl0cygpIHdoZW4gbm90IEBuZWlnaGJvdXJzW2Rvb3JdP1xyXG5cclxuICAjIFJldHVybnMgdGhlIGFyZWEgb2YgdGhlIHJvb21cclxuICBnZXRBcmVhOiAtPiBAd2lkdGggKiBAaGVpZ2h0XHJcblxyXG4gICMgUmV0dXJuIHRydWUgaWYgZ2l2ZW4gcm9vbSBjb2xsaWRlcyB3aXRoIHRoaXMgcm9vbVxyXG4gIGNvbGxpZGVzV2l0aDogKHJvb20pIC0+XHJcbiAgICBub3QgKEB4ID4gcm9vbS54ICsgcm9vbS53aWR0aCBvciByb29tLnggPiBAeCArIEB3aWR0aCkgYW5kXHJcbiAgICBub3QgKEB5ID4gcm9vbS55ICsgcm9vbS5oZWlnaHQgb3Igcm9vbS55ID4gQHkgKyBAaGVpZ2h0KVxyXG5cclxuICAjIEdlbmVyYXRlIGEgZGVlcCBjb3B5IG9mIHRoaXMgcm9vbVxyXG4gIGNsb25lOiAtPlxyXG4gICAgYXR0cnNDbG9uZSA9IHt9XHJcbiAgICBhdHRyc0Nsb25lW2tleV0gPSB2YWx1ZSBmb3Iga2V5LCB2YWx1ZSBvZiBAYXR0cnNcclxuICAgIG5laWdoYm91cnNDbG9uZSA9IChuZWlnaGJvdXIgZm9yIG5laWdoYm91ciBpbiBAbmVpZ2hib3VycylcclxuICAgIG5ldyBSb29tKEB4LCBAeSwgQHdpZHRoLCBAaGVpZ2h0LCBAaWQsIGF0dHJzQ2xvbmUsIG5laWdoYm91cnNDbG9uZSlcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4jIyNcclxuICBUaGlzIGNsYXNzIHJlcHJlc2VudHMgdGhlIHN0YXRlIG9mIHRoZSBnZW5lcmF0b3Igb24gYSBnaXZlbiBtb21lbnQuIEl0XHJcbiAgY29udGFpbnMgYSBsaXN0IHdpdGggdGhlIHJvb21zIHRoYXQgaGF2ZSBiZWVuIGdlbmVyYXRlZCwgYSBsaXN0IHdpdGggdGhlXHJcbiAgcm9vbXMgdGhhdCBhcmUgd2FpdGluZyB0byBiZSBleHBhbmRlZCBhbmQgYSB0aWxlIG1hcCB0aGF0IHJlcHJlc2VudHMgdGhlXHJcbiAgY3VycmVudCBkaXN0cmlidXRpb24gb2YgdGhlIHJvb21zXHJcbiMjI1xyXG5cclxuY2xhc3MgU3RhdGVcclxuXHJcbiAgY29uc3RydWN0b3I6IChAcm9vbXMgPSBbXSwgQGZyb250aWVyID0gW10sIHdpZHRoLCBoZWlnaHQpIC0+XHJcbiAgICBpZiB3aWR0aD8gYW5kIGhlaWdodD8gdGhlbiBAY29sbGlzaW9uTWFwID0gbmV3IFRpbGVtYXAod2lkdGgsIGhlaWdodCwgZmFsc2UpXHJcblxyXG4gICMgUmV0dXJuIHRoZSBudW1iZXIgb2Ygc3RlcHMgZ2l2ZW4gdW50aWwgdGhpcyBzdGF0ZVxyXG4gIGdldFN0ZXBzOiAtPiBAcm9vbXMubGVuZ3RoIC0gMVxyXG5cclxuICAjIEFkZCBhIG5ldyByb29tIHRvIHRoaXMgc3RhdGVcclxuICBhZGRSb29tOiAocm9vbSkgLT5cclxuICAgIEByb29tcy5wdXNoKHJvb20pXHJcbiAgICBAZnJvbnRpZXIucHVzaChyb29tKVxyXG4gICAgQGNvbGxpc2lvbk1hcC5zZXQocm9vbS54LCByb29tLnksIHJvb20ud2lkdGgsIHJvb20uaGVpZ2h0LCB0cnVlKSBpZiBAY29sbGlzaW9uTWFwP1xyXG5cclxuICAjIENoZWNrcyBpZiBhIHJvb20gY2FuIGJlIGFkZGVkIHdpdGhvdXQgY29sbGlkaW5nIHdpdGggZXhpc3Rpbmcgcm9vbXNcclxuICBoYXNSb29tRm9yOiAocm9vbSkgLT5cclxuICAgIGlmIEBjb2xsaXNpb25NYXA/XHJcbiAgICAgIHJldHVybiBAY29sbGlzaW9uTWFwLmlzKHJvb20ueCwgcm9vbS55LCByb29tLndpZHRoLCByb29tLmhlaWdodCwgZmFsc2UpXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiBmYWxzZSBmb3Igb3RoZXJSb29tIGluIEByb29tcyB3aGVuIG90aGVyUm9vbS5jb2xsaWRlc1dpdGgocm9vbSlcclxuICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgIyBHZW5lcmF0ZSBhIGRlZXAgY2xvbmUgb2YgdGhpcyBzdGF0ZVxyXG4gIGNsb25lOiAtPlxyXG4gICAgbmV3SW5zdGFuY2UgPSBuZXcgU3RhdGUoXHJcbiAgICAgIHJvb20uY2xvbmUoKSBmb3Igcm9vbSBpbiBAcm9vbXMsXHJcbiAgICAgIHJvb20uY2xvbmUoKSBmb3Igcm9vbSBpbiBAZnJvbnRpZXJcclxuICAgIClcclxuICAgIG5ld0luc3RhbmNlLmNvbGxpc2lvbk1hcCA9IEBjb2xsaXNpb25NYXAuY2xvbmUoKSBpZiBAY29sbGlzaW9uTWFwP1xyXG4gICAgcmV0dXJuIG5ld0luc3RhbmNlXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyMjXHJcbiAgVGhpcyBjbGFzcyB3aWxsIHByb3ZpZGUgZnVuY3Rpb25zIHRvIGdlbmVyYXRlIGNvbnRlbnQgcmFuZG9tbHkgYmFzZWQgb25cclxuICB0aGUgZ2l2ZW4gcHJvcGVydGllcy5cclxuIyMjXHJcblxyXG5jbGFzcyBHZW5lcmF0b3JcclxuXHJcbiAgY29uc3RydWN0b3I6IChudW1iZXJPZlJvb21zLCBwcm9wZXJ0aWVzKSAtPlxyXG4gICAgQHJlbWFpbmluZ1Jvb21zID0gbnVtYmVyT2ZSb29tc1xyXG4gICAgQG1pblJvb21TaXplID0gcHJvcGVydGllcy5taW5Sb29tU2l6ZSA/IERlZmF1bHRzLk1JTl9ST09NX1NJWkVcclxuICAgIEBtYXhSb29tU2l6ZSA9IHByb3BlcnRpZXMubWF4Um9vbVNpemUgPyBEZWZhdWx0cy5NQVhfUk9PTV9TSVpFXHJcbiAgICBAbWluUm9vbUFyZWEgPSBwcm9wZXJ0aWVzLm1pblJvb21BcmVhID8gQG1pblJvb21TaXplICoqIDJcclxuICAgIEBtYXhSb29tQXJlYSA9IHByb3BlcnRpZXMubWF4Um9vbUFyZWEgPyBAbWF4Um9vbVNpemUgKiogMlxyXG4gICAgQHJhdGlvUmVzdHIgID0gcHJvcGVydGllcy5yYXRpb1Jlc3RyaWN0aW9uID8gMFxyXG4gICAgQG1hcFdpZHRoID0gcHJvcGVydGllcy53aWR0aCA/IEBtYXhSb29tU2l6ZSAqIG51bWJlck9mUm9vbXNcclxuICAgIEBtYXBIZWlnaHQgPSBwcm9wZXJ0aWVzLmhlaWdodCA/IEBtYXhSb29tU2l6ZSAqIG51bWJlck9mUm9vbXNcclxuICAgIEBpbml0aWFsUm9vbVdpZHRoID0gcHJvcGVydGllcy5pbml0aWFsUm9vbVdpZHRoID8gRGVmYXVsdHMuSU5JVElBTF9ST09NX1dJRFRIXHJcbiAgICBAaW5pdGlhbFJvb21IZWlnaHQgPSBwcm9wZXJ0aWVzLmluaXRpYWxSb29tSGVpZ2h0ID8gRGVmYXVsdHMuSU5JVElBTF9ST09NX0hFSUdIVFxyXG5cclxuICBnZW5lcmF0ZUluaXRpYWxSb29tOiAtPlxyXG4gICAgeCA9IHJhbmRvbS52YWx1ZShAbWFwV2lkdGggKiAwLjMwLCBAbWFwV2lkdGggKiAwLjcwKVxyXG4gICAgeSA9IHJhbmRvbS52YWx1ZShAbWFwSGVpZ2h0ICogMC4zMCwgQG1hcEhlaWdodCAqIDAuNzApXHJcbiAgICBuZXcgUm9vbSh4LCB5LCBAaW5pdGlhbFJvb21XaWR0aCwgQGluaXRpYWxSb29tSGVpZ2h0LCAwKVxyXG5cclxuICBnZW5lcmF0ZUluaXRpYWxTdGF0ZTogLT5cclxuICAgIG5ldyBTdGF0ZShbXSwgW10sIEBtYXBXaWR0aCwgQG1hcEhlaWdodClcclxuXHJcbiAgZ2VuZXJhdGVOZWlnaGJvdXI6IChyb29tLCBkb29yLCBzdGF0ZSkgLT5cclxuICAgIGNhbmRpZGF0ZXMgPSBAZ2VuZXJhdGVQb3NzaWJsZU5laWdoYm91cnMocm9vbSwgZG9vciwgc3RhdGUpXHJcbiAgICBpZiBjYW5kaWRhdGVzLmxlbmd0aCA+IDBcclxuICAgICAgIyBHcm91cCBjYW5kaWRhdGVzIGJ5IGFyZWFcclxuICAgICAgYXZhaWxhYmxlQXJlYXMgPSBbXVxyXG4gICAgICBjYW5kaWRhdGVzR3JvdXBlZCA9IFtdXHJcbiAgICAgIGZvciByb29tIGluIGNhbmRpZGF0ZXNcclxuICAgICAgICB1bmxlc3Mgcm9vbS5nZXRBcmVhKCkgaW4gYXZhaWxhYmxlQXJlYXNcclxuICAgICAgICAgIGF2YWlsYWJsZUFyZWFzLnB1c2gocm9vbS5nZXRBcmVhKCkpXHJcbiAgICAgICAgICBjYW5kaWRhdGVzR3JvdXBlZFthdmFpbGFibGVBcmVhcy5pbmRleE9mKHJvb20uZ2V0QXJlYSgpKV0gPSBbXVxyXG4gICAgICAgIGNhbmRpZGF0ZXNHcm91cGVkW2F2YWlsYWJsZUFyZWFzLmluZGV4T2Yocm9vbS5nZXRBcmVhKCkpXS5wdXNoKHJvb20pXHJcbiAgICAgICMgUmFuZG9tbHkgc2VsZWN0IGNhbmRpZGF0ZVxyXG4gICAgICBzZWxlY3RlZEdyb3VwID0gY2FuZGlkYXRlc0dyb3VwZWRbcmFuZG9tLnZhbHVlKDAsIGNhbmRpZGF0ZXNHcm91cGVkLmxlbmd0aCldXHJcbiAgICAgIHNlbGVjdGVkR3JvdXBbcmFuZG9tLnZhbHVlKDAsIHNlbGVjdGVkR3JvdXAubGVuZ3RoKV1cclxuXHJcbiAgZ2VuZXJhdGVQb3NzaWJsZU5laWdoYm91cnM6IChyb29tLCBkb29yLCBzdGF0ZSkgLT5cclxuICAgIGNhbmRpZGF0ZXMgPSBbXVxyXG4gICAgIyBHZW5lcmF0ZSByb29tcyBmb3IgYWxsIHRoZSBwb3NzaWJsZSBzaXplc1xyXG4gICAgZm9yIGhlaWdodCBpbiBbQG1pblJvb21TaXplLi5AbWF4Um9vbVNpemVdXHJcbiAgICAgIGZvciB3aWR0aCBpbiBbQG1pblJvb21TaXplLi5AbWF4Um9vbVNpemVdIHdoZW4gQHZhbGlkTWVhc3VyZXMod2lkdGgsIGhlaWdodClcclxuICAgICAgICAjIEl0ZXJhdGUgYWxsIG92ZXIgdGhlIHBvc3NpYmxlIHBvc2l0aW9ucyB0aGUgcm9vbSBjb3VsZCBiZVxyXG4gICAgICAgIG9mZnNldE1heCA9IGlmIGRvb3IgJSAyIGlzIDAgdGhlbiB3aWR0aCBlbHNlIGhlaWdodFxyXG4gICAgICAgIGZvciBvZmZzZXQgaW4gWzEgLSBvZmZzZXRNYXguLjBdXHJcbiAgICAgICAgICAjIENhbGN1bGF0ZSBjYW5kaWRhdGUncyBjb29yZGluYXRlc1xyXG4gICAgICAgICAgW3gsIHldID0gc3dpdGNoIGRvb3IgJSA0XHJcbiAgICAgICAgICAgIHdoZW4gRGlyZWN0aW9uLk5PUlRIXHJcbiAgICAgICAgICAgICAgW3Jvb20ueCArIGRvb3IgLy8gNCArIG9mZnNldCwgcm9vbS55IC0gaGVpZ2h0XVxyXG4gICAgICAgICAgICB3aGVuIERpcmVjdGlvbi5TT1VUSFxyXG4gICAgICAgICAgICAgIFtyb29tLnggKyBkb29yIC8vIDQgKyBvZmZzZXQsIHJvb20ueSArIHJvb20uaGVpZ2h0XVxyXG4gICAgICAgICAgICB3aGVuIERpcmVjdGlvbi5FQVNUXHJcbiAgICAgICAgICAgICAgW3Jvb20ueCArIHJvb20ud2lkdGgsIHJvb20ueSArIGRvb3IgLy8gNCArIG9mZnNldF1cclxuICAgICAgICAgICAgd2hlbiBEaXJlY3Rpb24uV0VTVFxyXG4gICAgICAgICAgICAgIFtyb29tLnggLSB3aWR0aCwgcm9vbS55ICsgZG9vciAvLyA0ICsgb2Zmc2V0XVxyXG4gICAgICAgICAgIyBHZW5lcmF0ZSB0aGUgY2FuZGlkYXRlXHJcbiAgICAgICAgICBjYW5kaWRhdGUgPSBuZXcgUm9vbSh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBzdGF0ZS5nZXRTdGVwcygpICsgMSlcclxuICAgICAgICAgICMgQWRkIHJvb20gdG8gY2FuZGlkYXRlJ3MgbmVpZ2hib3Vyc1xyXG4gICAgICAgICAgZG9vck9uTmVpZ2hib3VyID0gNCAqIG9mZnNldCAqICgtMSkgKyBnZXRPcHBvc2l0ZURpcmVjdGlvbihkb29yKVxyXG4gICAgICAgICAgY2FuZGlkYXRlLm5laWdoYm91cnNbZG9vck9uTmVpZ2hib3VyXSA9IHJvb20uaWRcclxuICAgICAgICAgICMgQWRkIHRoZSBkb29yIHRvIHRoZSBjYW5kaWRhdGVzIGlmIGl0IGRvZXNuJ3QgY29sbGlkZSB3aXRoIGFueXRoaW5nXHJcbiAgICAgICAgICBjYW5kaWRhdGVzLnB1c2goY2FuZGlkYXRlKSBpZiBzdGF0ZS5oYXNSb29tRm9yKGNhbmRpZGF0ZSlcclxuICAgIHJldHVybiBjYW5kaWRhdGVzXHJcblxyXG4gIHZhbGlkTWVhc3VyZXM6ICh3aWR0aCwgaGVpZ2h0KSAtPiBoZWlnaHQgKiB3aWR0aCA8PSBAbWF4Um9vbUFyZWEgYW5kXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCAqIHdpZHRoID49IEBtaW5Sb29tQXJlYSBhbmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGggLyBoZWlnaHQgPj0gQHJhdGlvUmVzdHIgYW5kXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCAvIHdpZHRoID49IEByYXRpb1Jlc3RyXHJcblxyXG4gICMgUFJJVkFURSBIRUxQRVJTXHJcbiAgZ2V0T3Bwb3NpdGVEaXJlY3Rpb24gPSAoZG9vcikgLT4gKChkb29yICUgNCkgKyAyKSAlIDRcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4jIyNcclxuICBUaGlzIGlzIHRoZSBmdW5jdGlvbiB0aGF0IHdpbGwgZ2VuZXJhdGUgdGhlIG1hcC4gSXQgdGFrZXMgYSB3aWR0aCwgYSBoZWlnaHQsXHJcbiAgdGhlIG51bWJlciBvZiByb29tcyB0byBnZW5lcmF0ZSwgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdlbmVyYXRvciBhbmQgYVxyXG4gIGNhbGxiYWNrIHRvIGJlIGV4ZWN1dGVkIG9uIGVhY2ggc3RlcC5cclxuIyMjXHJcblxyXG5nZW5lcmF0ZSA9IChudW1iZXJPZlJvb21zLCBwcm9wZXJ0aWVzLCBvblN0ZXBDYWxsYmFjaykgLT5cclxuXHJcbiAgIyBJbml0aWFsaXplIGdlbmVyYXRvclxyXG4gIGdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3IobnVtYmVyT2ZSb29tcywgcHJvcGVydGllcylcclxuXHJcbiAgIyBHZW5lcmF0ZSBpbml0aWFsIHN0YXRlXHJcbiAgaW5pdGlhbFJvb20gPSBnZW5lcmF0b3IuZ2VuZXJhdGVJbml0aWFsUm9vbSgpXHJcbiAgc3RhdGUgPSBnZW5lcmF0b3IuZ2VuZXJhdGVJbml0aWFsU3RhdGUoKVxyXG4gIHN0YXRlLmFkZFJvb20oaW5pdGlhbFJvb20pXHJcbiAgcmVtYWluaW5nUm9vbXMgPSBudW1iZXJPZlJvb21zIC0gMSAgIyBUYWtlIGluaXRpYWwgcm9vbVxyXG4gIG9uU3RlcENhbGxiYWNrKG9idGFpbk1hcChzdGF0ZS5jbG9uZSgpKSwgc3RhdGUuZ2V0U3RlcHMoKSkgaWYgb25TdGVwQ2FsbGJhY2s/XHJcblxyXG4gICMgR2VuZXJhdGUgcm9vbXMgcmFuZG9tbHlcclxuICB3aGlsZSByZW1haW5pbmdSb29tcyA+IDAgYW5kIHN0YXRlLmZyb250aWVyLmxlbmd0aCA+IDBcclxuICAgIHJvb20gPSBzdGF0ZS5mcm9udGllci5zaGlmdCgpXHJcbiAgICBmb3IgZG9vciBpbiByYW5kb20uc2h1ZmZsZShyb29tLmdldEF2YWlsYWJsZUV4aXRzKCkpIHdoZW4gcmVtYWluaW5nUm9vbXMgPiAwXHJcbiAgICAgICMgQ29weSB0aGUgb2JqZWN0cyBhbmQgdXBkYXRlIHJlZmVyZW5jZXMgb24gZWFjaCBzdGVwXHJcbiAgICAgIHN0YXRlID0gc3RhdGUuY2xvbmUoKVxyXG4gICAgICByb29tID0gc3RhdGUucm9vbXNbcm9vbS5pZF1cclxuICAgICAgIyBHZW5lcmF0ZSBuZXcgcm9vbVxyXG4gICAgICBuZXdSb29tID0gZ2VuZXJhdG9yLmdlbmVyYXRlTmVpZ2hib3VyKHJvb20sIGRvb3IsIHN0YXRlKVxyXG4gICAgICBpZiBuZXdSb29tP1xyXG4gICAgICAgIHJvb20ubmVpZ2hib3Vyc1tkb29yXSA9IG5ld1Jvb20uaWRcclxuICAgICAgICBzdGF0ZS5hZGRSb29tKG5ld1Jvb20pXHJcbiAgICAgICAgcmVtYWluaW5nUm9vbXMtLVxyXG4gICAgICAgIG9uU3RlcENhbGxiYWNrKG9idGFpbk1hcChzdGF0ZS5jbG9uZSgpKSwgc3RhdGUuZ2V0U3RlcHMoKSkgaWYgb25TdGVwQ2FsbGJhY2s/XHJcblxyXG4gIHJldHVybiBvYnRhaW5NYXAoc3RhdGUpXHJcblxyXG5cclxub2J0YWluTWFwID0gKHN0YXRlKSAtPlxyXG4gIG5ldyBNYXAoc3RhdGUuY29sbGlzaW9uTWFwLndpZHRoLCBzdGF0ZS5jb2xsaXNpb25NYXAuaGVpZ2h0LCBzdGF0ZS5yb29tcylcclxuXHJcbiMjIyBFWFBPUlQgRlVOQ1RJT05TICMjI1xyXG53aW5kb3cuZ2VuZXJhdGUgPSBnZW5lcmF0ZVxyXG4iXX0=