$(document).ready ->
  # DEFINITIONS
  c = $("#canvas")[0].getContext("2d")
  map = undefined
  generateMap = () ->
    window.CANVAS_SIZE = parseInt($("#canvas").attr("width"))
    window.MAP_SIZE = parseInt($("#mapSize").val())
    switch $("#algorythm").val()
      when "BSP"
        #ITERATIONS
        bsp.config.ITERATIONS = parseInt($("#bspIterations").val())
        # ROOM DELETING RATIO
        if $("#deletingEnabled").prop("checked")
          bsp.config.ROOM_DELETING_RATIO = parseFloat($("#deletingRatio").val())
        else
          bsp.config.ROOM_DELETING_RATIO = 0
        if $("#doorsEnabled").prop("checked")
          bsp.config.DOOR_CHANCE = parseInt($("#doorChance").val())
        else
          bsp.config.DOOR_CHANCE = 0
        bsp.config.DRAW_WALLS = $("#drawWalls").prop("checked")
        map = bsp.generate(MAP_SIZE)
        map.paint(c)

  # Set default values
  $("#mapSize").val(window.MAP_SIZE)
  if window.SHOW_GRID
    $("#showGrid").prop("checked", "on")
  else
    $("#showGrid").removeProp("checked", "on")
  if window.SHOW_WALLS
    $("#showWalls").prop("checked", "on")
  else
    $("#showWalls").removeProp("checked", "on")
  if window.SHOW_DOORS
    $("#showDoors").prop("checked", "on")
  else
    $("#showDoors").removeProp("checked", "on")
  $("#bspIterations").val(bsp.config.ITERATIONS)
  $("#deletingRatio").val(bsp.config.ROOM_DELETING_RATIO)
  if bsp.config.ROOM_DELETING_RATIO > 0
    $("#deletingEnabled").prop("checked", "on")
  else
    $("#ratioRestEnabled").removeProp("checked", "on")
  $("#doorChance").val(bsp.config.DOOR_CHANCE)
  if bsp.config.DOOR_CHANCE > 0
    $("#doorsEnabled").prop("checked", "on")
  else
    $("#doorsEnabled").removeProp("checked", "on")
  if bsp.config.DRAW_WALLS
    $("#drawWalls").prop("checked", "on")
  else
    $("#drawWalls").removeProp("checked", "on")

  # Disable fields with enable-checkbox
  $("#deletingEnabled").change ->
    if $("#deletingEnabled").prop("checked")
      $("#deletingRatio").removeAttr("disabled", "")
    else
      $("#deletingRatio").attr("disabled", "")
  $("#doorsEnabled").change ->
    if $("#doorsEnabled").prop("checked")
      $("#doorChance").removeAttr("disabled", "")
    else
      $("#doorChance").attr("disabled", "")

  # Bind functions to buttons
  $("#generate").click(generateMap)
  $("#showGrid").change ->
    window.SHOW_GRID = $("#showGrid").prop("checked")
    map.paint(c)
  $("#showWalls").change ->
    window.SHOW_WALLS = $("#showWalls").prop("checked")
    map.paint(c)
  $("#showDoors").change ->
    window.SHOW_DOORS = $("#showDoors").prop("checked")
    map.paint(c)
  # Enable tooltips with bootstrap
  $('[data-togle="tooltip"]').tooltip()
  # Generate map on page load
  generateMap()