import pjson from "../package.json";
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
