'use strict';

var debug = require('debug')('changelog:organizeCommits');
var format = require('util').format;

function organizeCommit(sections, commit) {
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
}

function organizeCommits(commits, sections) {
  debug('organizaing commits');
  commits.forEach(organizeCommit.bind(this, sections), this);
  return sections;
}

module.exports = organizeCommits;
