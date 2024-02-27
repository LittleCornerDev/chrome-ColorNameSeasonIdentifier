import { describe, expect, jest, test } from "@jest/globals";
import { chrome } from "jest-chrome";
import bg from "../../../source/scripts/background";

describe.skip("background", () => {
  test("listenToTabChanges", async () => {
    jest.spyOn(bg, "listenToTabChanges");
    chrome.runtime.connect({ name: "jest" });
    expect(bg.listenToTabChanges).toHaveBeenCalledTimes(1);
  });

  test("handleTabCreate", async () => {
    jest.spyOn(bg, "handleTabCreate");
    chrome.tabs.create({ url: "https://localhost" });
    expect(bg.handleTabCreate).toHaveBeenCalledTimes(1);
  });
});
