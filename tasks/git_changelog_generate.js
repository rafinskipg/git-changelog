/*
 * git-changelog
 * https://github.com/rafinskipg/git-changelog
 */

var fs = require('fs');
var path = require('path');
var child = require('child_process');
var format = require('util').format;

var debug = require('debug')('changelog');
var _ = require('lodash');
var q = require('q');

var defaults = require('./defaults');

//ALLOWED_COMMITS = '^fix|^feat|^docs|BREAKING',
//git-describe - Show the most recent tag that is reachable from a commit

var Changelog = function Changelog() {
  debug('initializing constructor');
  this.setDefaults();
};

Changelog.prototype.setDefaults = function setDefaults() {
  debug('setting defaults');
  this.options = {};
  this.cmd = {
    gitTag: 'git describe --tags --abbrev=0',
    gitRepoUrl: 'git config --get remote.origin.url',
    gitLog: null,
    gitLogNoTag: null
  };
  this.header = '<a name="%s">%s</a>\n# %s (%s)\n\n';
  this.emptyComponent = '$$';
  this.links = null;
  this.provider = null;
};

Changelog.prototype.message = function message() {
  debug('adding message');
  Array.prototype.slice.call(arguments).forEach(function(value, index) {
    this.options.msg += (index ? ': ' : '') + value;
  }, this);

  this.options.msg += ';';
};

Changelog.prototype.initOptions = function initOptions(params) {
  debug('initializing options');
  this.setDefaults();

  this.options = _.defaults(params, defaults);
  this.options.msg = '';

  this.message('name', this.options.app_name);
  this.message('file', this.options.file);
  this.message('grep_commits', this.options.grep_commits);
  this.message('debug', this.options.debug);
  this.message('version', this.options.version);

};

Changelog.prototype.getProviderLinks = function getProviderLinks() {
  debug('getting provider links');
  // This is just in case they differ their urls at some point in the future.
  // Also brings the posibility of adding more providers
  var providerLinks = {
    github: {
      issue: '[#%s](' + this.options.repo_url + '/issues/%s)',
      commit: '[%s](' + this.options.repo_url + '/commit/%s)'
    },
    bitbucket: {
      issue: '[#%s](' + this.options.repo_url + '/issues/%s)',
      commit: '[%s](' + this.options.repo_url + '/commits/%s)'
    }
  };

  this.provider = this.options.repo_url.indexOf('github.com') !== -1 ? 'github' :'bitbucket';
  this.links = providerLinks[this.provider];
};

Changelog.prototype.getGitLogCommands = function getGitLogCommands() {
  debug('getting log commands');
  this.cmd.gitLog = 'git log ' + this.options.branch_name + ' --grep="%s" -E --format=%s %s..HEAD';
  this.cmd.gitLogNoTag = 'git log ' + this.options.branch_name + ' --grep="%s" -E --format=%s';
};

Changelog.prototype.init = function init(params) {
  debug('initializing ...');
  var self = this;
  var deferred = q.defer();

  this.initOptions(params);

  this.getRepoUrl().then(function(url) {
    var provider;

    self.options.repo_url = url;
    self.message('remote', self.options.repo_url);

    self.getProviderLinks();
    self.getGitLogCommands();

    deferred.resolve(self.options);
  })
  .catch(function(err) {
    self.message('not remote');
    deferred.reject("Sorry, you doesn't have configured any origin remote or passed a `repo_url` config value");
  });

  return deferred.promise;
};

Changelog.prototype.parseRawCommit = function parseRawCommit(raw) {
  debug('parsing raw commit');
  if (!raw) {
    return null;
  }

  var lines = raw.split('\n');
  var msg = {}, match;

  msg.closes = [];
  msg.breaks = [];

  lines.forEach(function(line) {
    match = line.match(/(?:Closes|Fixes)\s#(\d+)/);
    if (match) {
      msg.closes.push(parseInt(match[1], 10));
    }
  });

  msg.hash = lines.shift();
  msg.subject = lines.shift();

  match = raw.match(/BREAKING CHANGE:([\s\S]*)/);
  if (match) {
    msg.breaking = match[1];
  }

  msg.body = lines.join('\n');
  match = msg.subject.match(/^(.*)\((.*)\)\:\s(.*)$/);

  if (!match) {
    match = msg.subject.match(/^(.*)\:\s(.*)$/);
    if (!match) {
      this.warn('Incorrect message: %s %s', msg.hash, msg.subject);
      return null;
    }
    msg.type = match[1];
    msg.subject = match[2];

    return msg;
  }

  msg.type = match[1];
  msg.component = match[2];
  msg.subject = match[3];

  return msg;
};

Changelog.prototype.linkToIssue = function linkToIssue(issue) {
  debug('generating link to issue');
  return format(this.links.issue, issue, issue);
};

Changelog.prototype.linkToCommit = function linkToCommit(hash) {
  debug('generating link to commit');
  return format(this.links.commit, hash.substr(0, 8), hash);
};

Changelog.prototype.currentDate = function currentDate() {
  debug('getting current date');
  var now = new Date();
  var pad = function(i) {
    return ('0' + i).substr(-2);
  };

  return format('%d-%s-%s', now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()));
};

