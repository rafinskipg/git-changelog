'use strict';

var debug = require('debug')('changelog:getCommitSections');
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

function readDefaultSections(){
  
  return this.options.sections;
}

function getCommitSections() {
  this.log('debug','getting repo url');

  var deferred = q.defer();

  readChangelogRcFile(this.options.changelogrc, this.log.bind(this))
    .then(function(contents){
      try{
        var options = JSON.parse(contents);
        this.options.sections = options.sections;
        //TODO: Read git changelog.rc for all options not just sections
      }catch(e){
        console.log(e);
      }
      deferred.resolve(contents);
    })
    .catch(function(){
      this.log('warn', 'No .changelog.rc file found, using default settings',this.options.sections);
      deferred.resolve();
    }.bind(this));

  return deferred.promise;
}

module.exports = getCommitSections;
