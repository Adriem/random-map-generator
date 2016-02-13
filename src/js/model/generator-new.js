
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
  function Room(x1, y1, width1, height1, id, attrs, neighbours1) {
    this.x = x1;
    this.y = y1;
    this.width = width1;
    this.height = height1;
    this.id = id;
    this.attrs = attrs != null ? attrs : {};
    this.neighbours = neighbours1 != null ? neighbours1 : [];
  }

  Room.prototype.getExits = function() {
    var i;
    return [].push((function() {
      var j, ref, results;
      results = [];
      for (i = j = 0, ref = this.width; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push((Direction.NORTH + (i * 4), Direction.SOUTH + (i * 4)));
      }
      return results;
    }).call(this), (function() {
      var j, ref, results;
      results = [];
      for (i = j = 0, ref = this.height; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        results.push((Direction.EAST + (i * 4), Direction.WEST + (i * 4)));
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
      if (neighbour[door] == null) {
        results.push(door);
      }
    }
    return results;
  };

  Room.prototype.clone = function() {
    var attrClone, j, key, len, neighbour, neighboursClone, ref, ref1, value;
    attrClone = {};
    ref = this.attrs;
    for (key in ref) {
      value = ref[key];
      attrClone[key] = value;
    }
    ref1 = this.neighbours;
    for (j = 0, len = ref1.length; j < len; j++) {
      neighbour = ref1[j];
      neighboursClone = neighbour;
    }
    return new Room(this.x, this.y, this.width, this.height, this.id, attrClone, neighboursClone);
  };

  return Room;

})();

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

  State.prototype.clone = function() {
    var room;
    return new State((function() {
      var j, len, ref, results;
      ref = this.rooms;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        room = ref[j];
        results.push(room.clone);
      }
      return results;
    }).call(this), (function() {
      var j, len, ref, results;
      ref = this.frontier;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        room = ref[j];
        results.push(room.clone);
      }
      return results;
    }).call(this), this.collisionMap.clone());
  };

  return State;

})();

