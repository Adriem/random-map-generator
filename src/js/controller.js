var setupToggle, setupToggleable;

$(document).ready(function() {
  var c, generateMap, map;
  c = $("#canvas")[0].getContext("2d");
  map = void 0;
  generateMap = function() {
    mapParams.canvasSize = parseInt($("#canvas").attr("width"));
    mapParams.mapSize = parseInt($("#mapSize").val());
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
        map = bsp.generate(mapParams.mapSize);
        return map.paint(c);
    }
  };
  $("#mapSize").val(mapParams.mapSize);
  setupToggle("#showGrid", mapParams.showGrid);
  setupToggle("#showWalls", mapParams.showWalls);
  setupToggle("#showDoors", mapParams.showDoors);
  setupToggle("#showDebug", mapParams.debugMode);
  $("#roomMinSize").val(bsp.config.MIN_ROOM_SIZE);
  $("#roomMaxSize").val(bsp.config.MAX_ROOM_SIZE);
  setupToggleable("#deletingEnabled", "#deletingRatio", bsp.config.ROOM_DELETING_RATIO);
  setupToggleable("#doorsEnabled", "#doorChance", bsp.config.DOOR_CHANCE);
  $("#generate").click(generateMap);
  $("#showGrid").change(function() {
    mapParams.showGrid = $("#showGrid").prop("checked");
    return map.paint(c);
  });
  $("#showWalls").change(function() {
    mapParams.showWalls = $("#showWalls").prop("checked");
    return map.paint(c);
  });
  $("#showDoors").change(function() {
    mapParams.showDoors = $("#showDoors").prop("checked");
    return map.paint(c);
  });
  $("#showDebug").change(function() {
    mapParams.debugMode = $("#showDebug").prop("checked");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsNEJBQUE7O0FBQUEsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEtBQVosQ0FBa0IsU0FBQSxHQUFBO0FBRWhCLE1BQUEsbUJBQUE7QUFBQSxFQUFBLENBQUEsR0FBSSxDQUFBLENBQUUsU0FBRixDQUFhLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBaEIsQ0FBMkIsSUFBM0IsQ0FBSixDQUFBO0FBQUEsRUFDQSxHQUFBLEdBQU0sTUFETixDQUFBO0FBQUEsRUFFQSxXQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osSUFBQSxTQUFTLENBQUMsVUFBVixHQUF1QixRQUFBLENBQVMsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBa0IsT0FBbEIsQ0FBVCxDQUF2QixDQUFBO0FBQUEsSUFDQSxTQUFTLENBQUMsT0FBVixHQUFvQixRQUFBLENBQVMsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLEdBQWQsQ0FBQSxDQUFULENBRHBCLENBQUE7QUFFQSxZQUFPLENBQUEsQ0FBRSxZQUFGLENBQWUsQ0FBQyxHQUFoQixDQUFBLENBQVA7QUFBQSxXQUNPLEtBRFA7QUFHSSxRQUFBLEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBWCxHQUEyQixRQUFBLENBQVMsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxHQUFsQixDQUFBLENBQVQsQ0FBM0IsQ0FBQTtBQUFBLFFBRUEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFYLEdBQTJCLFFBQUEsQ0FBUyxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLEdBQWxCLENBQUEsQ0FBVCxDQUYzQixDQUFBO0FBR0E7QUFBQTs7OztXQUhBO0FBQUEsUUFTQSxHQUFHLENBQUMsTUFBTSxDQUFDLG1CQUFYLEdBQW9DLENBQUEsQ0FBRSxrQkFBRixDQUFxQixDQUFDLElBQXRCLENBQTJCLFNBQTNCLENBQUgsR0FDL0IsVUFBQSxDQUFXLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLEdBQXBCLENBQUEsQ0FBWCxDQUQrQixHQUU1QixDQVhMLENBQUE7QUFBQSxRQWFBLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBWCxHQUE0QixDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLElBQW5CLENBQXdCLFNBQXhCLENBQUgsR0FDdkIsUUFBQSxDQUFTLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsR0FBakIsQ0FBQSxDQUFULENBRHVCLEdBRXBCLENBZkwsQ0FBQTtBQUFBLFFBZ0JBLEdBQUEsR0FBTSxHQUFHLENBQUMsUUFBSixDQUFhLFNBQVMsQ0FBQyxPQUF2QixDQWhCTixDQUFBO2VBaUJBLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVixFQXBCSjtBQUFBLEtBSFk7RUFBQSxDQUZkLENBQUE7QUFBQSxFQTRCQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsR0FBZCxDQUFrQixTQUFTLENBQUMsT0FBNUIsQ0E1QkEsQ0FBQTtBQUFBLEVBNkJBLFdBQUEsQ0FBWSxXQUFaLEVBQXlCLFNBQVMsQ0FBQyxRQUFuQyxDQTdCQSxDQUFBO0FBQUEsRUE4QkEsV0FBQSxDQUFZLFlBQVosRUFBMEIsU0FBUyxDQUFDLFNBQXBDLENBOUJBLENBQUE7QUFBQSxFQStCQSxXQUFBLENBQVksWUFBWixFQUEwQixTQUFTLENBQUMsU0FBcEMsQ0EvQkEsQ0FBQTtBQUFBLEVBZ0NBLFdBQUEsQ0FBWSxZQUFaLEVBQTBCLFNBQVMsQ0FBQyxTQUFwQyxDQWhDQSxDQUFBO0FBQUEsRUFtQ0EsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxHQUFsQixDQUFzQixHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWpDLENBbkNBLENBQUE7QUFBQSxFQW9DQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLEdBQWxCLENBQXNCLEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBakMsQ0FwQ0EsQ0FBQTtBQUFBLEVBc0NBLGVBQUEsQ0FBZ0Isa0JBQWhCLEVBQW9DLGdCQUFwQyxFQUFzRCxHQUFHLENBQUMsTUFBTSxDQUFDLG1CQUFqRSxDQXRDQSxDQUFBO0FBQUEsRUF1Q0EsZUFBQSxDQUFnQixlQUFoQixFQUFpQyxhQUFqQyxFQUFnRCxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQTNELENBdkNBLENBQUE7QUFBQSxFQTBDQSxDQUFBLENBQUUsV0FBRixDQUFjLENBQUMsS0FBZixDQUFxQixXQUFyQixDQTFDQSxDQUFBO0FBQUEsRUEyQ0EsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLE1BQWYsQ0FBc0IsU0FBQSxHQUFBO0FBQ3BCLElBQUEsU0FBUyxDQUFDLFFBQVYsR0FBcUIsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsU0FBcEIsQ0FBckIsQ0FBQTtXQUNBLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVixFQUZvQjtFQUFBLENBQXRCLENBM0NBLENBQUE7QUFBQSxFQThDQSxDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsTUFBaEIsQ0FBdUIsU0FBQSxHQUFBO0FBQ3JCLElBQUEsU0FBUyxDQUFDLFNBQVYsR0FBc0IsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLElBQWhCLENBQXFCLFNBQXJCLENBQXRCLENBQUE7V0FDQSxHQUFHLENBQUMsS0FBSixDQUFVLENBQVYsRUFGcUI7RUFBQSxDQUF2QixDQTlDQSxDQUFBO0FBQUEsRUFpREEsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLE1BQWhCLENBQXVCLFNBQUEsR0FBQTtBQUNyQixJQUFBLFNBQVMsQ0FBQyxTQUFWLEdBQXNCLENBQUEsQ0FBRSxZQUFGLENBQWUsQ0FBQyxJQUFoQixDQUFxQixTQUFyQixDQUF0QixDQUFBO1dBQ0EsR0FBRyxDQUFDLEtBQUosQ0FBVSxDQUFWLEVBRnFCO0VBQUEsQ0FBdkIsQ0FqREEsQ0FBQTtBQUFBLEVBb0RBLENBQUEsQ0FBRSxZQUFGLENBQWUsQ0FBQyxNQUFoQixDQUF1QixTQUFBLEdBQUE7QUFDckIsSUFBQSxTQUFTLENBQUMsU0FBVixHQUFzQixDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsSUFBaEIsQ0FBcUIsU0FBckIsQ0FBdEIsQ0FBQTtXQUNBLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVixFQUZxQjtFQUFBLENBQXZCLENBcERBLENBQUE7QUFBQSxFQXdEQSxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxPQUE1QixDQUFBLENBeERBLENBQUE7U0EwREEsV0FBQSxDQUFBLEVBNURnQjtBQUFBLENBQWxCLENBQUEsQ0FBQTs7QUFBQSxXQStEQSxHQUFjLFNBQUMsS0FBRCxFQUFRLE1BQVIsR0FBQTtBQUNaLEVBQUEsSUFBa0MsTUFBbEM7V0FBQSxDQUFBLENBQUUsS0FBRixDQUFRLENBQUMsSUFBVCxDQUFjLFNBQWQsRUFBeUIsSUFBekIsRUFBQTtHQURZO0FBQUEsQ0EvRGQsQ0FBQTs7QUFBQSxlQWtFQSxHQUFrQixTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLE1BQWhCLEVBQXdCLFdBQXhCLEdBQUE7O0lBQXdCLGNBQWM7R0FFdEQ7QUFBQSxFQUFBLENBQUEsQ0FBRSxLQUFGLENBQVEsQ0FBQyxHQUFULENBQWEsTUFBYixDQUFBLENBQUE7QUFDQSxFQUFBLElBQUcsTUFBQSxHQUFTLFdBQVo7QUFDRSxJQUFBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsU0FBZixFQUEwQixJQUExQixDQUFBLENBREY7R0FBQSxNQUFBO0FBR0UsSUFBQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsVUFBVixDQUFxQixTQUFyQixFQUFnQyxJQUFoQyxDQUFBLENBSEY7R0FEQTtTQU1BLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQWlCLFNBQUEsR0FBQTtBQUNmLElBQUEsSUFBRyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLFNBQWYsQ0FBSDthQUNFLENBQUEsQ0FBRSxLQUFGLENBQVEsQ0FBQyxVQUFULENBQW9CLFVBQXBCLEVBQWdDLEVBQWhDLEVBREY7S0FBQSxNQUFBO2FBR0UsQ0FBQSxDQUFFLEtBQUYsQ0FBUSxDQUFDLElBQVQsQ0FBYyxVQUFkLEVBQTBCLEVBQTFCLEVBSEY7S0FEZTtFQUFBLENBQWpCLEVBUmdCO0FBQUEsQ0FsRWxCLENBQUEiLCJmaWxlIjoiY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiQoZG9jdW1lbnQpLnJlYWR5IC0+XHJcbiAgIyBERUZJTklUSU9OU1xyXG4gIGMgPSAkKFwiI2NhbnZhc1wiKVswXS5nZXRDb250ZXh0KFwiMmRcIilcclxuICBtYXAgPSB1bmRlZmluZWRcclxuICBnZW5lcmF0ZU1hcCA9ICgpIC0+XHJcbiAgICBtYXBQYXJhbXMuY2FudmFzU2l6ZSA9IHBhcnNlSW50KCQoXCIjY2FudmFzXCIpLmF0dHIoXCJ3aWR0aFwiKSlcclxuICAgIG1hcFBhcmFtcy5tYXBTaXplID0gcGFyc2VJbnQoJChcIiNtYXBTaXplXCIpLnZhbCgpKVxyXG4gICAgc3dpdGNoICQoXCIjYWxnb3J5dGhtXCIpLnZhbCgpXHJcbiAgICAgIHdoZW4gXCJCU1BcIlxyXG4gICAgICAgICMgUk9PTSBNSU4gU0laRVxyXG4gICAgICAgIGJzcC5jb25maWcuTUlOX1JPT01fU0laRSA9IHBhcnNlSW50KCQoXCIjcm9vbU1pblNpemVcIikudmFsKCkpXHJcbiAgICAgICAgIyBST09NIE1BWCBTSVpFXHJcbiAgICAgICAgYnNwLmNvbmZpZy5NQVhfUk9PTV9TSVpFID0gcGFyc2VJbnQoJChcIiNyb29tTWF4U2l6ZVwiKS52YWwoKSlcclxuICAgICAgICAjIyMgUk9PTSBBU1BFQ1QgUkFUSU9cclxuICAgICAgICBic3AuY29uZmlnLlJBVElPX1JFU1RSID0gaWYgJChcIiNhc3BlY3RSYXRpb0VuYWJsZWRcIikucHJvcChcImNoZWNrZWRcIilcclxuICAgICAgICAgIHBhcnNlRmxvYXQoJChcIiNhc3BlY3RSYXRpb1wiKS52YWwoKSlcclxuICAgICAgICBlbHNlIDBcclxuICAgICAgICAjIyNcclxuICAgICAgICAjIFJPT00gREVMRVRJTkcgUkFUSU9cclxuICAgICAgICBic3AuY29uZmlnLlJPT01fREVMRVRJTkdfUkFUSU8gPSBpZiAkKFwiI2RlbGV0aW5nRW5hYmxlZFwiKS5wcm9wKFwiY2hlY2tlZFwiKVxyXG4gICAgICAgICAgcGFyc2VGbG9hdCgkKFwiI2RlbGV0aW5nUmF0aW9cIikudmFsKCkpXHJcbiAgICAgICAgZWxzZSAwXHJcbiAgICAgICAgIyBET09SIENIQU5DRVxyXG4gICAgICAgIGJzcC5jb25maWcuRE9PUl9DSEFOQ0UgPSBpZiAkKFwiI2Rvb3JzRW5hYmxlZFwiKS5wcm9wKFwiY2hlY2tlZFwiKVxyXG4gICAgICAgICAgcGFyc2VJbnQoJChcIiNkb29yQ2hhbmNlXCIpLnZhbCgpKVxyXG4gICAgICAgIGVsc2UgMFxyXG4gICAgICAgIG1hcCA9IGJzcC5nZW5lcmF0ZShtYXBQYXJhbXMubWFwU2l6ZSlcclxuICAgICAgICBtYXAucGFpbnQoYylcclxuXHJcbiAgIyBJTlBVVCBTRVRVUFNcclxuICAkKFwiI21hcFNpemVcIikudmFsKG1hcFBhcmFtcy5tYXBTaXplKVxyXG4gIHNldHVwVG9nZ2xlKFwiI3Nob3dHcmlkXCIsIG1hcFBhcmFtcy5zaG93R3JpZClcclxuICBzZXR1cFRvZ2dsZShcIiNzaG93V2FsbHNcIiwgbWFwUGFyYW1zLnNob3dXYWxscylcclxuICBzZXR1cFRvZ2dsZShcIiNzaG93RG9vcnNcIiwgbWFwUGFyYW1zLnNob3dEb29ycylcclxuICBzZXR1cFRvZ2dsZShcIiNzaG93RGVidWdcIiwgbWFwUGFyYW1zLmRlYnVnTW9kZSlcclxuXHJcbiAgIyBic3Agc3BlY2lmaWNcclxuICAkKFwiI3Jvb21NaW5TaXplXCIpLnZhbChic3AuY29uZmlnLk1JTl9ST09NX1NJWkUpXHJcbiAgJChcIiNyb29tTWF4U2l6ZVwiKS52YWwoYnNwLmNvbmZpZy5NQVhfUk9PTV9TSVpFKVxyXG4gICNzZXR1cFRvZ2dsZWFibGUoXCIjYXNwZWN0UmF0aW9FbmFibGVkXCIsXCIjYXNwZWN0UmF0aW9cIixic3AuY29uZmlnLlJBVElPX1JFU1RSKVxyXG4gIHNldHVwVG9nZ2xlYWJsZShcIiNkZWxldGluZ0VuYWJsZWRcIiwgXCIjZGVsZXRpbmdSYXRpb1wiLCBic3AuY29uZmlnLlJPT01fREVMRVRJTkdfUkFUSU8pXHJcbiAgc2V0dXBUb2dnbGVhYmxlKFwiI2Rvb3JzRW5hYmxlZFwiLCBcIiNkb29yQ2hhbmNlXCIsIGJzcC5jb25maWcuRE9PUl9DSEFOQ0UpXHJcblxyXG4gICMgQmluZCBmdW5jdGlvbnMgdG8gYnV0dG9uc1xyXG4gICQoXCIjZ2VuZXJhdGVcIikuY2xpY2soZ2VuZXJhdGVNYXApXHJcbiAgJChcIiNzaG93R3JpZFwiKS5jaGFuZ2UgLT5cclxuICAgIG1hcFBhcmFtcy5zaG93R3JpZCA9ICQoXCIjc2hvd0dyaWRcIikucHJvcChcImNoZWNrZWRcIilcclxuICAgIG1hcC5wYWludChjKVxyXG4gICQoXCIjc2hvd1dhbGxzXCIpLmNoYW5nZSAtPlxyXG4gICAgbWFwUGFyYW1zLnNob3dXYWxscyA9ICQoXCIjc2hvd1dhbGxzXCIpLnByb3AoXCJjaGVja2VkXCIpXHJcbiAgICBtYXAucGFpbnQoYylcclxuICAkKFwiI3Nob3dEb29yc1wiKS5jaGFuZ2UgLT5cclxuICAgIG1hcFBhcmFtcy5zaG93RG9vcnMgPSAkKFwiI3Nob3dEb29yc1wiKS5wcm9wKFwiY2hlY2tlZFwiKVxyXG4gICAgbWFwLnBhaW50KGMpXHJcbiAgJChcIiNzaG93RGVidWdcIikuY2hhbmdlIC0+XHJcbiAgICBtYXBQYXJhbXMuZGVidWdNb2RlID0gJChcIiNzaG93RGVidWdcIikucHJvcChcImNoZWNrZWRcIilcclxuICAgIG1hcC5wYWludChjKVxyXG4gICMgRW5hYmxlIHRvb2x0aXBzIHdpdGggYm9vdHN0cmFwXHJcbiAgJCgnW2RhdGEtdG9nbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpXHJcbiAgIyBHZW5lcmF0ZSBtYXAgb24gcGFnZSBsb2FkXHJcbiAgZ2VuZXJhdGVNYXAoKVxyXG5cclxuXHJcbnNldHVwVG9nZ2xlID0gKGlucHV0LCByZWZWYWwpIC0+XHJcbiAgJChpbnB1dCkucHJvcChcImNoZWNrZWRcIiwgXCJvblwiKSBpZiByZWZWYWxcclxuXHJcbnNldHVwVG9nZ2xlYWJsZSA9ICh0b2dnbGUsIGlucHV0LCByZWZWYWwsIGRpc2FibGVkVmFsID0gMCkgLT5cclxuICAjIFNldCBkZWZhdWx0IHZhbHVlXHJcbiAgJChpbnB1dCkudmFsKHJlZlZhbClcclxuICBpZiByZWZWYWwgPiBkaXNhYmxlZFZhbFxyXG4gICAgJCh0b2dnbGUpLnByb3AoXCJjaGVja2VkXCIsIFwib25cIilcclxuICBlbHNlXHJcbiAgICAkKHRvZ2dsZSkucmVtb3ZlUHJvcChcImNoZWNrZWRcIiwgXCJvblwiKVxyXG4gICMgRGlzYWJsZSBmaWVsZCBvbiBjaGVja2JveCBkaXNhYmxlXHJcbiAgJCh0b2dnbGUpLmNoYW5nZSAtPlxyXG4gICAgaWYgJCh0b2dnbGUpLnByb3AoXCJjaGVja2VkXCIpXHJcbiAgICAgICQoaW5wdXQpLnJlbW92ZUF0dHIoXCJkaXNhYmxlZFwiLCBcIlwiKVxyXG4gICAgZWxzZVxyXG4gICAgICAkKGlucHV0KS5hdHRyKFwiZGlzYWJsZWRcIiwgXCJcIikiXX0=