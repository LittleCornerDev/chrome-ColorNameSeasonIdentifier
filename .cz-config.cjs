// NOTE:
// This project is configured to expect all *.js to be in ES6 module syntax, but
// cz-customizable requires its config to be in CommonJS.
// This file has therefore been renamed to *.cjs, but
// cz-customizable assumes config file to only be *.js.
// Therefore, package.json was updated to indicate a custom cz-customizable config file
// using the .cjs extension.
// See https://github.com/leoforfree/cz-customizable/issues/199

const scopes = [
	{
		name: 'config:      Changes to config files',
		value: 'config'
	},
	{
		name: 'icons:       Changes to source icon files',
		value: 'icons'
	},
	{
		name: 'scripts:     Changes to source script files',
		value: 'scripts'
	},
	{
		name: 'stylesheets: Changes to source css files',
		name: 'stylesheets'
	},
	{
		name: 'vcs:         Changes to version control files, including hooks and build scripts',
		value: 'vcs'
	},
	{
		name: '*:           Changes across multiple scopes',
		value: '*'
	} ];

module.exports = {
	types: [
		{
			name: 'chore:    Changes to the build process or auxiliary tools\n            and libraries such as documentation generation',
			value: 'chore',
		},
		{
			name: 'docs:     Documentation-only changes (code comments|jsdoc|tsdoc|markdown)',
			value: 'docs'
		},
		{
			name: 'feat:     A new user-facing feature',
			value: 'feat'
		},
		{
			name: 'fix:      A user-facing bug fix',
			value: 'fix'
		},
		{
			name: 'perf:     A code change that improves performance',
			value: 'perf',
		},
		{
			name: 'refactor: A code change that neither fixes a bug nor adds a feature',
			value: 'refactor',
		},
		{
			name: 'revert:   Revert to a commit',
			value: 'revert',
		},
		{
			name: 'style:    Changes that do not affect the meaning of the code\n            (white-space, formatting, missing semi-colons, etc)',
			value: 'style',
		},
		{
			name: 'test:     Adding missing tests',
			value: 'test',
		},
		// "WIP" may not be one of the default types checked by .commitlintrc
		// might need to add this to .commitlintrc if we want to use it
		/*{
			name: 'WIP:      Work in progress',
			value: 'WIP'
		},*/
	],

	scopes: scopes,

	// re-use commit from ./.git/COMMIT_EDITMSG?
	usePreparedCommit: true,  //default false

	// display prompt for messages.ticketNumber
	// and add it to commit header like so:
	// type(scope): ticketNumberPrefix+ticketNumber subject
	allowTicketNumber: false,

	// whether to require a ticket number
	isTicketNumberRequired: false,

	ticketNumberPrefix: '#',
	ticketNumberRegExp: '\\d{1,5}',

	// set specific scopes per type
	scopeOverrides: {
		docs: scopes.filter(s =>
			s.value === "scripts" ||
			s.value === "stylesheets" ||
			s.value === "vcs" ||
			s.value === "*"
		),
		feat: scopes.filter(s =>
			s.value === "icons" ||
			s.value === "scripts" ||
			s.value === "stylesheets" ||
			s.value === "*"
		),
		fix: scopes.filter(s =>
			s.value === "icons" ||
			s.value === "scripts" ||
			s.value === "stylesheets" ||
			s.value === "*"
		),
		style: scopes.filter(s =>
			s.value === "scripts" ||
			s.value === "stylesheets" ||
			s.value === "vcs" ||
			s.value === "*"
		),
		test: scopes.filter(s =>
			s.value === "scripts"
		)
	},

	// override the messages, defaults are as follows
	messages: {
		type: "Select the TYPE of change that you're committing:",
		//scope: '\nDenote the SCOPE of this change (optional):',
		scope: '\nDenote the SCOPE of this change:',
		// used if allowCustomScopes is true
		customScope: 'Denote the SCOPE of this change:',
		subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
		body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
		//ticketNumber: "Enter the ticket number following this pattern(\d{ 1, 5}):\n",
		breaking: 'List any BREAKING CHANGES (optional):\n',
		footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
		confirmCommit: 'Are you sure you want to proceed with the commit above?',
	},

	// allow commiters to enter any scope
	allowCustomScopes: false, //default: false

	// commit type that should have `breaking` message prompted
	allowBreakingChanges: [ 'chore', 'feat', 'fix', 'perf', 'refactor', 'revert' ], //default: none

	// skip any questions you want
	// skipQuestions: ['scope', 'body'], //default: none

	// limit subject length
	subjectLimit: 72, //default 100

	// character that will be replaced with \n in commit messages body and footer
	// breaklineChar: '|', //default: "|"

	// Commit message footer sectio prefix.
	// footerPrefix : 'ISSUES CLOSED:' //default: "ISSUES CLOSED:"

	// Whether to ask `breaking` message first
	// askForBreakingChangeFirst : true, // default is false

	// Whether to capitalize first letter of the commit subject
	// upperCaseSubject: false, // default is false
};
