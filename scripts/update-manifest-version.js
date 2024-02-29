// Add assert due to ERR_IMPORT_ASSERTION_TYPE_MISSING error for Node >= 16.14.0
// https://github.com/nodejs/node/releases/tag/v16.14.0
import pjson from "../package.json" assert { type: "json" };
const version = pjson.version;
console.log(`Detected version ${version} from package.json`);

import editJsonFile from "edit-json-file";

// Load manifest.json
// NOTE: If the file doesn't exist, the content will be an empty object by default.
let file = editJsonFile(`source/manifest.json`);

// Set manifest.json version to same as package.json
file.set("version", version);
console.log(`Updated manifest.json version to ${version}.`);

// Save the data to the disk
file.save();
