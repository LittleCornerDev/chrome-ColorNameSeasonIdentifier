/******************************************************************************
 * File: 	background.json
 * Summary: Background script for this Chrome Extension
 * Author: 	Little Corner Dev (https://github.com/LittleCornerDev)
 *
 * Copyright (c) 2020, Little Corner Dev. All rights reserved.
 * Use of this source code is governed by the license that can be
 * found in the LICENSE file.
 */

var CNSI = globalThis.CNSI || {};

CNSI.bg = {
  data: {},

  init: function () {
    console.log("Initializing background");

    chrome.runtime.onConnect.addListener((port) => {
      CNSI.bg.listenToTabChanges();
    });
  },

  listenToTabChanges: function () {
    console.log("Listening to all tab changes");

    //chrome?.tabs?.onActivated?.addListener(CNSI.bg.handleTabActivate);
    chrome?.tabs?.onCreated?.addListener(CNSI.bg.handleTabCreate);
    chrome?.tabs?.onRemoved?.addListener(CNSI.bg.handleTabRemove);
    chrome?.tabs?.onUpdated?.addListener(CNSI.bg.handleTabUpdate);

    chrome?.action?.onClicked?.addListener(CNSI.bg.handleIconClick);
  },

  unlistenToTabChanges: function () {
    console.log("Unlistening to all tab changes");

    //chrome?.tabs?.onActivated?.removeListener(CNSI.bg.handleTabActivate);
    chrome?.tabs?.onCreated?.removeListener(CNSI.bg.handleTabCreate);
    chrome?.tabs?.onRemoved?.removeListener(CNSI.bg.handleTabRemove);
    chrome?.tabs?.onUpdated?.removeListener(CNSI.bg.handleTabUpdate);

    chrome?.action?.onClicked?.removeListener(CNSI.bg.handleIconClick);
  },

  // handle switch to already open tab
  handleTabActivate: async function (activeInfo) {
    var tabId = activeInfo.tabId;

    //const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    //const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    //const tabs = await chrome.tabs.query({ active: true });
    //const url = tabs[ 0 ].url;
    //console.log(`Tab info: ${JSON.stringify(tabs[ 0 ])}`);

    //if (CNSI.bg.data[ tabId ] == null && !url?.startsWith("chrome://")) {
    if (CNSI.bg.data[tabId] == null) {
      //console.log(`Tab ${tabId} activated: ${url}`);
      console.log(`Tab ${tabId} activated`);

      console.log("Initializing vars due to tab activated");
      CNSI.bg.initStorageVars(tabId);
    }
  },

  // handle new tabs
  handleTabCreate: function (tab) {
    if (
      tab != null &&
      tab.url != null &&
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
      CNSI.bg.initStorageVars(tabs[0]);
      */

      CNSI.bg.initStorageVars(tab.id);
    }
  },

  // handle tab deletes
  handleTabRemove: function (tabId, removeInfo) {
    if (CNSI.bg.data[tabId] != null) {
      console.log(`Tab ${tabId} removed: ${removeInfo}`);
      console.log("Deleting data for closed tab " + tabId);
      delete CNSI.bg.data[tabId];
    }
  },

  // handle tab reloads and url changes
  handleTabUpdate: function (tabId, changeInfo, tab) {
    if (
      tab != null &&
      tab.url != null &&
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
      CNSI.bg.initStorageVars(tabs[0]);
      CNSI.bg.handleIconClick();
      */

      console.log("Initializing vars due to tab updated");
      CNSI.bg.initStorageVars(tab.id);
    }
  },

  initStorageVars: async function (tabId) {
    // Set critical vars in storage in case of crashes
    // https://developer.chrome.com/extensions/storage

    //var port = chrome?.tabs?.connect(tabId, {name: ""})
    // var port = chrome?.tabs?.connect(tabId, { name: "CNSIport" + tabId });
    var port = chrome?.tabs?.connect(tabId);
    console.log(
      "Connected port is " + JSON.stringify(port) + " for tab " + tabId,
    );

    CNSI.bg.data[tabId] = {
      identifier: "closed",
      port: port,
      screenshot: null,
    };

    await chrome?.storage?.local?.set({
      [tabId]: CNSI.bg.data[tabId],
    });
    console.log("CNSI data initialized for tab " + tabId);
    return CNSI.bg.data[tabId];
  },

  getStorageVar: async function (tab, key) {
    let data;
    if (
      CNSI.bg.data == null ||
      CNSI.bg.data.length == 0 ||
      CNSI.bg.data[tab.id] == null
    ) {
      data = await CNSI.bg.initStorageVars(tab.id);
    } else {
      const allData = await chrome?.storage?.local?.get(null);
      //console.log('all stored data' + JSON.stringify(allData));
      //const sata = await chrome?.storage?.local?.get(tab.id); gets error
      data = allData[tab.id];
    }

    // ensure local memory is up to date
    CNSI.bg.data[tab.id] = data;
    //console.log('CNSI data is ' + JSON.stringify(CNSI.bg.data[ tab.id ]) + ' for tab ' + tab.id);

    return CNSI.bg.data[tab.id][key];
  },

  setStorageVar: async function (tab, key, value) {
    if (
      CNSI.bg.data == null ||
      CNSI.bg.data.length == 0 ||
      CNSI.bg.data[tab.id] == null
    ) {
      await CNSI.bg.initStorageVars(tab.id);
    }

    // update the value we need to
    CNSI.bg.data[tab.id][key] = value;
    //console.log('CNSI data is now ' + JSON.stringify(CNSI.bg.data[ tab.id ]) + ' for tab ' + tab.id);

    await chrome?.storage?.local?.set({ [tab.id]: CNSI.bg.data[tab.id] });
  },

  loadStyles: async function (tabId) {
    console.log("Loading styles for tab " + tabId);

    await chrome?.scripting?.insertCSS({
      files: ["styles/content.css"],
      target: { tabId: tabId },
    });

    var error = CNSI.bg.checkForError();
    if (error == null) {
      console.log("Main content css load succeeded");
    } else {
      console.log("Main content css load failed");
    }
  },

  unloadStyles: async function (tabId) {
    console.log("Unloading styles for tab " + tabId);

    await chrome?.scripting?.removeCSS({
      files: ["styles/content.cs"],
      target: { tabId: tabId },
    });

    var error = CNSI.bg.checkForError();
    if (error == null) {
      console.log("Main content css unload succeeded");
    } else {
      console.log("Main content css unload failed");
    }
  },

  loadScripts: async function (tabId) {
    console.log("Loading scripts for tab " + tabId);

    const result1 = await chrome?.scripting?.executeScript({
      target: { tabId: tabId },
      files: ["scripts/utilities.js"],
    });

    let error = CNSI.bg.checkForError();
    if (error == null && result1 != null) {
      console.log("Utility script load succeeded: " + result1);

      const result2 = await chrome?.scripting?.executeScript({
        target: { tabId: tabId },
        files: ["scripts/data.js"],
      });

      let error = CNSI.bg.checkForError();
      if (error == null && result2 != null) {
        console.log("Data script load succeeded: " + result2);

        const result3 = await chrome?.scripting?.executeScript({
          target: { tabId: tabId },
          files: ["scripts/content.js"],
        });

        let error = CNSI.bg.checkForError("Main content script");
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

  /*unloadScripts: function(tabId) {
    console.log("Unloading scripts?? for tab " + tabId);
  },*/

  loadContentStylesAndScripts: async function (tabId) {
    console.log("Load styles and scripts");
    await CNSI.bg.loadStyles(tabId);
    //await CNSI.bg.loadScripts(tabId);
  },

  unloadContentStylesAndScripts: async function (tabId) {
    console.log("Unload styles and scripts");
    //await CNSI.bg.unloadScripts(tabId);
    await CNSI.bg.unloadStyles(tabId);
  },

  handleIconClick: async function (tab) {
    if (tab != null && tab.active && tab.status == "complete") {
      console.log("Extension icon clicked for tab " + tab.id);

      // get tab's identifier state from storage
      var identifier = await CNSI.bg.getStorageVar(tab, "identifier");
      console.log("Identifier is currently " + identifier);

      // get tab's port from storage
      var port = await CNSI.bg.getStorageVar(tab, "port");
      console.log(
        "Stored port is " + JSON.stringify(port) + " for tab " + tab.id,
      );

      if (identifier == null || identifier == "closed") {
        try {
          await CNSI.bg.loadContentStylesAndScripts(tab.id);
          CNSI.bg.openIdentifier(tab, port);
        } catch (err) {
          CNSI.bg.onError(err);
        }
      } else if (identifier == "opened") {
        CNSI.bg.closeIdentifier(tab, port);
        //CNSI.bg.unloadContentStylesAndScripts(tab.id);
        //CNSI.bg.initStorageVars(tab.id);
      }
    }
  },

  //https://stackoverflow.com/questions/14517184/exception-handling-in-chrome-extensions
  checkForError: function () {
    var errorMsg = null;

    if (chrome?.runtime?.lastError) {
      errorMsg = chrome?.runtime?.lastError.message;
      console.error(errorMsg);
    }

    return errorMsg;
  },
  onError: function (error) {
    console.error(`ERROR: ${error}`);
  },

  listenToMessages: function (tab, port) {
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
        CNSI.bg.handleMessage,
      );
    });
  },

  unlistenToMessages: function (tab, port) {
    console.log("Unlistening to messages for tab " + tab.id);
    chrome?.runtime?.onConnect.addListener((port) => {
      //port.onMessage.removeListener(
      chrome?.runtime?.onMessage?.removeListener(CNSI.bg.handleMessage);
    });
  },

  handleMessage: function (request, sender, sendResponse) {
    /*console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the background script");*/
    if (request.getTabId) {
      sendResponse({ status: "success", tabId: sender.tab.id });
    } else if (request.scrolled || request.resized || request.clicked) {
      CNSI.bg.takeScreenshot(sender.tab);
      sendResponse({ status: "success" });
    } else {
      sendResponse({ status: "failure" });
    }
  },

  takeScreenshot: async function (tab, port) {
    console.log("Taking screenshot for tab " + tab.id);

    const screenshotUrl = await chrome?.tabs?.captureVisibleTab();

    // save screenshot in storage
    CNSI.bg.setStorageVar(tab, "screenshot", screenshotUrl);

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

  openIdentifier: async function (tab, port) {
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
      CNSI.bg.setStorageVar(tab, "identifier", "opened");
      CNSI.bg.takeScreenshot(tab, port);
      CNSI.bg.listenToMessages(tab, port);
    } else {
      console.log("Open request failed!");
    }
  },

  closeIdentifier: async function (tab, port) {
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
      CNSI.bg.setStorageVar(tab, "identifier", "closed");
      //CNSI.bg.disconnect(tab, port);
      CNSI.bg.unlistenToMessages(tab, port);
    } else {
      console.log("Close request failed!");
    }
  },

  /*disconnect: function (tab, port) {
    console.log("Attempting to disconnect vars and listeners for tab " + tab.id);

    //CNSI.bg.initStorageVars(tab);

    // remove message listener
    CNSI.bg.unlistenToMessages(tab, port);

    // unload vars / scripts/ style
    //CNSI.bg.unloadContentStylesAndScripts(tab.id);
  }*/
};

try {
  CNSI.bg.init();
} catch (error) {
  console.error(`Background initialization error: ${error}`);
}
