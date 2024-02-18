/******************************************************************************
 * File: 	utilities.js
 * Summary: Utility script for this Chrome Extension
 * Author: 	Little Corner Dev (https://github.com/LittleCornerDev)
 *
 * Copyright (c) 2020, Little Corner Dev. All rights reserved.
 * Use of this source code is governed by the license that can be
 * found in the LICENSE file.
 */

var CNSI = globalThis.CNSI || {};

CNSI.utils = {
  getHSVdescription: function (hsvType, value) {
    var pole1, pole2;
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

    var percentage = value;
    if (hsvType == "h") {
      // flatten 360 color wheel into two poles to get percentage
      // blue at 240 should be the "coolest" at 0%
      // yellow at 60 should be "warmest" at 100%
      percentage = (Math.abs(value - 240) / 180) * 100;
    }

    var desc = "";
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

  getHexLowerNoHash: function (hexCode) {
    //TODO: add format/regex check?

    var hex = hexCode.toLowerCase();
    if (hex.charAt(0) == "#") hex = hex.slice(1);

    return hex;
  },

  getHexUpperWithHash: function (hexCode) {
    //TODO: add format/regex check?

    var hex = hexCode.toUpperCase();
    if (hex.charAt(0) != "#") hex = "#" + hex;

    return hex;
  },

  capitalizeFirstLetter: function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  kebabize: function (str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    //return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
  },

  titleCase: function (str) {
    var words = str.toLowerCase().split(" ");
    for (var i = 0; i < words.length; i++) {
      words[i] = CNSI.utils.capitalizeFirstLetter(words[i]);
    }

    // combine words into a string again
    return words.join(" ");
  },

  getColorNameDisplay: function (name, source, number = null) {
    var sourceUrls = {
      Crayola: "https://www.w3schools.com/colors/colors_crayola.asp",
      X11: "https://en.wikipedia.org/wiki/X11_color_names",
      W3C: "https://www.w3schools.com/colors/colors_names.asp",
      RAL: "https://www.w3schools.com/colors/colors_ral.asp",
      Pantone: "https://en.wikipedia.org/wiki/Pantone",
    };

    //var display = CNSI.utils.titleCase(name) + " [" ;
    var display = name + " [";
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

  getColorSeasonDisplay: function (season, seasonType, colorType = null) {
    var seasons = ["winter", "spring", "summer", "autumn"];
    var seasonTypes = {
      winter: ["dark", "true", "bright"],
      spring: ["bright", "true", "light"],
      summer: ["light", "true", "soft"],
      autumn: ["soft", "true", "dark"],
    };
    var colorTypes = ["fn", "ca", "m"];

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

    var display =
      CNSI.utils.capitalizeFirstLetter(seasonType) +
      " " +
      CNSI.utils.capitalizeFirstLetter(season);
    if (colorType != null) {
      display += " [" + colorType.toUpperCase() + "]";
    }
    return display;
  },

  // Modified from
  // https://css-tricks.com/converting-color-spaces-in-javascript/
  RGBAtoHex: function (r, g, b, a = null) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    a = a != null ? Math.round(a * 255).toString(16) : null;

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    if (a != null && a.length == 1) a = "0" + a;

    var hex = "#" + r + g + b;
    if (a != null) hex + a;
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
  RGBtoHSV: function (r, g, b) {
    let h, s, v;
    let rr, gg, bb;

    let rabs = r / 255;
    let gabs = g / 255;
    let babs = b / 255;

    v = Math.max(rabs, gabs, babs);
    let diff = v - Math.min(rabs, gabs, babs);
    let diffc = (c) => (v - c) / 6 / diff + 1 / 2;
    let percentRoundFn = (num) => Math.round(num * 100) / 100;

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
  RGBtoHCL: function (r, g, b) {
    let Y0 = 100,
      gamma = 3,
      Al = 1.4456,
      Ach_inc = 0.16;

    let min = Math.min(Math.min(r, g), b),
      max = Math.max(Math.max(r, g), b);

    if (max == 0) {
      return {
        h: 0,
        c: 0,
        l: 0,
      };
    }

    let alpha = min / max / Y0;
    let Q = Math.exp(alpha * gamma);
    let rg = r - g;
    let gb = g - b;
    let br = b - r;
    let L = (Q * max + (1 - Q) * min) / 2;
    let C = (Q * (Math.abs(rg) + Math.abs(gb) + Math.abs(br))) / 3;
    let H = CNSI.utils.radiansToDegrees(Math.atan2(gb, rg));

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

  radiansToDegrees: function (radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
  },

  // Modified from
  //https://css-tricks.com/converting-color-spaces-in-javascript/
  hexToRGB: function (h) {
    if (h.charAt(0) != "#") h = "#" + h;

    let r = 0,
      g = 0,
      b = 0;

    // 3 digits
    if (h.length == 4) {
      r = "0x" + h[1] + h[1];
      g = "0x" + h[2] + h[2];
      b = "0x" + h[3] + h[3];

      // 6 digits
    } else if (h.length == 7) {
      r = "0x" + h[1] + h[2];
      g = "0x" + h[3] + h[4];
      b = "0x" + h[5] + h[6];
    }

    //return "rgb("+ +r + "," + +g + "," + +b + ")";
    return {
      r: parseInt(r),
      g: parseInt(g),
      b: parseInt(b),
    };
  },

  // Adapted from
  // https://stackoverflow.com/questions/46432335/hex-to-hsl-convert-javascript
  hexToHSL: function (hex) {
    // Convert hex to RGB first
    let rgb = CNSI.utils.hexToRGB(hex);
    let r = rgb.r;
    let g = rgb.g;
    let b = rgb.b;

    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h,
      s,
      l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
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
  fillCanvasWithHex: function (canvas, h) {
    var canvasContext = canvas.getContext("2d");
    var canvasLayoutWidth = canvas.width;
    var canvasLayoutHeight = canvas.height;
    if (h.charAt(0) != "#") h = "#" + h;
    canvasContext.fillStyle = h;
    canvasContext.fillRect(0, 0, canvasLayoutWidth, canvasLayoutHeight);
  },
};
