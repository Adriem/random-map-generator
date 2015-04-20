
var app = angular.module("random-map-generator", []);
app.controller('myController', function($scope) {
	$scope.mapSize = 64;
	$scope.iterations = 4;
	$scope.partitionMode = 2;
	$scope.sizeRestEnabled = true;
	$scope.sizeRest = 5;
	$scope.ratioRestEnabled = true;
	$scope.ratioRest = 0.45;
	$scope.newSeed = true;
});