'use strict';

var debug = require('debug')('changelog:organizeCommits');
var format = require('util').format;

function grepSection(sections, commit){
  //TODO: MONKEY METHOD, please use the regexp greps

  var keys = Object.keys(sections);

  for (var i = 0; i < keys.length; i++){
    if(commit.subject.indexOf(keys[i]) === 0){
      return sections[keys[i]];
    }
  }

  return null;
}

function organizeCommit(sections, commit) {
  var section = commit.type ? sections[commit.type] : grepSection(sections, commit) ;
  
  var component = commit.component ? commit.component.toLowerCase() : this.emptyComponent;
  if (section) {
    section[component] = section[component] || [];
    section[component].push(commit);
  }

  if (commit.breaking) {
    sections.BREAKING[component] = sections.BREAKING[component] || [];
    sections.BREAKING[component].push({
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
