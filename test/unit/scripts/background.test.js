const fs = require("fs");
const vm = require("vm");
const context = vm.createContext({
  chrome: globalThis.chrome,
});

const code = fs.readFileSync(
  require.resolve("../../../source/scripts/background.js"),
  "utf8",
);

beforeAll(() => {
  //console.log("code", code);
  vm.runInContext(code, context);
  //console.log("context", context);
});

test.skip("handleTabActivate", async () => {
  //context.CNSI.bg.handleTabActivate = jest.fn();
  jest.spyOn(context.CNSI.bg, "handleTabActivate");
  console.log("context.CNSI.bg", context.CNSI.bg);
  //vm.runInContext(code, context);
  context.chrome.tabs.update(1, { active: true });
  expect(context.CNSI.bg.handleTabActivate).toHaveBeenCalledTimes(1);
});

test.skip("handleTabCreate", async () => {
  //context.CNSI.bg.handleTabCreate = jest.fn();
  jest.spyOn(context.CNSI.bg, "handleTabCreate");
  console.log("context.CNSI.bg", context.CNSI.bg);
  //vm.runInContext(code, context);
  context.chrome.tabs.create({ url: "https://localhost" });
  expect(context.CNSI.bg.handleTabCreate).toHaveBeenCalledTimes(1);
});
