# chrome-ColorNameSeasonIdentifier

![Build Status](https://github.com/LittleCornerDev/chrome-ColorNameSeasonIdentifier/actions/workflows/ci.yml/badge.svg)
![Release Status](https://github.com/LittleCornerDev/chrome-ColorNameSeasonIdentifier/actions/workflows/cd.yml/badge.svg)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/LittleCornerDev/chrome-ColorNameSeasonIdentifier/badge.svg)](https://snyk.io/test/github/LittleCornerDev/chrome-ColorNameSeasonIdentifier)

Identifies hex code, possible name, and possible wardrobe season for any pixel in the current tab page.
Is it "khaki", or is it "beige"? Now you'll know what that color is probably called... by finding the closest match from digital standards like X11 and W3C as well as approximations of non-digital color sources like Crayola crayons.

Is it a good shade of blue for "Deep Winter" or for "True Summer"? If you've ever finally figured out your wardrobe color season but still cannot tell which shade is right for you just by looking at it, next time you're looking at items on your browser, maybe this extension can help!

PLEASE NOTE: The digital color detected is subject to your computer's as well as your browser's color profile settings. Different computers may not display a pixel exactly the same way. This extension can only provide a best guess based on the particular hex code detected using your current color profile settings.

## HOW TO INSTALL

- [From Chrome Web Store](https://chromewebstore.google.com/detail/color-name-season-identif/pddbkjjdhnmhmdeoaodeggedmebdhcgp)
- [From Unzipped File](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

## FEATURES

- Click extension icon to open/close color detection information.
- Mouseover any pixel on the current tab to see detected color, closest name, and closest season.
- Changing tab url, scrolling, and clicking anywhere on current tab will reload image data.

## COLOR DATA SOURCES

- https://en.wikipedia.org/wiki/X11_color_names
- https://www.w3schools.com/colors/colors_names.asp
- https://www.w3schools.com/colors/colors_crayola.asp
- https://www.w3schools.com/colors/colors_ral.asp
- https://en.wikipedia.org/wiki/Pantone
- https://theconceptwardrobe.com/colour-analysis-comprehensive-guides/which-colour-season-are-you

## CHANGES

[CHANGELOG](https://github.com/LittleCornerDev/chrome-ColorNameSeasonIdentifier/blob/master/CHANGELOG.md)

## CONTRIBUTORS

![GitHub Contributors Image](https://contrib.rocks/image?repo=LittleCornerDev/chrome-ColorNameSeasonIdentifier)

[CONTRIBUTING GUIDE](https://github.com/LittleCornerDev/chrome-ColorNameSeasonIdentifier/blob/master/.github/CONTRIBUTING.md)
