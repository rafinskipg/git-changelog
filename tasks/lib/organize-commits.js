'use strict';

var debug = require('debug')('changelog:organizeCommits');
var format = require('util').format;
var _ = require('lodash');

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
    section.commitsCount++;
    
    if(component === this.emptyComponent){
      section.commits.push(commit)
    }else{
      section.components[component] = section.components[component] || [];
      section.components[component].push(commit);  
    }
  }

  if (commit.breaking) {
    //Add it to the breaking list))
    sections.BREAKING.commitsCount++;
    var breakingCommit = {
      subject: format("due to %s,\n %s", this.linkToCommit(commit.hash), commit.breaking),
      hash: commit.hash,
      closes: []
    };

    if(component === this.emptyComponent){
      sections.BREAKING.commits.push(breakingCommit)
    }else{
      sections.BREAKING.components[component] = sections.BREAKING.components[component] || [];
      sections.BREAKING.components[component].push(breakingCommit);  
    }
  }
}

function organizeCommits(commits, defaultSections) {
  var sections = {
    BREAKING : {
      components: {},
      commitsCount: 0,
      title: 'Breaking Changes',
      commits: [],
      type: 'BREAKING'
    }
  };


  defaultSections.forEach(function(sectionInfo){
    var sectionType = sectionInfo.grep.replace('^', '');
    
    sections[sectionType] = {
      title: sectionInfo.title,
      components: {},
      commits: [],
      commitsCount: 0,
      type: sectionType
    };
  });

  debug('organizaing commits');

  commits.forEach(organizeCommit.bind(this, sections), this);

  return _.compact(Object.keys(sections).map(function(key){
    var section = sections[key]
    
    section.components = Object.keys(section.components).sort().map(function(key){
      return { name: key, 
        commits: section.components[key]
      }
    })

    return section.commitsCount > 0 ? section : null;
  }))
}

module.exports = organizeCommits;
