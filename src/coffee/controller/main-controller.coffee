$(document).ready () ->

  drawing = false
  canvas = new CanvasController 'canvas'
  map = null

  # RENDERER PROPERTIES
  properties =
    tilesPerUnit : new NumericInput('tilesPerUnit', 'Tiles per unit', 1)
    wallStyle    : new SelectInput('wallStyle', "Wall style", wallStyle)
    drawGrid     : new ToggleInput('drawGrid', "Draw grid")
    showRoomList : new ToggleInput('showRoomList', "Show room list")
    # debugMode    : new ToggleInput('debugMode', "Show debug info", true)

  # GENERATOR CONTROLS
  controls =
    mapSize       : new NumericInput('mapSize', 'Map size (units)', 5)
    numberOfRooms : new NumericInput('numberOfRooms', 'Number of rooms', 1)
    initialRoomW  : new NumericInput('initialRoomW', 'Initial room width', 1)
    initialRoomH  : new NumericInput('initialRoomH', 'Initial room height', 1)
    minRoomSize   : new NumericInput('minRoomSize', 'Min. room size', 1)
    maxRoomSize   : new NumericInput('maxRoomSize', 'Max. room size', 1)
    minArea: new ToggleableNumericInput('minArea', 'Min. room area', 1)
    maxArea: new ToggleableNumericInput('maxArea', 'Max. room area', 1)
    ratioRestr: new ToggleableNumericInput('ratioRestr', 'Ratio restr.', 0.5, 1, 0.1)

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
        ratioRestriction:
          if controls.ratioRestr.getToggleState()
            controls.ratioRestr.getValue()
          else undefined
        maxRoomArea:
          if controls.maxArea.getToggleState()
            controls.maxArea.getValue()
          else undefined
        minRoomArea:
          if controls.minArea.getToggleState()
            controls.minArea.getValue()
          else undefined
      },
      (map, step) ->
        console.log("Step ##{step}: ", map.roomList)
        steps.push map
    )
    drawStepByStep canvas, steps

  drawMap = (canvas, map) ->
    $('#room-list').empty()
    if properties.showRoomList.get() then for room in map.roomList
      $('#room-list').append """
        <div><strong>Room ##{room.id}: </strong> {
          x: #{room.x}, y: #{room.y}, width: #{room.width}, height: #{room.height}
        }</div>
      """
    tilemap = map.getTilemap(properties.tilesPerUnit.get())
    canvas.drawMap(tilemap, properties.drawGrid.get(), properties.wallStyle.get())

  drawStepByStep = (canvas, steps, i = 0) ->
    $('#generate').attr('disabled', '')
    drawing = true
    drawMap canvas, steps.shift()
    if steps.length > 0
      setTimeout((() -> drawStepByStep(canvas, steps)), 250)
    else
      $('#generate').removeAttr('disabled', '')
      drawing = false

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
  controls.minArea.set(Defaults.MIN_ROOM_AREA)
  controls.minArea.toggle(true)
  controls.maxArea.set(Defaults.MAX_ROOM_AREA)
  controls.maxArea.toggle(false)
  controls.ratioRestr.set(Defaults.RATIO_RESTRICTION)
  controls.ratioRestr.toggle(false)

  properties.tilesPerUnit.set(Defaults.TILES_PER_UNIT)
  properties.wallStyle.set(2)
  properties.drawGrid.set(true)

  # Set listener to auto-updated inputs
  properties.tilesPerUnit.setListener(() -> drawMap(canvas, map) unless drawing)
  properties.wallStyle.setListener(() -> drawMap(canvas, map) unless drawing)
  properties.drawGrid.setListener(() -> drawMap(canvas, map) unless drawing)
  properties.showRoomList.setListener(() -> drawMap(canvas, map) unless drawing)

  # Set listener to toggleable inputs
  controls.maxArea.setToggleListener () ->
    controls.maxArea.toggle(controls.maxArea.getToggleState())
  controls.minArea.setToggleListener () ->
    controls.minArea.toggle(controls.minArea.getToggleState())
  controls.ratioRestr.setToggleListener () ->
    controls.ratioRestr.toggle(controls.ratioRestr.getToggleState())

  # Generate map on page load
  generateMap()
