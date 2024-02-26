import { describe, expect, jest, test } from "@jest/globals";
import utils from "../../../source/scripts/utilities";

describe("utilities", () => {
  test("capitalizeFirstLetter", () => {
    expect(utils.capitalizeFirstLetter("helloWorld")).toBe("HelloWorld");
  });
  test("kebabize", () => {
    expect(utils.kebabize("helloWorld")).toBe("hello-world");
  });
  test("titleCase", () => {
    expect(utils.titleCase("hello world")).toBe("Hello World");
  });
});
