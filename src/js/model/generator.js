
/* Default values for the generator */
var Defaults, cloneState, expandRoomFromFrontier, generateInitialState, generateMap, getEastCandidates, getNorthCandidates, getOppositeDirection, getPossibleNeighbours, getPossibleNeighboursx, getSouthCandidates, getWestCandidates, obtainMap;

Defaults = {
  MAP_WIDTH: 10,
  NUMBER_OF_ROOMS: 15,
  TILES_PER_UNIT: 3,
  INITIAL_ROOM_WIDTH: 1,
  INITIAL_ROOM_HEIGHT: 1,
  MIN_ROOM_WIDTH: 1,
  MAX_ROOM_WIDTH: 2
};


/* High level map generation algorythm */

generateMap = function(width, height, numberOfRooms, roomProperties, onStepCallback) {
  var state;
  if (numberOfRooms == null) {
    numberOfRooms = 10;
  }
  if (roomProperties == null) {
    roomProperties = {};
  }
  state = generateInitialState(width, height, roomProperties.initialRoomWidth, roomProperties.initialRoomHeight);
  state.remainingRooms = numberOfRooms - 1;
  if (onStepCallback != null) {
    onStepCallback(obtainMap(state), state.steps);
  }
  while (state.remainingRooms > 0) {
    state = expandRoomFromFrontier(state, roomProperties, onStepCallback);
  }
  return new Map(state.tilemap.width, state.tilemap.height, state.roomList);
};


/*
  Generate the first state for a map, just by generating a map with given width
  and height and adding a room at a random position on it.
 */

generateInitialState = function(width, height, firstRoomWidth, firstRoomHeight) {
  var frontier, originRoom, roomList, tilemap, x, y;
  if (firstRoomWidth == null) {
    firstRoomWidth = 1;
  }
  if (firstRoomHeight == null) {
    firstRoomHeight = 1;
  }
  x = random.value(width * 0.40, width * 0.60);
  y = random.value(height * 0.40, height * 0.60);
  originRoom = new Room(x, y, firstRoomWidth, firstRoomHeight, void 0, 0);
  originRoom.special = 'first room';
  tilemap = new Tilemap(width, height, Tile.EMPTY);
  tilemap.set(originRoom.origin[0], originRoom.origin[1], originRoom.width, originRoom.height, Tile.FIRST_ROOM);
  roomList = [originRoom];
  frontier = [originRoom];
  return {
    roomList: roomList,
    tilemap: tilemap,
    frontier: frontier,
    steps: 0
  };
};


/*
  Extract the first room of the frontier and expand it, generating its
  neighbours and adding them to the frontier as well
 */

expandRoomFromFrontier = function(state, properties, onStepCallback, onRoomExpandedCallback) {
  var _room, _state, candidates, door, i, j, len, newRoom, ref1, room;
  _state = cloneState(state);
  room = _state.frontier.shift();
  ref1 = random.shuffle(room.getAvailableExits());
  for (i = j = 0, len = ref1.length; j < len; i = ++j) {
    door = ref1[i];
    if (!(_state.remainingRooms > 0)) {
      continue;
    }
    console.log(door);
    if (i > 0) {
      _state = cloneState(_state);
    }
    _room = _state.roomList[room.id];
    candidates = getPossibleNeighbours(door, _room, _state.tilemap, properties.minRoomSize, properties.maxRoomSize);
    if (candidates.length > 0) {
      newRoom = candidates[random.value(0, candidates.length)];
      newRoom.id = _state.roomList.length;
      _room.neighbours[door] = newRoom.id;
      _state.roomList.push(newRoom);
      _state.frontier.push(newRoom);
      _state.steps++;
      _state.remainingRooms--;
      _state.tilemap.set(newRoom.origin[0], newRoom.origin[1], newRoom.width, newRoom.height, Tile.GROUND);
      if (onStepCallback != null) {
        onStepCallback(obtainMap(_state), _state.steps);
      }
    }
  }
  if (onRoomExpandedCallback != null) {
    onRoomExpandedCallback(obtainMap(_state, _state.steps));
  }
  return _state;
};

this.Defaults = Defaults;

this.generate = generateMap;

obtainMap = function(state) {
  return new Map(state.tilemap.width, state.tilemap.height, state.roomList);
};

getOppositeDirection = function(door) {
  return ((door % 4) + 2) % 4;
};

cloneState = function(state) {
  var room;
  return {
    roomList: (function() {
      var j, len, ref1, results;
      ref1 = state.roomList;
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        room = ref1[j];
        results.push(room.clone());
      }
      return results;
    })(),
    tilemap: clone(state.tilemap),
    frontier: (function() {
      var j, len, ref1, results;
      ref1 = state.frontier;
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        room = ref1[j];
        results.push(room.clone());
      }
      return results;
    })(),
    steps: state.steps,
    remainingRooms: state.remainingRooms
  };
};

