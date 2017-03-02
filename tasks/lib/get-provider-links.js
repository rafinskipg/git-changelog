'use strict';

var debug = require('debug')('changelog:getProviderLinks');

function getProviderLinks() {
    debug('getting provider links');
    // This is just in case they differ their urls at some point in the future.
    // Also brings the posibility of adding more providers
    var providerLinks = {
        github: {
            issue: '[#%s](%issue_url%/issues/%s)',
            commit: '[%s](' + this.options.repo_url + '/commit/%s)'
        },
        bitbucket: {
            issue: '[#%s](%issue_url%/issues/%s)',
            commit: '[%s](' + this.options.repo_url + '/commits/%s)'
        },
        gitlab: {
            issue: '[#%s](%issue_url%/issues/%s)',
            commit: '[%s](' + this.options.repo_url + '/commit/%s)'
        }
    };

    if (this.options.provider && typeof(providerLinks[this.options.provider]) !== 'undefined') {
        this.provider = this.options.provider;
    }
    else {
        if (this.options.repo_url.match(/bitbucket/)) {
            this.provider = 'bitbucket';
        } else if (this.options.repo_url.match(/gitlab/)) {
            this.provider = 'gitlab';
        } else {
            // use github as default provider
            this.provider = 'github';
        }
    }
    this.links = providerLinks[this.provider];
    this.links.issue = this.links.issue.replace('%issue_url%', this.options.issue_url || this.options.repo_url)

}

module.exports = getProviderLinks;
