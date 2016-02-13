$(document).ready () ->

  canvas = new CanvasController 'canvas'
  map = null

  # RENDERER PROPERTIES
  properties =
    tilesPerUnit : new NumericInput('tilesPerUnit', 'Tiles per unit', 1)
    wallStyle    : new SelectInput('wallStyle', "Wall style", wallStyle)
    drawGrid     : new ToggleInput('drawGrid', "Draw grid")
    debugMode    : new ToggleInput('debugMode', "Show debug info", true)

  # GENERATOR CONTROLS
  controls =
    mapSize       : new NumericInput('mapSize', 'Map size (units)', 5)
    numberOfRooms : new NumericInput('numberOfRooms', 'Number of rooms', 1)
    initialRoomW  : new NumericInput('initialRoomW', 'Initial room width', 1)
    initialRoomH  : new NumericInput('initialRoomH', 'Initial room height', 1)
    minRoomSize   : new NumericInput('minRoomSize', 'Min. room size', 1)
    maxRoomSize   : new NumericInput('maxRoomSize', 'Max. room size', 1)

  # FUNCTION DEFINITION
  generateMap = () ->
    steps = []
    map = generate(
      controls.numberOfRooms.get(),
      {
        width: controls.mapSize.get()
        height: controls.mapSize.get()
        initialRoomWidth: controls.initialRoomW.get()
        initialRoomHeight: controls.initialRoomH.get()
        minRoomSize: controls.minRoomSize.get()
        maxRoomSize: controls.maxRoomSize.get()
      },
      (map, step) ->
        console.log("Step ##{step}: ", map.roomList)
        steps.push map
    )
    drawStepByStep canvas, steps
    # drawMap canvas, map

  drawMap = (canvas, map) ->
    tilemap = map.getTilemap(properties.tilesPerUnit.get())
    canvas.drawMap(tilemap, properties.drawGrid.get(), properties.wallStyle.get())

  drawStepByStep = (canvas, steps, i = 0) ->
    drawMap canvas, steps.shift()
    setTimeout((() -> drawStepByStep(canvas, steps)), 250) if steps.length > 0

  # Add controls to the page
  $('#renderer-controls').append(value.html) for own key, value of properties
  $('#generator-controls').append(value.html) for own key, value of controls

  # Bind functions to buttons
  $("#generate").click(generateMap)

  # Enable tooltips with bootstrap
  $('[data-togle="tooltip"]').tooltip()

  # Set default values to the inputs
  controls.mapSize.set(Defaults.MAP_SIZE)
  controls.numberOfRooms.set(Defaults.NUMBER_OF_ROOMS)
  controls.initialRoomW.set(Defaults.INITIAL_ROOM_WIDTH)
  controls.initialRoomH.set(Defaults.INITIAL_ROOM_HEIGHT)
  controls.minRoomSize.set(Defaults.MIN_ROOM_SIZE)
  controls.maxRoomSize.set(Defaults.MAX_ROOM_SIZE)

  properties.tilesPerUnit.set(Defaults.TILES_PER_UNIT)
  properties.wallStyle.set(2)
  properties.drawGrid.set(true)
  properties.debugMode.set(false)

  # Set listener to auto-updated inputs
  properties.tilesPerUnit.setListener(() -> drawMap(canvas, map))
  properties.wallStyle.setListener(() -> drawMap(canvas, map))
  properties.drawGrid.setListener(() -> drawMap(canvas, map))
  properties.drawGrid.setListener(() -> drawMap(canvas, map))

  # Generate map on page load
  generateMap()




# ------------------------------------------------------------------------------
# LEGACY :\
# ------------------------------------------------------------------------------
setupToggleable = (toggle, input, refVal, disabledVal = 0) ->
  # Set default value
  $(input).val(refVal)
  if refVal > disabledVal
    $(toggle).prop("checked", "on")
  else
    $(toggle).removeProp("checked", "on")
  # Disable field on checkbox disable
  $(toggle).change ->
    if $(toggle).prop("checked")
      $(input).removeAttr("disabled", "")
    else
      $(input).attr("disabled", "")
