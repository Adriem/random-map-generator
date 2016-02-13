# ==============================================================================
#  This file contains some utilities for general use
# ------------------------------------------------------------------------------
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

  # Return a random arrangement from an array
  shuffle: (array) ->
    arrayClone = (item for item in array)
    newArray = []
    while arrayClone.length > 0
      randomIndex = this.value(0, arrayClone.length)
      randomItem = arrayClone.splice(randomIndex, 1)
      newArray.push(randomItem...)
    console.log "Shuffled", array, newArray
    return newArray

# Make elemets available to all the window
window.random = random