getPossibleNeighbours = function(door, room, tilemap, minSize, maxSize) {
  var candidate, candidates, doorDirection, doorIndex, doorOnNeighbour, height, j, k, l, neighbours, numberOfDoors, offset, offsetMax, ref, ref1, ref2, ref3, ref4, ref5, width, xOrigin, yOrigin;
  if (minSize == null) {
    minSize = 1;
  }
  if (maxSize == null) {
    maxSize = 2;
  }
  console.log("Inside possible neighbours: ", door);
  doorDirection = door % 4;
  ref = (function() {
    switch (doorDirection) {
      case Direction.NORTH:
        return new Point(room.origin[0] + Math.floor(door / 4), room.origin[1]);
      case Direction.SOUTH:
        return new Point(room.origin[0] + Math.floor(door / 4), room.origin[1] + room.height - 1);
      case Direction.EAST:
        return new Point(room.origin[0] + room.width - 1, room.origin[1] + Math.floor(door / 4));
      case Direction.WEST:
        return new Point(room.origin[0], room.origin[1] + Math.floor(door / 4));
    }
  })();
  candidates = [];
  for (height = j = ref1 = minSize, ref2 = maxSize; ref1 <= ref2 ? j <= ref2 : j >= ref2; height = ref1 <= ref2 ? ++j : --j) {
    for (width = k = ref3 = minSize, ref4 = maxSize; ref3 <= ref4 ? k <= ref4 : k >= ref4; width = ref3 <= ref4 ? ++k : --k) {
      offsetMax = doorDirection === Direction.NORTH || doorDirection === Direction.SOUTH ? width : height;
      for (offset = l = ref5 = 1 - offsetMax; ref5 <= 0 ? l <= 0 : l >= 0; offset = ref5 <= 0 ? ++l : --l) {
        console.log(door);
        doorOnNeighbour = 4 * offset * (-1) + getOppositeDirection(door);
        numberOfDoors = Math.max(width, height) * 4;
        neighbours = (function() {
          var m, ref6, results;
          results = [];
          for (doorIndex = m = 0, ref6 = numberOfDoors; 0 <= ref6 ? m < ref6 : m > ref6; doorIndex = 0 <= ref6 ? ++m : --m) {
            if (doorIndex === doorOnNeighbour) {
              results.push(room.id);
            } else {
              results.push(null);
            }
          }
          return results;
        })();
        console.log(door, doorOnNeighbour, neighbours);
        xOrigin = (function() {
          switch (doorDirection) {
            case Direction.EAST:
              return ref[0] + 1;
            case Direction.WEST:
              return ref[0] - width;
            default:
              return ref[0] + offset;
          }
        })();
        yOrigin = (function() {
          switch (doorDirection) {
            case Direction.NORTH:
              return ref[1] - height;
            case Direction.SOUTH:
              return ref[1] + 1;
            default:
              return ref[1] + offset;
          }
        })();
        candidate = new Room(xOrigin, yOrigin, width, height, neighbours);
        if (tilemap.is(candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)) {
          candidates.push(candidate);
        }
      }
    }
  }
  return candidates;
};

getPossibleNeighboursx = function(door, room, tilemap, minSize, maxSize) {
  var ref;
  switch (door % 4) {
    case Direction.NORTH:
      ref = new Point(room.origin[0] + Math.floor(door / 4), room.origin[1]);
      return getNorthCandidates(ref, room.id, tilemap, minSize, maxSize);
    case Direction.SOUTH:
      ref = new Point(room.origin[0] + Math.floor(door / 4), room.origin[1] + room.height - 1);
      return getSouthCandidates(ref, room.id, tilemap, minSize, maxSize);
    case Direction.EAST:
      ref = new Point(room.origin[0] + room.width - 1, room.origin[1] + Math.floor(door / 4));
      return getEastCandidates(ref, room.id, tilemap, minSize, maxSize);
    case Direction.WEST:
      ref = new Point(room.origin[0], room.origin[1] + Math.floor(door / 4));
      return getWestCandidates(ref, room.id, tilemap, minSize, maxSize);
  }
};

getNorthCandidates = function(ref, room, tilemap, minSize, maxSize) {
  var candidate, candidates, door, doorOnNeighbour, height, j, k, l, neighbours, numberOfDoors, ref1, ref2, ref3, ref4, ref5, width, xOffset;
  if (minSize == null) {
    minSize = 1;
  }
  if (maxSize == null) {
    maxSize = 2;
  }
  candidates = [];
  for (height = j = ref1 = minSize, ref2 = maxSize; ref1 <= ref2 ? j <= ref2 : j >= ref2; height = ref1 <= ref2 ? ++j : --j) {
    for (width = k = ref3 = minSize, ref4 = maxSize; ref3 <= ref4 ? k <= ref4 : k >= ref4; width = ref3 <= ref4 ? ++k : --k) {
      for (xOffset = l = ref5 = 1 - width; ref5 <= 0 ? l <= 0 : l >= 0; xOffset = ref5 <= 0 ? ++l : --l) {
        doorOnNeighbour = 4 * xOffset * (-1) + Direction.SOUTH;
        numberOfDoors = Math.max(width, height) * 4;
        neighbours = (function() {
          var m, ref6, results;
          results = [];
          for (door = m = 0, ref6 = numberOfDoors; 0 <= ref6 ? m < ref6 : m > ref6; door = 0 <= ref6 ? ++m : --m) {
            results.push(door === doorOnNeighbour ? room : null);
          }
          return results;
        })();
        candidate = new Room(ref[0] + xOffset, ref[1] - height, width, height, neighbours);
        if (tilemap.is(candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)) {
          candidates.push(candidate);
        }
      }
    }
  }
  return candidates;
};

getSouthCandidates = function(ref, room, tilemap, minSize, maxSize) {
  var candidate, candidates, door, doorOnNeighbour, height, j, k, l, neighbours, numberOfDoors, ref1, ref2, ref3, ref4, ref5, width, xOffset;
  if (minSize == null) {
    minSize = 1;
  }
  if (maxSize == null) {
    maxSize = 2;
  }
  candidates = [];
  for (height = j = ref1 = minSize, ref2 = maxSize; ref1 <= ref2 ? j <= ref2 : j >= ref2; height = ref1 <= ref2 ? ++j : --j) {
    for (width = k = ref3 = minSize, ref4 = maxSize; ref3 <= ref4 ? k <= ref4 : k >= ref4; width = ref3 <= ref4 ? ++k : --k) {
      for (xOffset = l = ref5 = 1 - width; ref5 <= 0 ? l <= 0 : l >= 0; xOffset = ref5 <= 0 ? ++l : --l) {
        doorOnNeighbour = 4 * xOffset * (-1) + Direction.NORTH;
        numberOfDoors = Math.max(width, height) * 4;
        neighbours = (function() {
          var m, ref6, results;
          results = [];
          for (door = m = 0, ref6 = numberOfDoors; 0 <= ref6 ? m < ref6 : m > ref6; door = 0 <= ref6 ? ++m : --m) {
            results.push(door === doorOnNeighbour ? room : null);
          }
          return results;
        })();
        candidate = new Room(ref[0] + xOffset, ref[1] + 1, width, height, neighbours);
        if (tilemap.is(candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)) {
          candidates.push(candidate);
        }
      }
    }
  }
  return candidates;
};

