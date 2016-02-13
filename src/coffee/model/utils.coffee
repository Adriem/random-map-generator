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

# Make elemets available to all the window
this.random = random
this.clone  = clone
