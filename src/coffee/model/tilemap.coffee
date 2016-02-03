# ==============================================================================
#  This file contains some classes and utilities to work with tilemaps
# ------------------------------------------------------------------------------
#  Author: Adrian Moreno
# ==============================================================================

# This class represents a point either as an array and as an object with
# fields x, y and z (when available)
class Point extends Array
  constructor: (values...) ->
    @push value for value in values

  Object.defineProperty @prototype, 'x',
    get: () -> @[0]
    set: (value) ->
      @push null while not @length > 0
      @[0] = value

  Object.defineProperty @prototype, 'y',
    get: () -> @[1]
    set: (value) ->
      @push null while not @length > 1
      @[1] = value

  Object.defineProperty @prototype, 'z',
    get: () -> @[2]
    set: (value) ->
      @push null while not @length > 2
      @[2] = value


# This class represents a tile map as a 2D array, adding some useful methods
class Tilemap extends Array

  constructor: (width, height, value = null) ->
    this.push(value for j in [0...height]) for i in [0...width]

  Object.defineProperty @prototype, 'width',
    get: () ->  this.length

  Object.defineProperty @prototype, 'height',
    get: () -> this[0].length

  get: (x, y, width = 1, height = 1) ->
    this[_x][_y] for _y in [y...y + height] for _x in [x...x + width]

  set: (x, y, width = 1, height = 1, value) ->
    this[_x][_y] = value for _y in [y...y + height] for _x in [x...x + width]

  is: (x, y, width = 1, height = 1, value) ->
    return false if x + width > this.width or y + height > this.height or x < 0 or y < 0
    for _x in [x...x + width]
      for _y in [y...y + height] when this[_x][_y] isnt value
        return false
    return true

  setWidth: (width, value = null) ->
    if width > this.width
      this.push(value for i in [0...this.height]) while width > this.width
    else
      this.splice(width, this.width - width)
    return this.width

  setHeight: (height, value = null) ->
    for x in [0...this.width]
      if height > this.height
        this[x].push value while height > this[x].width
      else
        this.splice(height, this.height - height)
    return this[0].height

  clone: () ->
    newInstance = new Tilemap(@width, @height)
    newInstance[x][y] = value for value, y in row for row, x in this
    return newInstance

# Make classes available globally
window.Point = Point
window.Tilemap = Tilemap
