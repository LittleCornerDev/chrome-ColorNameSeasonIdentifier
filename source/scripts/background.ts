/******************************************************************************
 * File: 	background.ts
 * Summary:	Background script for this Chrome Extension
 * Author: 	Little Corner Dev (https://github.com/LittleCornerDev)
 *
 * Copyright (c) 2020, Little Corner Dev. All rights reserved.
 * Use of this source code is governed by the license that can be
 * found in the LICENSE file.
 */

import {
  IdentifierState,
  StorageData,
  StorageDataKey,
  StorageDataValue,
  TabId,
} from "./types";

//const CNSI: any = globalThis.CNSI || {};
//CNSI.bg = {
//export default {
const CnsiBg = {
  data: {} as Record<TabId, StorageData>,

  init: function () {
    console.log("Initializing background");

    chrome.runtime.onConnect.addListener((port) => {
      CnsiBg.listenToTabChanges();
    });
  },

  listenToTabChanges: function () {
    console.log("Listening to all tab changes");

    //chrome?.tabs?.onActivated?.addListener(CnsiBg.handleTabActivate);
    chrome?.tabs?.onCreated?.addListener(CnsiBg.handleTabCreate);
    chrome?.tabs?.onRemoved?.addListener(CnsiBg.handleTabRemove);
    chrome?.tabs?.onUpdated?.addListener(CnsiBg.handleTabUpdate);

    chrome?.action?.onClicked?.addListener(CnsiBg.handleIconClick);
  },

  unlistenToTabChanges: function () {
    console.log("Unlistening to all tab changes");

    //chrome?.tabs?.onActivated?.removeListener(CnsiBg.handleTabActivate);
    chrome?.tabs?.onCreated?.removeListener(CnsiBg.handleTabCreate);
    chrome?.tabs?.onRemoved?.removeListener(CnsiBg.handleTabRemove);
    chrome?.tabs?.onUpdated?.removeListener(CnsiBg.handleTabUpdate);

    chrome?.action?.onClicked?.removeListener(CnsiBg.handleIconClick);
  },

  // handle switch to already open tab
  handleTabActivate: async function (activeInfo: chrome.tabs.TabActiveInfo) {
    const tabId = activeInfo.tabId;

    //const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    //const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    //const tabs = await chrome.tabs.query({ active: true });
    //const url = tabs[ 0 ].url;
    //console.log(`Tab info: ${JSON.stringify(tabs[ 0 ])}`);

    //if (CnsiBg.data[ tabId ] == null && !url?.startsWith("chrome://")) {
    if (CnsiBg.data[tabId] == null) {
      //console.log(`Tab ${tabId} activated: ${url}`);
      console.log(`Tab ${tabId} activated`);

      console.log("Initializing vars due to tab activated");
      CnsiBg.initStorageVars(tabId);
    }
  },

  // handle new tabs
  handleTabCreate: function (tab: chrome.tabs.Tab) {
    if (
      tab &&
      tab.id &&
      tab.url &&
      !tab.url.startsWith("chrome://") &&
      tab.active &&
      tab.status == "complete"

      //&& typeof CNSI === undefined
      //changeInfo.status == 'complete' && tab.status == 'complete' //https://stackoverflow.com/questions/27708352/chrome-tabs-onupdated-addlistener-called-multiple-times
    ) {
      console.log(`Tab ${tab.id} created: ${tab.url}`);
      console.log("Initializing vars due to tab created");
      /*const tabs = await chrome?.tabs?.query({ active: true, currentWindow: true });
			const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
			CnsiBg.initStorageVars(tabs[0]);
			*/

      CnsiBg.initStorageVars(tab.id);
    }
  },

  // handle tab deletes
  handleTabRemove: function (
    tabId: TabId,
    removeInfo: chrome.tabs.TabRemoveInfo,
  ) {
    if (CnsiBg.data[tabId] != null) {
      console.log(`Tab ${tabId} removed: ${removeInfo}`);
      console.log("Deleting data for closed tab " + tabId);
      delete CnsiBg.data[tabId];
    }
  },

  // handle tab reloads and url changes
  handleTabUpdate: function (
    tabId: TabId,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab,
  ) {
    if (
      tab &&
      tab.id &&
      tab.url &&
      !tab.url.startsWith("chrome://") &&
      tab.active &&
      tab.status == "complete" &&
      changeInfo.status == "complete"
      //&& typeof CNSI === undefined
      //changeInfo.status == 'complete' && tab.status == 'complete' //https://stackoverflow.com/questions/27708352/chrome-tabs-onupdated-addlistener-called-multiple-times
    ) {
      console.log(`Tab ${tab.id} updated: ${tab.url}`);

      /*const tabs = await chrome?.tabs?.query({ active: true, currentWindow: true });
			const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
			CnsiBg.initStorageVars(tabs[0]);
			CnsiBg.handleIconClick();
			*/

      console.log("Initializing vars due to tab updated");
      CnsiBg.initStorageVars(tab.id);
    }
  },

  initStorageVars: async function (tabId: TabId): Promise<StorageData> {
    // Set critical vars in storage in case of crashes
    // https://developer.chrome.com/extensions/storage

    //var port = chrome?.tabs?.connect(tabId, {name: ""})
    // var port = chrome?.tabs?.connect(tabId, { name: "CNSIport" + tabId });
    const port = chrome?.tabs?.connect(tabId);
    console.log(
      "Connected port is " + JSON.stringify(port) + " for tab " + tabId,
    );

    CnsiBg.data[tabId] = {
      identifier: "closed",
      port: port,
      screenshot: "",
    };

    await chrome?.storage?.local?.set({
      [tabId]: CnsiBg.data[tabId],
    });
    console.log("CNSI data initialized for tab " + tabId);
    return CnsiBg.data[tabId];
  },

  getStorageVar: async function (
    tab: chrome.tabs.Tab,
    key: StorageDataKey,
  ): Promise<StorageDataValue> {
    if (!tab.id) {
      return "";
    }

    let data;
    if (
      !CnsiBg.data ||
      Object.keys(CnsiBg.data).length == 0 ||
      !CnsiBg.data[tab.id]
    ) {
      data = await CnsiBg.initStorageVars(tab.id);
    } else {
      const allData = await chrome?.storage?.local?.get(null);
      //console.log('all stored data' + JSON.stringify(allData));
      //const sata = await chrome?.storage?.local?.get(tab.id); gets error
      data = allData[tab.id];
    }

    // ensure local memory is up to date
    CnsiBg.data[tab.id] = data;
    //console.log('CNSI data is ' + JSON.stringify(CnsiBg.data[ tab.id ]) + ' for tab ' + tab.id);

    return CnsiBg.data[tab.id][key];
  },

  setStorageVar: async function (
    tab: chrome.tabs.Tab,
    key: StorageDataKey,
    value: StorageDataValue,
  ): Promise<void> {
    if (!tab.id) {
      return;
    }

    if (
      !CnsiBg.data ||
      Object.keys(CnsiBg.data).length == 0 ||
      !CnsiBg.data[tab.id]
    ) {
      await CnsiBg.initStorageVars(tab.id);
    }

    // update the value we need to
    if (key == "port") {
      CnsiBg.data[tab.id][key] = value as chrome.runtime.Port;
    } else if (key == "identifier") {
      CnsiBg.data[tab.id][key] = value as IdentifierState;
    } else {
      CnsiBg.data[tab.id][key] = value as string;
    }

    //console.log('CNSI data is now ' + JSON.stringify(CnsiBg.data[ tab.id ]) + ' for tab ' + tab.id);

    await chrome?.storage?.local?.set({ [tab.id]: CnsiBg.data[tab.id] });
  },

  loadStyles: async function (tabId: TabId) {
    console.log("Loading styles for tab " + tabId);

    await chrome?.scripting?.insertCSS({
      files: ["styles/content.css"],
      target: { tabId: tabId },
    });

    const error = CnsiBg.checkForError();
    if (error == null) {
      console.log("Main content css load succeeded");
    } else {
      console.log("Main content css load failed");
    }
  },

  unloadStyles: async function (tabId: TabId) {
    console.log("Unloading styles for tab " + tabId);

    await chrome?.scripting?.removeCSS({
      files: ["styles/content.cs"],
      target: { tabId: tabId },
    });

    const error = CnsiBg.checkForError();
    if (error == null) {
      console.log("Main content css unload succeeded");
    } else {
      console.log("Main content css unload failed");
    }
  },
  /*
	loadScripts: async function (tabId: TabId) {
		console.log("Loading scripts for tab " + tabId);

		const result1 = await chrome?.scripting?.executeScript({
			target: { tabId: tabId },
			files: [ "scripts/utilities.js" ],
		});

		const error = CnsiBg.checkForError();
		if (error == null && result1 != null) {
			console.log("Utility script load succeeded: " + result1);

			const result2 = await chrome?.scripting?.executeScript({
				target: { tabId: tabId },
				files: [ "scripts/data.js" ],
			});

			const error = CnsiBg.checkForError();
			if (error == null && result2 != null) {
				console.log("Data script load succeeded: " + result2);

				const result3 = await chrome?.scripting?.executeScript({
					target: { tabId: tabId },
					files: [ "scripts/content.js" ],
				});

				const error = CnsiBg.checkForError();
				if (error == null && result3 != null) {
					console.log("Main content script load succeeded: " + result3);
				} else {
					console.log("Main content script load failed");
				}
			} else {
				console.log("Seasons script load failed");
			}
		} else {
			console.log("Utility script load failed");
		}
	},

	unloadScripts: function(tabId:TabId) {
		console.log("Unloading scripts?? for tab " + tabId);
	},

	loadContentStylesAndScripts: async function (tabId: TabId) {
		console.log("Load styles and scripts");
		await CnsiBg.loadStyles(tabId);
		//await CnsiBg.loadScripts(tabId);
	},

	unloadContentStylesAndScripts: async function (tabId: TabId) {
		console.log("Unload styles and scripts");
		//await CnsiBg.unloadScripts(tabId);
		await CnsiBg.unloadStyles(tabId);
	},
*/
  handleIconClick: async function (tab: chrome.tabs.Tab) {
    if (tab && tab.id && tab.active && tab.status == "complete") {
      console.log("Extension icon clicked for tab " + tab.id);

      // get tab's identifier state from storage
      const identifier = await CnsiBg.getStorageVar(tab, "identifier");
      console.log("Identifier is currently " + identifier);

      // get tab's port from storage
      const port = (await CnsiBg.getStorageVar(
        tab,
        "port",
      )) as chrome.runtime.Port;
      console.log(
        "Stored port is " + JSON.stringify(port) + " for tab " + tab.id,
      );

      if (identifier == null || identifier == "closed") {
        try {
          //await CnsiBg.loadContentStylesAndScripts(tab.id);
          CnsiBg.openIdentifier(tab, port);
        } catch (err) {
          CnsiBg.onError(err);
        }
      } else if (identifier == "opened") {
        CnsiBg.closeIdentifier(tab, port);
        //CnsiBg.unloadContentStylesAndScripts(tab.id);
        //CnsiBg.initStorageVars(tab.id);
      }
    }
  },

  //https://stackoverflow.com/questions/14517184/exception-handling-in-chrome-extensions
  checkForError: function () {
    let errorMsg = null;

    if (chrome?.runtime?.lastError) {
      errorMsg = chrome?.runtime?.lastError.message;
      console.error(errorMsg);
    }

    return errorMsg;
  },
  onError: function (error: unknown) {
    console.error(`ERROR: ${error}`);
  },

  listenToMessages: function (tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
    console.log("Listening to messages for tab " + tab.id);

    // Wrap runtime listeners with onConnect
    // https://stackoverflow.com/questions/54181734/chrome-extension-message-passing-unchecked-runtime-lasterror-could-not-establi/54686484#54686484
    chrome?.runtime?.onConnect.addListener((port) => {
      console.log(
        "Listening to port: " + JSON.stringify(port) + " for tab " + tab.id,
      );

      // listen for `scrolled` message
      // https://developer.chrome.com/extensions/messaging
      chrome?.runtime?.onMessage.addListener(
        //port.onMessage.addListener(
        CnsiBg.handleMessage,
      );
    });
  },

  unlistenToMessages: function (
    tab: chrome.tabs.Tab,
    port: chrome.runtime.Port,
  ) {
    console.log("Unlistening to messages for tab " + tab.id);
    chrome?.runtime?.onConnect.addListener((port) => {
      //port.onMessage.removeListener(
      chrome?.runtime?.onMessage?.removeListener(CnsiBg.handleMessage);
    });
  },

  handleMessage: function (
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): void {
    if (!sender.tab) {
      return;
    }

    /*console.log(sender.tab ?
			"from a content script:" + sender.tab.url :
			"from the background script");*/
    if (request.event == "getTabId") {
      sendResponse({ status: "success", tabId: sender?.tab?.id });
    } else if (
      request.event == "scrolled" ||
      request.event == "resized" ||
      request.event == "clicked"
    ) {
      CnsiBg.takeScreenshot(sender?.tab);
      sendResponse({ status: "success" });
    } else {
      sendResponse({ status: "failure" });
    }
  },

  takeScreenshot: async function (
    tab: chrome.tabs.Tab,
    port?: chrome.runtime.Port,
  ): Promise<void> {
    if (!tab.id) {
      return;
    }

    console.log("Taking screenshot for tab " + tab.id);

    const screenshotUrl = await chrome?.tabs?.captureVisibleTab();

    // save screenshot in storage
    CnsiBg.setStorageVar(tab, "screenshot", screenshotUrl);

    // send screenshot to content script
    // https://developer.chrome.com/extensions/messaging
    //const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    //const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

    //const response = await port.postMessage(
    const response = await chrome?.tabs?.sendMessage(
      //tabs[0].id,
      tab.id,
      { screenshot: screenshotUrl, tabId: tab.id },
    );

    console.log(
      "Sending screenshot for tab " + tab.id + ": " + response.status,
    );
  },

  openIdentifier: async function (
    tab: chrome.tabs.Tab,
    port: chrome.runtime.Port,
  ): Promise<void> {
    if (!tab.id) {
      return;
    }

    console.log("Attempting to open identifier for tab " + tab.id);

    // open analyzer via content.js
    // https://developer.chrome.com/extensions/messaging
    //const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    //const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

    //const response = await port.postMessage(
    const response = await chrome?.tabs?.sendMessage(
      //tabs[0].id,
      tab.id,
      { identifier: "open" },
    );
    if (response?.status == "success") {
      console.log("Open request succeeded!");
      CnsiBg.setStorageVar(tab, "identifier", "opened");
      CnsiBg.takeScreenshot(tab, port);
      CnsiBg.listenToMessages(tab, port);
    } else {
      console.log("Open request failed!");
    }
  },

  closeIdentifier: async function (
    tab: chrome.tabs.Tab,
    port: chrome.runtime.Port,
  ) {
    if (!tab.id) {
      return;
    }

    console.log("Attempting to close identifier for tab " + tab.id);

    // close analyzer via content.js
    // https://developer.chrome.com/extensions/messaging
    //const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    //const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

    //const response = await port.postMessage(
    const response = await chrome?.tabs?.sendMessage(
      //tabs[0].id,
      tab.id,
      { identifier: "close" },
    );

    if (response?.status && response?.status == "success") {
      console.log("Close request succeeded!");
      CnsiBg.setStorageVar(tab, "identifier", "closed");
      //CnsiBg.disconnect(tab: chrome.tabs.Tab, port: chrome.runtime.Port);
      CnsiBg.unlistenToMessages(tab, port);
    } else {
      console.log("Close request failed!");
    }
  },

  /*disconnect: function (tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
		console.log("Attempting to disconnect vars and listeners for tab " + tab.id);

		//CnsiBg.initStorageVars(tab);

		// remove message listener
		CnsiBg.unlistenToMessages(tab: chrome.tabs.Tab, port: chrome.runtime.Port);

		// unload vars / scripts/ style
		//CnsiBg.unloadContentStylesAndScripts(tab.id);
	}*/
};

CnsiBg.init();
export default CnsiBg;
