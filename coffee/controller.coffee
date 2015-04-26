$(document).ready ->
  # DEFINITIONS
  c = $("#canvas")[0].getContext("2d")
  generateMap = () ->
    CANVAS_SIZE = parseInt($("#canvas").attr("width"))
    MAP_SIZE = parseInt($("#mapSize").val())
    tileSize = TILE_SIZE()
    switch $("#algorythm").val()
      when "BSP"
        #ITERATIONS
        BSP.config.ITERATIONS = parseInt($("#bspIterations").val())
        # ROOM DELETING RATIO
        if $("#deletingEnabled").prop("checked")
          BSP.config.ROOM_DELETING_RATIO = parseFloat($("#deletingRatio").val())
        else
          BSP.config.ROOM_DELETING_RATIO = 0
        BSP.generate(MAP_SIZE, c)

  # Set default data
  $("#mapSize").val(MAP_SIZE)
  $("#bspIterations").val(BSP.config.ITERATIONS)
  if BSP.config.ROOM_DELETING_RATIO > 0
    $("#deletingEnabled").prop("checked", "on")
    $("#deletingRatio").val(BSP.config.ROOM_DELETING_RATIO)
  else
    $("#ratioRestEnabled").removeProp("checked", "on")
    $("#ratioRest").val(BSP.config.RATIO_RESTR)

  # Disable fields with enable-checkbox
  $("#deletingEnabled").change ->
    if $("#deletingEnabled").prop("checked")
      $("#deletingRatio").removeAttr("disabled", "")
    else
      $("#deletingRatio").attr("disabled", "")

  # Bind function to button
  $("#generate").click(generateMap)
  # Enable tooltips with bootstrap
  $('[data-togle="tooltip"]').tooltip()
  # Generate map on page load
  generateMap()