'use strict';

var debug = require('debug')('changelog:getProviderLinks');

function getProviderLinks() {
  debug('getting provider links');
  // This is just in case they differ their urls at some point in the future.
  // Also brings the posibility of adding more providers
  var providerLinks = {
    github: {
      issue: '[#%s](' + this.options.repo_url + '/issues/%s)',
      commit: '[%s](' + this.options.repo_url + '/commit/%s)'
    },
    bitbucket: {
      issue: '[#%s](' + this.options.repo_url + '/issues/%s)',
      commit: '[%s](' + this.options.repo_url + '/commits/%s)'
    }
  };

  this.provider = this.options.repo_url.indexOf('github.com') !== -1 ? 'github' :'bitbucket';
  this.links = providerLinks[this.provider];
}

module.exports = getProviderLinks;