getEastCandidates = function(ref, room, tilemap, minSize, maxSize) {
  var candidate, candidates, door, doorOnNeighbour, height, j, k, l, neighbours, numberOfDoors, ref1, ref2, ref3, ref4, ref5, width, yOffset;
  if (minSize == null) {
    minSize = 1;
  }
  if (maxSize == null) {
    maxSize = 2;
  }
  candidates = [];
  for (width = j = ref1 = minSize, ref2 = maxSize; ref1 <= ref2 ? j <= ref2 : j >= ref2; width = ref1 <= ref2 ? ++j : --j) {
    for (height = k = ref3 = minSize, ref4 = maxSize; ref3 <= ref4 ? k <= ref4 : k >= ref4; height = ref3 <= ref4 ? ++k : --k) {
      for (yOffset = l = ref5 = 1 - height; ref5 <= 0 ? l <= 0 : l >= 0; yOffset = ref5 <= 0 ? ++l : --l) {
        doorOnNeighbour = 4 * yOffset * (-1) + Direction.WEST;
        numberOfDoors = Math.max(width, height) * 4;
        neighbours = (function() {
          var m, ref6, results;
          results = [];
          for (door = m = 0, ref6 = numberOfDoors; 0 <= ref6 ? m < ref6 : m > ref6; door = 0 <= ref6 ? ++m : --m) {
            results.push(door === doorOnNeighbour ? room : null);
          }
          return results;
        })();
        candidate = new Room(ref[0] + 1, ref[1] + yOffset, width, height, neighbours);
        if (tilemap.is(candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)) {
          candidates.push(candidate);
        }
      }
    }
  }
  return candidates;
};

getWestCandidates = function(ref, room, tilemap, minSize, maxSize) {
  var candidate, candidates, door, doorOnNeighbour, height, j, k, l, neighbours, numberOfDoors, ref1, ref2, ref3, ref4, ref5, width, yOffset;
  if (minSize == null) {
    minSize = 1;
  }
  if (maxSize == null) {
    maxSize = 2;
  }
  candidates = [];
  for (width = j = ref1 = minSize, ref2 = maxSize; ref1 <= ref2 ? j <= ref2 : j >= ref2; width = ref1 <= ref2 ? ++j : --j) {
    for (height = k = ref3 = minSize, ref4 = maxSize; ref3 <= ref4 ? k <= ref4 : k >= ref4; height = ref3 <= ref4 ? ++k : --k) {
      for (yOffset = l = ref5 = 1 - height; ref5 <= 0 ? l <= 0 : l >= 0; yOffset = ref5 <= 0 ? ++l : --l) {
        doorOnNeighbour = 4 * yOffset * (-1) + Direction.EAST;
        numberOfDoors = Math.max(width, height) * 4;
        neighbours = (function() {
          var m, ref6, results;
          results = [];
          for (door = m = 0, ref6 = numberOfDoors; 0 <= ref6 ? m < ref6 : m > ref6; door = 0 <= ref6 ? ++m : --m) {
            results.push(door === doorOnNeighbour ? room : null);
          }
          return results;
        })();
        candidate = new Room(ref[0] - width, ref[1] + yOffset, width, height, neighbours);
        if (tilemap.is(candidate.origin[0], candidate.origin[1], width, height, Tile.EMPTY)) {
          candidates.push(candidate);
        }
      }
    }
  }
  return candidates;
};

