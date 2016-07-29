![git-changelog logo][logo-image]
---
[![NPM Version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Test Coverage][coverage-badge]][codeclimate-url]
[![Code Climate][codeclimate-badge]][codeclimate-url]

> A git changelog based on ANGULAR JS commit standards (but adaptable to your needs). [NPM page][npm-url]

**Works as a `CLI` option or `grunt` plugin**

[Example output](https://github.com/rafinskipg/git-changelog/blob/master/EXTENDEDCHANGELOG.md)

----

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Breaking changes](#breaking-changes)
- [`.changelogrc` specification](#changelogrc-specification)
- [The "git_changelog" task](#the-git_changelog-task)
  - [Grunt Task](#grunt-task)
    - [Getting Started](#getting-started)
    - [Options | Defaults](#options-%7C-defaults)
  - [Command Line](#command-line)
- [Git Commit Guidelines - Source : "Angular JS"](#git-commit-guidelines---source--angular-js)
  - [Commit Message Format](#commit-message-format)
  - [Example types](#example-types)
  - [Scope](#scope)
  - [Subject](#subject)
  - [Body](#body)
  - [Footer](#footer)
- [Tagging your project](#tagging-your-project)
- [ROADMAP](#roadmap)
  - [v0.3.0](#v030)
- [Release History](#release-history)
- [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Breaking changes

Since version `1.0.0` git-changelog has included the [`.changelogrc` specification](#changelogrc-specification) and has discontinued the next options:
- `grep_commits` option has been removed in favour of the `.changelogrc` options
- `tag = false`, in addition to pick logs from the begining of the project, now groups the commits by tag [see example]. **TODO**
- `tag = false` && `group=false` will log from the begining of the project, without grouping by tag **TODO**
- `repo_url` fixed as parameter
- `branch_name` changed to `branch`

## `.changelogrc` specification

The `.changelogrc` file contains the "standard commit guideliness" that you and your team are following.

This specification is used to grep the commits on your log, it contains a valid JSON that will tell git-changelog which sections to include on the changelog. 

```javascript
{
    "app_name": "Git Changelog",
    "logo": "https://github.com/rafinskipg/git-changelog/raw/master/images/git-changelog-logo.png",
    "intro": "Git changelog is a utility tool for generating changelogs. It is free and opensource. :)",
    "branch" : "",
    "repo_url": "",
    "version" : "v1.0.0",
    "file": 'CHANGELOG.md',
    "sections": [
        {
            "title": "Bug Fixes",
            "grep": "^fix"
        },
        {
            "title": "Features",
            "grep": "^feat"
        },
        {
            "title": "Documentation",
            "grep": "^docs"
        },
        {
            "title": "Breaking changes",
            "grep": "BREAKING"
        },
        {
            "title": "Refactor",
            "grep": "^refactor"
        },
        {
            "title": "Style",
            "grep": "^style"
        },
        {
            "title": "Test",
            "grep": "^test"
        },
        {
            "title": "Chore",
            "grep": "^chore"
        },
        {
            "title": "Branchs merged",
            "grep": "^Merge branch"
        },
        {
            "title" : "Pull requests merged",
            "grep": "^Merge pull request"
        }
    ]
}
```

### Options | Defaults

* **branch** : The name of the branch. Defaults to ` `
* **repo_url** : The url of the project. For issues and commits links. Defaults to `git config --get remote.origin.url`
* **version**: The version of the project. Defaults to ` `, *DEPRECATED* will default to the tag name
* **file**: The name of the file that will be generated. Defaults to `CHANGELOG.md`,
* **app_name** : The name of the project. Defaults to `My App - Changelog`
* **intro** : The introduction text on the header of the changelog. Defaults to `null`
* **logo** : A logo URL to be included in the header of the changelog. Defaults to `null`
* **changelogrc ** : Relative path indicating the location of the .changelogrc file, defaults to current dir.
* **tag**: You can select from which tag to generate the log, it defaults to the last one. Set it to false for log since the beginning of the project
* **debug**: Debug mode, false by default
* **sections**: Group the commit by sections. The sections included by default are the ones that are on the previous example of .changelogrc file.


## The "git_changelog" task

### Grunt Task

#### Getting Started
This plugin requires Grunt `1.0.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install git-changelog --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('git-changelog');
```


In your project's Gruntfile, add a section named `git_changelog` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  git_changelog: {
    minimal: {
      options: {
        file: 'MyChangelog.md',
        app_name : 'Git changelog',
        changelogrc : '/files/.changelogrc',
        logo : 'https://github.com/rafinskipg/git-changelog/raw/master/images/git-changelog-logo.png',
        intro : 'Git changelog is a utility tool for generating changelogs. It is free and opensource. :)'
      }
    },
    extended: {
      options: {
        app_name : 'Git changelog extended',
        file : 'EXTENDEDCHANGELOG.md',
        version : 'squeezy potatoe',
        sections : [
          {
            "title": "Test commits",
            "grep": "^test"
          },
          {
            "title": "New Awesome Features!",
            "grep": "^feat"
          }
        ],
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

    -h, --help                        output usage information
    -V, --version                     output the version number
    -e, --extended                    Extended log
    -a, --app_name [app_name]         Name [app_name]
    -b, --branch [branch]   Branch name [branch]
    -f, --file [file]                 File [file]
    -r, --repo_url [url]              Repo url [url]
    -l, --logo [logo]                 Logo path [logo]
    -i, --intro [intro]               intro text [intro]
    -t, --tag [tag]                   Since tag [tag]
    -rc, --changelogrc [changelogrc]  .changelogrc relative path [changelogrc]
    -g, --grep [grep]                 Grep commits for [grep]
    -d, --debug                       Debugger

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

Example commit messages

```
git commit -m "docs(readme): Add documentation for explaining the commit message"
git commit -m "refactor: Change other things"
```

Closing issues : 

```
git commit -m "fix(git_changelog_generate): pass tag if it exists to gitReadLog
Previously if a tag was found the script would try to find commits
between undefined..HEAD. By passing the tag, it now finds tags between
tag..HEAD.

Closes #5."
```

### Example types

**You may define your own types refering to the `.changelogrc` specification**

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

## Tagging your project

In order to have you project versions correctly displayed on your changelog, try to use this commit message format:

```
chore(release): v1.4.0 codename(jaracimrman-existence)
```

In order to do that, you can use git annotated tags:

```
git tag -a v1.4.0 -m 'chore(release): v1.4.0 codename(jaracimrman-existence)'
```

If you are publishing NPM modules you can let NPM [do that for you][npm-versioning]:

```
npm version patch -m "chore(release): %s codename(furious-stallman)"
```

## ROADMAP

### v2.0.0
- Downloadable resources area on the generated changelog, for linking to your zip project folder of certain tag.


## Release History

### v1.0.0

- Support for `.changelogrc`


## Contributors

_Add your name here by contributing to this project_

- [rafinskipg][Rafinskipg]
- [JohnnyEstilles][JohnnyEstilles]
- [colegleason][colegleason]
- [jodybrewster][jodybrewster]



[logo-image]: images/git-changelog-logo.png

[npm-badge]: https://badge.fury.io/js/git-changelog.svg
[npm-url]: https://www.npmjs.org/package/git-changelog

[travis-badge]: https://travis-ci.org/rafinskipg/git-changelog.svg
[travis-url]: https://travis-ci.org/rafinskipg/git-changelog

[codeclimate-badge]: https://codeclimate.com/github/rafinskipg/git-changelog/badges/gpa.svg
[codeclimate-url]: https://codeclimate.com/github/rafinskipg/git-changelog

[coverage-badge]: https://codeclimate.com/github/rafinskipg/git-changelog/badges/coverage.svg

[Rafinskipg]: https://github.com/rafinskipg
[JohnnyEstilles]: https://github.com/JohnnyEstilles

[jodybrewster]: https://github.com/jodybrewster
[colegleason]: https://github.com/colegleason

[npm-versioning]: https://docs.npmjs.com/cli/version
[changelog_specification]: https://github.com/rafinskipg/git-changelog/#changelog-specification
[npm-versioning]: https://docs.npmjs.com/cli/version
