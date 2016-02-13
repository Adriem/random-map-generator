
/* Default values for the generator */
var Defaults, Generator, Room, State, generate, obtainMap;

Defaults = {
  MAP_SIZE: 10,
  NUMBER_OF_ROOMS: 15,
  TILES_PER_UNIT: 3,
  INITIAL_ROOM_WIDTH: 1,
  INITIAL_ROOM_HEIGHT: 1,
  MIN_ROOM_SIZE: 1,
  MAX_ROOM_SIZE: 2
};

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

  Room.prototype.clone = function() {
    var attrClone, key, neighbour, neighboursClone, ref, value;
    attrClone = {};
    ref = this.attrs;
    for (key in ref) {
      value = ref[key];
      attrClone[key] = value;
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
    return new Room(this.x, this.y, this.width, this.height, this.id, attrClone, neighboursClone);
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
  function State(rooms, frontier, collisionMap) {
    this.rooms = rooms != null ? rooms : [];
    this.frontier = frontier != null ? frontier : [];
    this.collisionMap = collisionMap != null ? collisionMap : new Tilemap(100, 100, false);
  }

  State.prototype.getSteps = function() {
    return this.rooms.length - 1;
  };

  State.prototype.addRoom = function(room) {
    this.rooms.push(room);
    this.frontier.push(room);
    return this.collisionMap.set(room.x, room.y, room.width, room.height, true);
  };

  State.prototype.hasRoomFor = function(room) {
    return this.collisionMap.is(room.x, room.y, room.width, room.height, false);
  };

  State.prototype.clone = function() {
    var room;
    return new State((function() {
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
    }).call(this), this.collisionMap.clone());
  };

  return State;

})();

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
    x = random.value(this.mapWidth * 0.20, this.mapWidth * 0.80);
    y = random.value(this.mapHeight * 0.20, this.mapHeight * 0.80);
    return new Room(x, y, this.initialRoomWidth, this.initialRoomHeight, 0);
  };

  Generator.prototype.generateInitialState = function() {
    return new State([], [], new Tilemap(this.mapWidth, this.mapHeight, false));
  };

  Generator.prototype.generateNeighbour = function(room, door, state) {
    var candidates;
    candidates = this.generatePossibleNeighbours(room, door, state);
    if (candidates.length > 0) {
      return candidates[random.value(0, candidates.length)];
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
  state = generator.generateInitialState();
  initialRoom = generator.generateInitialRoom();
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

this.generate = generate;

//# sourceMappingURL=data:application/json;base64,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QyxVQUFXLENBQUEsSUFBQSxDQUFoQixHQUF3QixPQUFPLENBQUM7UUFDaEMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFkO1FBQ0EsY0FBQTtRQUNBLElBQThELHNCQUE5RDtVQUFBLGNBQUEsQ0FBZSxTQUFBLENBQVUsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFWLENBQWYsRUFBeUMsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUF6QyxFQUFBO1NBSkY7O0FBTkY7RUFGRjtBQWNBLFNBQU8sU0FBQSxDQUFVLEtBQVY7QUEzQkU7O0FBOEJYLFNBQUEsR0FBWSxTQUFDLEtBQUQ7U0FDTixJQUFBLEdBQUEsQ0FBSSxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQXZCLEVBQThCLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBakQsRUFBeUQsS0FBSyxDQUFDLEtBQS9EO0FBRE07OztBQUdaOztBQUNBLElBQUksQ0FBQyxRQUFMLEdBQWdCIiwiZmlsZSI6Im1vZGVsL2dlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiMgIFRoaXMgZmlsZSBjb250YWlucyB0aGUgZnVuY3Rpb25zIHRvIHJhbmRvbWx5IGdlbmVyYXRlIHRoZSBtYXAuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgIEF1dGhvcjogQWRyaWFuIE1vcmVub1xyXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuIyMjIERlZmF1bHQgdmFsdWVzIGZvciB0aGUgZ2VuZXJhdG9yICMjI1xyXG5EZWZhdWx0cyA9XHJcbiAgTUFQX1NJWkU6IDEwXHJcbiAgTlVNQkVSX09GX1JPT01TOiAxNVxyXG4gIFRJTEVTX1BFUl9VTklUOiAzXHJcbiAgSU5JVElBTF9ST09NX1dJRFRIOiAxXHJcbiAgSU5JVElBTF9ST09NX0hFSUdIVDogMVxyXG4gIE1JTl9ST09NX1NJWkU6IDFcclxuICBNQVhfUk9PTV9TSVpFOiAyXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuY2xhc3MgUm9vbVxyXG4gIGNvbnN0cnVjdG9yOiAoQHgsIEB5LCBAd2lkdGgsIEBoZWlnaHQsIEBpZCwgQGF0dHJzID0ge30sIEBuZWlnaGJvdXJzID0gW10pIC0+XHJcblxyXG4gICMgUmV0dXJuIGFuIGFycmF5IHdpdGggdGhlIGluZGV4ZXMgb2YgYWxsIHRoZSBleGl0cyBvZiB0aGUgcm9vbVxyXG4gIGdldEV4aXRzOiAoKSAtPiBbXS5jb25jYXQoXHJcbiAgICBEaXJlY3Rpb24uTk9SVEggKyAoaSo0KSBmb3IgaSBpbiBbMC4uLkB3aWR0aF0sXHJcbiAgICBEaXJlY3Rpb24uU09VVEggKyAoaSo0KSBmb3IgaSBpbiBbMC4uLkB3aWR0aF0sXHJcbiAgICBEaXJlY3Rpb24uRUFTVCArIChpKjQpIGZvciBpIGluIFswLi4uQGhlaWdodF0sXHJcbiAgICBEaXJlY3Rpb24uV0VTVCArIChpKjQpIGZvciBpIGluIFswLi4uQGhlaWdodF1cclxuICApXHJcblxyXG4gICMgUmV0dXJuIGFuIGFycmF5IHdpdGggdGhlIGluZGV4ZXMgb2YgdW51c2VkIGV4aXRzIG9mIHRoZSByb29tXHJcbiAgZ2V0QXZhaWxhYmxlRXhpdHM6ICgpIC0+IGRvb3IgZm9yIGRvb3IgaW4gQGdldEV4aXRzKCkgd2hlbiBub3QgQG5laWdoYm91cnNbZG9vcl0/XHJcblxyXG4gICMgR2VuZXJhdGUgYSBkZWVwIGNvcHkgb2YgdGhpcyByb29tXHJcbiAgY2xvbmU6IC0+XHJcbiAgICBhdHRyQ2xvbmUgPSB7fVxyXG4gICAgYXR0ckNsb25lW2tleV0gPSB2YWx1ZSBmb3Iga2V5LCB2YWx1ZSBvZiBAYXR0cnNcclxuICAgIG5laWdoYm91cnNDbG9uZSA9IChuZWlnaGJvdXIgZm9yIG5laWdoYm91ciBpbiBAbmVpZ2hib3VycylcclxuICAgIG5ldyBSb29tKEB4LCBAeSwgQHdpZHRoLCBAaGVpZ2h0LCBAaWQsIGF0dHJDbG9uZSwgbmVpZ2hib3Vyc0Nsb25lKVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiMjI1xyXG4gIFRoaXMgY2xhc3MgcmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgdGhlIGdlbmVyYXRvciBvbiBhIGdpdmVuIG1vbWVudC4gSXRcclxuICBjb250YWlucyBhIGxpc3Qgd2l0aCB0aGUgcm9vbXMgdGhhdCBoYXZlIGJlZW4gZ2VuZXJhdGVkLCBhIGxpc3Qgd2l0aCB0aGVcclxuICByb29tcyB0aGF0IGFyZSB3YWl0aW5nIHRvIGJlIGV4cGFuZGVkIGFuZCBhIHRpbGUgbWFwIHRoYXQgcmVwcmVzZW50cyB0aGVcclxuICBjdXJyZW50IGRpc3RyaWJ1dGlvbiBvZiB0aGUgcm9vbXNcclxuIyMjXHJcblxyXG5jbGFzcyBTdGF0ZVxyXG5cclxuICBjb25zdHJ1Y3RvcjogKEByb29tcyA9IFtdLCBAZnJvbnRpZXIgPSBbXSxcclxuICAgICAgICAgICAgICAgIEBjb2xsaXNpb25NYXAgPSBuZXcgVGlsZW1hcCgxMDAsIDEwMCwgZmFsc2UpKSAtPlxyXG5cclxuICAjIFJldHVybiB0aGUgbnVtYmVyIG9mIHN0ZXBzIGdpdmVuIHVudGlsIHRoaXMgc3RhdGVcclxuICBnZXRTdGVwczogLT4gQHJvb21zLmxlbmd0aCAtIDFcclxuXHJcbiAgIyBBZGQgYSBuZXcgcm9vbSB0byB0aGlzIHN0YXRlXHJcbiAgYWRkUm9vbTogKHJvb20pIC0+XHJcbiAgICBAcm9vbXMucHVzaChyb29tKVxyXG4gICAgQGZyb250aWVyLnB1c2gocm9vbSlcclxuICAgIEBjb2xsaXNpb25NYXAuc2V0KHJvb20ueCwgcm9vbS55LCByb29tLndpZHRoLCByb29tLmhlaWdodCwgdHJ1ZSlcclxuXHJcbiAgIyBDaGVja3MgaWYgYSByb29tIGNhbiBiZSBhZGRlZCB3aXRob3V0IGNvbGxpZGluZyB3aXRoIGV4aXN0aW5nIHJvb21zXHJcbiAgaGFzUm9vbUZvcjogKHJvb20pIC0+XHJcbiAgICBAY29sbGlzaW9uTWFwLmlzKHJvb20ueCwgcm9vbS55LCByb29tLndpZHRoLCByb29tLmhlaWdodCwgZmFsc2UpXHJcblxyXG4gICMgR2VuZXJhdGUgYSBkZWVwIGNsb25lIG9mIHRoaXMgc3RhdGVcclxuICBjbG9uZTogLT4gbmV3IFN0YXRlKFxyXG4gICAgcm9vbS5jbG9uZSgpIGZvciByb29tIGluIEByb29tcyxcclxuICAgIHJvb20uY2xvbmUoKSBmb3Igcm9vbSBpbiBAZnJvbnRpZXIsXHJcbiAgICBAY29sbGlzaW9uTWFwLmNsb25lKClcclxuICApXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuY2xhc3MgR2VuZXJhdG9yXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAobnVtYmVyT2ZSb29tcywgcHJvcGVydGllcykgLT5cclxuICAgIEByZW1haW5pbmdSb29tcyA9IG51bWJlck9mUm9vbXNcclxuICAgIEBtaW5Sb29tU2l6ZSA9IHByb3BlcnRpZXMubWluUm9vbVNpemUgPyBEZWZhdWx0cy5NSU5fUk9PTV9TSVpFXHJcbiAgICBAbWF4Um9vbVNpemUgPSBwcm9wZXJ0aWVzLm1heFJvb21TaXplID8gRGVmYXVsdHMuTUFYX1JPT01fU0laRVxyXG4gICAgQG1pblJvb21BcmVhID0gcHJvcGVydGllcy5taW5Sb29tQXJlYSA/IEBtaW5Sb29tU2l6ZSAqKiAyXHJcbiAgICBAbWF4Um9vbUFyZWEgPSBwcm9wZXJ0aWVzLm1heFJvb21BcmVhID8gQG1heFJvb21TaXplICoqIDJcclxuICAgIEByYXRpb1Jlc3RyICA9IHByb3BlcnRpZXMucmF0aW9SZXN0cmljdGlvbiA/IDBcclxuICAgIEBtYXBXaWR0aCA9IHByb3BlcnRpZXMud2lkdGggPyBAbWF4Um9vbVNpemUgKiBudW1iZXJPZlJvb21zXHJcbiAgICBAbWFwSGVpZ2h0ID0gcHJvcGVydGllcy5oZWlnaHQgPyBAbWF4Um9vbVNpemUgKiBudW1iZXJPZlJvb21zXHJcbiAgICBAaW5pdGlhbFJvb21XaWR0aCA9IHByb3BlcnRpZXMuaW5pdGlhbFJvb21XaWR0aCA/IERlZmF1bHRzLklOSVRJQUxfUk9PTV9XSURUSFxyXG4gICAgQGluaXRpYWxSb29tSGVpZ2h0ID0gcHJvcGVydGllcy5pbml0aWFsUm9vbUhlaWdodCA/IERlZmF1bHRzLklOSVRJQUxfUk9PTV9IRUlHSFRcclxuXHJcbiAgZ2VuZXJhdGVJbml0aWFsUm9vbTogLT5cclxuICAgIHggPSByYW5kb20udmFsdWUoQG1hcFdpZHRoICogMC4yMCwgQG1hcFdpZHRoICogMC44MClcclxuICAgIHkgPSByYW5kb20udmFsdWUoQG1hcEhlaWdodCAqIDAuMjAsIEBtYXBIZWlnaHQgKiAwLjgwKVxyXG4gICAgbmV3IFJvb20oeCwgeSwgQGluaXRpYWxSb29tV2lkdGgsIEBpbml0aWFsUm9vbUhlaWdodCwgMClcclxuXHJcbiAgZ2VuZXJhdGVJbml0aWFsU3RhdGU6IC0+XHJcbiAgICBuZXcgU3RhdGUoW10sIFtdLCBuZXcgVGlsZW1hcChAbWFwV2lkdGgsIEBtYXBIZWlnaHQsIGZhbHNlKSlcclxuXHJcbiAgZ2VuZXJhdGVOZWlnaGJvdXI6IChyb29tLCBkb29yLCBzdGF0ZSkgLT5cclxuICAgIGNhbmRpZGF0ZXMgPSBAZ2VuZXJhdGVQb3NzaWJsZU5laWdoYm91cnMocm9vbSwgZG9vciwgc3RhdGUpXHJcbiAgICBjYW5kaWRhdGVzW3JhbmRvbS52YWx1ZSgwLCBjYW5kaWRhdGVzLmxlbmd0aCldIGlmIGNhbmRpZGF0ZXMubGVuZ3RoID4gMFxyXG5cclxuICBnZW5lcmF0ZVBvc3NpYmxlTmVpZ2hib3VyczogKHJvb20sIGRvb3IsIHN0YXRlKSAtPlxyXG4gICAgY2FuZGlkYXRlcyA9IFtdXHJcbiAgICAjIEdlbmVyYXRlIHJvb21zIGZvciBhbGwgdGhlIHBvc3NpYmxlIHNpemVzXHJcbiAgICBmb3IgaGVpZ2h0IGluIFtAbWluUm9vbVNpemUuLkBtYXhSb29tU2l6ZV1cclxuICAgICAgZm9yIHdpZHRoIGluIFtAbWluUm9vbVNpemUuLkBtYXhSb29tU2l6ZV0gd2hlbiBAdmFsaWRNZWFzdXJlcyh3aWR0aCwgaGVpZ2h0KVxyXG4gICAgICAgICMgSXRlcmF0ZSBhbGwgb3ZlciB0aGUgcG9zc2libGUgcG9zaXRpb25zIHRoZSByb29tIGNvdWxkIGJlXHJcbiAgICAgICAgb2Zmc2V0TWF4ID0gaWYgZG9vciAlIDIgaXMgMCB0aGVuIHdpZHRoIGVsc2UgaGVpZ2h0XHJcbiAgICAgICAgZm9yIG9mZnNldCBpbiBbMSAtIG9mZnNldE1heC4uMF1cclxuICAgICAgICAgICMgQ2FsY3VsYXRlIGNhbmRpZGF0ZSdzIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgICBbeCwgeV0gPSBzd2l0Y2ggZG9vciAlIDRcclxuICAgICAgICAgICAgd2hlbiBEaXJlY3Rpb24uTk9SVEhcclxuICAgICAgICAgICAgICBbcm9vbS54ICsgZG9vciAvLyA0ICsgb2Zmc2V0LCByb29tLnkgLSBoZWlnaHRdXHJcbiAgICAgICAgICAgIHdoZW4gRGlyZWN0aW9uLlNPVVRIXHJcbiAgICAgICAgICAgICAgW3Jvb20ueCArIGRvb3IgLy8gNCArIG9mZnNldCwgcm9vbS55ICsgcm9vbS5oZWlnaHRdXHJcbiAgICAgICAgICAgIHdoZW4gRGlyZWN0aW9uLkVBU1RcclxuICAgICAgICAgICAgICBbcm9vbS54ICsgcm9vbS53aWR0aCwgcm9vbS55ICsgZG9vciAvLyA0ICsgb2Zmc2V0XVxyXG4gICAgICAgICAgICB3aGVuIERpcmVjdGlvbi5XRVNUXHJcbiAgICAgICAgICAgICAgW3Jvb20ueCAtIHdpZHRoLCByb29tLnkgKyBkb29yIC8vIDQgKyBvZmZzZXRdXHJcbiAgICAgICAgICAjIEdlbmVyYXRlIHRoZSBjYW5kaWRhdGVcclxuICAgICAgICAgIGNhbmRpZGF0ZSA9IG5ldyBSb29tKHgsIHksIHdpZHRoLCBoZWlnaHQsIHN0YXRlLmdldFN0ZXBzKCkgKyAxKVxyXG4gICAgICAgICAgIyBBZGQgcm9vbSB0byBjYW5kaWRhdGUncyBuZWlnaGJvdXJzXHJcbiAgICAgICAgICBkb29yT25OZWlnaGJvdXIgPSA0ICogb2Zmc2V0ICogKC0xKSArIGdldE9wcG9zaXRlRGlyZWN0aW9uKGRvb3IpXHJcbiAgICAgICAgICBjYW5kaWRhdGUubmVpZ2hib3Vyc1tkb29yT25OZWlnaGJvdXJdID0gcm9vbS5pZFxyXG4gICAgICAgICAgIyBBZGQgdGhlIGRvb3IgdG8gdGhlIGNhbmRpZGF0ZXMgaWYgaXQgZG9lc24ndCBjb2xsaWRlIHdpdGggYW55dGhpbmdcclxuICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaChjYW5kaWRhdGUpIGlmIHN0YXRlLmhhc1Jvb21Gb3IoY2FuZGlkYXRlKVxyXG4gICAgcmV0dXJuIGNhbmRpZGF0ZXNcclxuXHJcbiAgdmFsaWRNZWFzdXJlczogKHdpZHRoLCBoZWlnaHQpIC0+IGhlaWdodCAqIHdpZHRoIDw9IEBtYXhSb29tQXJlYSBhbmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ICogd2lkdGggPj0gQG1pblJvb21BcmVhIGFuZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCAvIGhlaWdodCA+PSBAcmF0aW9SZXN0ciBhbmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IC8gd2lkdGggPj0gQHJhdGlvUmVzdHJcclxuXHJcbiAgIyBQUklWQVRFIEhFTFBFUlNcclxuICBnZXRPcHBvc2l0ZURpcmVjdGlvbiA9IChkb29yKSAtPiAoKGRvb3IgJSA0KSArIDIpICUgNFxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiMjI1xyXG4gIFRoaXMgaXMgdGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBnZW5lcmF0ZSB0aGUgbWFwLiBJdCB0YWtlcyBhIHdpZHRoLCBhIGhlaWdodCxcclxuICB0aGUgbnVtYmVyIG9mIHJvb21zIHRvIGdlbmVyYXRlLCB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2VuZXJhdG9yIGFuZCBhIFxyXG4gIGNhbGxiYWNrIHRvIGJlIGV4ZWN1dGVkIG9uIGVhY2ggc3RlcC5cclxuIyMjXHJcblxyXG5nZW5lcmF0ZSA9IChudW1iZXJPZlJvb21zLCBwcm9wZXJ0aWVzLCBvblN0ZXBDYWxsYmFjaykgLT5cclxuXHJcbiAgIyBJbml0aWFsaXplIGdlbmVyYXRvclxyXG4gIGdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3IobnVtYmVyT2ZSb29tcywgcHJvcGVydGllcylcclxuICBzdGF0ZSA9IGdlbmVyYXRvci5nZW5lcmF0ZUluaXRpYWxTdGF0ZSgpXHJcblxyXG4gICMgR2VuZXJhdGUgaW5pdGlhbCBzdGF0ZVxyXG4gIGluaXRpYWxSb29tID0gZ2VuZXJhdG9yLmdlbmVyYXRlSW5pdGlhbFJvb20oKVxyXG4gIHN0YXRlLmFkZFJvb20oaW5pdGlhbFJvb20pXHJcbiAgcmVtYWluaW5nUm9vbXMgPSBudW1iZXJPZlJvb21zIC0gMSAgIyBUYWtlIGluaXRpYWwgcm9vbVxyXG4gIG9uU3RlcENhbGxiYWNrKG9idGFpbk1hcChzdGF0ZS5jbG9uZSgpKSwgc3RhdGUuZ2V0U3RlcHMoKSkgaWYgb25TdGVwQ2FsbGJhY2s/XHJcblxyXG4gICMgR2VuZXJhdGUgcm9vbXMgcmFuZG9tbHlcclxuICB3aGlsZSByZW1haW5pbmdSb29tcyA+IDAgYW5kIHN0YXRlLmZyb250aWVyLmxlbmd0aCA+IDBcclxuICAgIHJvb20gPSBzdGF0ZS5mcm9udGllci5zaGlmdCgpXHJcbiAgICBmb3IgZG9vciBpbiByYW5kb20uc2h1ZmZsZShyb29tLmdldEF2YWlsYWJsZUV4aXRzKCkpIHdoZW4gcmVtYWluaW5nUm9vbXMgPiAwXHJcbiAgICAgICMgQ29weSB0aGUgb2JqZWN0cyBhbmQgdXBkYXRlIHJlZmVyZW5jZXMgb24gZWFjaCBzdGVwXHJcbiAgICAgIHN0YXRlID0gc3RhdGUuY2xvbmUoKVxyXG4gICAgICByb29tID0gc3RhdGUucm9vbXNbcm9vbS5pZF1cclxuICAgICAgIyBHZW5lcmF0ZSBuZXcgcm9vbVxyXG4gICAgICBuZXdSb29tID0gZ2VuZXJhdG9yLmdlbmVyYXRlTmVpZ2hib3VyKHJvb20sIGRvb3IsIHN0YXRlKVxyXG4gICAgICBpZiBuZXdSb29tP1xyXG4gICAgICAgIHJvb20ubmVpZ2hib3Vyc1tkb29yXSA9IG5ld1Jvb20uaWRcclxuICAgICAgICBzdGF0ZS5hZGRSb29tKG5ld1Jvb20pXHJcbiAgICAgICAgcmVtYWluaW5nUm9vbXMtLVxyXG4gICAgICAgIG9uU3RlcENhbGxiYWNrKG9idGFpbk1hcChzdGF0ZS5jbG9uZSgpKSwgc3RhdGUuZ2V0U3RlcHMoKSkgaWYgb25TdGVwQ2FsbGJhY2s/XHJcblxyXG4gIHJldHVybiBvYnRhaW5NYXAoc3RhdGUpXHJcblxyXG5cclxub2J0YWluTWFwID0gKHN0YXRlKSAtPlxyXG4gIG5ldyBNYXAoc3RhdGUuY29sbGlzaW9uTWFwLndpZHRoLCBzdGF0ZS5jb2xsaXNpb25NYXAuaGVpZ2h0LCBzdGF0ZS5yb29tcylcclxuXHJcbiMjIyBFWFBPUlQgRlVOQ1RJT05TICMjI1xyXG50aGlzLmdlbmVyYXRlID0gZ2VuZXJhdGVcclxuIl19