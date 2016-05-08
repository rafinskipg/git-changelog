'use strict';

var debug = require('debug')('changelog:loadChangelogRc');
var q = require('q'),
  fs = require('fs');

function readChangelogRcFile(changelogrc, logger) {
  debug('returning git repo url command');

  if(!changelogrc){
    return q.reject();
  }

  var dfd = q.defer();

  fs.readFile(changelogrc, 'utf8' ,function (err, data) {
    if (err) {
      logger('error', 'No changelog found', err);
      dfd.reject(err);
    }else{
      logger('info', 'Found changelog rc');
      dfd.resolve(data);
    }
  });

  return dfd.promise;
}


function loadChangelogRc() {
  this.log('debug','loading changelog rc specification from', this.options.changelogrc);
  var module = this;
  var deferred = q.defer();

  readChangelogRcFile(this.options.changelogrc, this.log.bind(this))
    .then(function(contents){

      try{
        contents = JSON.parse(contents);

        deferred.resolve(contents);
      }catch(e){
        module.log('warn', 'Invalid changelogrc file', e);
        return deferred.reject(e);
      }

    })
    .catch(function(){
      var sectionNames = module.options.sections.map(function(section){
        return section.title;
      }).join(', ');

      module.log('warn', 'No .changelog.rc file found, using default settings');
      module.log('info', 'Sections: ', sectionNames);
      deferred.resolve({});
    }.bind(this));

  return deferred.promise;
}

module.exports = loadChangelogRc;
