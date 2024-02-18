const tabId = 1;
const tab = { active: true, status: "complete", url: "" };

let listenersOnActivated = [];
let listenersOnCreated = [];
let listenersOnRemoved = [];
let listenersOnUpdated = [];

globalThis.chrome = {
  browserAction: {
    onClicked: {
      addListener: async (handler) => {
        console.log("chrome.browserAction.onClicked.addListener");
        handler(tab);
      },
    },
  },
  storage: {
    local: {
      get: async () => {
        console.log("chrome.storage.local.get");
      },
      set: async () => {
        console.log("chrome.storage.local.set");
      },
    },
  },
  tabs: {
    onActivated: {
      addListener: (handler) => {
        console.log("chrome.tabs.onActivated.addListener");
        return handler;
      },
    },
    onCreated: {
      addListener: (handler) => {
        console.log("chrome.tabs.onCreated.addListener");
        listenersOnCreated.push(handler);
      },
    },
    onRemoved: {
      addListener: (handler) => {
        console.log("chrome.tabs.onRemoved.addListener");
        listenersOnRemoved.push(handler);
      },
    },
    onUpdated: {
      addListener: (handler) => {
        console.log("chrome.tabs.onUpdated.addListener");
        listenersOnUpdated.push(handler);
      },
    },

    create: async (createProperties, callback) => {
      console.log("chrome.tabs.create");
      if (listenersOnCreated.length > 0) {
        listenersOnCreated[0](tab);
      }
    },
    remove: async () => {
      console.log("chrome.tabs.remove");
      if (listenersOnRemoved.length > 0) {
        listenersOnRemoved[0](tabId, {});
      }
    },
    executeScript: async () => {
      console.log("chrome.tabs.executeScript");
    },
    get: async () => {
      console.log("chrome.tabs.get");
    },
    query: async () => {
      console.log("chrome.tabs.query");
    },
    update: async (tabId, updateProperties, callback) => {
      console.log("chrome.tabs.update");
      if (updateProperties.active) {
        if (listenersOnActivated.length > 0) {
          listenersOnActivated[0]({ tabId });
        }
      } else {
        if (listenersOnActivated.length > 0) {
          listenersOnActivated[0]({ tabId });
        }
      }
    },
  },
};
