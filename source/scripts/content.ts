/******************************************************************************
 * File: 	content.ts
 * Summary:	Content script for this Chrome Extension
 * Author: 	Little Corner Dev (https://github.com/LittleCornerDev)
 *
 * Copyright (c) 2020, Little Corner Dev. All rights reserved.
 * Use of this source code is governed by the license that can be
 * found in the LICENSE file.
 */

import utils from "./utilities";
import data from "./data";
import {
	ColorDataTypeNames,
	ColorDataTypeSeasons,
	ColorValueHexWithHash,
	HsvType,
	RgbType,
	StyleClassNameKey,
	StyleClassNames,
	styleClassNames,
} from "./types";

//export default {
const CnsiContent = {
	// Tasks we need to do onload
	init: function () {
		console.log("Initializing content");

		//chrome.runtime.onConnect.addListener(CnsiContent.getTabId);
		CnsiContent.connectToExtension();
	},

	shutdown: function () {
		CnsiContent.removeListeners();
	},

	tabId: null,

	/*
	doesn't always work
	maxRetries: 5,
	getTabId: async function (port) {
		console.log("Getting tab id...");
		let response;
		try {
			//response = await port.sendMessage({ event: "getTabId" });
			response = await chrome?.runtime?.sendMessage({ event: "getTabId"});
			console.log("Sending getTabId message: " + response.status);

			if (response?.status == "success") {
				console.log("My tab id: " + response.tabId);
				CnsiContent.tabId = response.tabId;

			} else {
				console.log("Failed to get tab id: " + response);
			}
		} catch (error) {
			if (!response && CnsiContent.maxRetries > 0) {
				console.log("Failed to get tab id.	Trying again.");
				CnsiContent.maxRetries--;
				setTimeout(CnsiContent.getTabId, 1000 * CnsiContent.maxRetries);

			} else {
				console.error("Failed to get tab id: " + response);
			}
		}

	},*/

	// Adds element ids to `id` object for every key in `ids` array
	createIds: function () {
		styleClassNames.forEach((key) => {
			const val = key == "main" ? "cnsi" : "cnsi-" + utils.kebabize(key);
			CnsiContent.id[key] = val;
			//console.log(key + ": " + thisDefault.id[key]);
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
		chrome.runtime.onMessage.addListener(CnsiContent.handleMessages);
		//CnsiContent.port.onMessage.addListener(CnsiContent.handleMessages);

		document.body.addEventListener(
			"mousemove",
			CnsiContent.handleMouseMove
		);

		window.addEventListener("scroll", CnsiContent.handleScroll);

		window.addEventListener("resize", CnsiContent.handleResize);

		window.addEventListener("click", CnsiContent.handleClick);

		//});
	},

	removeListeners: function () {
		chrome?.runtime?.onMessage?.removeListener(CnsiContent.handleMessages);

		document.body.removeEventListener(
			"mousemove",
			CnsiContent.handleMouseMove
		);

		window.removeEventListener("scroll", CnsiContent.handleScroll);

		window.removeEventListener("resize", CnsiContent.handleResize);

		window.removeEventListener("click", CnsiContent.handleClick);
	},

	handleMessages: function (
		request: any,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: any) => void
	): void {
		/*console.log(sender.tab ?
					"from a content script:" + sender.tab.url :
					"from the background script");*/

		if (request.screenshot != null) {
			//console.log("Received screenshot " + request.screenshot);
			console.log("Received new screenshot");
			CnsiContent.screenshotUrl = request.screenshot;
			CnsiContent.tabId = request.tabId;
			console.log("tabId: " + CnsiContent.tabId);
			CnsiContent.setImage();
			sendResponse({ status: "success" });
		} else if (request.identifier != null) {
			console.log("Received identifier request " + request.identifier);
			if (request.identifier == "open") {
				CnsiContent.openIdentifier();
			} else if (request.identifier == "close") {
				//CnsiContent.shutdown(); will remove listeners and prevent the extension from re-opening again!
				CnsiContent.closeIdentifier();
			}
			sendResponse({ status: "success" });
		}
		//else {
		//console.log("Unexpected request");
		//sendResponse({status: "failure"});
		//}
	},

	handleMouseMove: function (event: MouseEvent) {
		// https://stackoverflow.com/questions/19376622/using-mouse-coordinates-as-pixel-values-for-javascript-functions
		const x = event.clientX; // + window.scrollX; //document.body.scrollLeft;
		const y = event.clientY; // + window.scrollY; //document.body.scrollTop;

		/*console.log("clientX: " + event.clientX + ", window.scrollX: " + window.scrollX + ", document.body.scrollLeft: " + document.body.scrollLeft);
		console.log("clientY: " + event.clientY + ", window.scrollY: " + window.scrollY + ", document.body.scrollTop: " + document.body.scrollTop);
		*/
		//console.log("x: " + x + ", y: " + y);
		//moveMain(x, y);

		if (document.getElementById(CnsiContent.id.main) != null) {
			CnsiContent.setImageCanvas(x, y);
			CnsiContent.setImageData();
		}
	},

	handleClick: async function (event: MouseEvent) {
		// Send message to background.js so it can send us new screenshot
		// https://developer.chrome.com/extensions/messaging

		chrome.runtime.onConnect.addListener(async (port) => {
			//const response = await port.sendMessage({ event: "clicked" });
			const response = await chrome?.runtime?.sendMessage({
				event: "clicked",
			});
			console.log("Sending click message: " + response.status);
		});
	},

	handleResize: async function (event: UIEvent) {
		// Send message to background.js so it can send us new screenshot
		// https://developer.chrome.com/extensions/messaging

		chrome.runtime.onConnect.addListener(async (port) => {
			//const response = await port.sendMessage({ event: "resized" });
			const response = await chrome?.runtime?.sendMessage({
				event: "resized",
			});
			console.log("Sending resize message: " + response.status);
		});
	},

	handleScroll: async function (event: Event) {
		// Send message to background.js so it can send us new screenshot
		// https://developer.chrome.com/extensions/messaging

		chrome.runtime.onConnect.addListener(async (port) => {
			//const response = await port.sendMessage({ event: "scrolled" });
			const response = await chrome?.runtime?.sendMessage({
				event: "scrolled",
			});
			console.log("Sending scroll message: " + response.status);
		});
	},

	// List of all element ids, keyed by type, for easy lookup.
	// Populated further in createIds().
	id: {} as StyleClassNames,

	// Dynamic image url to tab page screenshot
	screenshotUrl: "",

	// https://stackoverflow.com/questions/10994324/chrome-extension-content-script-re-injection-after-upgrade-or-install/11598753#11598753
	port: undefined as chrome.runtime.Port | undefined,

	// Attempt to reconnect
	reconnectToExtension: function () {
		if (CnsiContent.port != null) {
			console.log("Attempting to reconnect");

			// Reset port
			CnsiContent.port = undefined;

			// Attempt to reconnect after 1 second
			setTimeout(CnsiContent.connectToExtension, 1000 * 1);
		}
	},

	// Attempt to connect
	connectToExtension: function () {
		console.log("Attempting to connect");

		// Make the connection
		try {
			CnsiContent.port = chrome?.runtime?.connect({
				name: "cnsi-content-port",
			});
		} catch (error) {
			console.error(error);
		}
		if (CnsiContent.port != null) {
			console.log("Connected");
			//CnsiContent.getTabId();
			CnsiContent.addListeners();
			CnsiContent.createIds();

			// When extension is upgraded or disabled and renabled, the content scripts
			// will still be injected, so we have to reconnect them.
			// We listen for an onDisconnect event, and then wait for a second before
			// trying to connect again. Because chrome.runtime.connect fires an onDisconnect
			// event if it does not connect, an unsuccessful connection should trigger
			// another attempt, 1 second later.
			try {
				CnsiContent.port.onDisconnect.addListener(
					CnsiContent.reconnectToExtension
				);
			} catch (error) {
				console.error(error);
			}
		}
	},

	/*insertCSS: function() {
		// https://stackoverflow.com/questions/9721344/my-css-is-not-getting-injected-through-my-content-script
		var style = document.createElement("link");
		style.id = id.style;
		style.rel = "stylesheet";
		style.type = "text/css";
		style.href = chrome?.runtime?.getURL("CnsiContent.css");
		(document.head||document.documentElement).appendChild(style);
	}

	moveMain: function(x, y) {
		if (x != null && y != null) {
			//console.log("x: " + x + ", y: " + y);
			var main = document.getElementById(CnsiContent.id.main);
			main.style.top = y;
			main.style.left = x;
		}
	}


	*/

	getHTML: function () {
		return `<!-- BEGIN: Origin -->
			<section id="${CnsiContent.id.origin}" >
				<h5>Original Color</h5>
				<img/>
				<canvas></canvas>
				<div id="${CnsiContent.id.originHex}">
					<label>Hex Code</label><span></span>
				</div>
				<div id="${CnsiContent.id.originRgba}">
					<div id="${CnsiContent.id.originRgbaR}">
						<label>R</label><span></span>
					</div>
					<div id="${CnsiContent.id.originRgbaG}">
						<label>G</label><span></span>
					</div>
					<div id="${CnsiContent.id.originRgbaB}">
						<label>B</label><span></span>
					</div>
					<div id="${CnsiContent.id.originRgbaA}">
						<label>A</label><span></span>
					</div>
				</div>
				<!-- < div id = "${CnsiContent.id.originHcl}" >
					<div id="${CnsiContent.id.originHclH}">
						<label>H</label><span></span>
					</div>
					<div id="${CnsiContent.id.originHclC}">
						<label>C</label><span></span>
					</div>
					<div id="${CnsiContent.id.originHclL}">
						<label>L</label><span></span>
					</div>
				</div >
			<div id="${CnsiContent.id.originHsl}">
				<div id="${CnsiContent.id.originHslH}">
					<label>H</label><span></span>
				</div>
				<div id="${CnsiContent.id.originHslS}">
					<label>S</label><span></span>
				</div>
				<div id="${CnsiContent.id.originHslL}">
					<label>L</label><span></span>
				</div>
			</div> -->
				<div id="${CnsiContent.id.originHsv}">
					<div id="${CnsiContent.id.originHsvH}">
						<label>H</label><span></span>
					</div>
					<div id="${CnsiContent.id.originHsvS}">
						<label>S</label><span></span>
					</div>
					<div id="${CnsiContent.id.originHsvV}">
						<label>V</label><span></span>
					</div>
				</div>
			</section >
			<!-- END: Origin Section -->

			<!-- BEGIN: Name Section -->
			<section id="${CnsiContent.id.name}">
				<h5>Closest Name</h5>
				<canvas></canvas>
				<div id="${CnsiContent.id.nameHex}">
					<label>Hex Code</label><span></span>
				</div>
				<div id="${CnsiContent.id.nameExact}">
					<label>Exact Match</label><span></span>
				</div>
				<div id="${CnsiContent.id.nameNames}">
					<label>Name(s)</label><ul></ul>
					<small>* Not a digital color space.	<br/>Color name is an approximation.</small>
				</div>
			</section>
			<!-- END: Name Section -->

			<!-- BEGIN: Seasons Section -->
			<section id="${CnsiContent.id.seasons}">
				<h5>Closest Season Swatch</h5>
				<canvas></canvas>
				<div id="${CnsiContent.id.seasonsHex}">
					<label>Hex Code</label><span></span>
				</div>
				<div id="${CnsiContent.id.seasonsExact}">
					<label>Exact Match</label><span></span>
				</div>
				<div id="${CnsiContent.id.seasonsGood}">
					<label>Good for</label><ul></ul>
					<small>FN - Fashion Neutral<br/>CA - Complementary/Accent<br/>M - Metal</small>
				</div>
				<div id="${CnsiContent.id.seasonsBad}">
					<label>Bad for</label><ul></ul>
				</div>
			</section>
			<!-- END: Seasons Section -->`;
	},

	// Closes/removes our main content div from the current tab page.
	closeIdentifier: function () {
		const main = document.getElementById(CnsiContent.id.main);
		if (main != null) {
			main.remove();
		}
	},

	// Opens/adds our main content div to the current tab page.
	openIdentifier: function () {
		// Make sure it doesn't already exist.
		// We do not want duplicate divs!
		if (document.getElementById(CnsiContent.id.main) == null) {
			// create main wrapper element
			const main = document.createElement("div");
			main.id = CnsiContent.id.main;
			main.innerHTML = CnsiContent.getHTML();

			// append all elements to bottom of current document
			document.body.appendChild(main);
		}
	},

	// Populates name info in content div
	displayNameInfo: function (originHexCode: ColorValueHexWithHash) {
		const nameHexSpan = document
			?.getElementById(CnsiContent.id.nameHex)
			?.querySelector("span");
		const nameNamesList = document
			?.getElementById(CnsiContent.id.nameNames)
			?.querySelector("ul");
		const nameExactSpan = document
			?.getElementById(CnsiContent.id.nameExact)
			?.querySelector("span");

		if (nameHexSpan) nameHexSpan.innerHTML = "n/a";
		if (nameExactSpan) nameExactSpan.innerHTML = "n/a";
		if (nameNamesList) nameNamesList.innerHTML = "";

		const nameData = data.getColorData(
			originHexCode,
			"names"
		) as ColorDataTypeNames;

		if (nameData) {
			if (nameHexSpan && nameData.hex)
				nameHexSpan.innerHTML = nameData.hex;
			if (nameExactSpan && nameData.isExactMatch)
				nameExactSpan.innerHTML = nameData.isExactMatch.toString();

			if (nameNamesList && nameData.names) {
				nameData.names.forEach(function (data, i) {
					nameNamesList.innerHTML +=
						"<li>" +
						utils.getColorNameDisplay(
							data.name,
							data.source,
							data.number
						) +
						"</li>";
				});
			}
		}

		const nameSection = document.getElementById(CnsiContent.id.name);
		const canvas = nameSection?.querySelector("canvas");
		if (canvas && nameData.hex)
			utils.fillCanvasWithHex(canvas, nameData.hex);
	},

	// Populates season info in content div
	displaySeasonInfo: function (originHexCode: ColorValueHexWithHash) {
		const seasonsHexSpan = document
			?.getElementById(CnsiContent.id.seasonsHex)
			?.querySelector("span");
		const seasonsGoodList = document
			?.getElementById(CnsiContent.id.seasonsGood)
			?.querySelector("ul");
		const seasonsBadList = document
			?.getElementById(CnsiContent.id.seasonsBad)
			?.querySelector("ul");
		const seasonsExactSpan = document
			?.getElementById(CnsiContent.id.seasonsExact)
			?.querySelector("span");

		//make sure to clear texts since this gets constantly populated onmousemove
		if (seasonsHexSpan) seasonsHexSpan.innerHTML = "n/a";
		if (seasonsExactSpan) seasonsExactSpan.innerHTML = "n/a";
		if (seasonsGoodList) seasonsGoodList.innerHTML = "";
		if (seasonsBadList) seasonsBadList.innerHTML = "";

		const seasonData = data.getColorData(
			originHexCode,
			"seasons"
		) as ColorDataTypeSeasons;

		if (seasonData) {
			if (seasonsHexSpan && seasonData.hex)
				seasonsHexSpan.innerHTML = seasonData.hex;
			if (seasonsExactSpan && seasonData.isExactMatch)
				seasonsExactSpan.innerHTML = seasonData.isExactMatch.toString();

			const seasonsSection = document?.getElementById(
				CnsiContent.id.seasons
			);
			const canvas = seasonsSection?.querySelector("canvas");
			if (canvas && seasonData.hex)
				utils.fillCanvasWithHex(canvas, seasonData.hex);

			if (seasonsGoodList && seasonData.good) {
				seasonData.good.forEach(function (data, i) {
					seasonsGoodList.innerHTML +=
						"<li>" +
						utils.getColorSeasonDisplay(
							data.season,
							data.seasonType,
							data.colorType
						) +
						"</li>";
				});
			}

			if (seasonsBadList && seasonData.bad) {
				seasonData.bad.forEach(function (data, i) {
					seasonsBadList.innerHTML +=
						"<li>" +
						utils.getColorSeasonDisplay(
							data.season,
							data.seasonType
						) +
						"</li>";
				});
			}
		}
	},

	// used by both setImageData() and setImageCanvase()
	// we should be consistent in the context we use for both
	getCanvasContext: function (canvas: HTMLCanvasElement) {
		//https://stackoverflow.com/questions/43582546/what-is-colorspace-in-imagedata
		//https://github.com/WICG/canvas-color-space/blob/master/CanvasColorSpaceProposal.md
		const canvasContext = canvas.getContext("2d", {
			alpha: false,
			willReadFrequently: true,
		});
		//var canvasContext = canvas.getContext('2d', { colorSpace: "srgb", pixelFormat: "8-8-8-8", willReadFrequently: true }); //default
		//var canvasContext = canvas.getContext('2d', { colorSpace: "linear-srgb", pixelFormat: "float16", willReadFrequently: true });
		//var canvasContext = canvas.getContext('2d', { colorSpace: "legacy-srgb", willReadFrequently: true });
		//var canvasContext = canvas.getContext("webgl2");
		return canvasContext;
	},

	// Sets the screenshotUrl to an invisible image element
	setImage: function () {
		//const data = await chrome?.storage?.local?.get(["CNSIdata"]);
		//var screenshotInStorage = data.CNSIdata[CnsiContent.tabId].screenshot;
		//var screenshotUrl = CnsiContent.screenshotUrl || screenshotInStorage;
		const screenshotUrl = CnsiContent.screenshotUrl;
		//console.log("screenshotUrl: " + screenshotUrl);

		if (screenshotUrl != null) {
			const main = document?.getElementById(CnsiContent.id.main);
			const img = main?.querySelector("img");
			if (img) img.src = screenshotUrl;
		}
	},

	// Sets the canvas to the pixel in the screenshot image at the given (x,y) coordinates
	setImageCanvas: function (x: number, y: number) {
		//const data = await chrome?.storage?.local?.get(["CNSIdata"]);
		//var screenshotInStorage = data.CNSIdata[CnsiContent.tabId].screenshot;
		//var screenshotUrl = CnsiContent.screenshotUrl || screenshotInStorage;
		const screenshotUrl = CnsiContent.screenshotUrl;

		if (screenshotUrl != null && x != null && y != null) {
			const origin = document?.getElementById(CnsiContent.id.origin);

			const canvas = origin?.querySelector("canvas");
			const img = origin?.querySelector("img");

			if (!canvas || !img) {
				return;
			}

			const canvasLayoutWidth = canvas?.width;
			const canvasLayoutHeight = canvas?.height;
			//console.log("canvasWidth: " + canvasWidth + ", canvasHeight: " + canvasHeight);

			const coordsToImgRatioX = img.width / window.innerWidth; //document.body.clientWidth if full screenshot
			const coordsToImgRatioY = img.height / window.innerHeight; //document.body.clientHeight
			/*console.log("img.width: " + img.width + ", window.innerWidth: " + window.innerWidth + ", document.body.clientWidth: " + document.body.clientWidth);
			console.log("img.height: " + img.height + ", window.innerHeight: " + window.innerHeight + ", w	 .clientHeight: " + document.body.clientHeight);
			console.log("coordsToImgRatioX: " + coordsToImgRatioX + ", coordsToImgRatioY: " + coordsToImgRatioY);*/

			const canvasContext = CnsiContent.getCanvasContext(canvas);

			//var img = new Image;
			//canvasContext.clearRect(0, 0, canvasLayoutWidth, canvasLayoutHeight);
			//img.onload = function() {
			const imgCropWidth = 1; //canvasLayoutWidth
			const imgCropHeight = 1; //canvasLayoutWidth
			let imgOffsetX = x * coordsToImgRatioX - imgCropWidth / 2;
			let imgOffsetY = y * coordsToImgRatioY - imgCropHeight / 2;
			if (imgOffsetX < 0) imgOffsetX = 0;
			if (imgOffsetY < 0) imgOffsetY = 0;
			//console.log("imgOffsetX: " + imgOffsetX + ", imgOffsetY: " + imgOffsetY);

			// https://stackoverflow.com/questions/38181137/how-can-i-take-screenshot-of-some-specific-area-using-javascript-in-chrome-exten
			canvasContext?.drawImage(
				img,
				imgOffsetX,
				imgOffsetY,
				imgCropWidth,
				imgCropHeight,
				0,
				0,
				canvasLayoutWidth,
				canvasLayoutHeight
			);
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
			//console.log("screenshotUrl:"	+ screenshotUrl);
		}
	},

	// Sets/displays the hex and rgb color data for the pixel displayed in the canvas.
	// Modified from
	// https://stackoverflow.com/questions/58668131/how-to-get-the-rgb-data-from-an-area-of-image-with-javascript
	setImageData: function () {
		const origin = document?.getElementById(CnsiContent.id["origin"]);

		const canvas = origin?.querySelector("canvas"); //https://github.com/WICG/canvas-color-space/blob/master/CanvasColorSpaceProposal.md

		if (!canvas) {
			return;
		}

		const canvasLayoutWidth = canvas?.width;
		const canvasLayoutHeight = canvas?.height;

		const canvasContext = CnsiContent.getCanvasContext(canvas);

		// Get RGB from canvas image data
		//
		// FIXME:	The RGB values from canvas getImageData isn't exactly accurate :-(
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
		const data = canvasContext?.getImageData(
			Math.floor(canvasLayoutWidth / 2),
			Math.floor(canvasLayoutHeight / 2),
			1,
			1
		).data;
		/*var data = new Uint8Array(canvasLayoutWidth * canvasLayoutHeight * 4);
		canvasContext.readPixels(canvasLayoutWidth/2, canvasLayoutHeight/2, 1, 1, canvasContext.RGBA, canvasContext.UNSIGNED_BYTE, data);*/

		if (!data) {
			return;
		}

		const average = { r: 0, g: 0, b: 0, a: 0 }; // Creates an object to count all the values up
		const pixels = data.length / 4; // The actual amount of pixels read
		//console.log("Canvas image has " + pixels + " pixels");

		// Loop through pixel data to sum up all the r, g, b, and a values.
		// The data is a flat array of values for [r,g,b,a] sequently from top left to bottom right.
		// So every four entries forms one pixel.
		const rgbaKeys: RgbType[] = ["r", "g", "b", "a"];
		for (let i = 0; i < data.length; i += 4) {
			// Add all the averages to their corresponding counters.
			rgbaKeys.forEach(function (component, componentIndex) {
				average[component] += data[i + componentIndex];
				//console.log("Adding " + data[i + componentIndex] + " to " + component + " values");
			});
		}

		// Get the average r, g, b, and a values by dividing the total sum values by
		// the number of pixels read.
		// Round up, as RGB is Integers only, and divide by 255 as the alpha value is a Float between 0 and 1.
		rgbaKeys.forEach((component, componentIndex) => {
			average[component] = Math.ceil(average[component] / pixels);
			//console.log("Final " + component + " value is " + average[component]);
			if (component == "a") {
				average[component] / 255;
			}

			//Display the RGBA values
			const span = document
				?.getElementById(
					CnsiContent.id[
						("originRgba" +
							component.toUpperCase()) as StyleClassNameKey
					]
				)
				?.querySelector("span");
			if (span) span.innerHTML = average[component].toString();
		});

		//https://github.com/vinaypillai/ac-colors#color
		//var acColor = new Color({"color":[average.r, average.g, average.b]});
		//console.log("acColor.hex: " + acColor.hex + ", acColor.hsl: " + acColor.hsl + ", acColor.xyz: " + acColor.xyz);

		// Display hex code
		const hexCode = utils.RGBAtoHex(average.r, average.g, average.b);
		const hexSpan = document
			?.getElementById(CnsiContent.id.originHex)
			?.querySelector("span");
		if (hexSpan) hexSpan.innerHTML = hexCode.toUpperCase();

		//Display the HCL
		//const hclKeys = [ "h", "c", "l"];
		/*var hcl = utils.RGBtoHCL(average.r, average.g, average.b);
		hclKeys.forEach(function(component, componentIndex) {
			var componentValue = hcl[component];

			var span = document.getElementById(CnsiContent.id["originHcl"+component.toUpperCase()]).querySelector("span");
			span.innerHTML = componentValue;
		});*/

		//Display the HSL
		//const hslKeys = [ "h", "s", "l"];
		//var hsl = utils.hexToHSL(hexCode);
		/*var otherHsl = ntc.hsl(hexCode);
		console.log("ntc HSL is h " + otherHsl[0] + " s " + otherHsl[1] + " l " + otherHsl[2]);*/
		/*hslKeys.forEach(function(component, componentIndex) {
			var componentValue = hsl[component];

			var span = document.getElementById(CnsiContent.id["originHsl"+component.toUpperCase()]).querySelector("span");
			if (component == "h") {
				span.innerHTML = componentValue;
			} else {
				span.innerHTML = componentValue + "%";
			}
		});*/

		//Display the HSV
		const hsvKeys: HsvType[] = ["h", "s", "v"];
		const hsv = utils.RGBtoHSV(average.r, average.g, average.b);
		hsvKeys.forEach((component, componentIndex) => {
			const componentValue = hsv[component];

			const span = document
				?.getElementById(
					CnsiContent.id[
						("originHsv" +
							component.toUpperCase()) as StyleClassNameKey
					]
				)
				?.querySelector("span");
			if (span) {
				if (component == "h") {
					span.innerHTML = componentValue + "°";
				} else {
					span.innerHTML = componentValue + "%";
				}
				span.innerHTML += utils.getHSVdescription(
					component,
					componentValue
				);
			}
		});

		if (hexSpan) {
			// Use origin hex code to look for possible name name
			CnsiContent.displayNameInfo(
				hexSpan.innerHTML as ColorValueHexWithHash
			);

			//Use origin hex code to look for possible wardrobe seasons
			CnsiContent.displaySeasonInfo(
				hexSpan.innerHTML as ColorValueHexWithHash
			);
		}
	},
};

CnsiContent.init();
export default CnsiContent;
