/******************************************************************************
 * File: 	background.json
 * Summary: Background script for this Chrome Extension
 * Author: 	Little Corner Dev (https://github.com/LittleCornerDev)
 *
 * Copyright (c) 2020, Little Corner Dev. All rights reserved.
 * Use of this source code is governed by the license that can be
 * found in the LICENSE file.
 */


var CNSI = {
	bg: {
		data: {},

		listenToTabChanges: function () {
			console.log("Listening to all tab changes");

			chrome.tabs.onActivated.addListener(CNSI.bg.handleTabActivate);
			chrome.tabs.onCreated.addListener(CNSI.bg.handleTabCreate);
			chrome.tabs.onRemoved.addListener(CNSI.bg.handleTabRemove);
			chrome.tabs.onUpdated.addListener(CNSI.bg.handleTabUpdate);

			chrome.browserAction.onClicked.addListener(CNSI.bg.handleIconClick);
		},

		unlistenToTabChanges: function () {
			console.log("Unlistening to all tab changes");

			chrome.tabs.onActivated.removeListener(CNSI.bg.handleTabActivate);
			chrome.tabs.onCreated.removeListener(CNSI.bg.handleTabCreate);
			chrome.tabs.onRemoved.removeListener(CNSI.bg.handleTabRemove);
			chrome.tabs.onUpdated.removeListener(CNSI.bg.handleTabUpdate);

			chrome.browserAction.onClicked.removeListener(CNSI.bg.handleIconClick);
		},

		// handle switch to already open tab
		handleTabActivate: function (activeInfo) {
			var tabId = activeInfo.tabId;
			if (CNSI.bg.data[ tabId ] == null) {
				CNSI.bg.initStorageVars(tabId);
			}
		},

		// handle new tabs
		handleTabCreate: function (tab) {
			if (
				tab != null && tab.url != null && !tab.url.startsWith("chrome://")
				&& tab.active && tab.status == "complete"
				//&& typeof CNSI === undefined
				//changeInfo.status == 'complete' && tab.status == 'complete' //https://stackoverflow.com/questions/27708352/chrome-tabs-onupdated-addlistener-called-multiple-times
			) {
				/*chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					CNSI.bg.initStorageVars(tabs[0]);
				});*/

				CNSI.bg.initStorageVars(tab.id);
			}
		},

		// handle tab deletes
		handleTabRemove: function (tabId, removeInfo) {
			if (CNSI.bg.data[ tabId ] != null) {
				console.log("Deleting data for closed tab " + tabId);
				delete CNSI.bg.data[ tabId ];
			}
		},

		// handle tab reloads and url changes
		handleTabUpdate: function (tabId, changeInfo, tab) {
			if (
				tab != null && tab.url != null && !tab.url.startsWith("chrome://")
				&& tab.active && tab.status == "complete" && changeInfo.status == "complete"
				//&& typeof CNSI === undefined
				//changeInfo.status == 'complete' && tab.status == 'complete' //https://stackoverflow.com/questions/27708352/chrome-tabs-onupdated-addlistener-called-multiple-times
			) {
				/*chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					CNSI.bg.initStorageVars(tabs[0]);
					CNSI.bg.handleIconClick();
				});*/

				console.log("Tab content changed. Re-initializing vars for " + tabId);
				CNSI.bg.initStorageVars(tab.id);
			}
		},

		initStorageVars: function (tabId) {
			// Set critical vars in storage in case of crashes
			// https://developer.chrome.com/extensions/storage

			//var port = chrome.tabs.connect(tab.id, {name: ""})
			var port = null; //chrome.tabs.connect(tab.id, {name: "CNSIport"+tab.id});

			CNSI.bg.data[ tabId ] = {
				identifier: "closed",
				port: port,
				screenshot: null
			};

			chrome.storage.local.set({ CNSIdata: CNSI.bg.data }, function () {
				console.log("CNSI data initialized/cleared for tab " + tabId);
			});
		},

		setStorageVar: function (tab, key, value) {
			// Since our var data is nested, we need to get all current values
			// so we can preserve curent value for other fields
			chrome.storage.local.get([ "CNSIdata" ], function (data) {
				CNSI.bg.data = data.CNSIdata;

				// update the value we need to
				CNSI.bg.data[ tab.id ][ key ] = value;

				chrome.storage.local.set({ CNSIdata: CNSI.bg.data }, function () {
					console.log("CNSI data " + key + " updated for tab " + tab.id);
				});
			});
		},


		loadStyles: function (tabId) {
			console.log("Loading styles for tab " + tabId);

			//return new Promise((resolve, reject) => {
			//	try {
			chrome.tabs.insertCSS(
				tabId,
				{ file: "styles/content.css" },
				//{file: chrome.runtime.getURL("styles/content.css")},
				function () {
					var error = CNSI.bg.checkForError();
					if (error == null) {
						console.log("main content css load succeeded");
					} else {
						console.log("main content css load failed");
					}
				}
			);
			/*}
			catch(err) {
				reject(err.message);
			}
		});*/

		},

		/*unloadStyles: function(tabId) {
			//console.log("Unloading styles for tab " + tabId);

			return new Promise((resolve, reject) => {
				try {
					`chrome.tabs.removeCSS` DOES NOT EXIST
					chrome.tabs.removeCSS(
						tabId,
						{file: "styles/content.css"},
						function () {
							var error = CNSI.bg.checkForError();
							if (error == null) {
								console.log("main content css unload succeeded");
							} else {
								console.log("main content css unload failed");
							}
						}
					);
				}
				catch(err) {
					reject(err.message);
				}
			});

		},*/

		loadScripts: function (tabId) {
			console.log("Loading scripts for tab " + tabId);
			return new Promise((resolve, reject) => {
				//try {
				// Load content scripts
				// https://stackoverflow.com/questions/24600495/chrome-tabs-executescript-cannot-access-a-chrome-url
				// https://stackoverflow.com/questions/19103183/how-to-insert-html-with-a-chrome-extension
				chrome.tabs.executeScript(
					tabId,
					{ file: "scripts/utilities.js" },
					//{file: chrome.runtime.getURL("scripts/utilities.js")},
					function (results) {
						let error = CNSI.bg.checkForError();
						if (error == null && results != null) {
							console.log("Utility script load succeeded: " + results);

							chrome.tabs.executeScript(
								tabId,
								{ file: "scripts/data.js" },
								//{file: chrome.runtime.getURL("scripts/data.js")},
								function (results) {
									let error = CNSI.bg.checkForError();
									if (error == null && results != null) {
										console.log("Data script load succeeded: " + results);

										chrome.tabs.executeScript(
											tabId,
											{ file: "scripts/content.js" },
											//{file: chrome.runtime.getURL("scripts/content.js")},
											function (results) {
												let error = CNSI.bg.checkForError();
												if (error == null && results != null) {
													console.log("Main content script load succeeded: " + results);
													resolve();
												} else {
													console.log("Main content script load failed");
													reject(error);
												}
											}
										);

									} else {
										console.log("Seasons script load failed");
										reject(error);
									}

								}
							);

						} else {
							console.log("Utility script load failed");
							reject(error);
						}
					}
				);

				/*}
				catch(err) {
					reject(err.message);
				}*/
			});
		},

		/*unloadScripts: function(tabId) {
			console.log("Unloading scripts?? for tab " + tabId);
		},*/

		loadContentStylesAndScripts: function (tabId) {
			// https://www.freecodecamp.org/news/how-to-write-a-javascript-promise-4ed8d44292b8/
			return new Promise((resolve, reject) => {
				//try {
				CNSI.bg.loadStyles(tabId);

				var loadJS = CNSI.bg.loadScripts(tabId);
				loadJS.then(result => resolve(result));
				loadJS.catch(error => reject(error));
				/*}
				catch(err) {
					reject(err.message);
				}*/
			});
		},

		/*unloadContentStylesAndScripts: function(tabId) {
			return new Promise((resolve, reject) => {
				try {
					CNSI.bg.unloadScripts(tabId);
					CNSI.bg.unloadStyles(tabId).then(result => {
						resolve();
					});
				}
				catch(err) {
					reject(err.message);
				}
			});
		},*/

		handleIconClick: function (tab) {
			if (tab != null && tab.active && tab.status == "complete") {
				console.log("Extension icon clicked for tab " + tab.id);

				// get indentifier state from storage
				chrome.storage.local.get([ "CNSIdata" ], function (data) {
					var identifier = (data.CNSIdata[ tab.id ] != null) ? data.CNSIdata[ tab.id ].identifier : "closed";
					var port = (data.CNSIdata[ tab.id ] != null) ? data.CNSIdata[ tab.id ].port : null;
					console.log("Identifier is currently " + identifier);
					console.log("Port is " + port);

					if (identifier == null || identifier == "closed") {
						var loadContent = CNSI.bg.loadContentStylesAndScripts(tab.id);
						loadContent.then((results) => {
							CNSI.bg.openIdentifier(tab, port);
						});
						loadContent.catch(CNSI.bg.onError);

					} else if (identifier == "opened") {
						CNSI.bg.closeIdentifier(tab, port);
						//CNSI.bg.unloadContentStylesAndScripts(tab.id);
						CNSI.bg.initStorageVars(tab.id);
					}

				});
			}
		},

		//https://stackoverflow.com/questions/14517184/exception-handling-in-chrome-extensions
		checkForError: function () {
			var errorMsg = null;

			if (chrome.runtime && chrome.runtime.lastError) {
				errorMsg = chrome.runtime.lastError.message;
				console.log(errorMsg);
			}

			return errorMsg;
		},
		onError: function (error) {
			console.log(`ERROR: ${error}`);
		},


		addListeners: function (tab, port) {
			CNSI.bg.listenToMessages(tab, port);
		},

		removeListeners: function (tab, port) {
			CNSI.bg.unlistenToMessages(tab, port);
		},

		listenToMessages: function (tab, port) {
			console.log("Listening to messages for tab " + tab.id);

			// Wrap runtime listeners with onConnect
			// https://stackoverflow.com/questions/54181734/chrome-extension-message-passing-unchecked-runtime-lasterror-could-not-establi/54686484#54686484
			//chrome.runtime.onConnect.addListener(port => {
			//console.log("connected to port: " + port);

			// listen for `scrolled` message
			// https://developer.chrome.com/extensions/messaging
			chrome.runtime.onMessage.addListener(
				//port.onMessage.addListener(
				CNSI.bg.handleMessage
			);
			//});
		},

		unlistenToMessages: function (tab, port) {
			console.log("Unlistening to messages for tab " + tab.id);

			chrome.runtime.onMessage.removeListener(
				//port.onMessage.removeListener(
				CNSI.bg.handleMessage
			);
		},

		handleMessage: function (request, sender, sendResponse) {
			/*console.log(sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the background script");*/
			if (request.getTabId) {
				sendResponse({ status: "success", tabId: sender.tab.id });
			}
			else if (request.scrolled || request.resized || request.clicked) {
				CNSI.bg.takeScreenshot(sender.tab);
				sendResponse({ status: "success" });
			} else {
				sendResponse({ status: "failure" });
			}

		},

		takeScreenshot: function (tab, port) {
			console.log("Taking screenshot for tab " + tab.id);

			/*chrome.storage.local.get(["CNSIdata"], function(data) {
				var port = data.CNSIdata[tab.id].port;*/

			chrome.tabs.captureVisibleTab(function (screenshotUrl) {

				// save screenshot in storage
				CNSI.bg.setStorageVar(tab, "screenshot", screenshotUrl);

				// send screenshot to content script
				// https://developer.chrome.com/extensions/messaging
				//chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(
					//port.postMessage(
					//tabs[0].id,
					tab.id,
					{ screenshot: screenshotUrl, tabId: tab.id },
					function (response) {
						console.log("Sending screenshot for tab " + tab.id + ": " + response.status);
					}
				);
				//});

			});

			//});
		},

		openIdentifier: function (tab, port) {
			console.log("Attempting to open identifier for tab " + tab.id);

			// open analyzer via content.js
			// https://developer.chrome.com/extensions/messaging
			//chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			//port.postMessage(
			chrome.tabs.sendMessage(
				//tabs[0].id,
				tab.id,
				{ identifier: "open" },
				function (response) {
					if (response != null && response.status == "success") {
						console.log("Open request succeeded!");
						CNSI.bg.setStorageVar(tab, "identifier", "opened");
						CNSI.bg.takeScreenshot(tab, port);
						CNSI.bg.addListeners(tab, port);
					} else {
						console.log("Open request failed!");
					}
				}
			);
			//});
		},

		closeIdentifier: function (tab, port) {
			console.log("Attempting to close identifier for tab " + tab.id);

			// close analyzer via content.js
			// https://developer.chrome.com/extensions/messaging
			//chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			//port.postMessage(
			chrome.tabs.sendMessage(
				//tabs[0].id,
				tab.id,
				{ identifier: "close" },
				function (response) {
					if (response != null && response.status == "success") {
						console.log("Close request succeeded!");
						//CNSI.bg.disconnect(tab, port);
						CNSI.bg.initStorageVars(tab);
						CNSI.bg.removeListeners(tab, port);
					} else {
						console.log("Close request failed!");
					}
				}
			);
			//});
		},


		/*disconnect: function(tab, port) {

			console.log("Attempting to disconnect vars and listeners for tab " + tab.id)

			CNSI.bg.initStorageVars(tab);

			// remove listeners
			CNSI.bg.removeListeners(tab, port);

			// unload vars / scripts/ style
			//CNSI.bg.unloadContentStylesAndScripts(tabId)
		}*/


	}
};


CNSI.bg.listenToTabChanges();
