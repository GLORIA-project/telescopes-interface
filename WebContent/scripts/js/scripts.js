'use strict';

var buildTimelineSlots = function(n) {
	var slots = [];

	for (var i = 0; i < n; i++) {
		var slot = {
			style : {
				left : (100 / n) * i + '%',
				width : (100 / n) + '%'
			}
		};

		if (i == 0) {
			slot.style.borderLeft = 'none';
		}

		slots[i] = slot;
	}

	return slots;
};

function ScriptsController($gloriaAPI, $scope, $timeout, $location,
		$gloriaLocale, $filter) {

	$scope.ready = false;
	$scope.scripts = [];
	$scope.scriptsReady = false;
	$scope.telescopeSelected = null;
	$scope.hourSelected = null;
	$scope.scriptSelected = null;
	$scope.scriptForDetail = null;

	$scope.hours = buildTimelineSlots(24);
	$scope.quarters = buildTimelineSlots(4);

	var i = 1;
	$scope.quarters.forEach(function(quarter) {
		quarter.text = "Q" + i;
		i++;
	});

	$scope.hourClicked = function(number) {
		$scope.hourSelected = number;
		$scope.scriptSelected = null;
		$scope.scriptForDetail = null;
	};

	$scope.scriptClicked = function(index, script) {
		$scope.scriptSelected = index;
		$scope.scriptForDetail = script;// $scope.scripts[number];
		toolbox.scrollTo('details');
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

	$scope.isValidScript = function(op) {
		return op == 'expose' || op == 'close' || op == 'open' || op == 'close&park';
	};
	
	$scope.deleteScript = function() {
		$gloriaAPI.deleteScript($scope.scriptForDetail, function() {
			$scope.scriptSelected = null;
			$scope.scriptForDetail = null;
			$scope.loadScripts();
		}, function(error) {
			alert("Could not delete script");
		});
	};

	$scope.loadScripts = function() {
		$gloriaAPI
				.getTelescopeScripts(
						$scope.telescopeSelected,
						function(data) {
							$scope.scripts = [];
							console.log(data);

							data
									.forEach(function(script) {

										if ($scope
												.isValidScript(script.operation)) {
											var leftValue = script.slot.begin / 864000;
											var widthValue = Math
													.min(
															script.slot.length / 864000,
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
												script.dayStyle.width = widthValue
														+ '%';
											}

											script.parameters = [];

											var init = script.init;
											for ( var property in init) {
												var parameter = {};
												if (property
														.indexOf("dome.delay") != -1) {
													parameter.alias = "park after";
												} else if (property
														.indexOf("exposure") != -1) {
													parameter.alias = "exposure time";
												} else if (property
														.indexOf("ccd.delay") != -1) {
													parameter.alias = "expose after";
												} else if (property
														.indexOf(".object") != -1) {
													parameter.alias = "object";
												} else if (property
														.indexOf(".ra") != -1) {
													parameter.alias = "ra";
												} else if (property
														.indexOf(".dec") != -1) {
													parameter.alias = "dec";
												}

												if (parameter.alias != undefined) {
													parameter.value = init[property];
													script.parameters
															.push(parameter);
												}
											}

											$scope.scripts.push(script);
										}
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
			toolbox.scrollTo('timeline');
		}
	};

	$gloriaLocale.loadResource('scripts/lang', 'scripts', function() {
		$scope.ready = true;
	});

	$scope.$on('$destroy', function() {
		// $timeout.cancel($scope.timer);
	});
}
