/*
 * git-changelog
 * https://github.com/rafinskipg/git-changelog
 */

var fs = require('fs');
var child = require('child_process');
var format = require('util').format;

var _ = require('lodash');
var q = require('q');

var defaults = require('./defaults');

//ALLOWED_COMMITS = '^fix|^feat|^docs|BREAKING',
//git-describe - Show the most recent tag that is reachable from a commit
var GIT_TAG_CMD  = 'git describe --tags --abbrev=0';
var HEADER_TPL = '<a name="%s">%s</a>\n# %s (%s)\n\n';
var GIT_REPO_URL_CMD = 'git config --get remote.origin.url';
var EMPTY_COMPONENT = '$$';
var GIT_LOG_CMD;
var GIT_NOTAG_LOG_CMD;
var LINK_ISSUE;
var LINK_COMMIT;

// I have to clean that mess

var Changelog = function Changelog() {
  this.options = {};
  this.options.msg = '';
};

Changelog.prototype.message = function message() {
  Array.prototype.slice.call(arguments).forEach(function(value, index) {
    this.options.msg += (index ? ': ' : '') + value;
  }, this);

  this.options.msg += ';';
};

Changelog.prototype.initOptions = function initOptions(params) {
  this.options = _.defaults(params, defaults);

  this.message('name', this.options.app_name);
  this.message('file', this.options.file);
  this.message('grep_commits', this.options.grep_commits);
  this.message('debug', this.options.debug);
  this.message('version', this.options.version);
};

Changelog.prototype.init = function init(params) {
  var self = this;
  var deferred = q.defer();

  this.initOptions(params);

  this.getRepoUrl().then(function(url) {
    var provider;

    self.options.repo_url = url;
    self.message('remote', self.options.repo_url);

    //G \ B \ ---
    provider = self.options.repo_url.indexOf('github.com') !== -1 ? 'G' :'B';

    //Log commits
    GIT_LOG_CMD = 'git log ' + self.options.branch_name + ' --grep="%s" -E --format=%s %s..HEAD';
    GIT_NOTAG_LOG_CMD = 'git log ' + self.options.branch_name + ' --grep="%s" -E --format=%s';

    //This is just in case they differ their urls at some point in the future. Also brings the posibility of adding more providers
    LINK_ISSUE = ({
                    G: '[#%s]('+self.options.repo_url+'/issues/%s)',
                    B : '[#%s]('+self.options.repo_url+'/issues/%s)'})
                    [provider];

    LINK_COMMIT = ({
                    G: '[%s]('+self.options.repo_url+'/commit/%s)',
                    B: '[%s]('+self.options.repo_url+'/commits/%s)'})
                    [provider];

    deferred.resolve(self.options);
  })
  .catch(function() {
    self.message('not remote');
    deferred.reject("Sorry, you doesn't have configured any origin remote or passed a `repo_url` config value");
  });

  return deferred.promise;
};

Changelog.prototype.parseRawCommit = function parseRawCommit(raw) {
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
  return format(LINK_ISSUE, issue, issue);
};

Changelog.prototype.linkToCommit = function linkToCommit(hash) {
  return format(LINK_COMMIT, hash.substr(0, 8), hash);
};

Changelog.prototype.currentDate = function currentDate() {
  var now = new Date();
  var pad = function(i) {
    return ('0' + i).substr(-2);
  };

  return format('%d-%s-%s', now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()));
};

