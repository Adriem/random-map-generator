$(document).ready(function(){
	//Variables
	var c = $("#cnvs")[0].getContext('2d');
	//Map function
	var generateMap = function() {
		CANVAS_SIZE = parseInt($("#cnvs").attr("width"));
		MAP_SIZE = parseInt($("#mapSize").val());
		TILE_SIZE = CANVAS_SIZE / MAP_SIZE;
		switch ($("#algorythm").val()) {
		case "BSP":
			BSP.config.ITERATIONS = parseInt($("#bspIterations").val());
			/*BSP.config.SIZE_RESTR = $("#sizeRestEnabled").prop("checked") ? 
				parseInt($("#sizeRest").val()) : 1;
			BSP.config.RATIO_RESTR = $("#ratioRestEnabled").prop("checked") ? 
				parseFloat($("#ratioRest").val()) : 0;*/
			BSP.config.ROOM_DELETING_RATIO = $("#deletingEnabled").prop("checked") ? 
				parseFloat($("#deletingRatio").val()) : 0;
			paint(BSP.generateMap(MAP_SIZE), c);
			break;
		}
		
	}	
	// Enable tooltips with bootstrap
	$('[data-toggle="tooltip"]').tooltip();
	// Set default data
	$("#mapSize").val(MAP_SIZE);
	$("#bspIterations").val(BSP.config.ITERATIONS);
	/*if (BSP.config.SIZE_RESTR > 1) {
		$("#sizeRestEnabled").prop("checked", "on");
		$("#sizeRest").val(BSP.config.SIZE_RESTR);
	} else {
		$("#sizeRestEnabled").removeProp("checked", "on");
		$("#sizeRest").val(BSP.config.SIZE_RESTR);
	}
	if (BSP.config.RATIO_RESTR > 0) {
		$("#ratioRestEnabled").prop("checked", "on");
		$("#ratioRest").val(BSP.config.RATIO_RESTR);
	} else {
		$("#ratioRestEnabled").removeProp("checked", "on");
		$("#ratioRest").val(BSP.config.RATIO_RESTR);
	}*/
	if (BSP.config.ROOM_DELETING_RATIO > 0) {
		$("#deletingEnabled").prop("checked", "on");
		$("#deletingRatio").val(BSP.config.ROOM_DELETING_RATIO);
	} else {
		$("#ratioRestEnabled").removeProp("checked", "on");
		$("#ratioRest").val(BSP.config.RATIO_RESTR);
	}
	// Disable fields with enable-checkbox
	/*$("#sizeRestEnabled").change(function() {
		if ($("#sizeRestEnabled").prop("checked")) {
			$("#sizeRest").removeAttr("disabled", "");
		} else $("#sizeRest").attr("disabled", "");
	});
	$("#ratioRestEnabled").change(function() {
		if ($("#ratioRestEnabled").prop("checked")) {
			$("#ratioRest").removeAttr("disabled", "");
		} else $("#ratioRest").attr("disabled", "");
	});*/
	$("#deletingEnabled").change(function() {
		if ($("#deletingEnabled").prop("checked")) {
			$("#deletingRatio").removeAttr("disabled", "");
		} else $("#deletingRatio").attr("disabled", "");
	});
	//Bind function to button
	$("#generate").click(generateMap);

	//Generate map on page start
	generateMap();
});