Changelog.prototype.printSection = function printSection(stream, title, section, printCommitLinks) {
  debug('printing section ...');
  printCommitLinks = printCommitLinks === undefined ? true : printCommitLinks;
  var components = Object.keys(section).sort();

  if (!components.length) {
    return;
  }

  stream.write(format('\n## %s\n\n', title));

  components.forEach(function(name) {
    var prefix = '-';
    var nested = section[name].length > 1;

    if (name !== this.emptyComponent) {
      if (nested) {
        stream.write(format('- **%s:**\n', name));
        prefix = '  -';
      } else {
        prefix = format('- **%s:**', name);
      }
    }

    section[name].forEach(function(commit) {
      if (printCommitLinks) {
        stream.write(format('%s %s\n  (%s', prefix, commit.subject, this.linkToCommit(commit.hash)));

        if (commit.closes.length) {
          stream.write(',\n   ' + commit.closes.map(this.linkToIssue, this).join(', '));
        }
        stream.write(')\n');
      } else {
        stream.write(format('%s %s\n', prefix, commit.subject));
      }
    }, this);
  }, this);

  stream.write('\n');
};

Changelog.prototype.printSalute = function printSalute(stream) {
  debug('printing salute');
  stream.write('\n\n---\n');
  stream.write('<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>');
};

Changelog.prototype.readGitLog = function readGitLog(git_log_command, from) {
  debug('reading git log ...');
  var self = this;
  var deferred = q.defer();

  git_log_command  =  git_log_command === this.cmd.gitLog ? format(git_log_command, this.options.grep_commits, '%H%n%s%n%b%n==END==', from) : format(git_log_command, this.options.grep_commits, '%H%n%s%n%b%n==END==');

  this.log('Executing : ', git_log_command);

  debug('executing git log command');
  child.exec(git_log_command , {timeout: 1000}, function(code, stdout, stderr) {
    debug('returning from git log command');
    var commits = [];
    stdout.split('\n==END==\n').forEach(function(rawCommit) {
      var commit = self.parseRawCommit(rawCommit);
      if (commit) {
        commits.push(commit);
      }
    });

    deferred.resolve(commits);
  });

  return deferred.promise;
};

Changelog.prototype.writeChangelog = function writeChangelog(stream, commits) {
  debug('writing change log');
  var deferred = q.defer();
  var sections = {
    fix: {},
    feat: {},
    breaks: {},
    style: {},
    refactor: {},
    test: {},
    chore: {},
    docs: {}
  };

  sections.breaks[this.emptyComponent] = [];

  this.organizeCommits(commits, sections);

  stream.on('open', function() {
    stream.write(format(this.header, this.options.version, this.options.app_name, this.options.version, this.currentDate()));

    this.printSection(stream, 'Bug Fixes', sections.fix);
    this.printSection(stream, 'Features', sections.feat);
    this.printSection(stream, 'Refactor', sections.refactor, false);
    this.printSection(stream, 'Style', sections.style, false);
    this.printSection(stream, 'Test', sections.test, false);
    this.printSection(stream, 'Chore', sections.chore, false);
    this.printSection(stream, 'Documentation', sections.docs, false);
    if (sections.breaks[this.emptyComponent].length > 0 ) {
      this.printSection(stream, 'Breaking Changes', sections.breaks, false);
    }

    this.printSalute(stream);
    stream.end();
    stream.on('finish', function() {
      deferred.resolve();
    });
    
  }.bind(this));

  return deferred.promise;
};

