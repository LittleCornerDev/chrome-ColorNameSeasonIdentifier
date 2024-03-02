// NOTE:
// This project is configured to expect all *.js to be in ES6 module syntax, but
// cz-customizable requires its config to be in CommonJS.
// This file has therefore been renamed to *.cjs, but
// cz-customizable assumes config file to only be *.js.
// Therefore, package.json was updated to indicate a custom cz-customizable config file
// using the .cjs extension.
// See https://github.com/leoforfree/cz-customizable/issues/199


module.exports = {
	types: [
		{ value: 'feat', name: 'feat:     A new user-facing feature' },
		{ value: 'fix', name: 'fix:      A user-facing bug fix' },
		{ value: 'docs', name: 'docs:     Documentation-only changes (code comments|jsdoc|tsdoc|markdown)' },
		{
			value: 'style',
			name: 'style:    Changes that do not affect the meaning of the code\n            (white-space, formatting, missing semi-colons, etc)',
		},
		{
			value: 'refactor',
			name: 'refactor: A code change that neither fixes a bug nor adds a feature',
		},
		{
			value: 'perf',
			name: 'perf:     A code change that improves performance',
		},
		{ value: 'test', name: 'test:     Adding missing tests' },
		{
			value: 'chore',
			name: 'chore:    Changes to the build process or auxiliary tools\n            and libraries such as documentation generation',
		},
		{ value: 'revert', name: 'revert:   Revert to a commit' },
		// "WIP" may not be one of the default types checked by .commitlintrc
		// might need to add this to .commitlintrc if we want to use it
		//{ value: 'WIP', name: 'WIP:      Work in progress' },
	],

	scopes: [ { name: 'config' }, { name: 'icons' }, { name: 'scripts' }, { name: 'stylesheets' }, { name: 'vcs' }, { name: '*' } ],

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

	// it needs to match the value for field type. Eg.: 'fix'
	/*
	scopeOverrides: {
	  fix: [

		{name: 'merge'},
		{name: 'style'},
		{name: 'e2eTest'},
		{name: 'unitTest'}
	  ]
	},
	*/

	// override the messages, defaults are as follows
	messages: {
		type: "Select the type of change that you're committing:",
		scope: '\nDenote the SCOPE of this change (optional):',
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
	allowBreakingChanges: [ 'feat', 'fix' ], //default: none

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
