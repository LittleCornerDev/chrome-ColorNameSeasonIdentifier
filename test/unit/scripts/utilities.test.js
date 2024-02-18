const fs = require("fs");
const vm = require("vm");
const context = vm.createContext({
  chrome: globalThis.chrome,
});

const code = fs.readFileSync(
  require.resolve("../../../source/scripts/utilities.js"),
  "utf8",
);

beforeAll(() => {
  //console.log("code", code);
  vm.runInContext(code, context);
  //console.log("context", context);
});

test("capitalizeFirstLetter", () => {
  expect(context.CNSI.utils.capitalizeFirstLetter("helloWorld")).toBe(
    "HelloWorld",
  );
});
test("kebabize", () => {
  expect(context.CNSI.utils.kebabize("helloWorld")).toBe("hello-world");
});
test("titleCase", () => {
  expect(context.CNSI.utils.titleCase("hello world")).toBe("Hello World");
});
