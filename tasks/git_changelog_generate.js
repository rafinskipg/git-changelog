/*
 * git-changelog
 * https://github.com/rafinskipg/git-changelog
 */

var debug = require('debug')('changelog');

//ALLOWED_COMMITS = '^fix|^feat|^docs|BREAKING',
//git-describe - Show the most recent tag that is reachable from a commit

var Changelog = function Changelog() {
  debug('initializing constructor');
  this.setDefaults();
};

Changelog.prototype.init = require('./lib/init');
Changelog.prototype.initOptions = require('./lib/init-options');
Changelog.prototype.setDefaults = require('./lib/set-defaults');
Changelog.prototype.message = require('./lib/message');
Changelog.prototype.getProviderLinks = require('./lib/get-provider-links');
Changelog.prototype.loadChangelogRc = require('./lib/load-changelog-rc');
Changelog.prototype.getGitLogCommands = require('./lib/get-gitlog-commands');
Changelog.prototype.parseRawCommit = require('./lib/parse-raw-commit');
Changelog.prototype.linkToIssue = require('./lib/link-to-issue');
Changelog.prototype.linkToCommit = require('./lib/link-to-commit');
Changelog.prototype.currentDate = require('./lib/current-date');
Changelog.prototype.printHeader = require('./lib/print-header');
Changelog.prototype.printSection = require('./lib/print-section');
Changelog.prototype.printSalute = require('./lib/print-salute');
Changelog.prototype.readGitLog = require('./lib/read-gitlog');
Changelog.prototype.writeChangelog = require('./lib/write-change-log');
Changelog.prototype.organizeCommits = require('./lib/organize-commits');
Changelog.prototype.getPreviousTag = require('./lib/get-previous-tag');
Changelog.prototype.getRepoUrl = require('./lib/get-repo-url');
Changelog.prototype.generate = require('./lib/generate');

Changelog.prototype.log = require('./lib/log');

var changelog = new Changelog();

module.exports = changelog;
