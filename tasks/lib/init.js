'use strict';

var q = require('q');

function getRepoSuccess(deferred, url) {
  var provider;

  this.options.repo_url = url;
  this.message('remote', this.options.repo_url);

  this.getProviderLinks();
  this.getGitLogCommands();
  this.getCommitSections()
    .then(deferred.resolve)
    .catch(deferred.reject);
}

function getRepoFailure(deferred, err) {
  this.message('not remote');
  deferred.reject("Sorry, you doesn't have configured any origin remote or passed a `repo_url` config value");
}

function init(params) {
  this.log('debug', 'Initializing changelog options');
  var self = this;
  var deferred = q.defer();

  this.initOptions(params);

  this.getRepoUrl()
    .then(getRepoSuccess.bind(this, deferred))
    .catch(getRepoFailure.bind(this, deferred));

  return deferred.promise;
}

module.exports = init;
