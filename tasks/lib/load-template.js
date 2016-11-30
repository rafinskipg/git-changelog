'use strict';

var debug = require('debug')('changelog:loadTemplateFile');
var q = require('q'),
  fs = require('fs');

function readTemplateFile(template, logger) {
  debug('finding template file');

  if(!template){
    return q.reject();
  }

  var dfd = q.defer();

  fs.readFile(template, 'utf8' ,function (err, data) {
    if (err) {
      logger('error', 'No template found', err);
      dfd.reject(err);
    }else{
      logger('info', 'Found template rc');
      dfd.resolve(data);
    }
  });

  return dfd.promise;
}


function loadTemplateFile() {
  this.log('debug','loading template from', this.options.template);
  var module = this;
  var deferred = q.defer();

  readTemplateFile(this.options.template, this.log.bind(this))
    .then(function(contents){

      try{
        console.log(contents)
        //contents = JSON.parse(contents);

        deferred.resolve(contents);
      }catch(e){
        module.log('warn', 'Invalid template file', e);
        return deferred.reject(e);
      }

    })
    .catch(function(){
      var sectionNames = module.options.sections.map(function(section){
        return section.title;
      }).join(', ');

      module.log('warn', 'No .template.rc file found, using default settings');
      module.log('info', 'Sections: ', sectionNames);
      deferred.resolve({});
    }.bind(this));

  return deferred.promise;
}

module.exports = loadTemplateFile;
