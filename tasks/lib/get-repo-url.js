'use strict';

const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const debug = require('debug')('changelog:getRepoUrl');
const getGitRepoInfo = require('./get-git-repo-info');

function cmdDone(code, stdout) {
  debug('returning git repo url command');

  if (code) {
    throw "Sorry, you've not configured an origin remote or passed a `repo_url` config value";
  } else {
    let { repoUrl } = getGitRepoInfo(stdout);

    return repoUrl;
  }
}

function getRepoUrl() {
  debug('getting repo url');

  if (this.options.repo_url) {
    return Promise.resolve(this.options.repo_url);
  } else {
    //IF we dont find a previous tag, we get all the commits from the beginning - The bigbang of the code
    debug('calling git repo url command');

    return execAsync(this.cmd.gitRepoUrl)
      .then(({code, stdout}) => cmdDone(code, stdout));

  }

}

module.exports = getRepoUrl;
