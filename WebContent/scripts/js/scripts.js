'use strict';

function ScriptsController($gloriaAPI, $scope, $timeout, $location,
		$gloriaLocale, $filter) {

	$scope.ready = false;
	$scope.scripts = [];
	$scope.scriptsReady = false;
	$scope.telescopeSelected = null;
	$scope.hourSelected = null;
	$scope.scriptSelected = null;
	$scope.scriptForDetail = null;

	$scope.hours = [];
	for (var i = 0; i < 24; i++) {
		var hour = {
			style : {
				left : (100 / 24) * i + '%',
				width : (100 / 24) + '%'
			}
		};

		if (i == 0) {
			hour.style.borderLeft = 'none';
		}

		$scope.hours[i] = hour;
	}

	$scope.hourClicked = function(number) {
		$scope.hourSelected = number;
		$scope.scriptSelected = null;
		$scope.scriptForDetail = null;
	};

	$scope.scriptClicked = function(index, script) {
		$scope.scriptSelected = index;
		$scope.scriptForDetail = script;// $scope.scripts[number];
	};

	$scope.filterScripts = function(script) {
		var endHour = new Date(script.slot.begin + script.slot.length)
				.getUTCHours();
		var beginHour = new Date(script.slot.begin).getUTCHours();

		if ($scope.hourSelected == beginHour || $scope.hourSelected == endHour) {
			var leftValue;
			var widthValue;

			if ($scope.hourSelected == beginHour) {
				leftValue = (script.slot.begin - ($scope.hourSelected * 3600000)) / 36000;
				widthValue = Math.min(script.slot.length / 36000,
						100 - leftValue);
			} else {
				leftValue = 0;
				widthValue = (script.slot.begin + script.slot.length - ($scope.hourSelected * 3600000)) / 36000;
			}
			script.hourStyle = {
				left : leftValue + '%',
				width : widthValue + '%',
				backgroundColor : '#709709',
				cursor : 'pointer',
				borderLeft : '1px solid rgb(0, 82, 128, 0.3)',
				borderRight : '1px solid rgb(0, 82, 128, 0.3)'
			};

			return true;
		} else {
			return false;
		}

		return $scope.hourSelected == beginHour
				|| $scope.hourSelected == endHour;
	};

	$scope.loadScripts = function() {
		$gloriaAPI.getTelescopeScripts($scope.telescopeSelected,
				function(data) {
					console.log(data);
					$scope.scripts = [];

					data.forEach(function(script) {

						var leftValue = script.slot.begin / 864000;
						var widthValue = Math.min(script.slot.length / 864000,
								100 - leftValue);

						script.dayStyle = {
							left : leftValue + '%',
							backgroundColor : '#709709',
							cursor : 'pointer',
							borderLeft : '1px solid rgb(0, 82, 128, 0.3)',
							borderRight : '1px solid rgb(0, 82, 128, 0.3)'
						};

						if (widthValue < 0.1) {
							script.dayStyle.width = '1px';
						} else {
							script.dayStyle.width = widthValue + '%';
						}

						$scope.scripts.push(script);

					});

					$scope.scriptsReady = true;
				}, function(error) {
				});
	};

	$scope.telescopeClicked = function(name) {
		if (name != $scope.telescopeSelected) {
			$scope.telescopeSelected = name;
			$scope.hourSelected = null;
			$scope.scriptSelected = null;
			$scope.scriptForDetail = null;
			$scope.scriptsReady = false;
			$scope.loadScripts();
		}
	};

	$gloriaLocale.loadResource('scripts/lang', 'scripts', function() {
		$scope.ready = true;
	});

	$scope.$on('$destroy', function() {
		// $timeout.cancel($scope.timer);
	});
}
