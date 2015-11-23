'use strict';

var debug = require('debug')('changelog:writeChangelog');
var format = require('util').format;
var q = require('q');

function sendToStream(stream, sections, deferred) {

  var module = this;

  this.printHeader(stream, this.options, this.currentDate());

  this.options.sections.forEach(function(section){
    var sectionType = section.grep.replace('^', '');
    module.printSection(stream, section.title, sections[sectionType]);
  });

  if (sections.breaks[this.emptyComponent].length > 0 ) {
    this.printSection(stream, 'Breaking Changes', sections.breaks, false);
  }

  this.printSalute(stream);
  stream.end();
  stream.on('finish', deferred.resolve);
}

function writeChangelog(stream, commits) {
  debug('writing change log');
  var deferred = q.defer();
  var sections = {
    breaks : {}
  };

  this.options.sections.forEach(function(sectionInfo){
    var sectionType = sectionInfo.grep.replace('^', '');
    sections[sectionType] = {}; 
  });

  sections.breaks[this.emptyComponent] = [];
  this.organizeCommits(commits, sections);
  stream.on('open', sendToStream.bind(this, stream, sections, deferred));

  return deferred.promise;
}

module.exports = writeChangelog;
