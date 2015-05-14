![git-changelog logo][logo-image]
---
[![NPM Version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Test Coverage][coverage-badge]][codeclimate-url]
[![Code Climate][codeclimate-badge]][codeclimate-url]

> A git changelog based on ANGULAR JS commit standards. [NPM page][npm-url]

**Works as a `CLI` option or `grunt` plugin**

[Example output](https://github.com/rafinskipg/git-changelog/blob/master/EXTENDEDCHANGELOG.md)

## NEWS!

version 0.1.7 is out, special thanks to [JohnnyEstilles][JohnnyEstilles] for his work.

This release includes a big refactor with a huge improvement on test coverage.

**Git changelog is secure enough**

Next releases will include:
- Downloadable resources area on the generated changelog, for linking to your zip project folder of certain tag.
- .gitchangelogrc specification. That will allow using any comment standards for your commit messages.

![Good news](http://www.labspaces.net/pictures/blog/4e5466b7dc69f1314154167_blog.jpg)


## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install git-changelog --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('git-changelog');
```

## The "git_changelog" task

### Overview
In your project's Gruntfile, add a section named `git_changelog` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  git_changelog: {
    minimal: {
      options: {
        file: 'MyChangelog.md',
        app_name : 'Git changelog'
      }
    },
    extended: {
      options: {
        repo_url: 'https://github.com/rafinskipg/git-changelog',
        app_name : 'Git changelog extended',
        file : 'EXTENDEDCHANGELOG.md',
        grep_commits: '^fix|^feat|^docs|^refactor|^chore|BREAKING',
        debug: true,
        tag : false //False for commits since the beggining
      }
    },
    fromCertainTag: {
      options: {
        repo_url: 'https://github.com/rafinskipg/git-changelog',
        app_name : 'My project name',
        file : 'tags/certainTag.md',
        tag : 'v0.0.1'
      }
    }
  }
})
```

### Options | Defaults

* **branch_name** : The name of the branch. Defaults to ` `
* **repo_url** : The url of the project. For issues and commits links. Defaults to `git config --get remote.origin.url`
* **version**: The version of the project. Defaults to ` `,
* **file**: The name of the file that will be generated. Defaults to `CHANGELOG.md`,
* **app_name** : The name of the project. Defaults to `My App - Changelog`
* **grep_commits**: The commits that will be picked. Defaults to `'^fix|^feat|^docs|^refactor|^chore|BREAKING'`
* **tag**: You can select from which tag to generate the log, it defaults to the last one. Set it to false for log since the beginning of the project
* **debug**: Debug mode, false by default

### Command Line
Install it globally

```
npm install -g git-changelog
```
See commands
```
git-changelog -h
```

Use it directly with the common options
```
 Usage: git-changelog [options]

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -e, --extended              Extended log
    -a, --app_name [app_name]   Name [app_name]
    -b, --branch [branch_name]  Branch name [branch_name]
    -f, --file [file]           File [file]
    -r, --repo_url [url]        Repo url [url]
    -t, --tag [tag]             Since tag [tag]
    -g, --grep [grep]           Grep commits for [grep]
    -d, --debug                 Debugger


```

For example:

```
git-changelog -t false -a "My nice application"
```

## Git Commit Guidelines - Source : "Angular JS"

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  But also,
we use the git commit messages to **generate the AngularJS change log**.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on github as well as in various git tools.

Example commit message

```
git commit -m "docs: added documentation for explaining the commit message"
```

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation


### Scope
The scope could be anything specifying place of the commit change. For example `$location`,
`$browser`, `$compile`, `$rootScope`, `ngHref`, `ngClick`, `ngView`, etc...

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

###Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
The body should include the motivation for the change and contrast this with previous behavior.

###Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.


A detailed explanation can be found in this [document][commit-message-format].
[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#


## Contributing
In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

[logo-image]: images/git-changelog-logo.png

[npm-badge]: https://badge.fury.io/js/git-changelog.svg
[npm-url]: https://www.npmjs.org/package/git-changelog

[travis-badge]: https://travis-ci.org/rafinskipg/git-changelog.svg
[travis-url]: https://travis-ci.org/rafinskipg/git-changelog

[codeclimate-badge]: https://codeclimate.com/github/rafinskipg/git-changelog/badges/gpa.svg
[codeclimate-url]: https://codeclimate.com/github/rafinskipg/git-changelog

[coverage-badge]: https://codeclimate.com/github/rafinskipg/git-changelog/badges/coverage.svg

[JohnnyEstilles]: https://github.com/JohnnyEstilles
