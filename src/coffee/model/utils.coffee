# ==============================================================================
#  This file contains some utilities for general use
#  Author: Adrian Moreno
# ==============================================================================

random =
  # Return a boolean with a probability of being true equal to val
  test: (val = 0.5) ->
    if val < 1 then Math.random() < val else Math.random() * 100 < val

  # Get a random integer value between min (included) and max (not included)
  # If only one parameter is supplied, return a value between 0 and min
  value: (min, max) ->
    unless max?
      max = min
      min = 0
    if min >= max then min else Math.floor(Math.random() * (max - min) + min)

  # TODO
  # Return a random arrangement from an array
  shuffle: (array) -> array

# TODO
# Return the exact copy of the item
clone = (original) -> original

# Property definition with set & get for coffeescript as seen in
# https://github.com/jashkenas/coffeescript/issues/451#issuecomment-2404226
# Since any function called within a class definition body will have the class
# itself as 'this' (or '@'), this can be called like this:
# class FooBar
#   constructor: (@param1, @param2, @moreParams) ->
#   @define 'prop1',
#     get: -> @param1.doSomething()
#     set: (someVal) -> @param1 = someVal
Function::define = (property, description, object = this) ->
  Object.defineProperty object.prototype, property, description

# Make elemets available to all the window
this.random = random
this.clone  = clone
