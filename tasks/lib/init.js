'use strict';

const log = require('./log');
const _ = require('lodash');

function setOptions(options) {
  this.options = _.defaults(options, this.options);

  log.call(this, 'info', '  - The APP name is', this.options.app_name);
  log.call(this, 'info', '  - The output file is', this.options.file);
  log.call(this, 'info', '  - The template file is', this.options.template);
  log.call(this, 'info', '  - The commit template file is', this.options.commit_template);

  this.options.grep_commits = this.options.sections.map(({ grep }) => grep).join('|');

  log.call(this, 'debug', 'Grep commits: ', this.options.grep_commits);

  return options;
}

function getRepoSuccess(url) {
  this.options.repo_url = url;
  this.message('remote', this.options.repo_url);

  this.getProviderLinks();
  this.getGitLogCommands();
}

function getRepoFailure(err) {
  this.message('not remote');
  throw err;
}

function init(params, loadRC) {
  log.call(this, 'debug', 'Initializing changelog options');

  this.initOptions(params);

  const promise = loadRC ? this.loadChangelogRc() : Promise.resolve(params);

  return promise
    .then(setOptions.bind(this))
    .then(this.getRepoUrl.bind(this))
    .then(getRepoSuccess.bind(this))
    .catch(getRepoFailure.bind(this));
}

module.exports = init;
