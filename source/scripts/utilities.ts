/******************************************************************************
 * File: 	utilities.ts
 * Summary:	Utility script for this Chrome Extension
 * Author: 	Little Corner Dev (https://github.com/LittleCornerDev)
 *
 * Copyright (c) 2020, Little Corner Dev. All rights reserved.
 * Use of this source code is governed by the license that can be
 * found in the LICENSE file.
 */

import {
  ColorDataSource,
  ColorType,
  ColorValueHex,
  ColorValueHexNoHash,
  ColorValueHexWithHash,
  Decimal,
  Degrees,
  HclData,
  HexString,
  HslData,
  HsvData,
  HsvType,
  Radians,
  RgbData,
  Season,
  SeasonType,
} from "./types";

const CsniUtilities = {
  getHSVdescription: function (hsvType: HsvType, value: Degrees): string {
    let pole1, pole2;
    switch (hsvType.toLowerCase()) {
      case "h":
        pole1 = "cool";
        pole2 = "warm";
        break;
      case "s":
        pole1 = "muted";
        pole2 = "saturated";
        break;
      case "v":
        pole1 = "dark";
        pole2 = "light";
        break;
      default:
      //console.log(`Sorry, we are out of ${expr}.`);
    }

    let percentage = value;
    if (hsvType == "h") {
      // flatten 360 color wheel into two poles to get percentage
      // blue at 240 should be the "coolest" at 0%
      // yellow at 60 should be "warmest" at 100%
      percentage = (Math.abs(value - 240) / 180) * 100;
    }

    let desc = "";
    /*if (hsvType == "h") {
			desc += " ["+percentage+"%]"
		}*/
    desc += " (";
    if (percentage < 20) {
      desc += "very " + pole1;
    } else if (percentage >= 20 && percentage < 40) {
      desc += pole1;
    } else if (percentage >= 40 && percentage < 50) {
      desc += "mildly " + pole1;
    } else if (percentage >= 50 && percentage < 60) {
      desc += "mildly " + pole2;
    } else if (percentage >= 60 && percentage < 80) {
      desc += pole2;
    } else if (percentage >= 80) {
      desc += "very " + pole2;
    }
    desc += ")";

    return desc;
  },

  getHexLowerNoHash: function (hexCode: ColorValueHex): ColorValueHexNoHash {
    //TODO: add format/regex check?

    let hex = hexCode.toLowerCase();
    if (hex.charAt(0) == "#") hex = hex.slice(1);

    return hex;
  },

  getHexUpperWithHash: function (
    hexCode: ColorValueHex,
  ): ColorValueHexWithHash {
    //TODO: add format/regex check?

    let hex = hexCode.toUpperCase();
    if (hex.charAt(0) != "#") hex = "#" + hex;

    return hex as ColorValueHexWithHash;
  },

  capitalizeFirstLetter: function (str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  kebabize: function (str: string): string {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    //return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
  },

  titleCase: function (str: string): string {
    const words = str.toLowerCase().split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = this.capitalizeFirstLetter(words[i]);
    }

    // combine words into a string again
    return words.join(" ");
  },

  getColorNameDisplay: function (
    name: string,
    source: ColorDataSource,
    number?: string,
  ): string {
    const sourceUrls = {
      Crayola: "https://www.w3schools.com/colors/colors_crayola.asp",
      X11: "https://en.wikipedia.org/wiki/X11_color_names",
      W3C: "https://www.w3schools.com/colors/colors_names.asp",
      RAL: "https://www.w3schools.com/colors/colors_ral.asp",
      Pantone: "https://en.wikipedia.org/wiki/Pantone",
    };

    //var display = this.titleCase(name) + " [" ;
    let display = name + " [";
    display +=
      '<a href="' + sourceUrls[source] + '" target="_blank">' + source + "</a>";

    if (number != null) {
      display += " " + number;
    }

    display += "]";

    if (source != "W3C" && source != "X11") {
      display += "*";
    }

    return display;
  },

  getColorSeasonDisplay: function (
    season: Season,
    seasonType: SeasonType,
    colorType?: ColorType,
  ) {
    const seasons = ["winter", "spring", "summer", "autumn"];
    const seasonTypes = {
      winter: ["dark", "true", "bright"],
      spring: ["bright", "true", "light"],
      summer: ["light", "true", "soft"],
      autumn: ["soft", "true", "dark"],
    };
    const colorTypes = ["fn", "ca", "m"];

    if (!seasons.includes(season)) {
      console.log("Invalid season");
      return;
    }
    if (!seasonTypes[season].includes(seasonType)) {
      console.log("Invalid seasonType");
      return;
    }
    if (colorType != null && !colorTypes.includes(colorType)) {
      console.log("Invalid colorType");
      return;
    }

    let display =
      this.capitalizeFirstLetter(seasonType) +
      " " +
      this.capitalizeFirstLetter(season);
    if (colorType != null) {
      display += " [" + colorType.toUpperCase() + "]";
    }
    return display;
  },

  // Modified from
  // https://css-tricks.com/converting-color-spaces-in-javascript/
  RGBAtoHex: function (
    r: Decimal,
    g: Decimal,
    b: Decimal,
    a?: Decimal,
  ): ColorValueHex {
    let rHex = r.toString(16);
    let gHex = g.toString(16);
    let bHex = b.toString(16);
    let aHex =
      a && typeof a == "number" ? Math.round(a * 255).toString(16) : null;

    if (rHex.length == 1) rHex = "0" + rHex;
    if (gHex.length == 1) gHex = "0" + gHex;
    if (bHex.length == 1) bHex = "0" + bHex;
    if (aHex?.length == 1) aHex = "0" + aHex;

    let hex = "#" + rHex + gHex + bHex;
    if (a) hex += aHex;
    return hex;

    //https://stackoverflow.com/questions/6735470/get-pixel-color-from-canvas-on-mouseover
    /*if (r > 255 || g > 255 || b > 255) {
			throw "Invalid RGB component";
		}

		return ((r << 16) | (g << 8) | b).toString(16);*/
  },

  // Adapted from
  // https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript
  // Info from
  // http://coecsl.ece.illinois.edu/ge423/spring05/group8/finalproject/hsv_writeup.pdf
  RGBtoHSV: function (r: Decimal, g: Decimal, b: Decimal): HsvData {
    let rr, gg, bb;

    const rabs = r / 255;
    const gabs = g / 255;
    const babs = b / 255;

    const v: Degrees = Math.max(rabs, gabs, babs);
    const diff = v - Math.min(rabs, gabs, babs);
    const diffc = (c: number) => (v - c) / 6 / diff + 1 / 2;
    const percentRoundFn = (num: number) => Math.round(num * 100) / 100;

    let h, s: Degrees;
    if (diff == 0) {
      h = s = 0;
    } else {
      s = diff / v;
      rr = diffc(rabs);
      gg = diffc(gabs);
      bb = diffc(babs);

      if (rabs === v) {
        h = bb - gg;
      } else if (gabs === v) {
        h = 1 / 3 + rr - bb;
      } else if (babs === v) {
        h = 2 / 3 + gg - rr;
      } else {
        // not expected
        h = 0;
      }

      if (h < 0) {
        h += 1;
      } else if (h > 1) {
        h -= 1;
      }
    }
    return {
      h: Math.round(h * 360),
      s: percentRoundFn(s * 100),
      v: percentRoundFn(v * 100),
    };
  },

  // Adapted from
  // https://stackoverflow.com/questions/7530627/hcl-color-to-rgb-and-backward
  RGBtoHCL: function (r: Decimal, g: Decimal, b: Decimal): HclData {
    const Y0 = 100,
      gamma = 3;
    //Al = 1.4456,
    //Ach_inc = 0.16;

    const min = Math.min(Math.min(r, g), b),
      max = Math.max(Math.max(r, g), b);

    if (max == 0) {
      return {
        h: 0,
        c: 0,
        l: 0,
      };
    }

    const alpha = min / max / Y0;
    const Q = Math.exp(alpha * gamma);
    const rg = r - g;
    const gb = g - b;
    const br = b - r;
    const L = (Q * max + (1 - Q) * min) / 2;
    const C = (Q * (Math.abs(rg) + Math.abs(gb) + Math.abs(br))) / 3;
    let H = this.radiansToDegrees(Math.atan2(gb, rg));

    if (rg < 0) {
      if (gb >= 0) {
        H = 90 + H;
      } else {
        H = H - 90;
      }
    } //works

    return {
      h: H,
      c: C,
      l: L,
    };
  },

  radiansToDegrees: function (radians: Radians): Degrees {
    const pi = Math.PI;
    return radians * (180 / pi);
  },

  // Modified from
  //https://css-tricks.com/converting-color-spaces-in-javascript/
  hexToRGB: function (h: ColorValueHex): RgbData {
    if (h.charAt(0) != "#") h = "#" + h;

    let rHexStr, gHexStr, bHexStr: HexString;

    // 3 digits
    if (h.length == 4) {
      rHexStr = ("0x" + h[1] + h[1]) as HexString;
      gHexStr = ("0x" + h[2] + h[2]) as HexString;
      bHexStr = ("0x" + h[3] + h[3]) as HexString;
    }
    // 6 digits
    else if (h.length == 7) {
      rHexStr = ("0x" + h[1] + h[2]) as HexString;
      gHexStr = ("0x" + h[3] + h[4]) as HexString;
      bHexStr = ("0x" + h[5] + h[6]) as HexString;
    }
    // not expected
    else {
      rHexStr = gHexStr = bHexStr = "0x0";
    }

    //return "rgb("+ +r + "," + +g + "," + +b + ")";
    return {
      r: parseInt(rHexStr),
      g: parseInt(gHexStr),
      b: parseInt(bHexStr),
    };
  },

  // Adapted from
  // https://stackoverflow.com/questions/46432335/hex-to-hsl-convert-javascript
  hexToHSL: function (hex: ColorValueHex): HslData {
    // Convert hex to RGB first
    const rgb = this.hexToRGB(hex);
    let r = rgb.r;
    let g = rgb.g;
    let b = rgb.b;

    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          // not expected
          h = 0;
      }
      h /= 6;
    }

    h = Math.round(360 * h);
    s = s * 100;
    s = Math.round(s);
    l = l * 100;
    l = Math.round(l);

    //return "hsl(" + h + "," + s + "%," + l + "%)";

    return {
      h: h,
      s: s,
      l: l,
    };
  },

  // Info from
  // https://www.w3schools.com/tags/canvas_fillstyle.asp
  fillCanvasWithHex: function (
    canvas: HTMLCanvasElement,
    h: ColorValueHex,
  ): void {
    const canvasContext = canvas.getContext("2d");
    const canvasLayoutWidth = canvas.width;
    const canvasLayoutHeight = canvas.height;
    if (h.charAt(0) != "#") h = "#" + h;
    if (canvasContext) {
      canvasContext.fillStyle = h;
      canvasContext.fillRect(0, 0, canvasLayoutWidth, canvasLayoutHeight);
    }
  },
};

export default CsniUtilities;
