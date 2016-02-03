
/* Default values for the generator */
var Defaults, cloneState, expandRoomFromFrontier, generateInitialState, generateMap, getEastCandidates, getNorthCandidates, getPossibleNeighbours, getSouthCandidates, getWestCandidates, obtainMap;

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
  console.log(room === state.frontier[0], room, state.frontier[0]);
  ref1 = random.shuffle(room.getAvailableExits());
  for (i = j = 0, len = ref1.length; j < len; i = ++j) {
    door = ref1[i];
    if (!(_state.remainingRooms > 0)) {
      continue;
    }
    if (i > 0) {
      _state = cloneState(_state);
    }
    _room = _state.roomList[room.id];
    candidates = getPossibleNeighbours(door, room, _state.tilemap, properties.minRoomSize, properties.maxRoomSize);
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

//# sourceMappingURL=data:application/json;base64,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LEVBQ2UsS0FEZixFQUNzQixNQUR0QixFQUM4QixJQUFJLENBQUMsS0FEbkMsQ0FBN0I7VUFBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixTQUFoQixFQUFBOztBQU5GO0FBRG1DO0FBQXJDO0FBU0EsU0FBTztBQVhXIiwiZmlsZSI6Im1vZGVsL2dlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiMgIFRoaXMgZmlsZSBjb250YWlucyB0aGUgZnVuY3Rpb25zIHRvIHJhbmRvbWx5IGdlbmVyYXRlIHRoZSBtYXAuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgIEF1dGhvcjogQWRyaWFuIE1vcmVub1xyXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuIyMjIERlZmF1bHQgdmFsdWVzIGZvciB0aGUgZ2VuZXJhdG9yICMjI1xyXG5EZWZhdWx0cyA9XHJcbiAgTUFQX1dJRFRIOiAxMFxyXG4gIE5VTUJFUl9PRl9ST09NUzogMTVcclxuICBUSUxFU19QRVJfVU5JVDogM1xyXG4gIElOSVRJQUxfUk9PTV9XSURUSDogMVxyXG4gIElOSVRJQUxfUk9PTV9IRUlHSFQ6IDFcclxuICBNSU5fUk9PTV9XSURUSDogMVxyXG4gIE1BWF9ST09NX1dJRFRIOiAyXHJcblxyXG5cclxuIyMjIEhpZ2ggbGV2ZWwgbWFwIGdlbmVyYXRpb24gYWxnb3J5dGhtICMjI1xyXG5nZW5lcmF0ZU1hcCA9ICh3aWR0aCwgaGVpZ2h0LCBudW1iZXJPZlJvb21zID0gMTAsIHJvb21Qcm9wZXJ0aWVzID0ge30sIG9uU3RlcENhbGxiYWNrKSAtPlxyXG4gIHN0YXRlID0gZ2VuZXJhdGVJbml0aWFsU3RhdGUod2lkdGgsIGhlaWdodCxcclxuICAgICAgcm9vbVByb3BlcnRpZXMuaW5pdGlhbFJvb21XaWR0aCwgcm9vbVByb3BlcnRpZXMuaW5pdGlhbFJvb21IZWlnaHQpXHJcbiAgc3RhdGUucmVtYWluaW5nUm9vbXMgPSBudW1iZXJPZlJvb21zIC0gMSAgIyBUYWtlIGluaXRpYWwgcm9vbVxyXG4gIGlmIG9uU3RlcENhbGxiYWNrPyB0aGVuIG9uU3RlcENhbGxiYWNrKG9idGFpbk1hcChzdGF0ZSksIHN0YXRlLnN0ZXBzKVxyXG4gIHdoaWxlIHN0YXRlLnJlbWFpbmluZ1Jvb21zID4gMFxyXG4gICAgc3RhdGUgPSBleHBhbmRSb29tRnJvbUZyb250aWVyKHN0YXRlLCByb29tUHJvcGVydGllcywgb25TdGVwQ2FsbGJhY2spXHJcbiAgcmV0dXJuIG5ldyBNYXAoc3RhdGUudGlsZW1hcC53aWR0aCwgc3RhdGUudGlsZW1hcC5oZWlnaHQsIHN0YXRlLnJvb21MaXN0KVxyXG5cclxuIyMjXHJcbiAgR2VuZXJhdGUgdGhlIGZpcnN0IHN0YXRlIGZvciBhIG1hcCwganVzdCBieSBnZW5lcmF0aW5nIGEgbWFwIHdpdGggZ2l2ZW4gd2lkdGhcclxuICBhbmQgaGVpZ2h0IGFuZCBhZGRpbmcgYSByb29tIGF0IGEgcmFuZG9tIHBvc2l0aW9uIG9uIGl0LlxyXG4jIyNcclxuZ2VuZXJhdGVJbml0aWFsU3RhdGUgPSAod2lkdGgsIGhlaWdodCwgZmlyc3RSb29tV2lkdGg9MSwgZmlyc3RSb29tSGVpZ2h0PTEpIC0+XHJcbiAgeCA9IHJhbmRvbS52YWx1ZSh3aWR0aCAqIDAuNDAsIHdpZHRoICogMC42MClcclxuICB5ID0gcmFuZG9tLnZhbHVlKGhlaWdodCAqIDAuNDAsIGhlaWdodCAqIDAuNjApXHJcbiAgb3JpZ2luUm9vbSA9IG5ldyBSb29tKHgsIHksIGZpcnN0Um9vbVdpZHRoLCBmaXJzdFJvb21IZWlnaHQsIHVuZGVmaW5lZCwgMClcclxuICBvcmlnaW5Sb29tLnNwZWNpYWwgPSAnZmlyc3Qgcm9vbSdcclxuICB0aWxlbWFwID0gbmV3IFRpbGVtYXAod2lkdGgsIGhlaWdodCwgVGlsZS5FTVBUWSlcclxuICB0aWxlbWFwLnNldChvcmlnaW5Sb29tLm9yaWdpblswXSwgb3JpZ2luUm9vbS5vcmlnaW5bMV0sXHJcbiAgICAgIG9yaWdpblJvb20ud2lkdGgsIG9yaWdpblJvb20uaGVpZ2h0LCBUaWxlLkZJUlNUX1JPT00pXHJcbiAgcm9vbUxpc3QgPSBbb3JpZ2luUm9vbV1cclxuICBmcm9udGllciA9IFtvcmlnaW5Sb29tXVxyXG4gIHJldHVybiB7IHJvb21MaXN0OiByb29tTGlzdCwgdGlsZW1hcDogdGlsZW1hcCwgZnJvbnRpZXI6IGZyb250aWVyLCBzdGVwczogMCB9XHJcblxyXG4jIyNcclxuICBFeHRyYWN0IHRoZSBmaXJzdCByb29tIG9mIHRoZSBmcm9udGllciBhbmQgZXhwYW5kIGl0LCBnZW5lcmF0aW5nIGl0c1xyXG4gIG5laWdoYm91cnMgYW5kIGFkZGluZyB0aGVtIHRvIHRoZSBmcm9udGllciBhcyB3ZWxsXHJcbiMjI1xyXG5leHBhbmRSb29tRnJvbUZyb250aWVyID0gKHN0YXRlLCBwcm9wZXJ0aWVzLCBvblN0ZXBDYWxsYmFjaywgb25Sb29tRXhwYW5kZWRDYWxsYmFjaykgLT5cclxuICBfc3RhdGUgPSBjbG9uZVN0YXRlKHN0YXRlKSAgIyBEZWVwIGNvcHkgb2YgX3NhdGUgZm9yIHRoZSBzYWtlIG9mIGlubXV0YWJpbGl0eVxyXG4gIHJvb20gPSBfc3RhdGUuZnJvbnRpZXIuc2hpZnQoKVxyXG4gIGNvbnNvbGUubG9nIHJvb20gaXMgc3RhdGUuZnJvbnRpZXJbMF0sIHJvb20sIHN0YXRlLmZyb250aWVyWzBdXHJcbiAgZm9yIGRvb3IsIGkgaW4gcmFuZG9tLnNodWZmbGUocm9vbS5nZXRBdmFpbGFibGVFeGl0cygpKSB3aGVuIF9zdGF0ZS5yZW1haW5pbmdSb29tcyA+IDBcclxuICAgIF9zdGF0ZSA9IGNsb25lU3RhdGUoX3N0YXRlKSBpZiBpID4gMCAgIyBHZW5lcmF0ZSBuZXcgc3RhdGUgZm9yIGVhY2ggbmV3IHN0ZXBcclxuICAgIF9yb29tID0gX3N0YXRlLnJvb21MaXN0W3Jvb20uaWRdICAjIEdldCB0aGUgcmVmZXJlbmNlIHRvIHJvb20gZnJvbSBjbG9uZWQgc3RhdGVcclxuICAgIGNhbmRpZGF0ZXMgPSBnZXRQb3NzaWJsZU5laWdoYm91cnMoZG9vciwgcm9vbSwgX3N0YXRlLnRpbGVtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMubWluUm9vbVNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMubWF4Um9vbVNpemUpXHJcbiAgICBpZiBjYW5kaWRhdGVzLmxlbmd0aCA+IDBcclxuICAgICAgbmV3Um9vbSA9IGNhbmRpZGF0ZXNbcmFuZG9tLnZhbHVlKDAsIGNhbmRpZGF0ZXMubGVuZ3RoKV1cclxuICAgICAgbmV3Um9vbS5pZCA9IF9zdGF0ZS5yb29tTGlzdC5sZW5ndGhcclxuICAgICAgX3Jvb20ubmVpZ2hib3Vyc1tkb29yXSA9IG5ld1Jvb20uaWRcclxuICAgICAgX3N0YXRlLnJvb21MaXN0LnB1c2gobmV3Um9vbSlcclxuICAgICAgX3N0YXRlLmZyb250aWVyLnB1c2gobmV3Um9vbSlcclxuICAgICAgX3N0YXRlLnN0ZXBzKytcclxuICAgICAgX3N0YXRlLnJlbWFpbmluZ1Jvb21zLS1cclxuICAgICAgX3N0YXRlLnRpbGVtYXAuc2V0KG5ld1Jvb20ub3JpZ2luWzBdLCBuZXdSb29tLm9yaWdpblsxXSxcclxuICAgICAgICBuZXdSb29tLndpZHRoLCBuZXdSb29tLmhlaWdodCwgVGlsZS5HUk9VTkQpXHJcbiAgICAgIGlmIG9uU3RlcENhbGxiYWNrPyB0aGVuIG9uU3RlcENhbGxiYWNrKG9idGFpbk1hcChfc3RhdGUpLCBfc3RhdGUuc3RlcHMpXHJcbiAgaWYgb25Sb29tRXhwYW5kZWRDYWxsYmFjaz8gdGhlbiBvblJvb21FeHBhbmRlZENhbGxiYWNrKG9idGFpbk1hcCBfc3RhdGUsIF9zdGF0ZS5zdGVwcylcclxuICByZXR1cm4gX3N0YXRlXHJcblxyXG4jIE1ha2UgYXZhaWxhYmxlIGdsb2JhbGx5XHJcbnRoaXMuRGVmYXVsdHMgPSBEZWZhdWx0c1xyXG50aGlzLmdlbmVyYXRlID0gZ2VuZXJhdGVNYXBcclxuXHJcblxyXG4jIEhFTFBFUlNcclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiMgR2V0IGEgbWFwIGluc3RhbmNlIGZyb20gYSBzdGF0ZVxyXG5vYnRhaW5NYXAgPSAoc3RhdGUpIC0+XHJcbiAgbmV3IE1hcChzdGF0ZS50aWxlbWFwLndpZHRoLCBzdGF0ZS50aWxlbWFwLmhlaWdodCwgc3RhdGUucm9vbUxpc3QpXHJcblxyXG4jIERlZXAgY29weSBvZiBzdGF0ZVxyXG5jbG9uZVN0YXRlID0gKHN0YXRlKSAtPlxyXG4gIHJvb21MaXN0OiAocm9vbS5jbG9uZSgpIGZvciByb29tIGluIHN0YXRlLnJvb21MaXN0KVxyXG4gIHRpbGVtYXA6IGNsb25lIHN0YXRlLnRpbGVtYXBcclxuICBmcm9udGllcjogKHJvb20uY2xvbmUoKSBmb3Igcm9vbSBpbiBzdGF0ZS5mcm9udGllcilcclxuICBzdGVwczogc3RhdGUuc3RlcHNcclxuICByZW1haW5pbmdSb29tczogc3RhdGUucmVtYWluaW5nUm9vbXNcclxuXHJcbmdldFBvc3NpYmxlTmVpZ2hib3VycyA9IChkb29yLCByb29tLCB0aWxlbWFwLCBtaW5TaXplLCBtYXhTaXplKSAtPlxyXG4gICMgQ2FsY3VsYXRlIHJlZmVyZW5jZSBwb2ludCBhbmQgZ2V0IGNhbmRpZGF0b3MgZnJvbSB0aGF0IHBvc2l0aW9uXHJcbiAgc3dpdGNoIGRvb3IgJSA0XHJcbiAgICB3aGVuIERpcmVjdGlvbi5OT1JUSFxyXG4gICAgICByZWYgPSBuZXcgUG9pbnQocm9vbS5vcmlnaW5bMF0gKyBkb29yIC8vIDQsIHJvb20ub3JpZ2luWzFdKVxyXG4gICAgICBnZXROb3J0aENhbmRpZGF0ZXMocmVmLCByb29tLmlkLCB0aWxlbWFwLCBtaW5TaXplLCBtYXhTaXplKVxyXG4gICAgd2hlbiBEaXJlY3Rpb24uU09VVEhcclxuICAgICAgcmVmID0gbmV3IFBvaW50KHJvb20ub3JpZ2luWzBdICsgZG9vciAvLyA0LCByb29tLm9yaWdpblsxXSArIHJvb20uaGVpZ2h0IC0gMSlcclxuICAgICAgZ2V0U291dGhDYW5kaWRhdGVzKHJlZiwgcm9vbS5pZCwgdGlsZW1hcCwgbWluU2l6ZSwgbWF4U2l6ZSlcclxuICAgIHdoZW4gRGlyZWN0aW9uLkVBU1RcclxuICAgICAgcmVmID0gbmV3IFBvaW50KHJvb20ub3JpZ2luWzBdICsgcm9vbS53aWR0aCAtIDEsIHJvb20ub3JpZ2luWzFdICsgZG9vciAvLyA0KVxyXG4gICAgICBnZXRFYXN0Q2FuZGlkYXRlcyhyZWYsIHJvb20uaWQsIHRpbGVtYXAsIG1pblNpemUsIG1heFNpemUpXHJcbiAgICB3aGVuIERpcmVjdGlvbi5XRVNUXHJcbiAgICAgIHJlZiA9IG5ldyBQb2ludChyb29tLm9yaWdpblswXSwgcm9vbS5vcmlnaW5bMV0gKyBkb29yIC8vIDQpXHJcbiAgICAgIGdldFdlc3RDYW5kaWRhdGVzKHJlZiwgcm9vbS5pZCwgdGlsZW1hcCwgbWluU2l6ZSwgbWF4U2l6ZSlcclxuXHJcbmdldE5vcnRoQ2FuZGlkYXRlcyA9IChyZWYsIHJvb20sIHRpbGVtYXAsIG1pblNpemUgPSAxLCBtYXhTaXplID0gMikgLT5cclxuICBjYW5kaWRhdGVzID0gW11cclxuICBmb3IgaGVpZ2h0IGluIFttaW5TaXplLi5tYXhTaXplXSB0aGVuIGZvciB3aWR0aCBpbiBbbWluU2l6ZS4ubWF4U2l6ZV1cclxuICAgIGZvciB4T2Zmc2V0IGluIFsxIC0gd2lkdGguLjBdXHJcbiAgICAgIGRvb3JPbk5laWdoYm91ciA9IDQgKiB4T2Zmc2V0ICogKC0xKSArIERpcmVjdGlvbi5TT1VUSFxyXG4gICAgICBudW1iZXJPZkRvb3JzID0gTWF0aC5tYXgod2lkdGgsIGhlaWdodCkgKiA0XHJcbiAgICAgIG5laWdoYm91cnMgPVxyXG4gICAgICAgIChpZiBkb29yIGlzIGRvb3JPbk5laWdoYm91ciB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgZG9vciBpbiBbMC4uLm51bWJlck9mRG9vcnNdXHJcbiAgICAgIGNhbmRpZGF0ZSA9IG5ldyBSb29tKHJlZlswXSArIHhPZmZzZXQsIHJlZlsxXSAtIGhlaWdodCwgd2lkdGgsIGhlaWdodCwgbmVpZ2hib3VycylcclxuICAgICAgY2FuZGlkYXRlcy5wdXNoIGNhbmRpZGF0ZSBpZiB0aWxlbWFwLmlzKFxyXG4gICAgICAgIGNhbmRpZGF0ZS5vcmlnaW5bMF0sIGNhbmRpZGF0ZS5vcmlnaW5bMV0sIHdpZHRoLCBoZWlnaHQsIFRpbGUuRU1QVFkpXHJcbiAgcmV0dXJuIGNhbmRpZGF0ZXNcclxuXHJcbmdldFNvdXRoQ2FuZGlkYXRlcyA9IChyZWYsIHJvb20sIHRpbGVtYXAsIG1pblNpemUgPSAxLCBtYXhTaXplID0gMikgLT5cclxuICBjYW5kaWRhdGVzID0gW11cclxuICBmb3IgaGVpZ2h0IGluIFttaW5TaXplLi5tYXhTaXplXSB0aGVuIGZvciB3aWR0aCBpbiBbbWluU2l6ZS4ubWF4U2l6ZV1cclxuICAgIGZvciB4T2Zmc2V0IGluIFsxIC0gd2lkdGguLjBdXHJcbiAgICAgIGRvb3JPbk5laWdoYm91ciA9IDQgKiB4T2Zmc2V0ICogKC0xKSArIERpcmVjdGlvbi5OT1JUSFxyXG4gICAgICBudW1iZXJPZkRvb3JzID0gTWF0aC5tYXgod2lkdGgsIGhlaWdodCkgKiA0XHJcbiAgICAgIG5laWdoYm91cnMgPVxyXG4gICAgICAgIChpZiBkb29yIGlzIGRvb3JPbk5laWdoYm91ciB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgZG9vciBpbiBbMC4uLm51bWJlck9mRG9vcnNdXHJcbiAgICAgIGNhbmRpZGF0ZSA9IG5ldyBSb29tKHJlZlswXSArIHhPZmZzZXQsIHJlZlsxXSArIDEsIHdpZHRoLCBoZWlnaHQsIG5laWdoYm91cnMpXHJcbiAgICAgIGNhbmRpZGF0ZXMucHVzaCBjYW5kaWRhdGUgaWYgdGlsZW1hcC5pcyhcclxuICAgICAgICBjYW5kaWRhdGUub3JpZ2luWzBdLCBjYW5kaWRhdGUub3JpZ2luWzFdLCB3aWR0aCwgaGVpZ2h0LCBUaWxlLkVNUFRZKVxyXG4gIHJldHVybiBjYW5kaWRhdGVzXHJcblxyXG5nZXRFYXN0Q2FuZGlkYXRlcyA9IChyZWYsIHJvb20sIHRpbGVtYXAsIG1pblNpemUgPSAxLCBtYXhTaXplID0gMikgLT5cclxuICBjYW5kaWRhdGVzID0gW11cclxuICBmb3Igd2lkdGggaW4gW21pblNpemUuLm1heFNpemVdIHRoZW4gZm9yIGhlaWdodCBpbiBbbWluU2l6ZS4ubWF4U2l6ZV1cclxuICAgIGZvciB5T2Zmc2V0IGluIFsxIC0gaGVpZ2h0Li4wXVxyXG4gICAgICBkb29yT25OZWlnaGJvdXIgPSA0ICogeU9mZnNldCAqICgtMSkgKyBEaXJlY3Rpb24uV0VTVFxyXG4gICAgICBudW1iZXJPZkRvb3JzID0gTWF0aC5tYXgod2lkdGgsIGhlaWdodCkgKiA0XHJcbiAgICAgIG5laWdoYm91cnMgPVxyXG4gICAgICAgIChpZiBkb29yIGlzIGRvb3JPbk5laWdoYm91ciB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgZG9vciBpbiBbMC4uLm51bWJlck9mRG9vcnNdXHJcbiAgICAgIGNhbmRpZGF0ZSA9IG5ldyBSb29tKHJlZlswXSArIDEsIHJlZlsxXSArIHlPZmZzZXQsIHdpZHRoLCBoZWlnaHQsIG5laWdoYm91cnMpXHJcbiAgICAgIGNhbmRpZGF0ZXMucHVzaCBjYW5kaWRhdGUgaWYgdGlsZW1hcC5pcyhcclxuICAgICAgICBjYW5kaWRhdGUub3JpZ2luWzBdLCBjYW5kaWRhdGUub3JpZ2luWzFdLCB3aWR0aCwgaGVpZ2h0LCBUaWxlLkVNUFRZKVxyXG4gIHJldHVybiBjYW5kaWRhdGVzXHJcblxyXG5nZXRXZXN0Q2FuZGlkYXRlcyA9IChyZWYsIHJvb20sIHRpbGVtYXAsIG1pblNpemUgPSAxLCBtYXhTaXplID0gMikgLT5cclxuICBjYW5kaWRhdGVzID0gW11cclxuICBmb3Igd2lkdGggaW4gW21pblNpemUuLm1heFNpemVdIHRoZW4gZm9yIGhlaWdodCBpbiBbbWluU2l6ZS4ubWF4U2l6ZV1cclxuICAgIGZvciB5T2Zmc2V0IGluIFsxIC0gaGVpZ2h0Li4wXVxyXG4gICAgICBkb29yT25OZWlnaGJvdXIgPSA0ICogeU9mZnNldCAqICgtMSkgKyBEaXJlY3Rpb24uRUFTVFxyXG4gICAgICBudW1iZXJPZkRvb3JzID0gTWF0aC5tYXgod2lkdGgsIGhlaWdodCkgKiA0XHJcbiAgICAgIG5laWdoYm91cnMgPVxyXG4gICAgICAgIChpZiBkb29yIGlzIGRvb3JPbk5laWdoYm91ciB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgZG9vciBpbiBbMC4uLm51bWJlck9mRG9vcnNdXHJcbiAgICAgIGNhbmRpZGF0ZSA9IG5ldyBSb29tKHJlZlswXSAtIHdpZHRoLCByZWZbMV0gKyB5T2Zmc2V0LCB3aWR0aCwgaGVpZ2h0LCBuZWlnaGJvdXJzKVxyXG4gICAgICBjYW5kaWRhdGVzLnB1c2ggY2FuZGlkYXRlIGlmIHRpbGVtYXAuaXMoXHJcbiAgICAgICAgY2FuZGlkYXRlLm9yaWdpblswXSwgY2FuZGlkYXRlLm9yaWdpblsxXSwgd2lkdGgsIGhlaWdodCwgVGlsZS5FTVBUWSlcclxuICByZXR1cm4gY2FuZGlkYXRlc1xyXG5cclxuIl19