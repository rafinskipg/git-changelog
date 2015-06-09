'use strict';

var debug = require('debug')('changelog:getCommitSections');
var q = require('q'),
  fs = require('fs');

function readChangelogRcFile(changelogrc) {
  debug('returning git repo url command');

  if(!changelogrc){
    return q.reject();
  }

  var dfd = q.defer();

  fs.readFile(changelogrc, function (err, data) {
    if (err) {
      dfd.reject(err);
    }else{
      dfd.resolve(data);
    }
  });

  return dfd.promise;
}

function readDefaultSections(){

}

function getCommitSections() {
  debug('getting repo url');

  var deferred = q.defer();

  readChangelogRcFile(this.options.changelogrc)
    .then(function(contents){
      console.log(contents);
      deferred.resolve(contents);
    })
    .catch(function(){
      deferred.resolve(readDefaultSections());
    });

  return deferred.promise;
}

module.exports = getCommitSections;
