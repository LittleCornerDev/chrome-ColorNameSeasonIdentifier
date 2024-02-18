<!-- @format -->

# Contributing Guide <!-- omit in toc -->

Thank you for investing your time in contributing to our project! :sparkles:.

Read our [Code of Conduct](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## Project Overview

To get an overview of the project, read the [README](../README.md) file.

### About Chrome Extensions

Here are some resources to help you with Chrome Extensions development:

- [Overview of Chrome Extensions](https://developer.chrome.com/docs/extensions)
- [Get Started with Chrome Extensions](https://developer.chrome.com/docs/extensions/get-started)
- [Develop Chrome Extensions](https://developer.chrome.com/docs/extensions/develop)

### About Open Source

Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/getting-started-with-git/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Issues

### Create a new issue

If you spot a problem wit this project, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can open a new issue using a relevant [issue form](https://github.com/github/docs/issues/new/choose).

### Solve an issue

Scan through our [existing issues](https://github.com/github/docs/issues) to find one that interests you. You can narrow down the search using `labels` as filters. See "[Label reference](https://docs.github.com/en/contributing/collaborating-on-github-docs/label-reference)" for more information. If you find an issue to work on, you are welcome to assign it to yourself and to open a Pull Request with a fix.

**Overview of How To Fork and Submit a PR**

- https://www.freecodecamp.org/news/how-to-make-your-first-pull-request-on-github-3/
- https://www.tomasbeuzen.com/post/git-fork-branch-pull/

#### 1. Fork the repository and clone your fork.

You cannot make your changes directly on the repository. Create a fork as a copy and clone it to work on it locally.

- Using GitHub Desktop:

  - [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
  - Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

- Using the command line:
  - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

#### 2. Set up node.

If you don't already have it, [install Node Version Manager (NVM)](https://codedamn.com/news/nodejs/nvm-installation-setup-guide).

On the command line, use NVM to use the Node version specified in `{PATH_TO_LOCAL_REPO}/.nvmrc`.

```bash
cd {PATH_TO_LOCAL_REPO}
nvm use
```

⚠️ NOTE: [Windows does not automatically read .nvmrc](https://gist.github.com/danpetitt/e87dabb707079e1bfaf797d0f5f798f2)

#### 3. Install dependencies.

On the command line, use Node to install dependencies.

```bash
cd {PATH_TO_LOCAL_REPO}
npm clean install
```

#### 4. Create a working branch and start your code changes.

On the command line:

```bash
cd {PATH_TO_LOCAL_REPO}
git checkout -b {NEW_BRANCH_NAME}
```

On your editor, edit files as needed.

#### 5. Update CHANGELOG.md.

📣 To ensure you changes will be included in the next release notes, add your updates to the [Unreleased] section of the [CHANGELOG](../CHANGELOG.md) under the appropriate update type as specified in [Keep A Changelog](https://keepachangelog.com/en/1.1.0/):

- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

#### 6. Run tests, lints, and formatter.

On the command line:

```bash
cd {PATH_TO_LOCAL_REPO}
npm run test
npm run lint
npm run format
```

#### 7. Commit and push your update.

[Commit](https://www.atlassian.com/git/tutorials/saving-changes/git-commit) and [push](https://www.atlassian.com/git/tutorials/syncing/git-push) your code changes once you are happy with them.

#### 8. Submit a Pull Request.

When you're finished with the changes, [create a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).

- Fill in the Pull Request description and information as indicated by the template.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Once you submit your PR, the CI pipeline checks tests, linters, and formatters. Check the results to see if anything needs to be fixed.

### 9. Address any change requests during Code Review.

After submitting the PR, your code changes will be subject to review.

We may ask for changes to be made, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments.

If you run into any merge issues, checkout this [git tutorial](https://github.com/skills/resolve-merge-conflicts) to help you resolve merge conflicts and other issues.

### 10. Pull after Merge.

The repository owner will merge your PR once it passes code review.

This means your code changes are now part of the main repository and can be pulled.

NOTE: This project does not automatically publish to the Chrome Store, but you can [load the extension locally](https://superuser.com/questions/247651/how-does-one-install-an-extension-for-chrome-browser-from-the-local-file-system).

Congratulations, you are now officially a contributor :tada::tada: Thank you! :sparkles:.

## Windows

This project can be developed on Windows, however a few potential gotchas need to be kept in mind:

1. Regular Expressions: Windows uses `\r\n` for line endings, while Unix-based systems use `\n`. Therefore, when working on Regular Expressions, use `\r?\n` instead of `\n` in order to support both environments. The Node.js [`os.EOL`](https://nodejs.org/api/os.html#os_os_eol) property can be used to get an OS-specific end-of-line marker.
2. Paths: Windows systems use `\` for the path separator, which would be returned by `path.join` and others. You could use `path.posix`, `path.posix.join` etc and the [slash](https://ghub.io/slash) module, if you need forward slashes - like for constructing URLs - or ensure your code works with either.
3. Bash: Not every Windows developer has a terminal that fully supports Bash, so it's generally preferred to write [scripts](/script) in JavaScript instead of Bash.
4. Filename too long error: There is a 260 character limit for a filename when Git is compiled with `msys`. While the suggestions below are not guaranteed to work and could cause other issues, a few workarounds include:
   - Update Git configuration: `git config --system core.longpaths true`
   - Consider using a different Git client on Windows