Changelog.prototype.printSection = function printSection(stream, title, section, printCommitLinks) {
  printCommitLinks = printCommitLinks === undefined ? true : printCommitLinks;
  var components = Object.keys(section).sort();

  if (!components.length) {
    return;
  }

  stream.write(format('\n## %s\n\n', title));

  components.forEach(function(name) {
    var prefix = '-';
    var nested = section[name].length > 1;

    if (name !== EMPTY_COMPONENT) {
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
          stream.write(',\n   ' + commit.closes.map(this.linkToIssue).join(', '));
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
  stream.write('\n\n---\n');
  stream.write('<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problem or suggestion, create an issue.* :) **Thanks** </sub></sup>');
};

Changelog.prototype.readGitLog = function prototype( git_log_command, from) {
  var self = this;
  var deferred = q.defer();

  git_log_command  =  git_log_command === GIT_LOG_CMD ? format(git_log_command, this.options.grep_commits, '%H%n%s%n%b%n==END==', from) : format(git_log_command, this.options.grep_commits, '%H%n%s%n%b%n==END==');

  this.log('Executing : ', git_log_command);

  child.exec(git_log_command , {timeout: 1000}, function(code, stdout, stderr) {
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

  sections.breaks[EMPTY_COMPONENT] = [];

  this.organizeCommitsInSections(commits, sections);

  stream.write(format(HEADER_TPL, this.options.version, this.options.app_name, this.options.version, this.currentDate()));
  this.printSection(stream, 'Bug Fixes', sections.fix);
  this.printSection(stream, 'Features', sections.feat);
  this.printSection(stream, 'Refactor', sections.refactor, false);
  this.printSection(stream, 'Style', sections.style, false);
  this.printSection(stream, 'Test', sections.test, false);
  this.printSection(stream, 'Chore', sections.chore, false);
  this.printSection(stream, 'Documentation', sections.docs, false);
  if (sections.breaks[EMPTY_COMPONENT].length > 0 ) {
    this.printSection(stream, 'Breaking Changes', sections.breaks, false);
  }

  this.printSalute(stream);
};

Changelog.prototype.organizeCommitsInSections = function organizeCommitsInSections(commits, sections) {
  commits.forEach(function(commit) {
    var section = sections[commit.type];
    var component = commit.component || EMPTY_COMPONENT;

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
  var deferred = q.defer();

  if (this.options.tag) {
    deferred.resolve(this.options.tag);
  } else if (this.options.tag === false) {
    deferred.resolve(false);
  } else {
    //IF we dont find a previous tag, we get all the commits from the beggining - The bigbang of the code
    child.exec(GIT_TAG_CMD, function(code, stdout, stderr) {
      if (code ) {
        deferred.resolve();
      } else {
        deferred.resolve(stdout.replace('\n', ''));
      }
    });
  }

  return deferred.promise;
};

Changelog.prototype.getRepoUrl = function getRepoUrl() {
  var deferred = q.defer();

  if (this.options.repo_url) {
    deferred.resolve(this.options.repo_url);
  } else {
    //IF we dont find a previous tag, we get all the commits from the beggining - The bigbang of the code
    child.exec(GIT_REPO_URL_CMD, function(code, stdout, stderr) {
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

Changelog.prototype.generate = function generate(params) {
  var self = this;
  var deferred = q.defer();

  this.init(params).then(function() {
    return self.getPreviousTag();
  }).then(function(tag) {
    var fn;

    if (typeof(tag) !== 'undefined' && tag !== false) {
      self.log('Reading git log since', tag);
      self.message('since tag', tag);

      fn = function() {
        return self.readGitLog(GIT_LOG_CMD, tag);
      }

    }else{
      self.log('Reading git log since the beggining');
      self.message('since beggining');

      fn = function() {
        return self.readGitLog(GIT_NOTAG_LOG_CMD);
      }
    }

    fn().then(function(commits) {
      self.message('parsed commits', commits.length);
      self.log('Parsed', commits.length, 'commits');
      self.log('Generating changelog to', self.options.file || 'stdout', '(', self.options.version, ')');

      self.writeChangelog(self.options.file ? fs.createWriteStream(self.options.file) : process.stdout, commits);

      deferred.resolve(self.options);
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
    console.log.apply(console, arguments);
  }
};

Changelog.prototype.warn = function warn() {
  this.log('WARNING:', format.apply(null, arguments));
};

module.exports = new Changelog();
