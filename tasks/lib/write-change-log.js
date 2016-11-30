'use strict';

var debug = require('debug')('changelog:writeChangelog');
var format = require('util').format;
var fse = require('fs-extra');

function sendToStream(stream, sections, resolve) {

  var module = this;

  this.printHeader(stream, this.options, this.currentDate());

  this.options.sections.forEach(function(section){
    var sectionType = section.grep.replace('^', '');
    if(sectionType !== 'BREAKING'){
      module.printSection(stream, section.title, sections[sectionType]);
    }else if (sections.BREAKING[module.emptyComponent].length > 0 ) {
      module.printSection(stream, 'Breaking Changes', sections.BREAKING, false);
    }
  });

  this.printSalute(stream);
  stream.end();
  stream.on('finish', resolve);
}

function writeChangelog(options, commits, sectionsdef) {
  var module = this;

  debug('writing change log');

  var sections = {
    BREAKING : {}
  };

  this.options.sections.forEach(function(sectionInfo){
    var sectionType = sectionInfo.grep.replace('^', '');
    sections[sectionType] = {}; 
  });

  sections.BREAKING[this.emptyComponent] = [];
  this.organizeCommits(commits, sections);

  var stream;
  
  return new Promise(function(resolve, reject){
    if (module.options.file) {
      stream = fse.createOutputStream(module.options.file);
    } else {
      stream = process.stdout;
    }

    stream.on('open', sendToStream.bind(module, stream, sections, resolve));

  })
}

function writeTemplateChangelog(stream, sections, resolve, reject){

}

module.exports = writeChangelog;
