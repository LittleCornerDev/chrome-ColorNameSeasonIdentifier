/******************************************************************************
 * File: 	data.js
 * Summary: Color season mapping script for this Chrome Extension
 * Author: 	Little Corner Dev (https://github.com/LittleCornerDev)
 *
 * Copyright (c) 2020, Little Corner Dev. All rights reserved.
 * Use of this source code is governed by the license that can be
 * found in the LICENSE file.
 */

var CNSI = globalThis.CNSI || {};

CNSI.data = {
  init: function () {
    console.log("Initializing data");

    // Save corresponding rgb and hsl values onload so that we don't have to keep calculating it when using findClosestHex() onmousemove in
    // Uses functions from utilities.js
    Object.keys(CNSI.data.colors).forEach(function (hex, i) {
      CNSI.data.colors[hex].rgb = CNSI.utils.hexToRGB(hex);
      CNSI.data.colors[hex].hsl = CNSI.utils.hexToHSL(hex);
    });
  },

  // Finds closest hex for given hex and info type in list of available hex codes.
  // Triggered from onmousemove logic in content.js.
  // Info from
  // https://softwareengineering.stackexchange.com/questions/159830/nearest-color-algorithm-using-hex-triplet
  findClosestHex: function (originHexCode, dataType) {
    if (dataType != "names" && dataType != "seasons") {
      dataType = "seasons";
    }

    var rgb = CNSI.utils.hexToRGB(originHexCode);
    var originR = rgb.r,
      originG = rgb.g,
      originB = rgb.b;

    var hsl = CNSI.utils.hexToHSL(originHexCode);
    var originH = hsl.h,
      originS = hsl.s,
      originL = hsl.l;

    var rgbDiff = 0,
      hslDiff = 0,
      currentDiff = 0;
    var closestHex = null,
      smallestDiff = -1;

    Object.keys(CNSI.data.colors).forEach(function (currentHex, i) {
      //make sure we are only looking for colors with desired type info
      if (CNSI.data.colors[currentHex][dataType] != null) {
        //https://softwareengineering.stackexchange.com/questions/159830/nearest-color-algorithm-using-hex-triplet
        rgbDiff = Math.sqrt(
          Math.pow(originR - CNSI.data.colors[currentHex].rgb.r, 2) +
            Math.pow(originG - CNSI.data.colors[currentHex].rgb.g, 2) +
            Math.pow(originB - CNSI.data.colors[currentHex].rgb.b, 2),
        );
        hslDiff = Math.sqrt(
          Math.pow(originH - CNSI.data.colors[currentHex].hsl.h, 2) +
            Math.pow(originS - CNSI.data.colors[currentHex].hsl.s, 2) +
            Math.pow(originL - CNSI.data.colors[currentHex].hsl.l, 2),
        );

        //currentDiff = rgbDiff + hslDiff * 2;  //Not sure why this is used in http://chir.ag/projects/ntc/ntc.js
        currentDiff = rgbDiff;

        if (smallestDiff < 0 || smallestDiff > currentDiff) {
          smallestDiff = currentDiff;
          closestHex = currentHex;
        }
      }
    });

    //console.log('Closest match to ' + originHexCode + ' is ' + closestHex);
    return closestHex;
  },

  getColorData: function (originHexCode, dataType) {
    if (dataType != "names" && dataType != "seasons") {
      dataType = "seasons";
    }

    var hex = CNSI.utils.getHexLowerNoHash(originHexCode);

    var data = null;

    if (
      CNSI.data.colors[hex] != null &&
      CNSI.data.colors[hex][dataType] != null
    ) {
      //console.log('exact ' + dataType + ' hex found for ' + hex);
      data = CNSI.data.colors[hex][dataType];
      data.hex = CNSI.utils.getHexUpperWithHash(hex);
      data.isExactMatch = true;
    } else {
      //console.log('exact ' + dataType + ' hex NOT found for ' + hex + '... finding closest');
      var closestHex = CNSI.data.findClosestHex(hex, dataType);
      //console.log('closest ' + dataType + ' hex found: ' + closestHex);

      if (
        CNSI.data.colors[closestHex] != null &&
        CNSI.data.colors[closestHex][dataType] != null
      ) {
        data = CNSI.data.colors[closestHex][dataType];
        data.hex = CNSI.utils.getHexUpperWithHash(closestHex);
        data.isExactMatch = false;
      }
    }

    return data;
  },

  // Color names info from:
  // https://en.wikipedia.org/wiki/X11_color_names
  // https://www.w3schools.com/colors/colors_names.asp
  // https://www.w3schools.com/colors/colors_ral.asp
  // https://en.wikipedia.org/wiki/Pantone
  //
  // TODO: Incorporate any colors we do not have yet but are listed in
  // https://en.wikipedia.org/wiki/Lists_of_colors?
  //
  // TODO: Should we incorporate the pantone colors in https://www.colorabout.com/list/pantone/?
  // NOTE: Pantone colors are copyrighted.
  //
  // TODO: Should we incoporate paint or crayola color names?
  // https://en.wikipedia.org/wiki/List_of_colors:_A%E2%80%93F
  // https://www.w3schools.com/colors/colors_crayola.asp
  //
  // TODO: Fabric colors would be ideal, but they seem to be named
  // by manufacturer and may be different per material.
  // Maybe use colors listed in https://sewguide.com/color-names-in-fashion/
  //
  //
  // Seasonal palettes from:
  // https://theconceptwardrobe.com/complete-seasonal-guides
  colors: {
    "000000": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Black", source: "X11" },
          { name: "Black", source: "W3C" },
          { name: "Black", source: "Crayola" },
        ],
      },
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
        bad: [
          { season: "spring", seasonType: "bright" },
          { season: "spring", seasonType: "true" },
          { season: "spring", seasonType: "light" },
          { season: "summer", seasonType: "light" },
          { season: "summer", seasonType: "true" },
          { season: "summer", seasonType: "soft" },
          { season: "autumn", seasonType: "soft" },
          { season: "autumn", seasonType: "true" },
          { season: "autumn", seasonType: "dark" },
        ],
      },
    },
    "000080": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Navy Blue", source: "X11" },
          { name: "Navy", source: "W3C" },
        ],
      },
    },
    "00008b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Blue", source: "X11" },
          { name: "Dark Blue", source: "W3C" },
        ],
      },
    },
    "0000cd": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Medium Blue", source: "X11" },
          { name: "Medium Blue", source: "W3C" },
        ],
      },
    },
    "0000ff": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Blue", source: "X11" },
          { name: "Blue", source: "W3C" },
        ],
      },
    },
    "000471": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "001baa": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "0035ff": {
      seasons: {
        bad: [{ season: "autumn", seasonType: "true" }],
      },
    },
    "003d63": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "003e23": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "0042a8": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "00468c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Midnight Blue", source: "Crayola" }],
      },
    },
    "0048ba": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Absolute Zero", source: "Crayola" }],
      },
    },
    "004bc9": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "0053db": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "005d4c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Opal Green", source: "RAL", number: "6036" }],
      },
    },
    "005950": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "005d52": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Opal Green", source: "RAL", number: "6026" }],
      },
    },
    "006400": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Green", source: "X11" },
          { name: "Dark Green", source: "W3C" },
        ],
      },
    },
    "0066cc": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Navy Blue", source: "Crayola" }],
      },
    },
    "0066ff": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue (III)", source: "Crayola" }],
      },
    },
    "006e3d": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "007243": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mint Green", source: "RAL", number: "6029" }],
      },
    },
    "00755e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Tropical Rain Forest", source: "Crayola" }],
      },
    },
    "007984": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "008000": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Web Green", source: "X11" },
          { name: "Green", source: "W3C" },
        ],
      },
    },
    "008033": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "008080": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Teal", source: "X11" },
          { name: "Teal", source: "W3C" },
          { name: "Teal Blue", source: "Crayola" },
        ],
      },
    },
    "0081ab": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Steel Blue", source: "Crayola" }],
      },
    },
    "008754": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Traffic Green", source: "RAL", number: "6024" }],
      },
    },
    "008b8b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Cyan", source: "X11" },
          { name: "Dark Cyan", source: "W3C" },
        ],
      },
    },
    "009473": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Emerald", source: "Pantone", number: "17-5641" }],
      },
    },
    "0095b7": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue Green", source: "Crayola" }],
      },
    },
    "009dc4": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pacific Blue", source: "Crayola" }],
      },
    },
    "00bfff": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Deep Sky Blue", source: "X11" },
          { name: "Deep Sky Blue", source: "W3C" },
        ],
      },
    },
    "00cc99": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Caribbean Green", source: "Crayola" }],
      },
    },
    "00cccc": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Robin's Egg Blue", source: "Crayola" }],
      },
    },
    "00ced1": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Turquoise", source: "X11" },
          { name: "Dark Turquoise", source: "W3C" },
        ],
      },
    },
    "00f700": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Luminous Green", source: "RAL", number: "6038" }],
      },
    },
    "00fa9a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Medium Spring Green", source: "X11" },
          { name: "Medium Spring Green", source: "W3C" },
        ],
      },
    },
    "00ff00": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Green", source: "X11" },
          { name: "Lime", source: "W3C" },
        ],
      },
    },
    "00ff7f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Spring Green", source: "X11" },
          { name: "Spring Green", source: "W3C" },
        ],
      },
    },
    "00ffff": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Cyan", source: "X11" },
          { name: "Aqua", source: "W3C" },
        ],
      },
    },
    "012477": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    "01786f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pine Green, Pine Tree", source: "Crayola" }],
      },
    },
    "017aa4": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "0214ff": {
      seasons: {
        bad: [{ season: "summer", seasonType: "soft" }],
      },
    },
    "026a52": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Turquoise Green", source: "RAL", number: "6016" }],
      },
    },
    "0285ea": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "02a4d3": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cerulean", source: "Crayola" }],
      },
    },
    "03004f": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "032269": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    "035650": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "050f9c": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "07574b": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "076345": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "07737a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Water Blue", source: "RAL", number: "5021" }],
      },
    },
    "0a0a0a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Jet Black", source: "RAL", number: "9005" }],
      },
    },
    "0a7e8c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Metallic Seaweed", source: "Crayola" }],
      },
    },
    "0b2c75": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "0b4151": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Ocean Blue", source: "RAL", number: "5020" }],
      },
    },
    "0c301a": {
      seasons: {
        bad: [{ season: "summer", seasonType: "light" }],
      },
    },
    "0c393e": {
      seasons: {
        bad: [{ season: "spring", seasonType: "light" }],
      },
    },
    "0d6c7b": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "0d7eba": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "0e4243": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue Green", source: "RAL", number: "6004" }],
      },
    },

    "0e518d": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Traffic Blue", source: "RAL", number: "5017" }],
      },
    },
    "0e547f": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "0e5b2a": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "0e7f2d": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "0f4336": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Moss Green", source: "RAL", number: "6005" }],
      },
    },
    "0f4c81": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Classic Blue", source: "Pantone", number: "19-4052" }],
      },
    },
    "0f8558": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Signal Green", source: "RAL", number: "6032" }],
      },
    },
    "0f0f52": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    "102c54": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Night Blue", source: "RAL", number: "5026" }],
      },
    },
    "10759a": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    108764: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "11405a": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "11888b": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "125d77": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    133733: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "13447c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Gentian Blue", source: "RAL", number: "5010" }],
      },
    },
    "134c4f": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "135b5b": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "1494ac": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "14a989": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Emerald", source: "Crayola" }],
      },
    },
    154889: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Signal Blue", source: "RAL", number: "5005" }],
      },
    },
    "1560bd": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Denim", source: "Crayola" }],
      },
    },
    172532: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "17381f": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    174769: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "176f84": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    177685: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "183a47": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "1875b1": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    187789: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    188176: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    191970: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Midnight Blue", source: "X11" },
          { name: "Midnight Blue", source: "W3C" },
        ],
      },
    },
    192041: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "18216f": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "193d99": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "194d9f": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    197565: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "1a1110": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Licorice", source: "Crayola" }],
      },
    },
    "1a3c36": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "1a4c3d": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "1a5784": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Capri Blue", source: "RAL", number: "5019" }],
      },
    },
    "1a95bd": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "1ab385": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mountain Meadow", source: "Crayola" }],
      },
    },
    "1b1b1b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Eerie Black", source: "Crayola" }],
      },
    },
    "1b262b": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "1b2c51": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    "1b2f53": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    "1b4840": {
      seasons: {
        good: [
          { season: "winter", seasonType: "dark", colorType: "ca" },
          { season: "winter", seasonType: "true", colorType: "ca" },
        ],
      },
    },
    "1b542c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Green", source: "RAL", number: "6035" }],
      },
    },
    "1c1c1c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Graphite Black", source: "RAL", number: "9011" }],
      },
    },
    "1c2c59": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    "1c4793": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "1c637b": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "1d1f2a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Black Blue", source: "RAL", number: "5004" }],
      },
    },
    "1d7675": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "1e1e1e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Traffic Black", source: "RAL", number: "9017" }],
      },
    },
    "1e4657": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "1e5b94": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "1e90ff": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dodger Blue", source: "X11" },
          { name: "Dodger Blue", source: "W3C" },
        ],
      },
    },
    "1f2852": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "1f4764": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Green Blue", source: "RAL", number: "5001" }],
      },
    },
    "1f6387": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "1f67a3": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    206050: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    206569: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "20b2aa": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Sea Green", source: "X11" },
          { name: "Light Sea Green", source: "W3C" },
        ],
      },
    },
    211397: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "211f20": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Black Brown", source: "RAL", number: "8022" }],
      },
    },
    "21247d": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "21344a": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    "214b6f": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "214fc6": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "New Car", source: "Crayola" }],
      },
    },
    215443: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "2160a3": {
      seasons: {
        good: [
          { season: "winter", seasonType: "dark", colorType: "ca" },
          { season: "winter", seasonType: "true", colorType: "ca" },
        ],
      },
    },
    "21888f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Turquoise Blue", source: "RAL", number: "5018" }],
      },
    },
    218975: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "22314b": {
      seasons: {
        bad: [{ season: "spring", seasonType: "true" }],
      },
    },
    "2243b6": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Denim Blue", source: "Crayola" }],
      },
    },
    "2254d4": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "227e80": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "228b22": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Forest Green", source: "X11" },
          { name: "Forest Green", source: "W3C" },
        ],
      },
    },
    "2322a8": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "232b3f": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    "232c3f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Steel Blue", source: "RAL", number: "5011" }],
      },
    },
    "232d53": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cobalt Blue", source: "RAL", number: "5013" }],
      },
    },
    "234a6c": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "234c8c": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    235381: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    "236ac5": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "237c65": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "24241f": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    242832: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    "244e60": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    245952: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    253529: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Leather Jacket", source: "Crayola" }],
      },
    },
    253572: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "254c70": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    "256d96": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    257180: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "25885e": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "25898b": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "25b56e": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "25e712": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pure Green", source: "RAL", number: "6037" }],
      },
    },
    "26392f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Fir Green", source: "RAL", number: "6009" }],
      },
    },
    265475: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "2677ac": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "2698b5": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    270067: {
      seasons: {
        bad: [{ season: "summer", seasonType: "true" }],
      },
    },
    276235: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Leaf Green", source: "RAL", number: "6002" }],
      },
    },
    "27adb0": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "28004a": {
      seasons: {
        bad: [{ season: "autumn", seasonType: "soft" }],
      },
    },
    282828: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Signal Black", source: "RAL", number: "9004" }],
      },
    },
    283424: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Bottle Green", source: "RAL", number: "6007" }],
      },
    },
    "2863b1": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "28713e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Emerald Green", source: "RAL", number: "6001" }],
      },
    },
    "2874b2": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sky Blue", source: "RAL", number: "5015" }],
      },
    },
    "2887c8": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Green Blue", source: "Crayola" }],
      },
    },
    "28a7d6": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "29351f": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    296478: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Gentian Blue", source: "RAL", number: "5025" }],
      },
    },
    299340: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    299617: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Slimy Green", source: "Crayola" }],
      },
    },
    "29ab87": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Jungle Green, Koala Tree", source: "Crayola" }],
      },
    },
    "2a2a32": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "2a3756": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Saphire Blue", source: "RAL", number: "5003" }],
      },
    },
    "2a4077": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "2b2b35": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    "2b2c7c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Ultramarine Blue", source: "RAL", number: "5002" }],
      },
    },
    "2b3372": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "2d142b": {
      seasons: {
        bad: [{ season: "summer", seasonType: "light" }],
      },
    },
    "2d3191": {
      seasons: {
        bad: [{ season: "autumn", seasonType: "soft" }],
      },
    },
    "2d383a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Outer Space", source: "Crayola" }],
      },
    },
    "2d5546": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pine Green", source: "RAL", number: "6028" }],
      },
    },
    "2d5da1": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sapphire", source: "Crayola" }],
      },
    },
    "2db7b2": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "2e2d88": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cosmic Cobalt", source: "Crayola" }],
      },
    },
    "2e3234": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Black Grey", source: "RAL", number: "7021" }],
      },
    },
    "2e5894": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "B'dazzled Blue", source: "Crayola" }],
      },
    },
    "2e5978": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Azure Blue", source: "RAL", number: "5009" }],
      },
    },
    "2e5d6d": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "2e8082": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "2e8b57": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Sea Green", source: "X11" },
          { name: "Sea Green", source: "W3C" },
        ],
      },
    },
    "2f004c": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "2f2120": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    "2f2a5a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Night Blue", source: "RAL", number: "5022" }],
      },
    },
    "2f3983": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "2f4f4f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Slate Gray", source: "X11" },
          { name: "Drak Slate Gray", source: "W3C" },
        ],
      },
    },
    "2f8ca6": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "2fa4ac": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "2fc47a": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    304241: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "306b4d": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "30bfbf": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maximum Blue Green", source: "Crayola" }],
      },
    },
    "312b93": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "313c48": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Grey Blue", source: "RAL", number: "5008" }],
      },
    },
    "31403d": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Black Green", source: "RAL", number: "6012" }],
      },
    },
    319177: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Illuminating Emerald", source: "Crayola" }],
      },
    },
    "32222f": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    323468: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "31398a": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "325c56": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    327662: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Patina Green", source: "RAL", number: "6000" }],
      },
    },

    "32817a": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "328a84": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "32cd32": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Lime Green", source: "X11" },
          { name: "Lime Green", source: "W3C" },
        ],
      },
    },
    "332e2a": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "339acc": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cerulean Blue", source: "Crayola" }],
      },
    },
    "33c7c2": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "33cc99": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Shamrock", source: "Crayola" }],
      },
    },
    "334a44": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    335582: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "335f60": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    342634: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    "34435f": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "3464b0": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "3481b8": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Light Blue", source: "RAL", number: "5012" }],
      },
    },
    "34a69c": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "352f2d": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    353048: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    353438: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    "35382e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Brown Green", source: "RAL", number: "6008" }],
      },
    },
    353839: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Onyx", source: "Crayola" }],
      },
    },
    "35395f": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    354733: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Chrome Green", source: "RAL", number: "6020" }],
      },
    },
    "35757e": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "35c0ff": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "35c8b1": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    363935: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    "363f63": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    366837: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "3691f1": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "373f53": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    "373f43": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Anthracite Grey", source: "RAL", number: "7016" }],
      },
    },
    374447: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Granite Grey", source: "RAL", number: "7026" }],
      },
    },
    375196: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "376c8a": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "37c4d7": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "384c70": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Violet Blue", source: "RAL", number: "5000" }],
      },
    },
    "38b463": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "39040e": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    391285: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pixie Powder", source: "Crayola" }],
      },
    },
    393420: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    396140: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "3973ae": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "3a2311": {
      seasons: {
        bad: [{ season: "summer", seasonType: "soft" }],
      },
    },
    "3a3037": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    "3a3e63": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "3a474f": {
      seasons: {
        bad: [{ season: "spring", seasonType: "light" }],
      },
    },
    "3a5bcd": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "3a6160": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "3aa655": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Green", source: "Crayola" }],
      },
    },
    "3aa8c1": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Moonstone", source: "Crayola" }],
      },
    },
    "3b367b": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "3b3f42": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "3b8bb2": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "3bc1cf": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "3c3c5c": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "3cb371": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Medium Sea Green", source: "X11" },
          { name: "Medium Sea Green", source: "W3C" },
        ],
      },
    },
    "3d403a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Black Olive", source: "RAL", number: "6015" }],
      },
    },
    "3d4752": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    "3d9d82": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "3e2431": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "3e3c32": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Brown Olive", source: "RAL", number: "6022" }],
      },
    },
    "3e6fd3": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "3e753b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Grass Green", source: "RAL", number: "6010" }],
      },
    },
    "3f26bf": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Ultramarine Blue", source: "Crayola" }],
      },
    },
    "3f3a3a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Grey Brown", source: "RAL", number: "8019" }],
      },
    },
    "3f3e40": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "3f464e": {
      seasons: {
        bad: [{ season: "spring", seasonType: "true" }],
      },
    },
    "3f495a": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "3f5553": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "3f61ca": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "3fb689": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    402225: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Black Red", source: "RAL", number: "3007" }],
      },
    },
    "40433b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Grey Olive", source: "RAL", number: "6006" }],
      },
    },

    "4061a6": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "40adb1": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "40e0d0": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Turquoise", source: "X11" },
          { name: "Turquoise", source: "W3C" },
        ],
      },
    },
    "41678d": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Brilliant Blue", source: "RAL", number: "5007" }],
      },
    },
    "4169e1": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Royal Blue", source: "X11" },
          { name: "Royal Blue", source: "W3C" },
        ],
      },
    },
    "41ac44": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "422f2c": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    "42a7c9": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "43141e": {
      seasons: {
        bad: [{ season: "summer", seasonType: "light" }],
      },
    },
    "436cb9": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lapis Lazuli", source: "Crayola" }],
      },
    },
    "43833c": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "43a6f1": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "43b2be": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "43c1b2": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    442843: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    "44322d": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Chocolate Brown", source: "RAL", number: "8017" }],
      },
    },
    444337: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Yellow Olive", source: "RAL", number: "6014" }],
      },
    },
    "444d56": {
      seasons: {
        bad: [{ season: "autumn", seasonType: "dark" }],
      },
    },
    446237: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "446b5f": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "44bc3d": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "44d7a8": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Eucalyptus", source: "Crayola" }],
      },
    },
    "45325a": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "453b3a": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    "454d60": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    "4570e6": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue (II)", source: "Crayola" }],
      },
    },
    "45746b": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "458a82": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "4590f1": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "45a27d": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pine", source: "Crayola" }],
      },
    },
    "45b5aa": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Turquoise", source: "Pantone", number: "15-5519" }],
      },
    },
    "45cbdc": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    461722: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "462e35": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    463469: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    "46675b": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "4668a8": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "4682b4": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Steel Blue", source: "X11" },
          { name: "Steel Blue", source: "W3C" },
        ],
      },
    },
    468641: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "May Green", source: "RAL", number: "6017" }],
      },
    },
    469496: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Malachite", source: "Crayola" }],
      },
    },
    "469a84": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Jade", source: "Crayola" }],
      },
    },
    "46d2e8": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "472da3": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "472f47": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    483424: {
      seasons: {
        bad: [{ season: "spring", seasonType: "light" }],
      },
    },
    473784: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "474a50": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Graphite Grey", source: "RAL", number: "7024" }],
      },
    },
    "474b43": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    "47686a": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "478a84": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mint Turquoise", source: "RAL", number: "6033" }],
      },
    },
    "47abcc": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maximum Blue", source: "Crayola" }],
      },
    },
    "47b9e6": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "483d8b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Slate Blue", source: "X11" },
          { name: "Dark Slate Blue", source: "W3C" },
        ],
      },
    },
    "48a43f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Yellow Green", source: "RAL", number: "6018" }],
      },
    },
    "48b6d5": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "48d1cc": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Medium Turquoise", source: "X11" },
          { name: "Medium Turquoise", source: "W3C" },
        ],
      },
    },
    "49392d": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sepia Brown", source: "RAL", number: "8014" }],
      },
    },
    "49728a": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "4997d0": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue (I)", source: "Crayola" }],
      },
    },
    "49a6cb": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "4a203b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Purple Violet", source: "RAL", number: "4007" }],
      },
    },
    "4a3b34": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "4a4d46": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    "4a646c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Deep Space Sparkle", source: "Crayola" }],
      },
    },
    "4a7cb1": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "4b0082": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Indigo", source: "X11" },
          { name: "Indigo", source: "W3C" },
        ],
      },
    },
    "4bc7cf": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sea Serpent", source: "Crayola" }],
      },
    },
    "4c1332": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "4b3b44": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "4b4d46": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Umbra Grey", source: "RAL", number: "7022" }],
      },
    },
    "4b573e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Olive Green", source: "RAL", number: "6003" }],
      },
    },
    "4bb0d2": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "4c2f26": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mahogany Brown", source: "RAL", number: "8016" }],
      },
    },
    "4c88dd": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "4e6b88": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    "4d445e": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    "4d56cd": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "4d668e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Distant Blue", source: "RAL", number: "5023" }],
      },
    },
    "4d8c57": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Middle Green", source: "Crayola" }],
      },
    },
    "4e3b31": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Terra Brown", source: "RAL", number: "8028" }],
      },
    },
    "4e3c2f": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "4e3d2d": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "4e3f5f": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "4e5451": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Traffic Grey B", source: "RAL", number: "7043" }],
      },
    },
    "4f69c6": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Indigo", source: "Crayola" }],
      },
    },
    "4f86f7": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blueberry", source: "Crayola" }],
      },
    },
    505688: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "507ca4": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "50bfe6": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blizzard Blue", source: "Crayola" }],
      },
    },
    "51220e": {
      seasons: {
        bad: [{ season: "winter", seasonType: "bright" }],
      },
    },
    "512e8a": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "51565c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Slate Grey", source: "RAL", number: "7015" }],
      },
    },
    "51bea5": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "524b43": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    "52838e": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    529197: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    535957: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "53753c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Fern Green", source: "RAL", number: "6025" }],
      },
    },
    "53b0ae": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Blue Turquoise", source: "Pantone", number: "15-5217" },
        ],
      },
    },
    "53c665": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "54a8cb": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "554c49": {
      seasons: {
        bad: [{ season: "spring", seasonType: "light" }],
      },
    },
    555548: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          {
            name: "Brown Grey, NATO Olive, Stone-Grey Olive",
            source: "RAL",
            number: "7013",
          },
        ],
      },
    },
    "555d61": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Iron Grey", source: "RAL", number: "7011" }],
      },
    },
    "556b2f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Olive Green", source: "X11" },
          { name: "Dark Olive Green", source: "W3C" },
        ],
      },
    },
    "560e0e": {
      seasons: {
        bad: [{ season: "spring", seasonType: "light" }],
      },
    },
    563834: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    564445: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "56887d": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Wintergreen Dream", source: "Crayola" }],
      },
    },
    573042: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "57585a": {
      seasons: {
        bad: [{ season: "autumn", seasonType: "soft" }],
      },
    },
    "575d58": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "567fb9": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "56c3a5": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "574f5f": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "574e45": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    "575d57": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Tarpaulin Grey", source: "RAL", number: "7010" }],
      },
    },
    "57a6fc": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "581e2d": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "58427c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cyber Grape", source: "Crayola" }],
      },
    },
    "58431e": {
      seasons: {
        bad: [{ season: "winter", seasonType: "bright" }],
      },
    },
    584888: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    585050: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    585450: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    "5876a6": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "59333d": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "5946b2": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Plump Purple", source: "Crayola" }],
      },
    },
    "583e84": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    594651: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    596163: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Basalt Grey", source: "RAL", number: "7012" }],
      },
    },
    596677: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "dark" }],
      },
    },
    "59833d": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "5a0542": {
      seasons: {
        bad: [{ season: "spring", seasonType: "light" }],
      },
    },
    "5a3a29": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Nut Brown", source: "RAL", number: "8011" }],
      },
    },
    "5a5b9f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue Iris", source: "Pantone", number: "18-3943" }],
      },
    },
    "5a64a8": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "5b2a35": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    "5b6259": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Green Grey", source: "RAL", number: "7009" }],
      },
    },
    "5b92b1": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "5d7d7a": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "5d86df": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "5da493": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Polished Pine", source: "Crayola" }],
      },
    },
    "5dadec": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue Jeans", source: "Crayola" }],
      },
    },
    "5cbef4": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "5d5855": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    "5d6970": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue Grey", source: "RAL", number: "7031" }],
      },
    },
    "5e2028": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Wine Red", source: "RAL", number: "3005" }],
      },
    },
    "5e4a4b": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    "5e6170": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    "5e6d8b": {
      seasons: {
        bad: [{ season: "spring", seasonType: "true" }],
      },
    },
    "5e8493": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "5e8c31": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maximum Green", source: "Crayola" }],
      },
    },
    "5ea2db": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "5f4b8b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Ultra Violet", source: "Pantone", number: "18-3838" }],
      },
    },
    "5f4d4a": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "5f6499": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "5f8422": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "5f8a8b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Steel Teal", source: "Crayola" }],
      },
    },
    "5f9ea0": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Cadet Blue", source: "X11" },
          { name: "Cadet Blue", source: "W3C" },
        ],
      },
    },
    "5fa777": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Forest Green", source: "Crayola" }],
      },
    },
    "5fa778": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Shiny Shamrock", source: "Crayola" }],
      },
    },
    "61385c": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "613b39": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    614051: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Eggplant", source: "Crayola" }],
      },
    },
    622848: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "633a34": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Chestnut Brown", source: "RAL", number: "8015" }],
      },
    },
    "634d1f": {
      seasons: {
        bad: [{ season: "spring", seasonType: "bright" }],
      },
    },
    635349: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "6372ad": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "639add": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "639cb1": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "63b76c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Fern", source: "Crayola" }],
      },
    },
    "644c5e": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "644f4d": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    "6456b7": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue Violet", source: "Crayola" }],
      },
    },
    "645e4e": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    "64609a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Amethyst", source: "Crayola" }],
      },
    },
    "6495ed": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Cornflower Blue", source: "X11" },
          { name: "Cornflower Blue", source: "W3C" },
        ],
      },
    },
    "639d3f": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "652dc1": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Purple Heart", source: "Crayola" }],
      },
    },
    "65c9c8": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    663399: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Rebecca Purple", source: "X11" },
          { name: "Rebecca Purple", source: "W3C" },
        ],
      },
    },
    664228: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Van Dyke Brown", source: "Crayola" }],
      },
    },
    665233: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Raw Umber", source: "Crayola" }],
      },
    },
    665850: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "666a5f": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    "6674ae": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "6683df": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "66cdaa": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Medium Aquamarine", source: "X11" },
          { name: "Medium Aquamarine", source: "W3C" },
        ],
      },
    },
    "66ff66": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Screamin' Green", source: "Crayola" }],
      },
    },
    673831: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Red Brown", source: "RAL", number: "8012" }],
      },
    },
    675141: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    676767: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Granite Gray", source: "Crayola" }],
      },
    },
    "677a8b": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "685d61": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    "68825b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Reseda Green", source: "RAL", number: "6011" }],
      },
    },
    "68b4de": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "67c591": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    691639: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Claret Violet", source: "RAL", number: "4004" }],
      },
    },
    694721: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "694b4e": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "69574a": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    696969: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dim Gray", source: "X11" },
          { name: "Dim Gray", source: "W3C" },
        ],
      },
    },
    "69c1cf": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "6a5acd": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Slate Blue", source: "X11" },
          { name: "Slate Blue", source: "W3C" },
        ],
      },
    },
    "6a93b0": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pastel Blue", source: "RAL", number: "5024" }],
      },
    },
    "6b3e52": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "6b3fa0": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Royal Purple", source: "Crayola" }],
      },
    },
    "6b485c": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "6b6880": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Blackberry", source: "RAL", number: "4012" }],
      },
    },
    "6b695f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Quartz Grey", source: "RAL", number: "7039" }],
      },
    },
    "6b6c2a": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "6b716f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mouse Grey", source: "RAL", number: "7005" }],
      },
    },
    "6b8e23": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Olive Drab", source: "X11" },
          { name: "Olive Drab", source: "W3C" },
        ],
      },
    },
    "6ba19d": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "6c7c98": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pigeon Blue", source: "RAL", number: "5014" }],
      },
    },
    "6ca67c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Medium Chrome Green", source: "Crayola" }],
      },
    },
    "6cdae7": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Turquoise Blue", source: "Crayola" }],
      },
    },
    "6d9bc3": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cerulean Frost", source: "Crayola" }],
      },
    },
    "6e0f2a": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "6e504a": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "6e5a70": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "6e6655": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "6e7283": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    "6e7870": {
      seasons: {
        bad: [{ season: "spring", seasonType: "bright" }],
      },
    },
    "6ea8ea": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "6eaea1": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Green Sheen", source: "Crayola" }],
      },
    },
    "6ebf44": {
      seasons: {
        bad: [{ season: "summer", seasonType: "soft" }],
      },
    },
    "6ec1fd": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "6ed469": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "6f2da8": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Grape", source: "Crayola" }],
      },
    },
    "6f4a2f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Fawn Brown", source: "RAL", number: "8007" }],
      },
    },
    "6f4f28": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Olive Brown", source: "RAL", number: "8008" }],
      },
    },
    "6f7385": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "7070cc": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Celestial Blue", source: "Crayola" }],
      },
    },
    "707a97": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "701f29": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Purple Red", source: "RAL", number: "3004" }],
      },
    },
    703731: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Oxide Red", source: "RAL", number: "3009" }],
      },
    },
    "70626d": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "70636d": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    708090: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Slate Gray", source: "X11" },
          { name: "Slate Gray", source: "W3C" },
        ],
      },
    },
    709987: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    710581: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    711521: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Ruby Red", source: "RAL", number: "3032" }],
      },
    },
    "71bbbb": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    722137: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "72b2e9": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "732e6c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Violet (I)", source: "Crayola" }],
      },
    },
    733380: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maximum Purple", source: "Crayola" }],
      },
    },
    736234: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "73666a": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    "736a5c": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    "736a62": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Charcoal Gray", source: "Crayola" }],
      },
    },
    738276: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Smoke", source: "Crayola" }],
      },
    },
    745970: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    746643: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Khaki Grey", source: "RAL", number: "7008" }],
      },
    },
    746964: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    "746b6f": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    "7475ad": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "75232e": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "755c49": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pale Brown", source: "RAL", number: "8025" }],
      },
    },
    "756f61": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Beige Grey", source: "RAL", number: "7006" }],
      },
    },
    757575: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sonic Silver", source: "Crayola" }],
      },
    },
    "763c28": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Copper", source: "RAL", number: "8029" }],
      },
    },
    765041: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    "7656b7": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "766a72": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    "766ec8": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Violet Blue", source: "Crayola" }],
      },
    },
    "76c268": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "76d7ea": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sky Blue, Fresh Air (magic)", source: "Crayola" }],
      },
    },
    772642: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    777869: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    "778ba5": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Shadow Blue", source: "Crayola" }],
      },
    },
    787874: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    778899: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Slate Gray", source: "X11" },
          { name: "Light Slate Gray", source: "W3C" },
        ],
      },
    },
    "77c6ee": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "783a51": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    786862: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    792841: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "79553c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Beige Brown", source: "RAL", number: "8024" }],
      },
    },
    "795eca": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "797c5a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Reed Green", source: "RAL", number: "6013" }],
      },
    },
    "798d71": {
      seasons: {
        bad: [{ season: "winter", seasonType: "bright" }],
      },
    },
    "79acd8": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "7a2d47": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "7a4b1f": {
      seasons: {
        bad: [{ season: "spring", seasonType: "bright" }],
      },
    },
    "7a634b": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    "7a749a": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "7a7675": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "m" }],
      },
    },
    "7a7b6d": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Moss Grey", source: "RAL", number: "7003" }],
      },
    },
    "7a89b8": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Wild Blue Yonder", source: "Crayola" }],
      },
    },
    "7a8f1a": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "7aabcf": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "7b5141": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Signal Brown", source: "RAL", number: "8002" }],
      },
    },
    "7b68ee": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Medium Slate Blue", source: "X11" },
          { name: "Medium Slate Blue", source: "W3C" },
        ],
      },
    },
    "7b7059": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    "7ba05b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Asparagus", source: "Crayola" }],
      },
    },
    "7bc4c4": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Aqua Sky", source: "Pantone", number: "14-4811" }],
      },
    },
    "7c74a9": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "7c7f7e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Dusty Grey", source: "RAL", number: "7037" }],
      },
    },
    "7cfc00": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Lawn Green", source: "X11" },
          { name: "Lawn Green", source: "W3C" },
        ],
      },
    },
    "7d2361": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "7d6662": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "7e1b38": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "7e292c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Brown Red", source: "RAL", number: "3011" }],
      },
    },
    "7e746f": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "7e8b92": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Squirrel Grey", source: "RAL", number: "7000" }],
      },
    },
    "7ed4e6": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Middle Blue", source: "Crayola" }],
      },
    },
    "7f3f79": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "7f5f9e": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "7f62a2": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "7f8281": {
      seasons: {
        bad: [{ season: "autumn", seasonType: "dark" }],
      },
    },
    "7f8480": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    "7fb0b2": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pastel Turquoise", source: "RAL", number: "6034" }],
      },
    },
    "7fff00": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Chartreuse", source: "X11" },
          { name: "Chartreuse", source: "W3C" },
        ],
      },
    },
    "7fffd4": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Aquamarine", source: "X11" },
          { name: "Aquamarine", source: "W3C" },
        ],
      },
    },
    800000: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Web Maroon", source: "X11" },
          { name: "Maroon", source: "W3C" },
        ],
      },
    },
    800080: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Web Purple", source: "X11" },
          { name: "Purple", source: "W3C" },
        ],
      },
    },
    803790: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Vivid Violet", source: "Crayola" }],
      },
    },
    "80504c": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    "80542f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Clay Brown", source: "RAL", number: "8003" }],
      },
    },
    805533: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Burnt Umber", source: "Crayola" }],
      },
    },
    808000: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Olive", source: "X11" },
          { name: "Olive", source: "W3C" },
        ],
      },
    },
    808080: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Web Gray", source: "X11" },
          { name: "Gray", source: "W3C" },
        ],
      },
    },
    808378: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    "817d8a": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    "817f68": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Olive Grey", source: "RAL", number: "7002" }],
      },
    },
    818479: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Concrete Grey", source: "RAL", number: "7023" }],
      },
    },
    818979: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cement Grey", source: "RAL", number: "7033" }],
      },
    },
    "81c0bb": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Light Green", source: "RAL", number: "6027" }],
      },
    },
    "81c1b1": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "81d7ca": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "82564f": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    828282: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Dark Grey", source: "RAL", number: "9023" }],
      },
    },
    "82898e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Telegrey 2", source: "RAL", number: "7046" }],
      },
    },
    "828b7e": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    "828e84": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mummy's Tomb", source: "Crayola" }],
      },
    },
    "832a0d": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Smokey Topaz", source: "Crayola" }],
      },
    },
    "8359a3": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Violet (II)", source: "Crayola" }],
      },
    },
    "83639d": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue Lilac", source: "RAL", number: "4005" }],
      },
    },
    837050: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Shadow", source: "Crayola" }],
      },
    },
    "83767f": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "83deeb": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "84aa6c": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "84726f": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "84b8ce": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "84de02": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Alien Armpit", source: "Crayola" }],
      },
    },
    "85754e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Gold Fusion", source: "Crayola" }],
      },
    },
    "85776c": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    858982: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    "85b6c2": {
      seasons: {
        bad: [{ season: "winter", seasonType: "bright" }],
      },
    },
    864421: {
      seasons: {
        bad: [{ season: "spring", seasonType: "light" }],
      },
    },
    "865c35": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "m" }],
      },
    },
    868082: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    "888a93": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    "86a47c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pale Green", source: "RAL", number: "6021" }],
      },
    },
    "86baf6": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "87325d": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    873256: {
      seasons: {
        bad: [{ season: "spring", seasonType: "true" }],
      },
    },
    "87335e": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "87421f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Fuzzy Wuzzy", source: "Crayola" }],
      },
    },
    "876f50": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    "8773a1": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Violet", source: "RAL", number: "4011" }],
      },
    },
    "877f42": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    877983: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    "87ceeb": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Sky Blue", source: "X11" },
          { name: "Sky Blue", source: "W3C" },
        ],
      },
    },
    "87cefa": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Sky Blue", source: "X11" },
          { name: "Light Sky Blue", source: "W3C" },
        ],
      },
    },
    "87ff2a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Spring Frost", source: "Crayola" }],
      },
    },
    887142: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Green Brown", source: "RAL", number: "8000" }],
      },
    },
    888175: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Mouse Grey", source: "RAL", number: "7048" }],
      },
    },
    "8896d3": {
      seasons: {
        good: [
          { season: "summer", seasonType: "light", colorType: "ca" },
          { season: "summer", seasonType: "true", colorType: "ca" },
        ],
      },
    },
    "88b04b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Greenery", source: "Pantone", number: "15-0343" }],
      },
    },
    "88b3a1": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "8a2861": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "8a2be2": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Blue Violet", source: "X11" },
          { name: "Blue Violet", source: "W3C" },
        ],
      },
    },
    "8a496b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Twilight Lavender", source: "Crayola" }],
      },
    },
    "8a5a83": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Red Lilac", source: "RAL", number: "4001" }],
      },
    },
    "8a8d5b": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "8aa6e5": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "8ab152": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "8b0000": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Red", source: "X11" },
          { name: "Dark Red", source: "W3C" },
        ],
      },
    },
    "8b008b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Magenta", source: "X11" },
          { name: "Dark Magenta", source: "W3C" },
        ],
      },
    },
    "8b4513": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Saddle Brown", source: "X11" },
          { name: "Saddle Brown", source: "W3C" },
        ],
      },
    },
    "8b72be": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Middle Blue Purple", source: "Crayola" }],
      },
    },
    "8b8680": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Gray", source: "Crayola" }],
      },
    },
    "8b9bb3": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    "8ba8b7": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pewter Blue", source: "Crayola" }],
      },
    },
    "8bd7fb": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "8c421f": {
      seasons: {
        bad: [{ season: "winter", seasonType: "dark" }],
      },
    },
    "8c6b5c": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    "8c90c8": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cobalt Blue", source: "Crayola" }],
      },
    },
    "8c9581": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "8cc73e": {
      seasons: {
        bad: [{ season: "autumn", seasonType: "soft" }],
      },
    },
    "8cc7b3": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "8d1d2c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Ruby Red", source: "RAL", number: "3003" }],
      },
    },
    "8d2358": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    "8d4e85": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Razzmic Berry", source: "Crayola" }],
      },
    },
    "8d7c63": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    "8d877b": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    "8d8d78": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "8d90a1": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Manatee", source: "Crayola" }],
      },
    },
    "8d96c4": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "8d9e61": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "8dd9cc": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Middle Blue Green", source: "Crayola" }],
      },
    },
    "8e3179": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Plum", source: "Crayola" }],
      },
    },
    "8e3f1e": {
      seasons: {
        bad: [{ season: "summer", seasonType: "light" }],
      },
    },
    "8e6ebf": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "8e7380": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    "8e8e85": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "8e98c6": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    "8f47b3": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Medium Violet", source: "Crayola" }],
      },
    },
    "8f4e35": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Copper Brown", source: "RAL", number: "8004" }],
      },
    },
    "8f674f": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    "8f742c": {
      seasons: {
        bad: [{ season: "summer", seasonType: "light" }],
      },
    },
    "8f8f8f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Grey Aluminum", source: "RAL", number: "9007" }],
      },
    },
    "8f9695": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Traffic Grey A", source: "RAL", number: "7042" }],
      },
    },
    "8f999f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Silver Grey", source: "RAL", number: "7001" }],
      },
    },
    "8fbc8f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Sea Green", source: "X11" },
          { name: "Dark Sea Green", source: "W3C" },
        ],
      },
    },
    "8fd400": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sheen Green", source: "Crayola" }],
      },
    },
    "8fd8d8": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Light Blue", source: "Crayola" }],
      },
    },
    "90466e": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    904684: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Signal Violet", source: "RAL", number: "4008" }],
      },
    },
    907969: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    908832: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "90877e": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "90c8dd": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    "90ee90": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Green", source: "X11" },
          { name: "Light Green", source: "W3C" },
        ],
      },
    },
    914020: {
      seasons: {
        bad: [{ season: "summer", seasonType: "true" }],
      },
    },
    "914e75": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sugar Plum", source: "Crayola" }],
      },
    },
    "9159a7": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    "918aed": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "91969a": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Telegrey 1", source: "RAL", number: "7045" }],
      },
    },
    921432: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "92543a": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "926f5b": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Beaver", source: "Crayola" }],
      },
    },
    927549: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Gold", source: "RAL", number: "1036" }],
      },
    },
    "92926e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Gold (I)", source: "Crayola" }],
      },
    },
    "9294a0": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    "92a8d1": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Serenity", source: "Pantone", number: "15-3913" }],
      },
    },
    "92c4ca": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "92c8e7": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "92c8f6": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    933709: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Citrine", source: "Crayola" }],
      },
    },
    "933d50": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Red Violet", source: "RAL", number: "4002" }],
      },
    },
    "9370db": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Medium Purple", source: "X11" },
          { name: "Medium Purple", source: "W3C" },
        ],
      },
    },
    939176: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Yellow Grey", source: "RAL", number: "7034" }],
      },
    },
    939388: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Stone Grey", source: "RAL", number: "7030" }],
      },
    },
    "93ccea": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cornflower", source: "Crayola" }],
      },
    },
    "93dfb8": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sea Green", source: "Crayola" }],
      },
    },
    "9400d3": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Violet", source: "X11" },
          { name: "Dark Violet", source: "W3C" },
        ],
      },
    },
    "941e43": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "948e80": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "m" }],
      },
    },
    "948e88": {
      seasons: {
        good: [
          { season: "winter", seasonType: "dark", colorType: "m" },
          { season: "winter", seasonType: "true", colorType: "m" },
          { season: "winter", seasonType: "bright", colorType: "m" },
        ],
      },
    },
    949599: {
      seasons: {
        bad: [{ season: "spring", seasonType: "true" }],
      },
    },
    "95334c": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    954527: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Orange", source: "RAL", number: "2013" }],
      },
    },
    955251: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Marsala", source: "Pantone", number: "18-1438" }],
      },
    },
    "95e0e8": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Aquamarine", source: "Crayola" }],
      },
    },
    "96928c": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    972947: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    976235: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "9782b5": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    "9799a2": {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    "979e36": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "98bbff": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "98fb98": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Pale Green", source: "X11" },
          { name: "Pale Green", source: "W3C" },
        ],
      },
    },
    992572: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Traffic Purple", source: "RAL", number: "4006" }],
      },
    },
    "9932cc": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Orchid", source: "X11" },
          { name: "Dark Orchid", source: "W3C" },
        ],
      },
    },
    "99454c": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    998170: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "99858e": {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    "998b8a": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    "9999cc": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue Bell", source: "Crayola" }],
      },
    },
    "99cf1c": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "9a2853": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    "9a7048": {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "m" }],
      },
    },
    "9a8043": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "m" }],
      },
    },
    "9a908a": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    "9a9464": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Olive Yellow", source: "RAL", number: "1020" }],
      },
    },
    "9a9697": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Platinum Grey", source: "RAL", number: "7036" }],
      },
    },
    "9a9aa6": {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    "9aba22": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    "9acd32": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Yellow Green", source: "X11" },
          { name: "Yellow Green", source: "W3C" },
        ],
      },
    },
    "9b1b30": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Chili Pepper", source: "Pantone", number: "19-1557" }],
      },
    },
    "9b5743": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "m" }],
      },
    },
    "9b7653": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Dirt", source: "Crayola" }],
      },
    },
    "9b92c5": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "9baeb6": {
      seasons: {
        bad: [{ season: "spring", seasonType: "bright" }],
      },
    },
    "9bb7d4": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cerulean", source: "Pantone", number: "15-4020" }],
      },
    },
    "9c2542": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Big Dip o' Ruby", source: "Crayola" }],
      },
    },
    "9c322e": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Tomato Red", source: "RAL", number: "3013" }],
      },
    },
    "9c51b6": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Purple Plum", source: "Crayola" }],
      },
    },
    "9c6b30": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Ochre Brown", source: "RAL", number: "8001" }],
      },
    },
    "9c7c38": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Metallic Sunburst", source: "Crayola" }],
      },
    },
    "9c959e": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    "9c9c9c": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Light Grey", source: "RAL", number: "9022" }],
      },
    },
    "9caed7": {
      seasons: {
        bad: [{ season: "autumn", seasonType: "true" }],
      },
    },
    "9cdd8f": {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    "9cefd5": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    "9d6961": {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    "9da3a6": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Window Grey", source: "RAL", number: "7040" }],
      },
    },
    "9db0b6": {
      seasons: {
        bad: [{ season: "autumn", seasonType: "dark" }],
      },
    },
    "9de093": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Granny Smith Apple", source: "Crayola" }],
      },
    },
    "9e2c64": {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    "9e5135": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "m" }],
      },
    },
    "9e5b40": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sepia", source: "Crayola" }],
      },
    },
    "9e5e6f": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Rose Dust", source: "Crayola" }],
      },
    },
    "9e7e75": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    "9e8b84": {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    "9ea0a1": {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Signal Grey", source: "RAL", number: "7004" }],
      },
    },
    "9ea2a0": {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    "9ebd52": {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    "9f3936": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "9f4985": {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    "9f6947": {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    "9f6b7e": {
      seasons: {
        bad: [{ season: "autumn", seasonType: "dark" }],
      },
    },
    "9f8f88": {
      seasons: {
        bad: [{ season: "spring", seasonType: "true" }],
      },
    },
    a020f0: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Purple", source: "X11" }],
      },
    },
    a02128: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Signal Red", source: "RAL", number: "3001" }],
      },
    },
    a0522d: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Sienna", source: "X11" },
          { name: "Sienna", source: "W3C" },
        ],
      },
    },
    a08172: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    a0979b: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    a0c7c2: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    a0e6ff: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Winter Wizard", source: "Crayola" }],
      },
    },
    a1232b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Carmine Red", source: "RAL", number: "3002" }],
      },
    },
    a12d44: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    a14849: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    a17763: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    a17a74: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Burnished Brown", source: "Crayola" }],
      },
    },
    a18dd4: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    a1988f: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    a1defc: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    a23725: {
      seasons: {
        bad: [{ season: "winter", seasonType: "bright" }],
      },
    },
    a23976: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    a27546: {
      seasons: {
        bad: [{ season: "winter", seasonType: "true" }],
      },
    },
    a29985: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Beige", source: "RAL", number: "1035" }],
      },
    },
    a29d37: {
      seasons: {
        bad: [{ season: "winter", seasonType: "true" }],
      },
    },
    a2b4c6: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    a2e2e0: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    a35625: {
      seasons: {
        bad: [{ season: "winter", seasonType: "bright" }],
      },
    },
    a381cd: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    a38995: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pastel Violet", source: "RAL", number: "4009" }],
      },
    },
    a38c15: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Curry", source: "RAL", number: "1027" }],
      },
    },
    a3a091: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    a4957d: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Grey Beige", source: "RAL", number: "1019" }],
      },
    },
    a4acbf: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    a50b5e: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Jazzberry Jam", source: "Crayola" }],
      },
    },
    a52a2a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Brown", source: "X11" },
          { name: "Brown", source: "W3C" },
        ],
      },
    },
    a5306f: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    a55325: {
      seasons: {
        bad: [{ season: "winter", seasonType: "true" }],
      },
    },
    a55353: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Middle Red Purple", source: "Crayola" }],
      },
    },
    a55624: {
      seasons: {
        bad: [{ season: "summer", seasonType: "true" }],
      },
    },
    a57164: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blast Off Bronze", source: "Crayola" }],
      },
    },
    a5a5a5: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "White Aluminum", source: "RAL", number: "9006" }],
      },
    },
    a63a79: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maximum Red Purple", source: "Crayola" }],
      },
    },
    a63b50: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    a65e2f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Orange Brown", source: "RAL", number: "8023" }],
      },
    },
    a6a6a6: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Quick Silver", source: "Crayola" }],
      },
    },
    a6a992: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    a6e7ff: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Fresh Air (fragrance)", source: "Crayola" }],
      },
    },
    a7c9e1: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    a7f432: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Green Lizard", source: "Crayola" }],
      },
    },
    a82853: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    a83731: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sweet Brown", source: "Crayola" }],
      },
    },
    a85c58: {
      seasons: {
        bad: [{ season: "winter", seasonType: "true" }],
      },
    },
    a8a9ad: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "true" }],
      },
    },
    a8ab9d: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    a90c3d: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    a99890: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    a9a9a9: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Gray", source: "X11" },
          { name: "Dark Gray", source: "W3C" },
        ],
      },
    },
    a9b2c3: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cadet Blue", source: "Crayola" }],
      },
    },
    a9b5f1: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    a9c8af: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    aa2a49: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    aa2c3b: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    aa4069: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Ruby", source: "Crayola" }],
      },
    },
    aa8f7c: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    aaaf86: {
      seasons: {
        bad: [{ season: "winter", seasonType: "true" }],
      },
    },
    aacdc7: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    aaf0d1: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Magic Mint", source: "Crayola" }],
      },
    },
    ab2524: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Flame Red", source: "RAL", number: "3000" }],
      },
    },
    ab7e1c: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "m" }],
      },
    },
    ab92b3: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Glossy Grape", source: "Crayola" }],
      },
    },
    ab9c9f: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    abad48: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Peridot", source: "Crayola" }],
      },
    },
    ac323b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Orient Red", source: "RAL", number: "3031" }],
      },
    },
    ac4034: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Coral Red", source: "RAL", number: "3016" }],
      },
    },
    ac994d: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "m" }],
      },
    },
    aca3a2: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    aca4a0: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    acaabf: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    acace6: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maximum Blue Purple", source: "Crayola" }],
      },
    },
    acbf60: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Middle Green Yellow", source: "Crayola" }],
      },
    },
    ad3a78: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    ad4379: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mystic Maroon", source: "Crayola" }],
      },
    },
    ad6f69: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Copper Penny", source: "Crayola" }],
      },
    },
    adacab: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    add8e6: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Blue", source: "X11" },
          { name: "Light Blue", source: "W3C" },
        ],
      },
    },
    ade0ff: {
      seasons: {
        bad: [{ season: "winter", seasonType: "true" }],
      },
    },
    adff2f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Green Yellow", source: "X11" },
          { name: "Green Yellow", source: "W3C" },
        ],
      },
    },
    ae4881: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    ae98aa: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lilac Luster", source: "Crayola" }],
      },
    },
    aeb2c5: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    aeeff4: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    af2d3f: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    af3d68: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    af585e: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    af593e: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Brown, Pet Shop", source: "Crayola" }],
      },
    },
    af6e4d: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Brown Sugar", source: "Crayola" }],
      },
    },
    af7fb1: {
      seasons: {
        bad: [{ season: "spring", seasonType: "true" }],
      },
    },
    af8a54: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Brown Beige", source: "RAL", number: "1011" }],
      },
    },
    afe313: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Inchworm", source: "Crayola" }],
      },
    },
    afeeee: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Pale Turquoise", source: "X11" },
          { name: "Pale Turquoise", source: "W3C" },
        ],
      },
    },
    b03060: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maroon", source: "X11" }],
      },
    },
    b03558: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    b05c52: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Giant's Club", source: "Crayola" }],
      },
    },
    b07080: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pink Pearl", source: "Crayola" }],
      },
    },
    b0a6a4: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    b0c4de: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Steel Blue", source: "X11" },
          { name: "Light Steel Blue", source: "W3C" },
        ],
      },
    },
    b0e0e6: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Powder Blue", source: "X11" },
          { name: "Powder Blue", source: "W3C" },
        ],
      },
    },
    b163a3: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Radiant Orchid", source: "Pantone", number: "18-3224" },
        ],
      },
    },
    b22222: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Firebrick", source: "X11" },
          { name: "Firebrick", source: "W3C" },
        ],
      },
    },
    b24c43: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearl Pink", source: "RAL", number: "3033" }],
      },
    },
    b26549: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "m" }],
      },
    },
    b28968: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    b2b0ba: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "m" }],
      },
    },
    b2f302: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lime", source: "Crayola" }],
      },
    },
    b33b24: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Dark Venetian Red", source: "Crayola" }],
      },
    },
    b3615e: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    b3ae6d: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    b42041: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Raspberry Red", source: "RAL", number: "3027" }],
      },
    },
    b4264c: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    b4af96: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    b4b8b0: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Agate Grey", source: "RAL", number: "7038" }],
      },
    },
    b56120: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "m" }],
      },
    },
    b56917: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Tiger's Eye", source: "Crayola" }],
      },
    },
    b57a65: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    b5b35c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Olive Green", source: "Crayola" }],
      },
    },
    b5bbd2: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    b6a06f: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    b71b93: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    b75839: {
      seasons: {
        bad: [{ season: "spring", seasonType: "bright" }],
      },
    },
    b76828: {
      seasons: {
        bad: [{ season: "winter", seasonType: "dark" }],
      },
    },
    b768a2: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pearly Purple", source: "Crayola" }],
      },
    },
    b7d9b1: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pastel Green", source: "RAL", number: "6019" }],
      },
    },
    b7b6bf: {
      seasons: {
        good: [
          { season: "spring", seasonType: "bright", colorType: "m" },
          { season: "spring", seasonType: "light", colorType: "m" },
          { season: "summer", seasonType: "light", colorType: "m" },
          { season: "summer", seasonType: "true", colorType: "m" },
          { season: "summer", seasonType: "soft", colorType: "m" },
        ],
      },
    },
    b88f4c: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    b8860b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Goldenrod", source: "X11" },
          { name: "Dark Goldenrod", source: "W3C" },
        ],
      },
    },
    b89c50: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Ochre Yellow", source: "RAL", number: "1024" }],
      },
    },
    b8b290: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    b8b5be: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    b8dcf1: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "true" }],
      },
    },
    b94e48: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Indian Red", source: "Crayola" }],
      },
    },
    b9b9a8: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pebble Grey", source: "RAL", number: "7032" }],
      },
    },
    ba55d3: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Medium Orchid", source: "X11" },
          { name: "Medium Orchid", source: "W3C" },
        ],
      },
    },
    bab3a1: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    bab6ff: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    bad3e1: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    bb3385: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Red Violet", source: "Crayola" }],
      },
    },
    bba6af: {
      seasons: {
        bad: [{ season: "spring", seasonType: "bright" }],
      },
    },
    bbb477: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Misty Moss", source: "Crayola" }],
      },
    },
    bc6049: {
      seasons: {
        bad: [{ season: "winter", seasonType: "bright" }],
      },
    },
    bc8f8f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Rosy Brown", source: "X11" },
          { name: "Rosy Brown", source: "W3C" },
        ],
      },
    },
    bc9781: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    bc9e66: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    bca7b0: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "dark" }],
      },
    },
    bcaba1: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    bcbeb0: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    bcbeca: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    bcbfbe: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    bd4c6a: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    bd559c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Rose Quartz", source: "Crayola" }],
      },
    },
    bd5928: {
      seasons: {
        bad: [{ season: "winter", seasonType: "dark" }],
      },
    },
    bd8260: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Chocolate", source: "Crayola" }],
      },
    },
    bd8492: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    bdb76b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Khaki", source: "X11" },
          { name: "Dark Khaki", source: "W3C" },
        ],
      },
    },
    bdbdb2: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Silk Grey", source: "RAL", number: "7044" }],
      },
    },
    be4e20: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Red Orange", source: "RAL", number: "2001" }],
      },
    },
    be5376: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    beb5a6: {
      seasons: {
        good: [
          { season: "spring", seasonType: "bright", colorType: "m" },
          { season: "spring", seasonType: "light", colorType: "m" },
          { season: "summer", seasonType: "light", colorType: "m" },
          { season: "summer", seasonType: "true", colorType: "m" },
          { season: "autumn", seasonType: "soft", colorType: "m" },
        ],
      },
    },
    bebebe: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Gray", source: "X11" }],
      },
    },
    bee493: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    bee64b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Light Chrome Green", source: "Crayola" }],
      },
    },
    bf1932: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "True Red", source: "Pantone", number: "19-1664" }],
      },
    },
    bf2261: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    bf4f51: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Bittersweet Shimmer", source: "Crayola" }],
      },
    },
    bf8fcc: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lavender (I)", source: "Crayola" }],
      },
    },
    bf9b30: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "m" }],
      },
    },
    bfa1b2: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    bfa5a2: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    bfafb2: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Black Shadows", source: "Crayola" }],
      },
    },
    bfc9ea: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    c06068: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    c07a9b: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    c0ad61: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "m" }],
      },
    },
    c0b6b6: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    c0b6bf: {
      seasons: {
        bad: [{ season: "winter", seasonType: "bright" }],
      },
    },
    c0b7b7: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    c0c0c0: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Silver", source: "X11" },
          { name: "Silver", source: "W3C" },
        ],
      },
      seasons: {
        good: [
          { season: "winter", seasonType: "dark", colorType: "m" },
          { season: "winter", seasonType: "true", colorType: "m" },
          { season: "winter", seasonType: "bright", colorType: "m" },
        ],
      },
    },
    c00851: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    c1121c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Traffic Red", source: "RAL", number: "3020" }],
      },
    },
    c154c1: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Fuchsia", source: "Crayola" }],
      },
    },
    c28eaf: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    c1a02e: {
      seasons: {
        bad: [{ season: "summer", seasonType: "soft" }],
      },
    },
    c1a050: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "m" }],
      },
    },
    c1b9b7: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    c1d55c: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    c25041: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    c32148: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maroon", source: "Crayola" }],
      },
    },
    c33434: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    c36860: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    c39953: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Aztec Gold", source: "Crayola" }],
      },
    },
    c3bab6: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    c3c3cb: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    c3cde6: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Periwinkle", source: "Crayola" }],
      },
    },
    c3f0ff: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    c40568: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    c46210: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Alloy Orange", source: "Crayola" }],
      },
    },
    c4c1bb: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    c4c2bc: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    c4c4ca: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    c4e8c6: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    c50023: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    c53151: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Dingy Dungeon", source: "Crayola" }],
      },
    },
    c5e17a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Yellow Green", source: "Crayola" }],
      },
    },
    c62d42: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Brick Red, Earthworm", source: "Crayola" }],
      },
    },
    c63678: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Telemagenta", source: "RAL", number: "4010" }],
      },
    },
    c63927: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Vermillion", source: "RAL", number: "2002" }],
      },
    },
    c6c2c5: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    c6ddd3: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    c71585: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Medium Violet Red", source: "X11" },
          { name: "Medium Violet Red", source: "W3C" },
        ],
      },
    },
    c74375: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Fuchsia Rose", source: "Pantone", number: "17-2031" }],
      },
    },
    c74dc6: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    c77195: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    c7b9b5: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    c8274d: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    c8509b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mulberry", source: "Crayola" }],
      },
    },
    c8824f: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    c88a65: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Antique Brass", source: "Crayola" }],
      },
    },
    c89f04: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Honey Yellow", source: "RAL", number: "1005" }],
      },
    },
    c8a788: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    c8c8cd: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blue Gray", source: "Crayola" }],
      },
    },
    c8d77f: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    c95a49: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cedar Chest", source: "Crayola" }],
      },
    },
    c975a6: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    c97533: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "m" }],
      },
    },
    c9865d: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    c9a0dc: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Wisteria, Flower Shop", source: "Crayola" }],
      },
    },
    c9ab7d: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    c9c0bb: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Silver", source: "Crayola" }],
      },
    },
    c9c1ac: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    ca3435: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mahogany", source: "Crayola" }],
      },
    },
    cb3e28: {
      seasons: {
        bad: [{ season: "summer", seasonType: "true" }],
      },
    },
    cb7f38: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    cb8d73: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Beige Red", source: "RAL", number: "3012" }],
      },
    },
    cbd0cc: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Light Grey", source: "RAL", number: "7035" }],
      },
    },
    cc3336: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Madder Lake", source: "Crayola" }],
      },
    },
    cc474b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "English Vermilion", source: "Crayola" }],
      },
    },
    cc5500: {
      seasons: {
        bad: [{ season: "spring", seasonType: "light" }],
      },
    },
    cc553d: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Venetian Red", source: "Crayola" }],
      },
    },
    cc9901: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "m" }],
      },
    },
    ccc58f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Green Beige", source: "RAL", number: "1000" }],
      },
    },
    ccc9df: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    ccccd4: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    ccff00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Electric Lime", source: "Crayola" }],
      },
    },
    cd1241: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    cd5c5c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Indian Red", source: "X11" },
          { name: "Indian Red", source: "W3C" },
        ],
      },
    },
    cd607e: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cinnamon Satin", source: "Crayola" }],
      },
    },
    cd853f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Peru", source: "X11" },
          { name: "Peru", source: "W3C" },
        ],
      },
    },
    cdac5e: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    cdc5ba: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    cdcaba: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    cdccd5: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    ce3a83: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    ce3f2c: {
      seasons: {
        bad: [{ season: "summer", seasonType: "light" }],
      },
    },
    ce446c: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    ce897b: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "m" }],
      },
    },
    cec8ef: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Soap", source: "Crayola" }],
      },
    },
    cecacb: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    ceccff: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    cfb4a5: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    cfd0cf: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Telegrey 4", source: "RAL", number: "7047" }],
      },
    },
    d0504b: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    d0528a: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    d05340: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Jasper", source: "Crayola" }],
      },
    },
    d093a1: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    d0cdec: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    d14152: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Strawberry Red", source: "RAL", number: "3018" }],
      },
    },
    d15b8f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Heather Violet", source: "RAL", number: "4003" }],
      },
    },
    d1942e: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    d1b58a: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    d1bc8a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Beige", source: "RAL", number: "1001" }],
      },
    },
    d2457c: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    d2589e: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    d2691e: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Chocolate", source: "X11" },
          { name: "Chocolate", source: "W3C" },
        ],
      },
    },
    d26c81: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    d27d46: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Raw Sienna", source: "Crayola" }],
      },
    },
    d29c54: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    d2b48c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Tan", source: "X11" },
          { name: "Tan", source: "W3C" },
        ],
      },
    },
    d2b773: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sand Yellow", source: "RAL", number: "1002" }],
      },
    },
    d2c4bb: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    d2e9c5: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "true" }],
      },
    },
    d3545f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Rose", source: "RAL", number: "3017" }],
      },
    },
    d3cac8: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    d3d3d3: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Gray", source: "X11" },
          { name: "Light Gray", source: "W3C" },
        ],
      },
    },
    d41f4f: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    d4652f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Signal Orange", source: "RAL", number: "2010" }],
      },
    },
    d47479: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Antique Pink", source: "RAL", number: "3014" }],
      },
    },
    d4cd8b: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    d4d9ff: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    d5435a: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    d56d56: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Salmon Pink", source: "RAL", number: "3022" }],
      },
    },
    d5b493: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    d5cabd: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    d5d0cd: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    d60017: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    d61b47: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    d6506f: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    d6a174: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    d6aedd: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Purple Mountains' Majesty", source: "Crayola" }],
      },
    },
    d6caca: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    d6d692: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    d6df29: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "soft" }],
      },
    },
    d7496e: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    d7824a: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    d7a637: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    d7bd9e: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    d7cba6: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    d7d3a2: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    d7d7d7: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Papyrus White", source: "RAL", number: "9018" }],
      },
    },
    d8608b: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    d87a83: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    d8a0bd: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    d8b084: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    d8bfd8: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Thistle", source: "X11" },
          { name: "Thistle", source: "W3C" },
        ],
      },
    },
    d8c789: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    d8ced6: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    d9004e: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    d92121: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maximum Red", source: "Crayola" }],
      },
    },
    d94f70: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Honeysuckle", source: "Pantone", number: "18-2120" }],
      },
    },
    d96982: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    d96cbe: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Medium Rose", source: "Crayola" }],
      },
    },
    d982b5: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Middle Purple", source: "Crayola" }],
      },
    },
    d98695: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Shimmering Blush", source: "Crayola" }],
      },
    },
    d99a6c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Tan", source: "Crayola" }],
      },
    },
    d9a328: {
      seasons: {
        bad: [{ season: "summer", seasonType: "true" }],
      },
    },
    d9b42a: {
      seasons: {
        bad: [{ season: "winter", seasonType: "true" }],
      },
    },
    d9ba5f: {
      seasons: {
        good: [
          { season: "spring", seasonType: "bright", colorType: "m" },
          { season: "spring", seasonType: "light", colorType: "m" },
        ],
      },
    },
    d9c022: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lemon Yellow", source: "RAL", number: "1012" }],
      },
    },
    d9d4da: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "fn" }],
      },
    },
    d9d6cf: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Timberwolf", source: "Crayola" }],
      },
    },
    d9e650: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maximum Green Yellow", source: "Crayola" }],
      },
    },
    da0c61: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    da2647: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cherry", source: "Crayola" }],
      },
    },
    da2c43: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Rusty Red", source: "Crayola" }],
      },
    },
    da3287: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cerise", source: "Crayola" }],
      },
    },
    da5e43: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    da614e: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Jelly Bean", source: "Crayola" }],
      },
    },
    da70d6: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Orchid", source: "X11" },
          { name: "Orchid", source: "W3C" },
        ],
      },
    },
    da8a67: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Copper", source: "Crayola" }],
      },
    },
    daa520: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Goldenrod", source: "X11" },
          { name: "Goldenrod", source: "W3C" },
        ],
      },
    },
    db5079: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Blush", source: "Crayola" }],
      },
    },
    db6a50: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Salmon Orange", source: "RAL", number: "2012" }],
      },
    },
    db7093: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Pale Violet Red", source: "X11" },
          { name: "Pale Violet Red", source: "W3C" },
        ],
      },
    },
    db91ef: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lilac", source: "Crayola" }],
      },
    },
    dbc2df: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "true" }],
      },
    },
    dbd5d8: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    dbdce7: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    dc143c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Crimson", source: "X11" },
          { name: "Crimson", source: "W3C" },
        ],
      },
    },
    dc1f2b: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    dc5f4c: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    dc6f9c: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    dcb26b: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    dcce8d: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    dcdcdc: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Gainsboro", source: "X11" },
          { name: "Gainsboro", source: "W3C" },
        ],
      },
    },
    dd1a38: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    dd3585: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    dd4124: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Tangerine Tango", source: "Pantone", number: "17-1463" },
        ],
      },
    },
    dd4760: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    dd7907: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Yellow Orange", source: "RAL", number: "2000" }],
      },
    },
    dd7e89: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    dd937d: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    dd9925: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    dda0dd: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Plum", source: "X11" },
          { name: "Plum", source: "W3C" },
        ],
      },
    },
    ddb20f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Broom Yellow", source: "RAL", number: "1032" }],
      },
    },
    ddd5ae: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    dde26a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Booger Buster", source: "Crayola" }],
      },
    },
    de0c4e: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    de3b78: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    de9fbc: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    dea681: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Tumbleweed", source: "Crayola" }],
      },
    },
    deb887: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Burlywood", source: "X11" },
          { name: "Burlywood", source: "W3C" },
        ],
      },
    },
    decdbe: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sand Dollar", source: "Pantone", number: "13-1106" }],
      },
    },
    df3c5f: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    dfc39d: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    dfcea1: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Ivory", source: "RAL", number: "1014" }],
      },
    },
    dfdacd: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    e04a1a: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    e07a86: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    e0809c: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    e0c58e: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    e0c98c: {
      seasons: {
        bad: [{ season: "winter", seasonType: "dark" }],
      },
    },
    e0d4c7: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    e0e0d5: {
      seasons: {
        good: [
          { season: "spring", seasonType: "bright", colorType: "m" },
          { season: "spring", seasonType: "true", colorType: "m" },
          { season: "spring", seasonType: "light", colorType: "m" },
          { season: "summer", seasonType: "light", colorType: "m" },
          { season: "summer", seasonType: "true", colorType: "m" },
          { season: "summer", seasonType: "soft", colorType: "m" },
          { season: "autumn", seasonType: "soft", colorType: "m" },
        ],
      },
    },
    e0ffff: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Cyan", source: "X11" },
          { name: "Light Cyan", source: "W3C" },
        ],
      },
    },
    e12c2c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Permanent Geranium Lake", source: "Crayola" }],
      },
    },
    e15501: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Traffic Orange", source: "RAL", number: "2009" }],
      },
    },
    e16069: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    e1a100: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maize Yellow", source: "RAL", number: "1006" }],
      },
    },
    e1a6ad: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Light Pink", source: "RAL", number: "3015" }],
      },
    },
    e29cd2: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Orchid", source: "Crayola" }],
      },
    },
    e2cfc3: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    e2d2cd: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    e22739: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    e2583e: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Tigerlily", source: "Pantone", number: "17-1456" }],
      },
    },
    e25e77: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    e2b007: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Golden Yellow", source: "RAL", number: "1004" }],
      },
    },
    e2c791: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    e30b5c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Razzmatazz", source: "Crayola" }],
      },
    },
    e397c9: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    e3c665: {
      seasons: {
        bad: [{ season: "winter", seasonType: "dark" }],
      },
    },
    e3cc5f: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    e3dce1: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    e3e6ed: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    e43e4c: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    e44762: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    e4b877: {
      seasons: {
        bad: [{ season: "winter", seasonType: "dark" }],
      },
    },
    e4d7a9: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    e58e73: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Middle Red", source: "Crayola" }],
      },
    },
    e5a5b5: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    e5c5d5: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    e74263: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    e62e6b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Carmine", source: "Crayola" }],
      },
    },
    e64d74: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    e65574: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    e667ce: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Brilliant Rose", source: "Crayola" }],
      },
    },
    e6717d: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    e6735c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Light Venetian Red", source: "Crayola" }],
      },
    },
    e675b5: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    e68484: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    e6a68f: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    e6bc5c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Raw Sienna (I)", source: "Crayola" }],
      },
    },
    e6bd7a: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    e6be8a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Gold (II)", source: "Crayola" }],
      },
    },
    e6c05a: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    e6c870: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    e6e2e2: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "fn" }],
      },
    },
    e6e6fa: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Lavender", source: "X11" },
          { name: "Lavender", source: "W3C" },
        ],
      },
    },
    e72512: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pure Red", source: "RAL", number: "3028" }],
      },
    },
    e75b12: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pure Orange", source: "RAL", number: "2004" }],
      },
    },
    e77200: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mango Tango", source: "Crayola" }],
      },
    },
    e78485: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    e792b8: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    e79c00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Daffodil Yellow", source: "RAL", number: "1007" }],
      },
    },
    e7ebda: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Grey White", source: "RAL", number: "9002" }],
      },
    },
    e859ae: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    e88e5a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Big Foot Feet", source: "Crayola" }],
      },
    },
    e8afb7: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    e8c36e: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    e8c96e: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "m" }],
      },
    },
    e8d5d6: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    e8d77f: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    e8e4a3: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    e84063: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    e936a7: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Frostbite", source: "Crayola" }],
      },
    },
    e95840: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    e96364: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    e97451: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Burnt Sienna, Baseball Mitt", source: "Crayola" }],
      },
    },
    e9967a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Salmon", source: "X11" },
          { name: "Dark Salmon", source: "W3C" },
        ],
      },
    },
    e9e0de: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    e9e1af: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    e9e5ce: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Oyster White", source: "RAL", number: "1013" }],
      },
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    ea173e: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    ea6287: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    ea8399: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    eaa2a1: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    eab147: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "m" }],
      },
    },
    eacaa4: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    ead6bf: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    eadcc3: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    eaddcc: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    eadebd: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Light Ivory", source: "RAL", number: "1015" }],
      },
    },
    eae7d5: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "fn" }],
      },
    },
    eaf044: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sulfur Yellow", source: "RAL", number: "1016" }],
      },
    },
    ebb0d7: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Thistle", source: "Crayola" }],
      },
    },
    eb3c59: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    eb54c5: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    eb636e: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    eb6b89: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    eb7f76: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    eb8190: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    ebc5b0: {
      seasons: {
        good: [
          { season: "spring", seasonType: "bright", colorType: "m" },
          { season: "spring", seasonType: "true", colorType: "m" },
          { season: "spring", seasonType: "light", colorType: "m" },
          { season: "summer", seasonType: "light", colorType: "m" },
        ],
      },
    },
    ebc973: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "m" }],
      },
    },
    ebe9a8: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    ec394f: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    ec7c25: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Deep Orange", source: "RAL", number: "2011" }],
      },
    },
    ec8284: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "ca" }],
      },
    },
    ec9e9d: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    eca051: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    ecaf88: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    ecb176: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Middle Yellow Red", source: "Crayola" }],
      },
    },
    ecdecb: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    ecebbd: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Spring Green", source: "Crayola" }],
      },
    },
    ed0a3f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Red, Smell the Roses", source: "Crayola" }],
      },
    },
    ed5e4d: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    ed615f: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    ed8a23: {
      seasons: {
        bad: [
          { season: "spring", seasonType: "bright" },
          { season: "summer", seasonType: "light" },
        ],
      },
    },
    ed977a: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "ca" }],
      },
    },
    ed99ae: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    edab56: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pastel Yellow", source: "RAL", number: "1034" }],
      },
    },
    edc9af: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Desert Sand", source: "Crayola" }],
      },
    },
    eddbc7: {
      seasons: {
        good: [{ season: "autumn", seasonType: "dark", colorType: "fn" }],
      },
    },
    edded9: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    ede9e6: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "m" }],
      },
    },
    ee1a23: {
      seasons: {
        bad: [{ season: "summer", seasonType: "soft" }],
      },
    },
    ee3498: {
      seasons: {
        bad: [{ season: "summer", seasonType: "soft" }],
      },
    },
    ee34d2: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Razzle Dazzle Rose", source: "Crayola" }],
      },
    },
    ee82ee: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Violet", source: "X11" },
          { name: "Violet", source: "W3C" },
        ],
      },
    },
    eea205: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sun Yellow", source: "RAL", number: "1037" }],
      },
    },
    eeaccb: {
      seasons: {
        bad: [{ season: "spring", seasonType: "true" }],
      },
    },
    eebdd2: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    eec900: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Rape Yellow", source: "RAL", number: "1021" }],
      },
    },
    eed0c6: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    eed9c4: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Almond", source: "Crayola" }],
      },
    },
    eee8aa: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Pale Goldenrod", source: "X11" },
          { name: "Pale Goldenrod", source: "W3C" },
        ],
      },
    },
    ef1a88: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "soft" }],
      },
    },
    ef9a23: {
      seasons: {
        bad: [{ season: "winter", seasonType: "dark" }],
      },
    },
    ef9e63: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    efadb9: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    f0358f: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "true" }],
      },
    },
    f06939: {
      seasons: {
        bad: [{ season: "summer", seasonType: "soft" }],
      },
    },
    f071af: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    f08080: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Coral", source: "X11" },
          { name: "Light Coral", source: "W3C" },
        ],
      },
    },
    f091a9: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mauvelous", source: "Crayola" }],
      },
    },
    f09ead: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    f0c05a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Mimosa", source: "Pantone", number: "14-0848" }],
      },
    },
    f0ca00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Traffic Yellow", source: "RAL", number: "1023" }],
      },
    },
    f0e07e: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    f0e68c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Khaki", source: "X11" },
          { name: "Khaki", source: "W3C" },
        ],
      },
    },
    f0eade: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "fn" }],
      },
    },
    f0f8ff: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Alice Blue", source: "X11" },
          { name: "Alice Blue", source: "W3C" },
        ],
      },
    },
    f0fff0: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Honeydew", source: "X11" },
          { name: "Honeydew", source: "W3C" },
        ],
      },
    },
    f0ffff: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Azure", source: "X11" },
          { name: "Azure", source: "W3C" },
        ],
      },
    },
    f17190: {
      seasons: {
        good: [{ season: "summer", seasonType: "true", colorType: "ca" }],
      },
    },
    f1c0b9: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "m" }],
      },
    },
    f1d57f: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    f1e788: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Green Yellow", source: "Crayola" }],
      },
    },
    f24246: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    f2cc98: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    f1d979: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    f1ecf2: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "fn" }],
      },
    },
    f14798: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    f2592b: {
      seasons: {
        bad: [
          { season: "summer", seasonType: "true" },
          { season: "autumn", seasonType: "soft" },
        ],
      },
    },
    f26fb7: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    f298c7: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    f29eb1: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    f2ba49: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maximum Yellow Red", source: "Crayola" }],
      },
    },
    f2bb5f: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    f2bc5d: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    f2c649: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maize", source: "Crayola" }],
      },
    },
    f2dbab: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    f3752c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Bright Red Orange", source: "RAL", number: "2008" }],
      },
    },
    f3c0bf: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    f3d463: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    f3d6d9: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    f3e03b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Zinc Yellow", source: "RAL", number: "1018" }],
      },
    },
    f4866f: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "ca" }],
      },
    },
    f48cac: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "dark" }],
      },
    },
    f4a18b: {
      seasons: {
        bad: [{ season: "winter", seasonType: "true" }],
      },
    },
    f4a460: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Sandy Brown", source: "X11" },
          { name: "Sandy Brown", source: "W3C" },
        ],
      },
    },
    f4b752: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Saffron Yellow", source: "RAL", number: "1017" }],
      },
    },
    f4b7c6: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    f4bfc3: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    f4d2e3: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    f4e99a: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    f4ec79: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    f4f0f1: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "fn" }],
      },
    },
    f4f4f4: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Signal White", source: "RAL", number: "9003" }],
      },
    },
    f578aa: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    f57987: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    f5a2d2: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    f5da6a: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    f5deb3: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Wheat", source: "X11" },
          { name: "Wheat", source: "W3C" },
        ],
      },
    },
    f5f3f6: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "fn" }],
      },
    },
    f5f5dc: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Beige", source: "X11" },
          { name: "Beige", source: "W3C" },
        ],
      },
    },
    f5f5f5: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "White Smoke", source: "X11" },
          { name: "White Smoke", source: "W3C" },
        ],
      },
    },
    f5ff00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Luminous Yellow", source: "RAL", number: "1026" }],
      },
    },
    f5fffa: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Mint Cream", source: "X11" },
          { name: "Mint Cream", source: "W3C" },
        ],
      },
    },
    f62a5b: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    f653a6: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Magenta", source: "Crayola" }],
      },
    },
    f65f7c: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    f69fa4: {
      seasons: {
        good: [{ season: "autumn", seasonType: "soft", colorType: "ca" }],
      },
    },
    f6a3cc: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    f6c5ae: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    f6dec7: {
      seasons: {
        bad: [{ season: "winter", seasonType: "bright" }],
      },
    },
    f6e5b4: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    f6ed31: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "soft" }],
      },
    },
    f6f6f6: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Traffic White", source: "RAL", number: "9016" }],
      },
    },
    f70000: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Luminous Red", source: "RAL", number: "3024" }],
      },
    },
    f7468a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Violet Red", source: "Crayola" }],
      },
    },
    f755a4: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    f75670: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    f7a38e: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pink Sherbert", source: "Crayola" }],
      },
    },
    f7b17e: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    f7b2cd: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    f7ba0b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Signal Yellow", source: "RAL", number: "1003" }],
      },
    },
    f7bd57: {
      seasons: {
        bad: [{ season: "winter", seasonType: "bright" }],
      },
    },
    f7cac9: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Rose Quartz", source: "Pantone", number: "13-1520" }],
      },
    },
    f7cecb: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    f7e074: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    f7ebd4: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    f84071: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    f85a7d: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    f9b29e: {
      seasons: {
        bad: [{ season: "winter", seasonType: "true" }],
      },
    },
    f9bf11: {
      seasons: {
        bad: [{ season: "summer", seasonType: "true" }],
      },
    },
    f8d568: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Orange Yellow", source: "Crayola" }],
      },
    },
    f8d6e1: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "dark" }],
      },
    },
    f9e49d: {
      seasons: {
        bad: [{ season: "winter", seasonType: "dark" }],
      },
    },
    f8e4bf: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    f8f3f7: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "fn" }],
      },
    },
    f8f8ff: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Ghost White", source: "X11" },
          { name: "Ghost White", source: "W3C" },
        ],
      },
    },
    f9a78d: {
      seasons: {
        bad: [{ season: "summer", seasonType: "true" }],
      },
    },
    f9be12: {
      seasons: {
        bad: [
          { season: "spring", seasonType: "bright" },
          { season: "summer", seasonType: "light" },
        ],
      },
    },
    f9c3c6: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    f9dcc8: {
      seasons: {
        good: [{ season: "autumn", seasonType: "true", colorType: "fn" }],
      },
    },
    f9e5d8: {
      seasons: {
        good: [{ season: "spring", seasonType: "true", colorType: "fn" }],
      },
    },
    f9ee78: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    f9f7f3: {
      seasons: {
        bad: [
          { season: "spring", seasonType: "bright" },
          { season: "spring", seasonType: "true" },
        ],
      },
    },
    fa448f: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    fa5b3d: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Orange Soda", source: "Crayola" }],
      },
    },
    fa6063: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    fa8072: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Salmon", source: "X11" },
          { name: "Salmon", source: "W3C" },
        ],
      },
    },
    fa842b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pastel Orange", source: "RAL", number: "2003" }],
      },
    },
    fa8cbe: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    faab21: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Dahlia Yellow", source: "RAL", number: "1033" }],
      },
    },
    faadc3: {
      seasons: {
        good: [{ season: "summer", seasonType: "soft", colorType: "ca" }],
      },
    },
    fac4ec: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    facffc: {
      seasons: {
        good: [{ season: "winter", seasonType: "bright", colorType: "ca" }],
      },
    },
    fad664: {
      seasons: {
        good: [{ season: "spring", seasonType: "bright", colorType: "ca" }],
      },
    },
    fad8e7: {
      seasons: {
        bad: [{ season: "autumn", seasonType: "true" }],
      },
    },
    faebd7: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Antique White", source: "X11" },
          { name: "Antique White", source: "W3C" },
        ],
      },
    },
    faefa1: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    faf0e6: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Linen", source: "X11" },
          { name: "Linen", source: "W3C" },
        ],
      },
    },
    fafa37: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Maximum Yellow", source: "Crayola" }],
      },
    },
    fafad2: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Goldenrod", source: "X11" },
          { name: "Light Goldenrod", source: "W3C" },
        ],
      },
    },
    fb4d46: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Tart Orange", source: "Crayola" }],
      },
    },
    fb6ea2: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    fbaed2: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lavender (II)", source: "Crayola" }],
      },
    },
    fbb8ac: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    fbcd9f: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    fbd58a: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    fbe7b2: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Banana Mania", source: "Crayola" }],
      },
    },
    fbe870: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Yellow, Sunny Day", source: "Crayola" }],
      },
    },
    fbe964: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    fbfaa3: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    fc5a8d: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Strawberry", source: "Crayola" }],
      },
    },
    fc74fd: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pink Flamingo", source: "Crayola" }],
      },
    },
    fc80a5: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Tickle Me Pink, Bubble Bath", source: "Crayola" }],
      },
    },
    fcd667: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Goldenrod, Sharpening Pencils", source: "Crayola" }],
      },
    },
    fcdf81: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    fce535: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    fcec92: {
      seasons: {
        good: [{ season: "winter", seasonType: "dark", colorType: "ca" }],
      },
    },
    fd0e35: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Scarlet", source: "Crayola" }],
      },
    },
    fd3a4a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Red Salsa", source: "Crayola" }],
      },
    },
    fd5240: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Ogre Door", source: "Crayola" }],
      },
    },
    fd5b78: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Wild Watermelon", source: "Crayola" }],
      },
    },
    fd6491: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    fd889f: {
      seasons: {
        good: [{ season: "summer", seasonType: "light", colorType: "ca" }],
      },
    },
    fdb1c7: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    fdd5b1: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Apricot", source: "Crayola" }],
      },
    },
    fdd7e4: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Pig Pink", source: "Crayola" }],
      },
    },
    fdf4e3: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cream", source: "RAL", number: "9001" }],
      },
    },
    fdf5e6: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Old Lace", source: "X11" },
          { name: "Old Lace", source: "W3C" },
        ],
      },
    },
    fdff00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lemon Glacier", source: "Crayola" }],
      },
    },
    fe4c40: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sunset Orange", source: "Crayola" }],
      },
    },
    fe6f5e: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Bittersweet", source: "Crayola" }],
      },
    },
    febaad: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Melon", source: "Crayola" }],
      },
    },
    fed85d: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Dandelion, Wash the Dog", source: "Crayola" }],
      },
    },
    fedcf0: {
      seasons: {
        good: [{ season: "winter", seasonType: "true", colorType: "ca" }],
      },
    },
    fee1dd: {
      seasons: {
        bad: [{ season: "winter", seasonType: "dark" }],
      },
    },
    feebca: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "fn" }],
      },
    },
    fef200: {
      seasons: {
        bad: [{ season: "summer", seasonType: "soft" }],
      },
    },
    fefefa: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Baby Powder", source: "Crayola" }],
      },
    },
    fefefe: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Coconut", source: "Crayola" }],
      },
    },
    feffdc: {
      seasons: {
        bad: [{ season: "winter", seasonType: "true" }],
      },
    },
    ff0000: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Red", source: "X11" },
          { name: "Red", source: "W3C" },
          { name: "Luminous Bright Red", source: "RAL", number: "3026" },
        ],
      },
    },
    ff007c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Winter Sky", source: "Crayola" }],
      },
    },
    ff00cc: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Hot Magenta, Purple Pizzazz", source: "Crayola" }],
      },
    },
    ff00ff: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Magenta", source: "X11" },
          { name: "Fuchsia", source: "W3C" },
        ],
      },
    },
    ff1493: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Deep Pink", source: "X11" },
          { name: "Deep Pink", source: "W3C" },
        ],
      },
    },
    ff2300: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Luminous Orange", source: "RAL", number: "2005" }],
      },
    },
    ff3399: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Wild Strawberry", source: "Crayola" }],
      },
    },
    ff355e: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Radical Red", source: "Crayola" }],
      },
    },
    ff3855: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sizzling Red", source: "Crayola" }],
      },
    },
    ff404c: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sunburnt Cyclops", source: "Crayola" }],
      },
    },
    ff4466: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Magic Potion", source: "Crayola" }],
      },
    },
    ff4500: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Orange Red", source: "X11" },
          { name: "Orange Red", source: "W3C" },
        ],
      },
    },
    ff4681: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sasquatch Socks", source: "Crayola" }],
      },
    },
    ff5050: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Rose", source: "Crayola" }],
      },
    },
    ff5349: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Orange Red", source: "Crayola" }],
      },
    },
    ff5470: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Fiery Rose", source: "Crayola" }],
      },
    },
    ff6037: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Outrageous Orange", source: "Crayola" }],
      },
    },
    ff6347: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Tomato", source: "X11" },
          { name: "Tomato", source: "W3C" },
        ],
      },
    },
    ff681f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Red Orange", source: "Crayola" }],
      },
    },
    ff69b4: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Hot Pink", source: "X11" },
          { name: "Hot Pink", source: "W3C" },
        ],
      },
    },
    ff6d3a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Smashed Pumpkin", source: "Crayola" }],
      },
    },
    ff6eff: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Shocking Pink", source: "Crayola" }],
      },
    },
    ff6f61: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Living Coral", source: "Pantone", number: "16-1546" }],
      },
    },
    ff7567: {
      seasons: {
        bad: [{ season: "winter", seasonType: "dark" }],
      },
    },
    ff7a00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Heat Wave", source: "Crayola" }],
      },
    },
    ff7f49: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Burnt Orange", source: "Crayola" }],
      },
    },
    ff7f50: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Coral", source: "X11" },
          { name: "Coral", source: "W3C" },
        ],
      },
    },
    ff7f95: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    ff85cf: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Princess Perfume", source: "Crayola" }],
      },
    },
    ff878d: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Tulip", source: "Crayola" }],
      },
    },
    ff8833: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Orange, Grandma's Perfume", source: "Crayola" }],
      },
    },
    ff8866: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Orange (fragrance)", source: "Crayola" }],
      },
    },
    ff8c00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Dark Orange", source: "X11" },
          { name: "Dark Orange", source: "W3C" },
        ],
      },
    },
    ff8e85: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    ff91a4: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Salmon", source: "Crayola" }],
      },
    },
    ff9933: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Neon Carrot", source: "Crayola" }],
      },
    },
    ff9966: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Atomic Tangerine", source: "Crayola" }],
      },
    },
    ff9980: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Vivid Tangerine", source: "Crayola" }],
      },
    },
    ffa07a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Salmon", source: "X11" },
          { name: "Light Salmon", source: "W3C" },
        ],
      },
    },
    ffa421: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Luminous Bright Orange", source: "RAL", number: "2007" },
        ],
      },
    },
    ffa500: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Orange", source: "X11" },
          { name: "Orange", source: "W3C" },
        ],
      },
    },
    ffa6c9: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Carnation Pink", source: "Crayola" }],
      },
    },
    ffa7b5: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    ffaa1d: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Bright Yellow", source: "Crayola" }],
      },
    },
    ffab00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Melon Yellow", source: "RAL", number: "1028" }],
      },
    },
    ffae42: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Yellow Orange", source: "Crayola" }],
      },
    },
    ffb6c1: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Pink", source: "X11" },
          { name: "Light Pink", source: "W3C" },
        ],
      },
    },
    ffb7d5: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Cotton Candy", source: "Crayola" }],
      },
    },
    ffb97b: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Macaroni and Cheese", source: "Crayola" }],
      },
    },
    ffc0cb: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Pink", source: "X11" },
          { name: "Pink", source: "W3C" },
        ],
      },
    },
    ffc1c4: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    ffca6d: {
      seasons: {
        good: [{ season: "spring", seasonType: "light", colorType: "ca" }],
      },
    },
    ffcba4: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Peach, Saw Dust", source: "Crayola" }],
      },
    },
    ffcc33: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sunglow", source: "Crayola" }],
      },
    },
    ffcff1: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Shampoo", source: "Crayola" }],
      },
    },
    ffd0b9: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Peach (fragrance)", source: "Crayola" }],
      },
    },
    ffd12a: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Banana", source: "Crayola" }],
      },
    },
    ffd3f8: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Bubble Gum", source: "Crayola" }],
      },
    },
    ffd700: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Gold", source: "X11" },
          { name: "Gold", source: "W3C" },
        ],
      },
    },
    ffdab9: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Peach Puff", source: "X11" },
          { name: "Peach Puff", source: "W3C" },
        ],
      },
    },
    ffdb00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Sizzling Sunrise", source: "Crayola" }],
      },
    },
    ffdead: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Navajo White", source: "X11" },
          { name: "Navajo White", source: "W3C" },
        ],
      },
    },
    ffdf46: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Gargoyle Gas", source: "Crayola" }],
      },
    },
    ffe4b5: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Moccasin", source: "X11" },
          { name: "Moccasin", source: "W3C" },
        ],
      },
    },
    ffe4c4: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Bisque", source: "X11" },
          { name: "Bisque", source: "W3C" },
        ],
      },
    },
    ffe4cd: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lumber", source: "Crayola" }],
      },
    },
    ffe4e1: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Misty Rose", source: "X11" },
          { name: "Misty Rose", source: "W3C" },
        ],
      },
    },
    ffeb00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Middle Yellow", source: "Crayola" }],
      },
    },
    ffebcd: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Blanched Almond", source: "X11" },
          { name: "Blanched Almond", source: "W3C" },
        ],
      },
    },
    ffefd5: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Papaya Whip", source: "X11" },
          { name: "Papaya Whip", source: "W3C" },
        ],
      },
    },
    fff0f5: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Lavender Blush", source: "X11" },
          { name: "Lavender Blush", source: "W3C" },
        ],
      },
    },
    fff5ee: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Seashell", source: "X11" },
          { name: "Seashell", source: "W3C" },
        ],
      },
    },
    fff700: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Yellow Sunshine", source: "Crayola" }],
      },
    },
    fff8dc: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Cornsilk", source: "X11" },
          { name: "Cornsilk", source: "W3C" },
        ],
      },
    },
    fffacd: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Lemon Chiffon", source: "X11" },
          { name: "Lemon Chiffon", source: "W3C" },
        ],
      },
    },
    fffaf0: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Floral White", source: "X11" },
          { name: "Floral White", source: "W3C" },
        ],
      },
    },
    fffafa: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Snow", source: "X11" },
          { name: "Snow", source: "W3C" },
        ],
      },
    },
    ffff00: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Yellow", source: "X11" },
          { name: "Yellow", source: "W3C" },
        ],
      },
    },
    ffff31: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Daffodil", source: "Crayola" }],
      },
    },
    ffff38: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lemon", source: "Crayola" }],
      },
    },
    ffff66: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Laser Lemon, Unmellow Yellow", source: "Crayola" }],
      },
    },
    ffff99: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Canary", source: "Crayola" }],
      },
    },
    ffff9f: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [{ name: "Lemon Yellow", source: "Crayola" }],
      },
    },
    ffffe0: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Light Yellow", source: "X11" },
          { name: "Light Yellow", source: "W3C" },
        ],
      },
    },
    fffff0: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "Ivory", source: "X11" },
          { name: "Ivory", source: "W3C" },
        ],
      },
    },
    ffffff: {
      names: {
        //need this as an object since we need to append additional properties to this info later
        names: [
          { name: "White", source: "X11" },
          { name: "White", source: "W3C" },
          { name: "Pure White", source: "RAL", number: "9010" },
        ],
      },
      seasons: {
        good: [
          { season: "winter", seasonType: "dark", colorType: "fn" },
          { season: "winter", seasonType: "true", colorType: "fn" },
          { season: "winter", seasonType: "bright", colorType: "fn" },
        ],
        bad: [
          { season: "spring", seasonType: "light" },
          { season: "summer", seasonType: "light" },
          { season: "summer", seasonType: "true" },
          { season: "summer", seasonType: "soft" },
          { season: "autumn", seasonType: "soft" },
          { season: "autumn", seasonType: "true" },
          { season: "autumn", seasonType: "dark" },
        ],
      },
    },
  },
};

CNSI.data.init();