Changelog.prototype.organizeCommits = function organizeCommits(commits, sections) {
  debug('organizaing commits');
  commits.forEach(function(commit) {
    var section = sections[commit.type];
    var component = commit.component || this.emptyComponent;

    if (section) {
      section[component] = section[component] || [];
      section[component].push(commit);
    }

    if (commit.breaking) {
      sections.breaks[component] = sections.breaks[component] || [];
      sections.breaks[component].push({
        subject: format("due to %s,\n %s", this.linkToCommit(commit.hash), commit.breaking),
        hash: commit.hash,
        closes: []
      });
    }
  }, this);

  return sections;
};

Changelog.prototype.getPreviousTag = function getPreviousTag() {
  debug('getting previous tag');
  var deferred = q.defer();

  if (this.options.tag) {
    deferred.resolve(this.options.tag);
  } else if (this.options.tag === false) {
    deferred.resolve(false);
  } else {
    //IF we dont find a previous tag, we get all the commits from the beggining - The bigbang of the code
    debug('calling git tag command');
    child.exec(this.cmd.gitTag, function(code, stdout, stderr) {
      debug('returning from git tag');
      if (code) {
        deferred.reject();
      } else {
        deferred.resolve(stdout.replace('\n', ''));
      }
    });
  }

  return deferred.promise;
};

Changelog.prototype.getRepoUrl = function getRepoUrl() {
  debug('getting repo url');
  var deferred = q.defer();

  if (this.options.repo_url) {
    deferred.resolve(this.options.repo_url);
  } else {
    //IF we dont find a previous tag, we get all the commits from the beggining - The bigbang of the code
    debug('calling git repo url command');
    child.exec(this.cmd.gitRepoUrl, function(code, stdout, stderr) {
      debug('returning git repo url command');
      if (code) {
        deferred.reject();
      } else {
        stdout = stdout.replace('\n', '').replace('.git', '');
        deferred.resolve(stdout);
      }
    });
  }

  return deferred.promise;
};

Changelog.prototype.checkPath = function chekPath(dirname, done) {
  fs.stat(dirname, function (err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        this.checkPath(path.dirname(dirname), function (err) {
          if (err) {
            throw err;
          } else {
            fs.mkdir(dirname, function (err) {
              if (err) {
                throw err;
              }
              done();
            });
          }
        });
      } else {
        throw err;
      }
    } else if (stats.isDirectory()) {
      done();
    } else {
      throw new Error(dirname + ' exists and is not a directory');
    }
  }.bind(this));
};

Changelog.prototype.getStream = function getStream(filename) {
  debug('getting stream ...');
  var deferred = q.defer();
  var stream;

  if (filename) {
    this.checkPath(path.dirname(filename), function() {
      deferred.resolve(fs.createWriteStream(filename));
    });
  } else {
    deferred.resolve(process.stdout);
  }

  return deferred.promise;
};

Changelog.prototype.generate = function generate(params) {
  debug('generating ...');
  var self = this;
  var deferred = q.defer();

  this.init(params).then(function() {
    return self.getPreviousTag();
  }).then(function(tag) {
    var readGitLog;

    if (typeof(tag) !== 'undefined' && tag !== false) {
      self.log('Reading git log since', tag);
      self.message('since tag', tag);
      readGitLog = self.readGitLog.bind(self, self.cmd.gitLog, tag);
    } else {
      self.log('Reading git log since the beggining');
      self.message('since beggining');
      readGitLog = self.readGitLog.bind(self, self.cmd.gitLogNoTag);
    }

    readGitLog().then(function(commits) {
      self.message('parsed commits', commits.length);
      self.log('Parsed', commits.length, 'commits');
      self.log('Generating changelog to', self.options.file || 'stdout', '(', self.options.version, ')');

      self.getStream(self.options.file).then(function(stream) {
        self.writeChangelog(stream, commits).then(function() {
          deferred.resolve(self.options);
        });
      });
    }).catch(function(err) {
      console.log('error', err);
    });
  }).catch(function(err) {
    console.log('Error generating changelog ', err);
    deferred.reject(err);
  });

  return deferred.promise;
};

Changelog.prototype.log = function log() {
  if (this.options.debug) {
    console.log.apply(null, arguments);
  }
};

Changelog.prototype.warn = function warn() {
  this.log('WARNING:', format.apply(null, arguments));
};

var changelog = new Changelog();

module.exports = changelog;