//# sourceMappingURL=data:application/json;base64,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QWQsRUFBcUIsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFTLE9BQTlCLEVBQXVDLEtBQXZDLEVBQThDLE1BQTlDLEVBQXNELFVBQXREO1FBQ2hCLElBQTZCLE9BQU8sQ0FBQyxFQUFSLENBQzNCLFNBQVMsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQURVLEVBQ04sU0FBUyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBRFgsRUFDZSxLQURmLEVBQ3NCLE1BRHRCLEVBQzhCLElBQUksQ0FBQyxLQURuQyxDQUE3QjtVQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFNBQWhCLEVBQUE7O0FBTkY7QUFEbUM7QUFBckM7QUFTQSxTQUFPO0FBWFciLCJmaWxlIjoibW9kZWwvZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuIyAgVGhpcyBmaWxlIGNvbnRhaW5zIHRoZSBmdW5jdGlvbnMgdG8gcmFuZG9tbHkgZ2VuZXJhdGUgdGhlIG1hcC5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyAgQXV0aG9yOiBBZHJpYW4gTW9yZW5vXHJcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4jIyMgRGVmYXVsdCB2YWx1ZXMgZm9yIHRoZSBnZW5lcmF0b3IgIyMjXHJcbkRlZmF1bHRzID1cclxuICBNQVBfV0lEVEg6IDEwXHJcbiAgTlVNQkVSX09GX1JPT01TOiAxNVxyXG4gIFRJTEVTX1BFUl9VTklUOiAzXHJcbiAgSU5JVElBTF9ST09NX1dJRFRIOiAxXHJcbiAgSU5JVElBTF9ST09NX0hFSUdIVDogMVxyXG4gIE1JTl9ST09NX1dJRFRIOiAxXHJcbiAgTUFYX1JPT01fV0lEVEg6IDJcclxuXHJcblxyXG4jIyMgSGlnaCBsZXZlbCBtYXAgZ2VuZXJhdGlvbiBhbGdvcnl0aG0gIyMjXHJcbmdlbmVyYXRlTWFwID0gKHdpZHRoLCBoZWlnaHQsIG51bWJlck9mUm9vbXMgPSAxMCwgcm9vbVByb3BlcnRpZXMgPSB7fSwgb25TdGVwQ2FsbGJhY2spIC0+XHJcbiAgc3RhdGUgPSBnZW5lcmF0ZUluaXRpYWxTdGF0ZSh3aWR0aCwgaGVpZ2h0LFxyXG4gICAgICByb29tUHJvcGVydGllcy5pbml0aWFsUm9vbVdpZHRoLCByb29tUHJvcGVydGllcy5pbml0aWFsUm9vbUhlaWdodClcclxuICBzdGF0ZS5yZW1haW5pbmdSb29tcyA9IG51bWJlck9mUm9vbXMgLSAxICAjIFRha2UgaW5pdGlhbCByb29tXHJcbiAgaWYgb25TdGVwQ2FsbGJhY2s/IHRoZW4gb25TdGVwQ2FsbGJhY2sob2J0YWluTWFwKHN0YXRlKSwgc3RhdGUuc3RlcHMpXHJcbiAgd2hpbGUgc3RhdGUucmVtYWluaW5nUm9vbXMgPiAwXHJcbiAgICBzdGF0ZSA9IGV4cGFuZFJvb21Gcm9tRnJvbnRpZXIoc3RhdGUsIHJvb21Qcm9wZXJ0aWVzLCBvblN0ZXBDYWxsYmFjaylcclxuICByZXR1cm4gbmV3IE1hcChzdGF0ZS50aWxlbWFwLndpZHRoLCBzdGF0ZS50aWxlbWFwLmhlaWdodCwgc3RhdGUucm9vbUxpc3QpXHJcblxyXG4jIyNcclxuICBHZW5lcmF0ZSB0aGUgZmlyc3Qgc3RhdGUgZm9yIGEgbWFwLCBqdXN0IGJ5IGdlbmVyYXRpbmcgYSBtYXAgd2l0aCBnaXZlbiB3aWR0aFxyXG4gIGFuZCBoZWlnaHQgYW5kIGFkZGluZyBhIHJvb20gYXQgYSByYW5kb20gcG9zaXRpb24gb24gaXQuXHJcbiMjI1xyXG5nZW5lcmF0ZUluaXRpYWxTdGF0ZSA9ICh3aWR0aCwgaGVpZ2h0LCBmaXJzdFJvb21XaWR0aD0xLCBmaXJzdFJvb21IZWlnaHQ9MSkgLT5cclxuICB4ID0gcmFuZG9tLnZhbHVlKHdpZHRoICogMC40MCwgd2lkdGggKiAwLjYwKVxyXG4gIHkgPSByYW5kb20udmFsdWUoaGVpZ2h0ICogMC40MCwgaGVpZ2h0ICogMC42MClcclxuICBvcmlnaW5Sb29tID0gbmV3IFJvb20oeCwgeSwgZmlyc3RSb29tV2lkdGgsIGZpcnN0Um9vbUhlaWdodCwgdW5kZWZpbmVkLCAwKVxyXG4gIG9yaWdpblJvb20uc3BlY2lhbCA9ICdmaXJzdCByb29tJ1xyXG4gIHRpbGVtYXAgPSBuZXcgVGlsZW1hcCh3aWR0aCwgaGVpZ2h0LCBUaWxlLkVNUFRZKVxyXG4gIHRpbGVtYXAuc2V0KG9yaWdpblJvb20ub3JpZ2luWzBdLCBvcmlnaW5Sb29tLm9yaWdpblsxXSxcclxuICAgICAgb3JpZ2luUm9vbS53aWR0aCwgb3JpZ2luUm9vbS5oZWlnaHQsIFRpbGUuRklSU1RfUk9PTSlcclxuICByb29tTGlzdCA9IFtvcmlnaW5Sb29tXVxyXG4gIGZyb250aWVyID0gW29yaWdpblJvb21dXHJcbiAgcmV0dXJuIHsgcm9vbUxpc3Q6IHJvb21MaXN0LCB0aWxlbWFwOiB0aWxlbWFwLCBmcm9udGllcjogZnJvbnRpZXIsIHN0ZXBzOiAwIH1cclxuXHJcbiMjI1xyXG4gIEV4dHJhY3QgdGhlIGZpcnN0IHJvb20gb2YgdGhlIGZyb250aWVyIGFuZCBleHBhbmQgaXQsIGdlbmVyYXRpbmcgaXRzXHJcbiAgbmVpZ2hib3VycyBhbmQgYWRkaW5nIHRoZW0gdG8gdGhlIGZyb250aWVyIGFzIHdlbGxcclxuIyMjXHJcbmV4cGFuZFJvb21Gcm9tRnJvbnRpZXIgPSAoc3RhdGUsIHByb3BlcnRpZXMsIG9uU3RlcENhbGxiYWNrLCBvblJvb21FeHBhbmRlZENhbGxiYWNrKSAtPlxyXG4gIF9zdGF0ZSA9IGNsb25lU3RhdGUoc3RhdGUpICAjIERlZXAgY29weSBvZiBfc2F0ZSBmb3IgdGhlIHNha2Ugb2YgaW5tdXRhYmlsaXR5XHJcbiAgcm9vbSA9IF9zdGF0ZS5mcm9udGllci5zaGlmdCgpXHJcbiAgZm9yIGRvb3IsIGkgaW4gcmFuZG9tLnNodWZmbGUocm9vbS5nZXRBdmFpbGFibGVFeGl0cygpKSB3aGVuIF9zdGF0ZS5yZW1haW5pbmdSb29tcyA+IDBcclxuICAgIGNvbnNvbGUubG9nIGRvb3JcclxuICAgIF9zdGF0ZSA9IGNsb25lU3RhdGUoX3N0YXRlKSBpZiBpID4gMCAgIyBHZW5lcmF0ZSBuZXcgc3RhdGUgZm9yIGVhY2ggbmV3IHN0ZXBcclxuICAgIF9yb29tID0gX3N0YXRlLnJvb21MaXN0W3Jvb20uaWRdICAjIEdldCB0aGUgcmVmZXJlbmNlIHRvIHJvb20gZnJvbSBjbG9uZWQgc3RhdGVcclxuICAgIGNhbmRpZGF0ZXMgPSBnZXRQb3NzaWJsZU5laWdoYm91cnMoZG9vciwgX3Jvb20sIF9zdGF0ZS50aWxlbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLm1pblJvb21TaXplLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLm1heFJvb21TaXplKVxyXG4gICAgaWYgY2FuZGlkYXRlcy5sZW5ndGggPiAwXHJcbiAgICAgIG5ld1Jvb20gPSBjYW5kaWRhdGVzW3JhbmRvbS52YWx1ZSgwLCBjYW5kaWRhdGVzLmxlbmd0aCldXHJcbiAgICAgIG5ld1Jvb20uaWQgPSBfc3RhdGUucm9vbUxpc3QubGVuZ3RoXHJcbiAgICAgIF9yb29tLm5laWdoYm91cnNbZG9vcl0gPSBuZXdSb29tLmlkXHJcbiAgICAgIF9zdGF0ZS5yb29tTGlzdC5wdXNoKG5ld1Jvb20pXHJcbiAgICAgIF9zdGF0ZS5mcm9udGllci5wdXNoKG5ld1Jvb20pXHJcbiAgICAgIF9zdGF0ZS5zdGVwcysrXHJcbiAgICAgIF9zdGF0ZS5yZW1haW5pbmdSb29tcy0tXHJcbiAgICAgIF9zdGF0ZS50aWxlbWFwLnNldChuZXdSb29tLm9yaWdpblswXSwgbmV3Um9vbS5vcmlnaW5bMV0sXHJcbiAgICAgICAgbmV3Um9vbS53aWR0aCwgbmV3Um9vbS5oZWlnaHQsIFRpbGUuR1JPVU5EKVxyXG4gICAgICBpZiBvblN0ZXBDYWxsYmFjaz8gdGhlbiBvblN0ZXBDYWxsYmFjayhvYnRhaW5NYXAoX3N0YXRlKSwgX3N0YXRlLnN0ZXBzKVxyXG4gIGlmIG9uUm9vbUV4cGFuZGVkQ2FsbGJhY2s/IHRoZW4gb25Sb29tRXhwYW5kZWRDYWxsYmFjayhvYnRhaW5NYXAgX3N0YXRlLCBfc3RhdGUuc3RlcHMpXHJcbiAgcmV0dXJuIF9zdGF0ZVxyXG5cclxuIyBNYWtlIGF2YWlsYWJsZSBnbG9iYWxseVxyXG50aGlzLkRlZmF1bHRzID0gRGVmYXVsdHNcclxudGhpcy5nZW5lcmF0ZSA9IGdlbmVyYXRlTWFwXHJcblxyXG5cclxuIyBIRUxQRVJTXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4jIEdldCBhIG1hcCBpbnN0YW5jZSBmcm9tIGEgc3RhdGVcclxub2J0YWluTWFwID0gKHN0YXRlKSAtPlxyXG4gIG5ldyBNYXAoc3RhdGUudGlsZW1hcC53aWR0aCwgc3RhdGUudGlsZW1hcC5oZWlnaHQsIHN0YXRlLnJvb21MaXN0KVxyXG5cclxuZ2V0T3Bwb3NpdGVEaXJlY3Rpb24gPSAoZG9vcikgLT4gKChkb29yICUgNCkgKyAyKSAlIDRcclxuIyBnZXRPcHBvc2l0ZURpcmVjdGlvbiA9IChkb29yKSAtPiBzd2l0Y2ggZG9vciAlIDRcclxuICAjIHdoZW4gRGlyZWN0aW9uLk5PUlRIIHRoZW4gRGlyZWN0aW9uLlNPVVRIXHJcbiAgIyB3aGVuIERpcmVjdGlvbi5TT1VUSCB0aGVuIERpcmVjdGlvbi5OT1JUSFxyXG4gICMgd2hlbiBEaXJlY3Rpb24uRUFTVCB0aGVuIERpcmVjdGlvbi5XRVNUXHJcbiAgIyB3aGVuIERpcmVjdGlvbi5XRVNUIHRoZW4gRGlyZWN0aW9uLkVBU1RcclxuXHJcbiMgRGVlcCBjb3B5IG9mIHN0YXRlXHJcbmNsb25lU3RhdGUgPSAoc3RhdGUpIC0+XHJcbiAgcm9vbUxpc3Q6IChyb29tLmNsb25lKCkgZm9yIHJvb20gaW4gc3RhdGUucm9vbUxpc3QpXHJcbiAgdGlsZW1hcDogY2xvbmUgc3RhdGUudGlsZW1hcFxyXG4gIGZyb250aWVyOiAocm9vbS5jbG9uZSgpIGZvciByb29tIGluIHN0YXRlLmZyb250aWVyKVxyXG4gIHN0ZXBzOiBzdGF0ZS5zdGVwc1xyXG4gIHJlbWFpbmluZ1Jvb21zOiBzdGF0ZS5yZW1haW5pbmdSb29tc1xyXG5cclxuZ2V0UG9zc2libGVOZWlnaGJvdXJzID0gKGRvb3IsIHJvb20sIHRpbGVtYXAsIG1pblNpemUgPSAxLCBtYXhTaXplID0gMikgLT5cclxuICBjb25zb2xlLmxvZyBcIkluc2lkZSBwb3NzaWJsZSBuZWlnaGJvdXJzOiBcIiwgZG9vclxyXG4gIGRvb3JEaXJlY3Rpb24gPSBkb29yICUgNFxyXG4gIHJlZiA9IHN3aXRjaCBkb29yRGlyZWN0aW9uXHJcbiAgICB3aGVuIERpcmVjdGlvbi5OT1JUSFxyXG4gICAgICBuZXcgUG9pbnQocm9vbS5vcmlnaW5bMF0gKyBkb29yIC8vIDQsIHJvb20ub3JpZ2luWzFdKVxyXG4gICAgd2hlbiBEaXJlY3Rpb24uU09VVEhcclxuICAgICAgbmV3IFBvaW50KHJvb20ub3JpZ2luWzBdICsgZG9vciAvLyA0LCByb29tLm9yaWdpblsxXSArIHJvb20uaGVpZ2h0IC0gMSlcclxuICAgIHdoZW4gRGlyZWN0aW9uLkVBU1RcclxuICAgICAgbmV3IFBvaW50KHJvb20ub3JpZ2luWzBdICsgcm9vbS53aWR0aCAtIDEsIHJvb20ub3JpZ2luWzFdICsgZG9vciAvLyA0KVxyXG4gICAgd2hlbiBEaXJlY3Rpb24uV0VTVFxyXG4gICAgICBuZXcgUG9pbnQocm9vbS5vcmlnaW5bMF0sIHJvb20ub3JpZ2luWzFdICsgZG9vciAvLyA0KVxyXG4gIGNhbmRpZGF0ZXMgPSBbXVxyXG4gICMgR2VuZXJhdGUgcm9vbXMgZm9yIGFsbCB0aGUgcG9zc2libGUgc2l6ZXNcclxuICBmb3IgaGVpZ2h0IGluIFttaW5TaXplLi5tYXhTaXplXSB0aGVuIGZvciB3aWR0aCBpbiBbbWluU2l6ZS4ubWF4U2l6ZV1cclxuICAgICMgSXRlcmF0ZSBhbGwgb3ZlciB0aGUgcG9zc2libGUgcG9zaXRpb25zIHRoZSByb29tIGNvdWxkIGJlXHJcbiAgICBvZmZzZXRNYXggPSBpZiBkb29yRGlyZWN0aW9uIGlzIERpcmVjdGlvbi5OT1JUSCBvciBkb29yRGlyZWN0aW9uIGlzIERpcmVjdGlvbi5TT1VUSCB0aGVuIHdpZHRoIGVsc2UgaGVpZ2h0XHJcbiAgICBmb3Igb2Zmc2V0IGluIFsxIC0gb2Zmc2V0TWF4Li4wXVxyXG4gICAgICBjb25zb2xlLmxvZyBkb29yXHJcbiAgICAgICMgQ2FsY3VsYXRlIHRoZSBkb29yIHdoZXJlIHRoZSByb29tIHdpbGwgYmUgbGlua2VkIG9uIHRoZSBjYW5kaWRhdGVcclxuICAgICAgZG9vck9uTmVpZ2hib3VyID0gNCAqIG9mZnNldCAqICgtMSkgKyBnZXRPcHBvc2l0ZURpcmVjdGlvbihkb29yKVxyXG4gICAgICAjIEdlbmVyYXRlIHRoZSBuZWlnaGJvdXIgYXJyYXkgZm9yIHRoZSBjYW5kaWRhdGVcclxuICAgICAgbnVtYmVyT2ZEb29ycyA9IE1hdGgubWF4KHdpZHRoLCBoZWlnaHQpICogNFxyXG4gICAgICBuZWlnaGJvdXJzID0gZm9yIGRvb3JJbmRleCBpbiBbMC4uLm51bWJlck9mRG9vcnNdXHJcbiAgICAgICAgaWYgZG9vckluZGV4IGlzIGRvb3JPbk5laWdoYm91ciB0aGVuIHJvb20uaWQgZWxzZSBudWxsXHJcbiAgICAgIGNvbnNvbGUubG9nIGRvb3IsIGRvb3JPbk5laWdoYm91ciwgbmVpZ2hib3Vyc1xyXG4gICAgICAjIENhbGN1bGF0ZSB0aGUgb3JpZ2luIG9mIHRoZSByb29tXHJcbiAgICAgIHhPcmlnaW4gPSBzd2l0Y2ggZG9vckRpcmVjdGlvblxyXG4gICAgICAgIHdoZW4gRGlyZWN0aW9uLkVBU1QgdGhlbiByZWZbMF0gKyAxXHJcbiAgICAgICAgd2hlbiBEaXJlY3Rpb24uV0VTVCB0aGVuIHJlZlswXSAtIHdpZHRoXHJcbiAgICAgICAgZWxzZSByZWZbMF0gKyBvZmZzZXRcclxuICAgICAgeU9yaWdpbiA9IHN3aXRjaCBkb29yRGlyZWN0aW9uXHJcbiAgICAgICAgd2hlbiBEaXJlY3Rpb24uTk9SVEggdGhlbiByZWZbMV0gLSBoZWlnaHRcclxuICAgICAgICB3aGVuIERpcmVjdGlvbi5TT1VUSCB0aGVuIHJlZlsxXSArIDFcclxuICAgICAgICBlbHNlIHJlZlsxXSArIG9mZnNldFxyXG4gICAgICBjYW5kaWRhdGUgPSBuZXcgUm9vbSh4T3JpZ2luLCB5T3JpZ2luLCB3aWR0aCwgaGVpZ2h0LCBuZWlnaGJvdXJzKVxyXG4gICAgICAjIEFkZCB0aGUgZG9vciB0byB0aGUgY2FuZGlkYXRlcyBpZiBpdCBkb2Vzbid0IGNvbGxpZGUgd2l0aCBhbnl0aGluZ1xyXG4gICAgICBjYW5kaWRhdGVzLnB1c2goY2FuZGlkYXRlKSBpZiB0aWxlbWFwLmlzKFxyXG4gICAgICAgIGNhbmRpZGF0ZS5vcmlnaW5bMF0sIGNhbmRpZGF0ZS5vcmlnaW5bMV0sIHdpZHRoLCBoZWlnaHQsIFRpbGUuRU1QVFkpXHJcbiAgcmV0dXJuIGNhbmRpZGF0ZXNcclxuXHJcblxyXG5cclxuXHJcblxyXG5nZXRQb3NzaWJsZU5laWdoYm91cnN4ID0gKGRvb3IsIHJvb20sIHRpbGVtYXAsIG1pblNpemUsIG1heFNpemUpIC0+XHJcbiAgIyBDYWxjdWxhdGUgcmVmZXJlbmNlIHBvaW50IGFuZCBnZXQgY2FuZGlkYXRvcyBmcm9tIHRoYXQgcG9zaXRpb25cclxuICBzd2l0Y2ggZG9vciAlIDRcclxuICAgIHdoZW4gRGlyZWN0aW9uLk5PUlRIXHJcbiAgICAgIHJlZiA9IG5ldyBQb2ludChyb29tLm9yaWdpblswXSArIGRvb3IgLy8gNCwgcm9vbS5vcmlnaW5bMV0pXHJcbiAgICAgIGdldE5vcnRoQ2FuZGlkYXRlcyhyZWYsIHJvb20uaWQsIHRpbGVtYXAsIG1pblNpemUsIG1heFNpemUpXHJcbiAgICB3aGVuIERpcmVjdGlvbi5TT1VUSFxyXG4gICAgICByZWYgPSBuZXcgUG9pbnQocm9vbS5vcmlnaW5bMF0gKyBkb29yIC8vIDQsIHJvb20ub3JpZ2luWzFdICsgcm9vbS5oZWlnaHQgLSAxKVxyXG4gICAgICBnZXRTb3V0aENhbmRpZGF0ZXMocmVmLCByb29tLmlkLCB0aWxlbWFwLCBtaW5TaXplLCBtYXhTaXplKVxyXG4gICAgd2hlbiBEaXJlY3Rpb24uRUFTVFxyXG4gICAgICByZWYgPSBuZXcgUG9pbnQocm9vbS5vcmlnaW5bMF0gKyByb29tLndpZHRoIC0gMSwgcm9vbS5vcmlnaW5bMV0gKyBkb29yIC8vIDQpXHJcbiAgICAgIGdldEVhc3RDYW5kaWRhdGVzKHJlZiwgcm9vbS5pZCwgdGlsZW1hcCwgbWluU2l6ZSwgbWF4U2l6ZSlcclxuICAgIHdoZW4gRGlyZWN0aW9uLldFU1RcclxuICAgICAgcmVmID0gbmV3IFBvaW50KHJvb20ub3JpZ2luWzBdLCByb29tLm9yaWdpblsxXSArIGRvb3IgLy8gNClcclxuICAgICAgZ2V0V2VzdENhbmRpZGF0ZXMocmVmLCByb29tLmlkLCB0aWxlbWFwLCBtaW5TaXplLCBtYXhTaXplKVxyXG5cclxuZ2V0Tm9ydGhDYW5kaWRhdGVzID0gKHJlZiwgcm9vbSwgdGlsZW1hcCwgbWluU2l6ZSA9IDEsIG1heFNpemUgPSAyKSAtPlxyXG4gIGNhbmRpZGF0ZXMgPSBbXVxyXG4gIGZvciBoZWlnaHQgaW4gW21pblNpemUuLm1heFNpemVdIHRoZW4gZm9yIHdpZHRoIGluIFttaW5TaXplLi5tYXhTaXplXVxyXG4gICAgZm9yIHhPZmZzZXQgaW4gWzEgLSB3aWR0aC4uMF1cclxuICAgICAgZG9vck9uTmVpZ2hib3VyID0gNCAqIHhPZmZzZXQgKiAoLTEpICsgRGlyZWN0aW9uLlNPVVRIXHJcbiAgICAgIG51bWJlck9mRG9vcnMgPSBNYXRoLm1heCh3aWR0aCwgaGVpZ2h0KSAqIDRcclxuICAgICAgbmVpZ2hib3VycyA9XHJcbiAgICAgICAgKGlmIGRvb3IgaXMgZG9vck9uTmVpZ2hib3VyIHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBkb29yIGluIFswLi4ubnVtYmVyT2ZEb29yc11cclxuICAgICAgY2FuZGlkYXRlID0gbmV3IFJvb20ocmVmWzBdICsgeE9mZnNldCwgcmVmWzFdIC0gaGVpZ2h0LCB3aWR0aCwgaGVpZ2h0LCBuZWlnaGJvdXJzKVxyXG4gICAgICBjYW5kaWRhdGVzLnB1c2ggY2FuZGlkYXRlIGlmIHRpbGVtYXAuaXMoXHJcbiAgICAgICAgY2FuZGlkYXRlLm9yaWdpblswXSwgY2FuZGlkYXRlLm9yaWdpblsxXSwgd2lkdGgsIGhlaWdodCwgVGlsZS5FTVBUWSlcclxuICByZXR1cm4gY2FuZGlkYXRlc1xyXG5cclxuZ2V0U291dGhDYW5kaWRhdGVzID0gKHJlZiwgcm9vbSwgdGlsZW1hcCwgbWluU2l6ZSA9IDEsIG1heFNpemUgPSAyKSAtPlxyXG4gIGNhbmRpZGF0ZXMgPSBbXVxyXG4gIGZvciBoZWlnaHQgaW4gW21pblNpemUuLm1heFNpemVdIHRoZW4gZm9yIHdpZHRoIGluIFttaW5TaXplLi5tYXhTaXplXVxyXG4gICAgZm9yIHhPZmZzZXQgaW4gWzEgLSB3aWR0aC4uMF1cclxuICAgICAgZG9vck9uTmVpZ2hib3VyID0gNCAqIHhPZmZzZXQgKiAoLTEpICsgRGlyZWN0aW9uLk5PUlRIXHJcbiAgICAgIG51bWJlck9mRG9vcnMgPSBNYXRoLm1heCh3aWR0aCwgaGVpZ2h0KSAqIDRcclxuICAgICAgbmVpZ2hib3VycyA9XHJcbiAgICAgICAgKGlmIGRvb3IgaXMgZG9vck9uTmVpZ2hib3VyIHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBkb29yIGluIFswLi4ubnVtYmVyT2ZEb29yc11cclxuICAgICAgY2FuZGlkYXRlID0gbmV3IFJvb20ocmVmWzBdICsgeE9mZnNldCwgcmVmWzFdICsgMSwgd2lkdGgsIGhlaWdodCwgbmVpZ2hib3VycylcclxuICAgICAgY2FuZGlkYXRlcy5wdXNoIGNhbmRpZGF0ZSBpZiB0aWxlbWFwLmlzKFxyXG4gICAgICAgIGNhbmRpZGF0ZS5vcmlnaW5bMF0sIGNhbmRpZGF0ZS5vcmlnaW5bMV0sIHdpZHRoLCBoZWlnaHQsIFRpbGUuRU1QVFkpXHJcbiAgcmV0dXJuIGNhbmRpZGF0ZXNcclxuXHJcbmdldEVhc3RDYW5kaWRhdGVzID0gKHJlZiwgcm9vbSwgdGlsZW1hcCwgbWluU2l6ZSA9IDEsIG1heFNpemUgPSAyKSAtPlxyXG4gIGNhbmRpZGF0ZXMgPSBbXVxyXG4gIGZvciB3aWR0aCBpbiBbbWluU2l6ZS4ubWF4U2l6ZV0gdGhlbiBmb3IgaGVpZ2h0IGluIFttaW5TaXplLi5tYXhTaXplXVxyXG4gICAgZm9yIHlPZmZzZXQgaW4gWzEgLSBoZWlnaHQuLjBdXHJcbiAgICAgIGRvb3JPbk5laWdoYm91ciA9IDQgKiB5T2Zmc2V0ICogKC0xKSArIERpcmVjdGlvbi5XRVNUXHJcbiAgICAgIG51bWJlck9mRG9vcnMgPSBNYXRoLm1heCh3aWR0aCwgaGVpZ2h0KSAqIDRcclxuICAgICAgbmVpZ2hib3VycyA9XHJcbiAgICAgICAgKGlmIGRvb3IgaXMgZG9vck9uTmVpZ2hib3VyIHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBkb29yIGluIFswLi4ubnVtYmVyT2ZEb29yc11cclxuICAgICAgY2FuZGlkYXRlID0gbmV3IFJvb20ocmVmWzBdICsgMSwgcmVmWzFdICsgeU9mZnNldCwgd2lkdGgsIGhlaWdodCwgbmVpZ2hib3VycylcclxuICAgICAgY2FuZGlkYXRlcy5wdXNoIGNhbmRpZGF0ZSBpZiB0aWxlbWFwLmlzKFxyXG4gICAgICAgIGNhbmRpZGF0ZS5vcmlnaW5bMF0sIGNhbmRpZGF0ZS5vcmlnaW5bMV0sIHdpZHRoLCBoZWlnaHQsIFRpbGUuRU1QVFkpXHJcbiAgcmV0dXJuIGNhbmRpZGF0ZXNcclxuXHJcbmdldFdlc3RDYW5kaWRhdGVzID0gKHJlZiwgcm9vbSwgdGlsZW1hcCwgbWluU2l6ZSA9IDEsIG1heFNpemUgPSAyKSAtPlxyXG4gIGNhbmRpZGF0ZXMgPSBbXVxyXG4gIGZvciB3aWR0aCBpbiBbbWluU2l6ZS4ubWF4U2l6ZV0gdGhlbiBmb3IgaGVpZ2h0IGluIFttaW5TaXplLi5tYXhTaXplXVxyXG4gICAgZm9yIHlPZmZzZXQgaW4gWzEgLSBoZWlnaHQuLjBdXHJcbiAgICAgIGRvb3JPbk5laWdoYm91ciA9IDQgKiB5T2Zmc2V0ICogKC0xKSArIERpcmVjdGlvbi5FQVNUXHJcbiAgICAgIG51bWJlck9mRG9vcnMgPSBNYXRoLm1heCh3aWR0aCwgaGVpZ2h0KSAqIDRcclxuICAgICAgbmVpZ2hib3VycyA9XHJcbiAgICAgICAgKGlmIGRvb3IgaXMgZG9vck9uTmVpZ2hib3VyIHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBkb29yIGluIFswLi4ubnVtYmVyT2ZEb29yc11cclxuICAgICAgY2FuZGlkYXRlID0gbmV3IFJvb20ocmVmWzBdIC0gd2lkdGgsIHJlZlsxXSArIHlPZmZzZXQsIHdpZHRoLCBoZWlnaHQsIG5laWdoYm91cnMpXHJcbiAgICAgIGNhbmRpZGF0ZXMucHVzaCBjYW5kaWRhdGUgaWYgdGlsZW1hcC5pcyhcclxuICAgICAgICBjYW5kaWRhdGUub3JpZ2luWzBdLCBjYW5kaWRhdGUub3JpZ2luWzFdLCB3aWR0aCwgaGVpZ2h0LCBUaWxlLkVNUFRZKVxyXG4gIHJldHVybiBjYW5kaWRhdGVzXHJcblxyXG4iXX0=