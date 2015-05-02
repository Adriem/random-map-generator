// Generated by CoffeeScript 1.9.2
(function() {
  var setupToggle, setupToggleable;

  $(document).ready(function() {
    var c, generateMap, map;
    c = $("#canvas")[0].getContext("2d");
    map = void 0;
    generateMap = function() {
      window.CANVAS_SIZE = parseInt($("#canvas").attr("width"));
      window.MAP_SIZE = parseInt($("#mapSize").val());
      switch ($("#algorythm").val()) {
        case "BSP":
          bsp.config.MIN_ROOM_SIZE = parseInt($("#roomMinSize").val());
          bsp.config.MAX_ROOM_SIZE = parseInt($("#roomMaxSize").val());

          /* ROOM ASPECT RATIO
          bsp.config.RATIO_RESTR = if $("#aspectRatioEnabled").prop("checked")
            parseFloat($("#aspectRatio").val())
          else 0
           */
          bsp.config.ROOM_DELETING_RATIO = $("#deletingEnabled").prop("checked") ? parseFloat($("#deletingRatio").val()) : 0;
          bsp.config.DOOR_CHANCE = $("#doorsEnabled").prop("checked") ? parseInt($("#doorChance").val()) : 0;
          map = bsp.generate(MAP_SIZE);
          return map.paint(c);
      }
    };
    $("#mapSize").val(window.MAP_SIZE);
    setupToggle("#showGrid", window.SHOW_GRID);
    setupToggle("#showWalls", window.SHOW_WALLS);
    setupToggle("#showDoors", window.SHOW_DOORS);
    setupToggle("#showDebug", window.DEBUG_MODE);
    $("#roomMinSize").val(bsp.config.MIN_ROOM_SIZE);
    $("#roomMaxSize").val(bsp.config.MAX_ROOM_SIZE);
    setupToggleable("#deletingEnabled", "#deletingRatio", bsp.config.ROOM_DELETING_RATIO);
    setupToggleable("#doorsEnabled", "#doorChance", bsp.config.DOOR_CHANCE);
    $("#generate").click(generateMap);
    $("#showGrid").change(function() {
      window.SHOW_GRID = $("#showGrid").prop("checked");
      return map.paint(c);
    });
    $("#showWalls").change(function() {
      window.SHOW_WALLS = $("#showWalls").prop("checked");
      return map.paint(c);
    });
    $("#showDoors").change(function() {
      window.SHOW_DOORS = $("#showDoors").prop("checked");
      return map.paint(c);
    });
    $("#showDebug").change(function() {
      window.DEBUG_MODE = $("#showDebug").prop("checked");
      return map.paint(c);
    });
    $('[data-togle="tooltip"]').tooltip();
    return generateMap();
  });

  setupToggle = function(input, refVal) {
    if (refVal) {
      return $(input).prop("checked", "on");
    }
  };

  setupToggleable = function(toggle, input, refVal, disabledVal) {
    if (disabledVal == null) {
      disabledVal = 0;
    }
    $(input).val(refVal);
    if (refVal > disabledVal) {
      $(toggle).prop("checked", "on");
    } else {
      $(toggle).removeProp("checked", "on");
    }
    return $(toggle).change(function() {
      if ($(toggle).prop("checked")) {
        return $(input).removeAttr("disabled", "");
      } else {
        return $(input).attr("disabled", "");
      }
    });
  };

}).call(this);

//# sourceMappingURL=controller.js.map
