export type ColorDataSource = "W3C" | "X11" | "Crayola" | "RAL" | "Pantone";
export type ColorDataType = "names" | "seasons";
export type ColorDataTypeNames = ColorMatch & {
	names?: ColorNameInfo[];
};
export type ColorDataTypeSeasons = ColorMatch & {
	good?: ColorSeasonInfo[];
	bad?: ColorSeasonInfo[];
};
export type ColorMatch = {
	hex?: ColorValueHexWithHash;
	isExactMatch?: boolean;
};
export type ColorNameInfo = {
	name: string;
	source: ColorDataSource;
	number?: string;
};
export type ColorSeasonInfo = {
	season: Season;
	seasonType: SeasonType;
	colorType?: ColorType;
};
export type ColorType = "fn" | "ca" | "m";
export type ColorValueHex = ColorValueHexWithHash | ColorValueHexNoHash;
export type ColorValueHexNoHash = string;
export type ColorValueHexWithHash = `#${ColorValueHexNoHash}`;
export type ColorData = Record<
	ColorValueHexNoHash,
	{
		names?: ColorDataTypeNames;
		seasons?: ColorDataTypeSeasons;
		rgb?: RgbData;
		hcl?: HclData;
		hsl?: HslData;
		hsv?: HsvData;
	}
>;

export type Decimal = number;
// TODO: use float range from 0 to 360
export type Degrees = number;
export type Hexadecimal = `0x${number}`;
export type HexString = `0x${string}`;

export type HclData = {
	h: Degrees;
	c: number;
	l: Percent;
};
export type HslData = {
	h: Degrees;
	s: Percent;
	l: Percent;
};
export type HsvData = {
	h: Degrees;
	s: Percent;
	v: Percent;
};
/*export enum HsvType {
	H = 'h',
	S = 's',
	V = 'v'
}*/
export type HsvType = "h" | "s" | "v";

/*
export type MessageRequest = {
	event: "getTabId" | "scrolled" | "resized" | "clicked"
};
export type MessageResponse = {
	status: "success" | "failure",
	tabId?: number
}
*/

export type Octal = number;
export type Percent = number;
export type Radians = number;

export type RgbData = { r: Decimal; g: Decimal; b: Decimal; a?: Percent };
export type RgbType = "r" | "g" | "b" | "a";

export type Season = "winter" | "spring" | "summer" | "autumn";
export type SeasonType =
	| SeasonTypeWinter
	| SeasonTypeSpring
	| SeasonTypeSummer
	| SeasonTypeAutumn;
export type SeasonTypeAutumn = "dark" | "true" | "soft";
export type SeasonTypeSpring = "light" | "true" | "bright";
export type SeasonTypeSummer = "light" | "true" | "soft";
export type SeasonTypeWinter = "dark" | "true" | "bright";

export type IdentifierState = "closed" | "opened";
export type StorageData = {
	identifier: IdentifierState;
	port: chrome.runtime.Port;
	screenshot: string;
};
export type StorageDataKey = "identifier" | "port" | "screenshot";
//export type StorageDataValue = StorageData[ StorageDataKey ];
export type StorageDataValue = IdentifierState | chrome.runtime.Port | string;

// Use array of string ids as object keys
// https://codyarose.com/blog/object-keys-from-array-in-typescript/
export const styleClassNames = [
	"main",
	"origin",
	"originHex",
	"originRgba",
	"originRgbaR",
	"originRgbaG",
	"originRgbaB",
	"originRgbaA",
	"originHcl",
	"originHclH",
	"originHclC",
	"originHclL",
	"originHsl",
	"originHslH",
	"originHslS",
	"originHslL",
	"originHsv",
	"originHsvH",
	"originHsvS",
	"originHsvV",
	"name",
	"nameHex",
	"nameNames",
	"nameExact",
	"seasons",
	"seasonsHex",
	"seasonsGood",
	"seasonsBad",
	"seasonsExact",
] as const;
export type StyleClassNameKey = (typeof styleClassNames)[number];
export type StyleClassNames = {
	[K in StyleClassNameKey]: string;
};

export type TabId = number;