Generator = (function() {
  var _calculateNeighbourOrigin, _getNeighboursOfNeighbour, getOppositeDirection;

  function Generator(numberOfRooms, properties) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
    this.remainingRooms = numberOfRooms;
    this.minRoomSize = (ref = properties.minRoomSize) != null ? ref : Defaults.MIN_ROOM_SIZE;
    this.maxRoomSize = (ref1 = properties.maxRoomSize) != null ? ref1 : Defaults.MAX_ROOM_SIZE;
    this.minRoomArea = (ref2 = properties.minRoomArea) != null ? ref2 : Math.pow(this.minRoomSize, 2);
    this.maxRoomArea = (ref3 = properties.maxRoomArea) != null ? ref3 : Math.pow(this.maxRoomSize, 2);
    this.ratioRestr = (ref4 = properties.ratioRestriction) != null ? ref4 : 0;
    this.mapWidth = (ref5 = properties.width) != null ? ref5 : this.maxRoomWidth * numberOfRooms;
    this.mapHeight = (ref6 = properties.height) != null ? ref6 : this.maxRoomHeight * numberOfRooms;
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
    if (candidates > 0) {
      return candidates[random.value(0, candidates.length)];
    }
  };

  Generator.prototype.generatePossibleNeighbours = function(room, door, state) {
    var candidate, candidates, height, j, k, l, neighbours, offset, offsetMax, origin, ref, ref1, ref2, ref3, ref4, width;
    candidates = [];
    for (height = j = ref = this.minRoomSize, ref1 = this.maxRoomSize; ref <= ref1 ? j <= ref1 : j >= ref1; height = ref <= ref1 ? ++j : --j) {
      for (width = k = ref2 = this.minRoomSize, ref3 = this.maxRoomSize; ref2 <= ref3 ? k <= ref3 : k >= ref3; width = ref2 <= ref3 ? ++k : --k) {
        if (!(this.validMeasures(width, height))) {
          continue;
        }
        offsetMax = door % 2 === 0 ? width : height;
        for (offset = l = ref4 = 1 - offsetMax; ref4 <= 0 ? l <= 0 : l >= 0; offset = ref4 <= 0 ? ++l : --l) {
          origin = this._calculateNeighbourOrigin(door, room, width, height, offset);
          neighbours = this._getNeighboursOfNeighbour(door, room, width, height, offset);
          candidate = new Room(origin[0], origin[1], width, height, state.getSteps() + 1, {}, neighbours);
          if (state.tilemap.is(candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)) {
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

  _calculateNeighbourOrigin = function(door, room, width, height, offset) {
    var x, y;
    switch (door % 4) {
      case Direction.NORTH:
        x = room.origin[0] + Math.floor(door / 4) + offset;
        y = room.origin[1] - height;
        break;
      case Direction.SOUTH:
        x = room.origin[0] + Math.floor(door / 4) + offset;
        y = room.origin[1] + room.height;
        break;
      case Direction.EAST:
        x = room.origin[0] + room.width;
        y = room.origin[1] + Math.floor(door / 4) + offset;
        break;
      case Direction.WEST:
        x = room.origin[0] - width;
        y = room.origin[1] + Math.floor(door / 4) + offset;
    }
    return new Point(x, y);
  };

  _getNeighboursOfNeighbour = function(door, room, width, height, offset) {
    var doorIndex, doorOnNeighbour, neighbours, numberOfDoors;
    doorOnNeighbour = 4 * offset * (-1) + getOppositeDirection(door);
    numberOfDoors = Math.max(width, height) * 4;
    return neighbours = (function() {
      var j, ref, results;
      results = [];
      for (doorIndex = j = 0, ref = numberOfDoors; 0 <= ref ? j < ref : j > ref; doorIndex = 0 <= ref ? ++j : --j) {
        if (doorIndex === doorOnNeighbour) {
          results.push(room.id);
        } else {
          results.push(null);
        }
      }
      return results;
    })();
  };

  getOppositeDirection = function(door) {
    return ((door % 4) + 2) % 4;
  };

  return Generator;

})();

generate = function(numberOfRooms, properties, onStepCallback) {
  var door, generator, initialRoom, j, len, newRoom, ref, remainingRooms, room, state;
  generator = new Generator(numberOfRooms, properties);
  state = generator.generateInitialState();
  initialRoom = generator.generateInitialRoom();
  state.addRoom(initialRoom);
  remainingRooms = numberOfRooms - 1;
  if (onStepCallback != null) {
    onStepCallback(obtainMap(state.clone), state.getSteps());
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
        if (onStepCallback != null) {
          onStepCallback(obtainMap(state.clone), state.getSteps());
        }
      }
    }
  }
  return new Map(state.tilemap.width, state.tilemap.height, state.roomList);
};

obtainMap = function(state) {
  return new Map(state.tilemap.width, state.tilemap.height, state.roomList);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZGVsL2dlbmVyYXRvci1uZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQTtBQUFBLElBQUE7O0FBQ0EsUUFBQSxHQUNFO0VBQUEsUUFBQSxFQUFVLEVBQVY7RUFDQSxlQUFBLEVBQWlCLEVBRGpCO0VBRUEsY0FBQSxFQUFnQixDQUZoQjtFQUdBLGtCQUFBLEVBQW9CLENBSHBCO0VBSUEsbUJBQUEsRUFBcUIsQ0FKckI7RUFLQSxhQUFBLEVBQWUsQ0FMZjtFQU1BLGFBQUEsRUFBZSxDQU5mOzs7QUFRSTtFQUNTLGNBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxNQUFULEVBQWlCLE9BQWpCLEVBQTBCLEVBQTFCLEVBQStCLEtBQS9CLEVBQTRDLFdBQTVDO0lBQUMsSUFBQyxDQUFBLElBQUQ7SUFBSSxJQUFDLENBQUEsSUFBRDtJQUFJLElBQUMsQ0FBQSxRQUFEO0lBQVEsSUFBQyxDQUFBLFNBQUQ7SUFBUyxJQUFDLENBQUEsS0FBRDtJQUFLLElBQUMsQ0FBQSx3QkFBRCxRQUFTO0lBQUksSUFBQyxDQUFBLG1DQUFELGNBQWM7RUFBMUQ7O2lCQUdiLFFBQUEsR0FBVSxTQUFBO0FBQ1IsUUFBQTtXQUFBLEVBQUUsQ0FBQyxJQUFIOztBQUNHO1dBQVMsbUZBQVQ7cUJBQ0UsQ0FBQSxTQUFTLENBQUMsS0FBVixHQUFrQixDQUFDLENBQUEsR0FBRSxDQUFILENBQWxCLEVBQXlCLFNBQVMsQ0FBQyxLQUFWLEdBQWtCLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBM0M7QUFERjs7aUJBREg7O0FBR0c7V0FBUyxzRkFBVDtxQkFDRSxDQUFBLFNBQVMsQ0FBQyxJQUFWLEdBQWlCLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBakIsRUFBd0IsU0FBUyxDQUFDLElBQVYsR0FBaUIsQ0FBQyxDQUFBLEdBQUUsQ0FBSCxDQUF6QztBQURGOztpQkFISDtFQURROztpQkFTVixpQkFBQSxHQUFtQixTQUFBO0FBQ2pCLFFBQUE7QUFBQTtBQUFBO1NBQUEscUNBQUE7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Q0FBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQWxCLEVBQXlCLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBdkMsRUFBK0MsS0FBSyxDQUFDLFFBQXJEO0FBRE0iLCJmaWxlIjoibW9kZWwvZ2VuZXJhdG9yLW5ldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiMgIFRoaXMgZmlsZSBjb250YWlucyB0aGUgZnVuY3Rpb25zIHRvIHJhbmRvbWx5IGdlbmVyYXRlIHRoZSBtYXAuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgIEF1dGhvcjogQWRyaWFuIE1vcmVub1xyXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuIyMjIERlZmF1bHQgdmFsdWVzIGZvciB0aGUgZ2VuZXJhdG9yICMjI1xyXG5EZWZhdWx0cyA9XHJcbiAgTUFQX1NJWkU6IDEwXHJcbiAgTlVNQkVSX09GX1JPT01TOiAxNVxyXG4gIFRJTEVTX1BFUl9VTklUOiAzXHJcbiAgSU5JVElBTF9ST09NX1dJRFRIOiAxXHJcbiAgSU5JVElBTF9ST09NX0hFSUdIVDogMVxyXG4gIE1JTl9ST09NX1NJWkU6IDFcclxuICBNQVhfUk9PTV9TSVpFOiAyXHJcblxyXG5jbGFzcyBSb29tXHJcbiAgY29uc3RydWN0b3I6IChAeCwgQHksIEB3aWR0aCwgQGhlaWdodCwgQGlkLCBAYXR0cnMgPSB7fSwgQG5laWdoYm91cnMgPSBbXSkgLT5cclxuXHJcbiAgIyBSZXR1cm4gYW4gYXJyYXkgd2l0aCB0aGUgaW5kZXhlcyBvZiBhbGwgdGhlIGV4aXRzIG9mIHRoZSByb29tXHJcbiAgZ2V0RXhpdHM6ICgpIC0+XHJcbiAgICBbXS5wdXNoKFxyXG4gICAgICAoZm9yIGkgaW4gWzAuLi50aGlzLndpZHRoXVxyXG4gICAgICAgIChEaXJlY3Rpb24uTk9SVEggKyAoaSo0KTsgRGlyZWN0aW9uLlNPVVRIICsgKGkqNCkpKSxcclxuICAgICAgKGZvciBpIGluIFswLi50aGlzLmhlaWdodF1cclxuICAgICAgICAoRGlyZWN0aW9uLkVBU1QgKyAoaSo0KTsgRGlyZWN0aW9uLldFU1QgKyAoaSo0KSkpXHJcbiAgICApXHJcblxyXG4gICMgUmV0dXJuIGFuIGFycmF5IHdpdGggdGhlIGluZGV4ZXMgb2YgdW51c2VkIGV4aXRzIG9mIHRoZSByb29tXHJcbiAgZ2V0QXZhaWxhYmxlRXhpdHM6ICgpIC0+XHJcbiAgICBkb29yIGZvciBkb29yIGluIHRoaXMuZ2V0RXhpdHMoKSB3aGVuIG5vdCBuZWlnaGJvdXJbZG9vcl0/XHJcblxyXG4gICMgR2VuZXJhdGUgYSBkZWVwIGNvcHkgb2YgdGhpcyByb29tXHJcbiAgY2xvbmU6IC0+XHJcbiAgICBhdHRyQ2xvbmUgPSB7fVxyXG4gICAgYXR0ckNsb25lW2tleV0gPSB2YWx1ZSBmb3Iga2V5LCB2YWx1ZSBvZiBAYXR0cnNcclxuICAgIG5laWdoYm91cnNDbG9uZSA9IG5laWdoYm91ciBmb3IgbmVpZ2hib3VyIGluIEBuZWlnaGJvdXJzXHJcbiAgICBuZXcgUm9vbShAeCwgQHksIEB3aWR0aCwgQGhlaWdodCwgQGlkLCBhdHRyQ2xvbmUsIG5laWdoYm91cnNDbG9uZSlcclxuXHJcblxyXG5jbGFzcyBTdGF0ZVxyXG5cclxuICBjb25zdHJ1Y3RvcjogKEByb29tcyA9IFtdLCBAZnJvbnRpZXIgPSBbXSwgQGNvbGxpc2lvbk1hcCA9IG5ldyBUaWxlbWFwKDEwMCwgMTAwLCBmYWxzZSkpIC0+XHJcblxyXG4gICMgUmV0dXJuIHRoZSBudW1iZXIgb2Ygc3RlcHMgZ2l2ZW4gdW50aWwgdGhpcyBzdGF0ZVxyXG4gIGdldFN0ZXBzOiAtPiBAcm9vbXMubGVuZ3RoIC0gMVxyXG5cclxuICAjIEFkZCBhIG5ldyByb29tIHRvIHRoaXMgc3RhdGVcclxuICBhZGRSb29tOiAocm9vbSkgLT5cclxuICAgIEByb29tcy5wdXNoKHJvb20pXHJcbiAgICBAZnJvbnRpZXIucHVzaChyb29tKVxyXG4gICAgQGNvbGxpc2lvbk1hcC5zZXQocm9vbS54LCByb29tLnksIHJvb20ud2lkdGgsIHJvb20uaGVpZ2h0LCB0cnVlKVxyXG5cclxuICAjIEdlbmVyYXRlIGEgZGVlcCBjbG9uZSBvZiB0aGlzIHN0YXRlXHJcbiAgY2xvbmU6IC0+IG5ldyBTdGF0ZShcclxuICAgIHJvb20uY2xvbmUgZm9yIHJvb20gaW4gQHJvb21zLFxyXG4gICAgcm9vbS5jbG9uZSBmb3Igcm9vbSBpbiBAZnJvbnRpZXIsXHJcbiAgICBAY29sbGlzaW9uTWFwLmNsb25lKClcclxuICApXHJcblxyXG5cclxuY2xhc3MgR2VuZXJhdG9yXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAobnVtYmVyT2ZSb29tcywgcHJvcGVydGllcykgLT5cclxuICAgIEByZW1haW5pbmdSb29tcyA9IG51bWJlck9mUm9vbXNcclxuICAgIEBtaW5Sb29tU2l6ZSA9IHByb3BlcnRpZXMubWluUm9vbVNpemUgPyBEZWZhdWx0cy5NSU5fUk9PTV9TSVpFXHJcbiAgICBAbWF4Um9vbVNpemUgPSBwcm9wZXJ0aWVzLm1heFJvb21TaXplID8gRGVmYXVsdHMuTUFYX1JPT01fU0laRVxyXG4gICAgQG1pblJvb21BcmVhID0gcHJvcGVydGllcy5taW5Sb29tQXJlYSA/IEBtaW5Sb29tU2l6ZSAqKiAyXHJcbiAgICBAbWF4Um9vbUFyZWEgPSBwcm9wZXJ0aWVzLm1heFJvb21BcmVhID8gQG1heFJvb21TaXplICoqIDJcclxuICAgIEByYXRpb1Jlc3RyICA9IHByb3BlcnRpZXMucmF0aW9SZXN0cmljdGlvbiA/IDBcclxuICAgIEBtYXBXaWR0aCA9IHByb3BlcnRpZXMud2lkdGggPyBAbWF4Um9vbVdpZHRoICogbnVtYmVyT2ZSb29tc1xyXG4gICAgQG1hcEhlaWdodCA9IHByb3BlcnRpZXMuaGVpZ2h0ID8gQG1heFJvb21IZWlnaHQgKiBudW1iZXJPZlJvb21zXHJcbiAgICBAaW5pdGlhbFJvb21XaWR0aCA9IHByb3BlcnRpZXMuaW5pdGlhbFJvb21XaWR0aCA/IERlZmF1bHRzLklOSVRJQUxfUk9PTV9XSURUSFxyXG4gICAgQGluaXRpYWxSb29tSGVpZ2h0ID0gcHJvcGVydGllcy5pbml0aWFsUm9vbUhlaWdodCA/IERlZmF1bHRzLklOSVRJQUxfUk9PTV9IRUlHSFRcclxuXHJcbiAgZ2VuZXJhdGVJbml0aWFsUm9vbTogLT5cclxuICAgIHggPSByYW5kb20udmFsdWUoQG1hcFdpZHRoICogMC4yMCwgQG1hcFdpZHRoICogMC44MClcclxuICAgIHkgPSByYW5kb20udmFsdWUoQG1hcEhlaWdodCAqIDAuMjAsIEBtYXBIZWlnaHQgKiAwLjgwKVxyXG4gICAgbmV3IFJvb20oeCwgeSwgQGluaXRpYWxSb29tV2lkdGgsIEBpbml0aWFsUm9vbUhlaWdodCwgMClcclxuXHJcbiAgZ2VuZXJhdGVJbml0aWFsU3RhdGU6IC0+XHJcbiAgICBuZXcgU3RhdGUoW10sIFtdLCBuZXcgVGlsZW1hcChAbWFwV2lkdGgsIEBtYXBIZWlnaHQsIGZhbHNlKSlcclxuXHJcbiAgZ2VuZXJhdGVOZWlnaGJvdXI6IChyb29tLCBkb29yLCBzdGF0ZSkgLT5cclxuICAgIGNhbmRpZGF0ZXMgPSBAZ2VuZXJhdGVQb3NzaWJsZU5laWdoYm91cnMocm9vbSwgZG9vciwgc3RhdGUpXHJcbiAgICBjYW5kaWRhdGVzW3JhbmRvbS52YWx1ZSgwLCBjYW5kaWRhdGVzLmxlbmd0aCldIGlmIGNhbmRpZGF0ZXMgPiAwXHJcblxyXG4gIGdlbmVyYXRlUG9zc2libGVOZWlnaGJvdXJzOiAocm9vbSwgZG9vciwgc3RhdGUpIC0+XHJcbiAgICBjYW5kaWRhdGVzID0gW11cclxuICAgICMgR2VuZXJhdGUgcm9vbXMgZm9yIGFsbCB0aGUgcG9zc2libGUgc2l6ZXNcclxuICAgIGZvciBoZWlnaHQgaW4gW0BtaW5Sb29tU2l6ZS4uQG1heFJvb21TaXplXVxyXG4gICAgICBmb3Igd2lkdGggaW4gW0BtaW5Sb29tU2l6ZS4uQG1heFJvb21TaXplXSB3aGVuIEB2YWxpZE1lYXN1cmVzKHdpZHRoLCBoZWlnaHQpXHJcbiAgICAgICAgIyBJdGVyYXRlIGFsbCBvdmVyIHRoZSBwb3NzaWJsZSBwb3NpdGlvbnMgdGhlIHJvb20gY291bGQgYmVcclxuICAgICAgICBvZmZzZXRNYXggPSBpZiBkb29yICUgMiBpcyAwIHRoZW4gd2lkdGggZWxzZSBoZWlnaHRcclxuICAgICAgICBmb3Igb2Zmc2V0IGluIFsxIC0gb2Zmc2V0TWF4Li4wXVxyXG4gICAgICAgICAgb3JpZ2luID0gQF9jYWxjdWxhdGVOZWlnaGJvdXJPcmlnaW4oZG9vciwgcm9vbSwgd2lkdGgsIGhlaWdodCwgb2Zmc2V0KVxyXG4gICAgICAgICAgbmVpZ2hib3VycyA9IEBfZ2V0TmVpZ2hib3Vyc09mTmVpZ2hib3VyKGRvb3IsIHJvb20sIHdpZHRoLCBoZWlnaHQsIG9mZnNldClcclxuICAgICAgICAgIGNhbmRpZGF0ZSA9IG5ldyBSb29tKG9yaWdpblswXSwgb3JpZ2luWzFdLCB3aWR0aCwgaGVpZ2h0LFxyXG4gICAgICAgICAgICAgIHN0YXRlLmdldFN0ZXBzKCkgKyAxLCB7fSwgbmVpZ2hib3VycylcclxuICAgICAgICAgICMgQWRkIHRoZSBkb29yIHRvIHRoZSBjYW5kaWRhdGVzIGlmIGl0IGRvZXNuJ3QgY29sbGlkZSB3aXRoIGFueXRoaW5nXHJcbiAgICAgICAgICBjYW5kaWRhdGVzLnB1c2goY2FuZGlkYXRlKSBpZiBzdGF0ZS50aWxlbWFwLmlzKFxyXG4gICAgICAgICAgICBjYW5kaWRhdGUub3JpZ2luWzBdLCBjYW5kaWRhdGUub3JpZ2luWzFdLCB3aWR0aCwgaGVpZ2h0LCBUaWxlLkVNUFRZKVxyXG4gICAgcmV0dXJuIGNhbmRpZGF0ZXNcclxuXHJcbiAgdmFsaWRNZWFzdXJlczogKHdpZHRoLCBoZWlnaHQpIC0+IGhlaWdodCAqIHdpZHRoIDw9IEBtYXhSb29tQXJlYSBhbmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ICogd2lkdGggPj0gQG1pblJvb21BcmVhIGFuZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCAvIGhlaWdodCA+PSBAcmF0aW9SZXN0ciBhbmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IC8gd2lkdGggPj0gQHJhdGlvUmVzdHJcclxuXHJcbiAgIyBTVEFUSUMgSEVMUEVSU1xyXG4gIF9jYWxjdWxhdGVOZWlnaGJvdXJPcmlnaW4gPSAoZG9vciwgcm9vbSwgd2lkdGgsIGhlaWdodCwgb2Zmc2V0KSAtPlxyXG4gICAgc3dpdGNoIGRvb3IgJSA0XHJcbiAgICAgIHdoZW4gRGlyZWN0aW9uLk5PUlRIXHJcbiAgICAgICAgeCA9IHJvb20ub3JpZ2luWzBdICsgZG9vciAvLyA0ICsgb2Zmc2V0XHJcbiAgICAgICAgeSA9IHJvb20ub3JpZ2luWzFdIC0gaGVpZ2h0XHJcbiAgICAgIHdoZW4gRGlyZWN0aW9uLlNPVVRIXHJcbiAgICAgICAgeCA9IHJvb20ub3JpZ2luWzBdICsgZG9vciAvLyA0ICsgb2Zmc2V0XHJcbiAgICAgICAgeSA9IHJvb20ub3JpZ2luWzFdICsgcm9vbS5oZWlnaHRcclxuICAgICAgd2hlbiBEaXJlY3Rpb24uRUFTVFxyXG4gICAgICAgIHggPSByb29tLm9yaWdpblswXSArIHJvb20ud2lkdGhcclxuICAgICAgICB5ID0gcm9vbS5vcmlnaW5bMV0gKyBkb29yIC8vIDQgKyBvZmZzZXRcclxuICAgICAgd2hlbiBEaXJlY3Rpb24uV0VTVFxyXG4gICAgICAgIHggPSByb29tLm9yaWdpblswXSAtIHdpZHRoXHJcbiAgICAgICAgeSA9IHJvb20ub3JpZ2luWzFdICsgZG9vciAvLyA0ICsgb2Zmc2V0XHJcbiAgICByZXR1cm4gbmV3IFBvaW50KHgsIHkpXHJcblxyXG4gIF9nZXROZWlnaGJvdXJzT2ZOZWlnaGJvdXIgPSAoZG9vciwgcm9vbSwgd2lkdGgsIGhlaWdodCwgb2Zmc2V0KSAtPlxyXG4gICAgIyBDYWxjdWxhdGUgdGhlIGRvb3Igd2hlcmUgdGhlIHJvb20gd2lsbCBiZSBsaW5rZWQgb24gdGhlIGNhbmRpZGF0ZVxyXG4gICAgZG9vck9uTmVpZ2hib3VyID0gNCAqIG9mZnNldCAqICgtMSkgKyBnZXRPcHBvc2l0ZURpcmVjdGlvbihkb29yKVxyXG4gICAgIyBHZW5lcmF0ZSB0aGUgbmVpZ2hib3VyIGFycmF5IGZvciB0aGUgY2FuZGlkYXRlXHJcbiAgICBudW1iZXJPZkRvb3JzID0gTWF0aC5tYXgod2lkdGgsIGhlaWdodCkgKiA0XHJcbiAgICBuZWlnaGJvdXJzID0gZm9yIGRvb3JJbmRleCBpbiBbMC4uLm51bWJlck9mRG9vcnNdXHJcbiAgICAgIGlmIGRvb3JJbmRleCBpcyBkb29yT25OZWlnaGJvdXIgdGhlbiByb29tLmlkIGVsc2UgbnVsbFxyXG5cclxuICBnZXRPcHBvc2l0ZURpcmVjdGlvbiA9IChkb29yKSAtPiAoKGRvb3IgJSA0KSArIDIpICUgNFxyXG5cclxuXHJcbmdlbmVyYXRlID0gKG51bWJlck9mUm9vbXMsIHByb3BlcnRpZXMsIG9uU3RlcENhbGxiYWNrKSAtPlxyXG5cclxuICAjIEluaXRpYWxpemUgZ2VuZXJhdG9yXHJcbiAgZ2VuZXJhdG9yID0gbmV3IEdlbmVyYXRvcihudW1iZXJPZlJvb21zLCBwcm9wZXJ0aWVzKVxyXG4gIHN0YXRlID0gZ2VuZXJhdG9yLmdlbmVyYXRlSW5pdGlhbFN0YXRlKClcclxuXHJcbiAgIyBHZW5lcmF0ZSBpbml0aWFsIHN0YXRlXHJcbiAgaW5pdGlhbFJvb20gPSBnZW5lcmF0b3IuZ2VuZXJhdGVJbml0aWFsUm9vbSgpXHJcbiAgc3RhdGUuYWRkUm9vbShpbml0aWFsUm9vbSlcclxuICByZW1haW5pbmdSb29tcyA9IG51bWJlck9mUm9vbXMgLSAxICAjIFRha2UgaW5pdGlhbCByb29tXHJcbiAgb25TdGVwQ2FsbGJhY2sob2J0YWluTWFwKHN0YXRlLmNsb25lKSwgc3RhdGUuZ2V0U3RlcHMoKSkgaWYgb25TdGVwQ2FsbGJhY2s/XHJcblxyXG4gICMgR2VuZXJhdGUgcm9vbXMgcmFuZG9tbHlcclxuICB3aGlsZSByZW1haW5pbmdSb29tcyA+IDAgYW5kIHN0YXRlLmZyb250aWVyLmxlbmd0aCA+IDBcclxuICAgIHJvb20gPSBzdGF0ZS5mcm9udGllci5zaGlmdCgpXHJcbiAgICBmb3IgZG9vciBpbiByYW5kb20uc2h1ZmZsZShyb29tLmdldEF2YWlsYWJsZUV4aXRzKCkpIHdoZW4gcmVtYWluaW5nUm9vbXMgPiAwXHJcbiAgICAgICMgQ29weSB0aGUgb2JqZWN0cyBhbmQgdXBkYXRlIHJlZmVyZW5jZXMgb24gZWFjaCBzdGVwXHJcbiAgICAgIHN0YXRlID0gc3RhdGUuY2xvbmUoKVxyXG4gICAgICByb29tID0gc3RhdGUucm9vbXNbcm9vbS5pZF1cclxuICAgICAgIyBHZW5lcmF0ZSBuZXcgcm9vbVxyXG4gICAgICBuZXdSb29tID0gZ2VuZXJhdG9yLmdlbmVyYXRlTmVpZ2hib3VyKHJvb20sIGRvb3IsIHN0YXRlKVxyXG4gICAgICBpZiBuZXdSb29tP1xyXG4gICAgICAgIHJvb20ubmVpZ2hib3Vyc1tkb29yXSA9IG5ld1Jvb20uaWRcclxuICAgICAgICBzdGF0ZS5hZGRSb29tKG5ld1Jvb20pXHJcbiAgICAgICAgb25TdGVwQ2FsbGJhY2sob2J0YWluTWFwKHN0YXRlLmNsb25lKSwgc3RhdGUuZ2V0U3RlcHMoKSkgaWYgb25TdGVwQ2FsbGJhY2s/XHJcblxyXG4gIHJldHVybiBuZXcgTWFwKHN0YXRlLnRpbGVtYXAud2lkdGgsIHN0YXRlLnRpbGVtYXAuaGVpZ2h0LCBzdGF0ZS5yb29tTGlzdClcclxuXHJcblxyXG5vYnRhaW5NYXAgPSAoc3RhdGUpIC0+XHJcbiAgbmV3IE1hcChzdGF0ZS50aWxlbWFwLndpZHRoLCBzdGF0ZS50aWxlbWFwLmhlaWdodCwgc3RhdGUucm9vbUxpc3QpXHJcbiJdfQ==