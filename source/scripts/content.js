/******************************************************************************
 * File: 	content.js
 * Summary: Content script for this Chrome Extension
 * Author: 	Little Corner Dev (https://github.com/LittleCornerDev)
 *
 * Copyright (c) 2020, Little Corner Dev. All rights reserved.
 * Use of this source code is governed by the license that can be
 * found in the LICENSE file.
 */



var CNSI = window.CNSI || {};

CNSI.content = {

	// Tasks we need to do onload
	init: function () {
		console.log("initializing content");
		//CNSI.content.connectToExtension();
		CNSI.content.getTabId();
		CNSI.content.addListeners();
		CNSI.content.createIds();
	},

	shutdown: function () {
		CNSI.content.removeListeners();
	},

	tabId: null,

	getTabId: function () {
		console.log("Getting tab id...");
		//chrome.runtime.onConnect.addListener(port => {
		//port.sendMessage({scrolled: true}, function(response) {
		chrome.runtime.sendMessage({ getTabId: true }, function (response) {
			if (response == null) {
				console.log("Failed to get tab id.  Trying again.");
				setTimeout(CNSI.content.getTabId, 1000 * 1);
			} else if (response.status == "success") {
				console.log('My tab id: ' + response.tabId);
				CNSI.content.tabId = response.tabId;
			}
		});
		//});
	},

	// Adds element ids to `id` object for every key in `ids` array
	createIds: function () {
		CNSI.content.ids.forEach(function (key) {
			CNSI.content.id[ key ] = CNSI.content.id.main + "-" + CNSI.utils.kebabize(key);
			//console.log(key + ": " + CNSI.content.id[key]);
		});
	},

	// Adds all listeners
	addListeners: function () {
		// Wrap runtime listeners with onConnect
		// https://stackoverflow.com/questions/54181734/chrome-extension-message-passing-unchecked-runtime-lasterror-could-not-establi/54686484#54686484
		// https://www.bennettnotes.com/post/fix-receiving-end-does-not-exist/
		//chrome.runtime.onConnect.addListener(port => {
		//console.log("content script connected on port " + port);


		// Listen for messages from background.js
		// These include the screenshot and identifier open/close
		// https://developer.chrome.com/extensions/messaging
		chrome.runtime.onMessage.addListener(CNSI.content.handleMessages);
		//port.onMessage.addListener(CNSI.content.handleMessages);

		document.body.addEventListener('mousemove', CNSI.content.handleMouseMove);

		window.addEventListener('scroll', CNSI.content.handleScroll);

		window.addEventListener('resize', CNSI.content.handleResize);

		window.addEventListener('click', CNSI.content.handleClick);


		//});
	},

	removeListeners: function () {
		chrome.runtime.onMessage.removeListener(CNSI.content.handleMessages);

		document.body.removeEventListener('mousemove', CNSI.content.handleMouseMove);

		window.removeEventListener('scroll', CNSI.content.handleScroll);

		window.removeEventListener('resize', CNSI.content.handleResize);

		window.removeEventListener('click', CNSI.content.handleClick);
	},


	handleMessages: function (request, sender, sendResponse) {
		/*console.log(sender.tab ?
					"from a content script:" + sender.tab.url :
					"from the background script");*/


		if (request.screenshot != null) {
			//console.log("Received screenshot " + request.screenshot);
			console.log("Received new screenshot");
			CNSI.content.screenshotUrl = request.screenshot;
			CNSI.content.tabId = request.tabId;
			CNSI.content.setImage();
			sendResponse({ status: "success" });
		}
		else if (request.identifier != null) {
			console.log("Received identifier request " + request.identifier);
			if (request.identifier == "open") {
				CNSI.content.openIdentifier();
			}
			else if (request.identifier == "close") {
				CNSI.content.shutdown();
				CNSI.content.closeIdentifier();
			}
			sendResponse({ status: "success" });
		}
		//else {
		//console.log("Unexpected request");
		//sendResponse({status: "failure"});
		//}
	},

	handleMouseMove: function (event) {
		// https://stackoverflow.com/questions/19376622/using-mouse-coordinates-as-pixel-values-for-javascript-functions
		var x = event.clientX;// + window.scrollX; //document.body.scrollLeft;
		var y = event.clientY;// + window.scrollY; //document.body.scrollTop;

		/*console.log("clientX: " + event.clientX + ", window.scrollX: " + window.scrollX + ", document.body.scrollLeft: " + document.body.scrollLeft);
		console.log("clientY: " + event.clientY + ", window.scrollY: " + window.scrollY + ", document.body.scrollTop: " + document.body.scrollTop);
		*/
		//console.log("x: " + x + ", y: " + y);
		//moveMain(x, y);

		if (document.getElementById(CNSI.content.id.main) != null) {
			CNSI.content.setImageCanvas(x, y);
			CNSI.content.setImageData();
		}
	},


	handleClick: function (event) {
		// Send message to background.js so it can send us new screenshot
		// https://developer.chrome.com/extensions/messaging

		//chrome.runtime.onConnect.addListener(port => {
		chrome.runtime.sendMessage({ clicked: true }, function (response) {
			//port.sendMessage({scrolled: true}, function(response) {
			console.log('sending click message: ' + response.status);
		});
		//});
	},

	handleResize: function (event) {
		// Send message to background.js so it can send us new screenshot
		// https://developer.chrome.com/extensions/messaging

		//chrome.runtime.onConnect.addListener(port => {
		chrome.runtime.sendMessage({ resized: true }, function (response) {
			//port.sendMessage({resized: true}, function(response) {
			console.log('sending resize message: ' + response.status);
		});
		//});
	},

	handleScroll: function (event) {
		// Send message to background.js so it can send us new screenshot
		// https://developer.chrome.com/extensions/messaging

		//chrome.runtime.onConnect.addListener(port => {
		chrome.runtime.sendMessage({ scrolled: true }, function (response) {
			//port.sendMessage({scrolled: true}, function(response) {
			console.log('sending scroll message: ' + response.status);
		});
		//});
	},

	// List of all element ids, keyed by type, for easy lookup.
	// Populated further in createIds().
	id: {
		main: "cnsi"  // Must name ids in content.css
	},

	// List of id keys for `id` population in createIds().
	// This is so each id value can follow the same naming convention
	// based on its id key.
	ids: [
		"style",
		"origin",
		"originHex",
		"originRgba",
		"originRgbaR",
		"originRgbaG",
		"originRgbaB",
		"originRgbaA",
		"originHcl",
		"originHclH",
		"originHclC",
		"originHclL",
		"originHsl",
		"originHslH",
		"originHslS",
		"originHslL",
		"originHsv",
		"originHsvH",
		"originHsvS",
		"originHsvV",
		"name",
		"nameHex",
		"nameNames",
		"nameExact",
		"seasons",
		"seasonsHex",
		"seasonsGood",
		"seasonsBad",
		"seasonsExact"
	],



	// Dynamic image url to tab page screenshot
	screenshotUrl: null,


	// https://stackoverflow.com/questions/10994324/chrome-extension-content-script-re-injection-after-upgrade-or-install/11598753#11598753
	port: null,

	// Attempt to reconnect
	reconnectToExtension: function () {
		console.log("Attempting to reconnect");

		// Reset port
		CNSI.content.port = null;
		// Attempt to reconnect after 1 second
		setTimeout(CNSI.content.connectToExtension, 1000 * 1);
	},

	// Attempt to connect
	connectToExtension: function () {
		console.log("Attempting to connect");

		// Make the connection
		//CNSI.content.port = chrome.runtime.connect({name: "my-port"});
		CNSI.content.port = chrome.runtime.connect();
		if (CNSI.content.port != null) {
			CNSI.content.addListeners();
			CNSI.content.createIds();
		}


		/*chrome.runtime.onConnect.addListener((port) => {
			port.onMessage.addListener((msg) => {
					if (msg.function == 'html') {
					port.postMessage({ html: document.documentElement.outerHTML, description: document.querySelector("meta[name=\'description\']").getAttribute('content'), title: document.title });
				}
			});
		});*/


		// When extension is upgraded or disabled and renabled, the content scripts
		// will still be injected, so we have to reconnect them.
		// We listen for an onDisconnect event, and then wait for a second before
		// trying to connect again. Because chrome.runtime.connect fires an onDisconnect
		// event if it does not connect, an unsuccessful connection should trigger
		// another attempt, 1 second later.
		CNSI.content.port.onDisconnect.addListener(CNSI.content.reconnectToExtension);
	},



	/*insertCSS: function() {
		// https://stackoverflow.com/questions/9721344/my-css-is-not-getting-injected-through-my-content-script
		var style = document.createElement("link");
		style.id = id.style;
		style.rel = "stylesheet";
		style.type = "text/css";
		style.href = chrome.extension.getURL("content.css");
		(document.head||document.documentElement).appendChild(style);
	}

	moveMain: function(x, y) {
		if (x != null && y != null) {
			//console.log("x: " + x + ", y: " + y);
			var main = document.getElementById(CNSI.content.id.main);
			main.style.top = y;
			main.style.left = x;
		}
	}


	*/

	getHTML: function () {
		return `<!-- BEGIN: Origin -->
			<section id="${CNSI.content.id.origin}" >
				<h5>Original Color</h5>
				<img/>
				<canvas></canvas>
				<div id="${CNSI.content.id.originHex}">
					<label>Hex Code</label><span></span>
				</div>
				<div id="${CNSI.content.id.originRgba}">
					<div id="${CNSI.content.id.originRgbaR}">
						<label>R</label><span></span>
					</div>
					<div id="${CNSI.content.id.originRgbaG}">
						<label>G</label><span></span>
					</div>
					<div id="${CNSI.content.id.originRgbaB}">
						<label>B</label><span></span>
					</div>
					<div id="${CNSI.content.id.originRgbaA}">
						<label>A</label><span></span>
					</div>
				</div>
				<!-- < div id = "${CNSI.content.id.originHcl}" >
					<div id="${CNSI.content.id.originHclH}">
						<label>H</label><span></span>
					</div>
					<div id="${CNSI.content.id.originHclC}">
						<label>C</label><span></span>
					</div>
					<div id="${CNSI.content.id.originHclL}">
						<label>L</label><span></span>
					</div>
				</div >
			<div id="${CNSI.content.id.originHsl}">
				<div id="${CNSI.content.id.originHslH}">
					<label>H</label><span></span>
				</div>
				<div id="${CNSI.content.id.originHslS}">
					<label>S</label><span></span>
				</div>
				<div id="${CNSI.content.id.originHslL}">
					<label>L</label><span></span>
				</div>
			</div> -->
				<div id="${CNSI.content.id.originHsv}">
					<div id="${CNSI.content.id.originHsvH}">
						<label>H</label><span></span>
					</div>
					<div id="${CNSI.content.id.originHsvS}">
						<label>S</label><span></span>
					</div>
					<div id="${CNSI.content.id.originHsvV}">
						<label>V</label><span></span>
					</div>
				</div>
			</section >
			<!-- END: Origin Section -->

			<!-- BEGIN: Name Section -->
			<section id="${CNSI.content.id.name}">
				<h5>Closest Name</h5>
				<canvas></canvas>
				<div id="${CNSI.content.id.nameHex}">
					<label>Hex Code</label><span></span>
				</div>
				<div id="${CNSI.content.id.nameExact}">
					<label>Exact Match</label><span></span>
				</div>
				<div id="${CNSI.content.id.nameNames}">
					<label>Name(s)</label><ul></ul>
					<small>* Not a digital color space.  <br/>Color name is an approximation.</small>
				</div>
			</section>
			<!-- END: Name Section -->

			<!-- BEGIN: Seasons Section -->
			<section id="${CNSI.content.id.seasons}">
				<h5>Closest Season Swatch</h5>
				<canvas></canvas>
				<div id="${CNSI.content.id.seasonsHex}">
					<label>Hex Code</label><span></span>
				</div>
				<div id="${CNSI.content.id.seasonsExact}">
					<label>Exact Match</label><span></span>
				</div>
				<div id="${CNSI.content.id.seasonsGood}">
					<label>Good for</label><ul></ul>
					<small>FN - Fashion Neutral<br/>CA - Complementary/Accent<br/>M - Metal</small>
				</div>
				<div id="${CNSI.content.id.seasonsBad}">
					<label>Bad for</label><ul></ul>
				</div>
			</section>
			<!-- END: Seasons Section -->`;
	},

	// Closes/removes our main content div from the current tab page.
	closeIdentifier: function () {
		var main = document.getElementById(CNSI.content.id.main);
		if (main != null) {
			main.remove();
		}
	},

	// Opens/adds our main content div to the current tab page.
	openIdentifier: function () {
		// Make sure it doesn't already exist.
		// We do not want duplicate divs!
		if (document.getElementById(CNSI.content.id.main) == null) {
			// create main wrapper element
			var main = document.createElement("div");
			main.id = CNSI.content.id.main;
			main.innerHTML = CNSI.content.getHTML();

			// append all elements to bottom of current document
			document.body.appendChild(main);
		}



	},

	// Populates name info in content div
	displayNameInfo: function (originHexCode) {
		var nameHexSpan = document.getElementById(CNSI.content.id.nameHex).querySelector("span");
		var nameNamesList = document.getElementById(CNSI.content.id.nameNames).querySelector("ul");
		var nameExactSpan = document.getElementById(CNSI.content.id.nameExact).querySelector("span");

		nameHexSpan.innerHTML = "n/a";
		nameExactSpan.innerHTML = "n/a";
		nameNamesList.innerHTML = "";

		var nameData = CNSI.data.getColorData(originHexCode, "names");

		if (nameData != null) {
			nameHexSpan.innerHTML = nameData.hex;
			nameExactSpan.innerHTML = nameData.isExactMatch;
			nameNamesList.innerHTML = "";
			if (nameData.names != null) {
				nameData.names.forEach(function (data, i) {
					nameNamesList.innerHTML += "<li>"
						+ CNSI.utils.getColorNameDisplay(data.name, data.source, data.number)
						+ "</li>";
				});
			}
		}

		var nameSection = document.getElementById(CNSI.content.id.name);
		var canvas = nameSection.querySelector("canvas");
		CNSI.utils.fillCanvasWithHex(canvas, nameData.hex);

	},

	// Populates season info in content div
	displaySeasonInfo: function (originHexCode) {
		var seasonsHexSpan = document.getElementById(CNSI.content.id.seasonsHex).querySelector("span");
		var seasonsGoodList = document.getElementById(CNSI.content.id.seasonsGood).querySelector("ul");
		var seasonsBadList = document.getElementById(CNSI.content.id.seasonsBad).querySelector("ul");
		var seasonsExactSpan = document.getElementById(CNSI.content.id.seasonsExact).querySelector("span");

		//make sure to clear texts since this gets constantly populated onmousemove
		seasonsHexSpan.innerHTML = "n/a";
		seasonsExactSpan.innerHTML = "n/a";
		seasonsGoodList.innerHTML = "";
		seasonsBadList.innerHTML = "";

		var seasonData = CNSI.data.getColorData(originHexCode, "seasons");

		if (seasonData != null) {
			seasonsHexSpan.innerHTML = seasonData.hex;
			seasonsExactSpan.innerHTML = seasonData.isExactMatch;

			var seasonsSection = document.getElementById(CNSI.content.id.seasons);
			var canvas = seasonsSection.querySelector("canvas");
			CNSI.utils.fillCanvasWithHex(canvas, seasonData.hex);

			seasonsGoodList.innerHTML = "";
			if (seasonData.good != null) {
				seasonData.good.forEach(function (data, i) {
					seasonsGoodList.innerHTML += "<li>"
						+ CNSI.utils.getColorSeasonDisplay(data.season, data.seasonType, data.colorType)
						+ "</li>";
				});
			}

			seasonsBadList.innerHTML = "";
			if (seasonData.bad != null) {
				seasonData.bad.forEach(function (data, i) {
					seasonsBadList.innerHTML += "<li>"
						+ CNSI.utils.getColorSeasonDisplay(data.season, data.seasonType)
						+ "</li>";
				});
			}
		}
	},

	// used by both setImageData() and setImageCanvase()
	// we should be consistent in the context we use for both
	getCanvasContext: function (canvas) {
		//https://stackoverflow.com/questions/43582546/what-is-colorspace-in-imagedata
		//https://github.com/WICG/canvas-color-space/blob/master/CanvasColorSpaceProposal.md
		var canvasContext = canvas.getContext("2d", { alpha: false });
		//var canvasContext = canvas.getContext('2d', { colorSpace: "srgb", pixelFormat: "8-8-8-8"}); //default
		//var canvasContext = canvas.getContext('2d', { colorSpace: "linear-srgb", pixelFormat: "float16"});
		//var canvasContext = canvas.getContext('2d', { colorSpace: "legacy-srgb"});
		//var canvasContext = canvas.getContext("webgl2");
		return canvasContext;
	},

	// Sets the screenshotUrl to an invisible image element
	setImage: function () {
		//chrome.storage.local.get(["CNSIdata"], function(data) {
		//var screenshotInStorage = data.CNSIdata[CNSI.content.tabId].screenshot;
		//var screenshotUrl = CNSI.content.screenshotUrl || screenshotInStorage;
		var screenshotUrl = CNSI.content.screenshotUrl;
		//console.log("screenshotUrl: " + screenshotUrl);

		if (screenshotUrl != null) {
			var main = document.getElementById(CNSI.content.id.main);
			var img = main.querySelector("img");
			img.src = screenshotUrl;
		}

		//});
	},

	// Sets the canvas to the pixel in the screenshot image at the given (x,y) coordinates
	setImageCanvas: function (x, y) {
		//chrome.storage.local.get(["CNSIdata"], function(data) {
		//var screenshotInStorage = data.CNSIdata[CNSI.content.tabId].screenshot;
		//var screenshotUrl = CNSI.content.screenshotUrl || screenshotInStorage;
		var screenshotUrl = CNSI.content.screenshotUrl;

		if (screenshotUrl != null && x != null && y != null) {
			var origin = document.getElementById(CNSI.content.id.origin);

			var canvas = origin.querySelector("canvas");
			var canvasLayoutWidth = canvas.width;
			var canvasLayoutHeight = canvas.height;
			//console.log("canvasWidth: " + canvasWidth + ", canvasHeight: " + canvasHeight);

			var img = origin.querySelector("img");

			var coordsToImgRatioX = img.width / window.innerWidth; //document.body.clientWidth if full screenshot
			var coordsToImgRatioY = img.height / window.innerHeight; //document.body.clientHeight
			/*console.log("img.width: " + img.width + ", window.innerWidth: " + window.innerWidth + ", document.body.clientWidth: " + document.body.clientWidth);
			console.log("img.height: " + img.height + ", window.innerHeight: " + window.innerHeight + ", w   .clientHeight: " + document.body.clientHeight);
			console.log("coordsToImgRatioX: " + coordsToImgRatioX + ", coordsToImgRatioY: " + coordsToImgRatioY);*/

			var canvasContext = CNSI.content.getCanvasContext(canvas);

			//var img = new Image;
			//canvasContext.clearRect(0, 0, canvasLayoutWidth, canvasLayoutHeight);
			//img.onload = function() {
			var imgCropWidth = 1; //canvasLayoutWidth
			var imgCropHeight = 1; //canvasLayoutWidth
			var imgOffsetX = x * coordsToImgRatioX - (imgCropWidth / 2);
			var imgOffsetY = y * coordsToImgRatioY - (imgCropHeight / 2);
			if (imgOffsetX < 0) imgOffsetX = 0;
			if (imgOffsetY < 0) imgOffsetY = 0;
			//console.log("imgOffsetX: " + imgOffsetX + ", imgOffsetY: " + imgOffsetY);

			// https://stackoverflow.com/questions/38181137/how-can-i-take-screenshot-of-some-specific-area-using-javascript-in-chrome-exten
			canvasContext.drawImage(img, imgOffsetX, imgOffsetY, imgCropWidth, imgCropHeight, 0, 0, canvasLayoutWidth, canvasLayoutHeight);
			/*let gl = canvas.getContext("webgl2");
			canvasContext.activeTexture(canvasContext.TEXTURE0);
			let texture = canvasContext.createTexture();
			canvasContext.bindTexture(canvasContext.TEXTURE_2D, texture);
			const framebuffer = canvasContext.createFramebuffer();
			canvasContext.bindFramebuffer(canvasContext.FRAMEBUFFER, framebuffer);
			canvasContext.framebufferTexture2D(canvasContext.FRAMEBUFFER, canvasContext.COLOR_ATTACHMENT0, canvasContext.TEXTURE_2D, texture, 0);
			canvasContext.texImage2D(canvasContext.TEXTURE_2D, 0, canvasContext.RGBA, canvasContext.RGBA, canvasContext.UNSIGNED_BYTE, img);
			canvasContext.drawBuffers([canvasContext.COLOR_ATTACHMENT0]);*/

			//};
			//img.src = screenshotUrl;

		} else {
			console.log("Missing required data for setting canvas");
			//console.log("x: " + x + ", y: " + y);
			//console.log("screenshotUrl:"  + screenshotUrl);
		}

		//});
	},

	// Sets/displays the hex and rgb color data for the pixel displayed in the canvas.
	// Modified from
	// https://stackoverflow.com/questions/58668131/how-to-get-the-rgb-data-from-an-area-of-image-with-javascript
	setImageData: function () {
		var origin = document.getElementById(CNSI.content.id.origin);

		var canvas = origin.querySelector("canvas");//https://github.com/WICG/canvas-color-space/blob/master/CanvasColorSpaceProposal.md
		var canvasLayoutWidth = canvas.width;
		var canvasLayoutHeight = canvas.height;

		var canvasContext = CNSI.content.getCanvasContext(canvas);

		// Get RGB from canvas image data
		//
		// FIXME:  The RGB values from canvas getImageData isn't exactly accurate :-(
		// There is an issue with transparency
		// https://stackoverflow.com/questions/36038679/html-canvas-inaccurately-sets-pixel-color-when-alpha-is-lower-than-one
		// but even without transparency, the values don't match
		// https://stackoverflow.com/questions/7692822/invalid-blending-results-across-all-browsers-with-html5-canvas
		// https://bugzilla.mozilla.org/show_bug.cgi?id=867594
		// https://bugs.chromium.org/p/chromium/issues/detail?id=425935
		//
		// E.g. "Telegrey 4" in https://www.w3schools.com/colors/colors_ral.asp
		// has a CSS background set to the diplayed hexcode #CFD0CF,
		// but we are detecting #D0D0D0.
		//
		// Forcing color profile on Chrome helps, but it's still not quite exact.
		// We also shouldn't assume users will know how to set their color profile to something other than default.
		// https://www.reddit.com/r/chrome/comments/930egn/set_force_color_profile_to_srgb_and_google_chrome/
		//
		//var data = canvasContext.getImageData(canvasLayoutWidth/2, canvasLayoutHeight/2, 1, 1).data;
		var data = canvasContext.getImageData(Math.floor(canvasLayoutWidth / 2), Math.floor(canvasLayoutHeight / 2), 1, 1).data;
		/*var data = new Uint8Array(canvasLayoutWidth * canvasLayoutHeight * 4);
		canvasContext.readPixels(canvasLayoutWidth/2, canvasLayoutHeight/2, 1, 1, canvasContext.RGBA, canvasContext.UNSIGNED_BYTE, data);*/

		const average = { r: 0, g: 0, b: 0, a: 0 }; // Creates an object to count all the values up
		const pixels = data.length / 4; // The actual amount of pixels read
		//console.log("Canvas image has " + pixels + " pixels");

		// Loop through pixel data to sum up all the r, g, b, and a values.
		// The data is a flat array of values for [r,g,b,a] sequently from top left to bottom right.
		// So every four entries forms one pixel.
		const rgbaKeys = [ "r", "g", "b", "a" ];
		for (let i = 0; i < data.length; i += 4) {
			// Add all the averages to their corresponding counters.
			rgbaKeys.forEach(function (component, componentIndex) {
				average[ component ] += data[ i + componentIndex ];
				//console.log("Adding " + data[i + componentIndex] + " to " + component + " values");
			});
		}

		// Get the average r, g, b, and a values by dividing the total sum values by
		// the number of pixels read.
		// Round up, as RGB is Integers only, and divide by 255 as the alpha value is a Float between 0 and 1.
		rgbaKeys.forEach(function (component, componentIndex) {
			average[ component ] = Math.ceil(average[ component ] / pixels);
			//console.log("Final " + component + " value is " + average[component]);
			if (component == "a") { average[ component ] / 255; }

			//Display the RGBA values
			var span = document.getElementById(CNSI.content.id[ "originRgba" + component.toUpperCase() ]).querySelector("span");
			span.innerHTML = average[ component ];
		});


		//https://github.com/vinaypillai/ac-colors#color
		//var acColor = new Color({"color":[average.r, average.g, average.b]});
		//console.log("acColor.hex: " + acColor.hex + ", acColor.hsl: " + acColor.hsl + ", acColor.xyz: " + acColor.xyz);


		// Display hex code
		var hexCode = CNSI.utils.RGBAtoHex(average.r, average.g, average.b);
		var hexSpan = document.getElementById(CNSI.content.id.originHex).querySelector("span");
		hexSpan.innerHTML = hexCode.toUpperCase();


		//Display the HCL
		//const hclKeys = [ "h", "c", "l"];
		/*var hcl = CNSI.utils.RGBtoHCL(average.r, average.g, average.b);
		hclKeys.forEach(function(component, componentIndex) {
			var componentValue = hcl[component];

			var span = document.getElementById(CNSI.content.id["originHcl"+component.toUpperCase()]).querySelector("span");
			span.innerHTML = componentValue;
		});*/

		//Display the HSL
		//const hslKeys = [ "h", "s", "l"];
		//var hsl = CNSI.utils.hexToHSL(hexCode);
		/*var otherHsl = ntc.hsl(hexCode);
		console.log("ntc HSL is h " + otherHsl[0] + " s " + otherHsl[1] + " l " + otherHsl[2]);*/
		/*hslKeys.forEach(function(component, componentIndex) {
			var componentValue = hsl[component];

			var span = document.getElementById(CNSI.content.id["originHsl"+component.toUpperCase()]).querySelector("span");
			if (component == "h") {
				span.innerHTML = componentValue;
			} else {
				span.innerHTML = componentValue + "%";
			}
		});*/


		//Display the HSV
		const hsvKeys = [ "h", "s", "v" ];
		var hsv = CNSI.utils.RGBtoHSV(average.r, average.g, average.b);
		hsvKeys.forEach(function (component, componentIndex) {
			var componentValue = hsv[ component ];

			var span = document.getElementById(CNSI.content.id[ "originHsv" + component.toUpperCase() ]).querySelector("span");
			if (component == "h") {
				span.innerHTML = componentValue + "°";
			} else {
				span.innerHTML = componentValue + "%";
			}
			span.innerHTML += CNSI.utils.getHSVdescription(component, componentValue);
		});


		// Use origin hex code to look for possible name name
		CNSI.content.displayNameInfo(hexSpan.innerHTML);

		//Use origin hex code to look for possible wardrobe seasons
		CNSI.content.displaySeasonInfo(hexSpan.innerHTML, true);

	}

};


CNSI.content.init();