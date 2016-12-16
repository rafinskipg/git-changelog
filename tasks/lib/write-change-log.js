'use strict';

var debug = require('debug')('changelog:writeChangelog');
var format = require('util').format;
var _ = require('lodash');
var fse = require('fs-extra');

function sendToStream(stream, sections, resolve) {

  var module = this;

  this.printHeader(stream, this.options, this.currentDate());

  Object.keys(sections).forEach(function(sectionType){
    var section = sections[sectionType]
    if(sectionType !== 'BREAKING'){
      module.printSection(stream, section.title, section.commits);
    }else if (sections.BREAKING.commits[module.emptyComponent].length > 0 ) {
      module.printSection(stream, sections.BREAKING.title, sections.BREAKING.commits, false);
    }
  });

  this.printSalute(stream);
  stream.end();
  stream.on('finish', resolve);
}

function writeChangelog(options, commits, sectionsdef) {
  var module = this;

  debug('writing change log');

  var sections = this.organizeCommits(commits, this.options.sections);
  
  var stream;

  if (module.options.file) {
    stream = fse.createOutputStream(module.options.file);
  } else {
    stream = process.stdout;
  }

  console.log(module.options)
        
  var data = {
    logo: module.options.logo,
    sections: sections,
    intro: module.options.intro,
    title: module.options.app_name,
    version:{
      number: module.options.tag,
      name: module.options.name
    } 
  }


  return new Promise(function(resolve, reject){
    this.loadTemplate(data)
      .then(function(template){
        if(template){
          console.log('Proceding with template')

          stream.on('open', function(){
            stream.write(template);
            console.
            stream.end();
            resolve();
          });

        }else {
          console.log('Standard printing output')
          stream.on('open', sendToStream.bind(module, stream, sections, resolve));
        }
      })
      .catch(reject)
  })
}

function writeTemplateChangelog(stream, sections, resolve, reject){

}

module.exports = writeChangelog;
