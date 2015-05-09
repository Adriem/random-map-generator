$(document).ready ->
  # DEFINITIONS
  c = $("#canvas")[0].getContext("2d")
  map = undefined
  generateMap = () ->
    globalParams.canvasSize = parseInt($("#canvas").attr("width"))
    globalParams.mapSize = parseInt($("#mapSize").val())
    switch $("#algorythm").val()
      when "BSP"
        # ROOM MIN SIZE
        bsp.config.MIN_ROOM_SIZE = parseInt($("#roomMinSize").val())
        # ROOM MAX SIZE
        bsp.config.MAX_ROOM_SIZE = parseInt($("#roomMaxSize").val())
        ### ROOM ASPECT RATIO
        bsp.config.RATIO_RESTR = if $("#aspectRatioEnabled").prop("checked")
          parseFloat($("#aspectRatio").val())
        else 0
        ###
        # ROOM DELETING RATIO
        bsp.config.ROOM_DELETING_RATIO = if $("#deletingEnabled").prop("checked")
          parseFloat($("#deletingRatio").val())
        else 0
        # DOOR CHANCE
        bsp.config.DOOR_CHANCE = if $("#doorsEnabled").prop("checked")
          parseInt($("#doorChance").val())
        else 0
        map = bsp.generate(globalParams.mapSize)
        map.paint(c)

  # INPUT SETUPS
  $("#mapSize").val(globalParams.mapSize)
  setupToggle("#showGrid", globalParams.showGrid)
  setupToggle("#showWalls", globalParams.showWalls)
  setupToggle("#showDoors", globalParams.showDoors)
  setupToggle("#showDebug", globalParams.debugMode)

  # bsp specific
  $("#roomMinSize").val(bsp.config.MIN_ROOM_SIZE)
  $("#roomMaxSize").val(bsp.config.MAX_ROOM_SIZE)
  #setupToggleable("#aspectRatioEnabled","#aspectRatio",bsp.config.RATIO_RESTR)
  setupToggleable("#deletingEnabled", "#deletingRatio", bsp.config.ROOM_DELETING_RATIO)
  setupToggleable("#doorsEnabled", "#doorChance", bsp.config.DOOR_CHANCE)

  # Bind functions to buttons
  $("#generate").click(generateMap)
  $("#showGrid").change ->
    globalParams.showGrid = $("#showGrid").prop("checked")
    map.paint(c)
  $("#showWalls").change ->
    globalParams.showWalls = $("#showWalls").prop("checked")
    map.paint(c)
  $("#showDoors").change ->
    globalParams.showDoors = $("#showDoors").prop("checked")
    map.paint(c)
  $("#showDebug").change ->
    globalParams.debugMode = $("#showDebug").prop("checked")
    map.paint(c)
  # Enable tooltips with bootstrap
  $('[data-togle="tooltip"]').tooltip()
  # Generate map on page load
  generateMap()


setupToggle = (input, refVal) ->
  $(input).prop("checked", "on") if refVal

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