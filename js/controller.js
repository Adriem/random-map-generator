// Generated by CoffeeScript 1.9.2
(function() {
  $(document).ready(function() {
    var c, generateMap;
    c = $("#canvas")[0].getContext("2d");
    generateMap = function() {
      var CANVAS_SIZE, MAP_SIZE, tileSize;
      CANVAS_SIZE = parseInt($("#canvas").attr("width"));
      MAP_SIZE = parseInt($("#mapSize").val());
      tileSize = TILE_SIZE();
      switch ($("#algorythm").val()) {
        case "BSP":
          BSP.config.ITERATIONS = parseInt($("#bspIterations").val());
          if ($("#deletingEnabled").prop("checked")) {
            BSP.config.ROOM_DELETING_RATIO = parseFloat($("#deletingRatio").val());
          } else {
            BSP.config.ROOM_DELETING_RATIO = 0;
          }
          return BSP.generate(MAP_SIZE, c);
      }
    };
    $("#mapSize").val(MAP_SIZE);
    $("#bspIterations").val(BSP.config.ITERATIONS);
    if (BSP.config.ROOM_DELETING_RATIO > 0) {
      $("#deletingEnabled").prop("checked", "on");
      $("#deletingRatio").val(BSP.config.ROOM_DELETING_RATIO);
    } else {
      $("#ratioRestEnabled").removeProp("checked", "on");
      $("#ratioRest").val(BSP.config.RATIO_RESTR);
    }
    $("#deletingEnabled").change(function() {
      if ($("#deletingEnabled").prop("checked")) {
        return $("#deletingRatio").removeAttr("disabled", "");
      } else {
        return $("#deletingRatio").attr("disabled", "");
      }
    });
    $("#generate").click(generateMap);
    $('[data-togle="tooltip"]').tooltip();
    return generateMap();
  });

}).call(this);

//# sourceMappingURL=controller.js.map
