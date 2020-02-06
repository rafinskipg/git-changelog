'use strict';

const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);
const _ = require('lodash');
const log = require('./log');
const debug = require('debug')('changelog:loadTemplateFile');


function loadDefaultTemplate(logger){
  const templatePath = `${__dirname}/../../templates/template.md`;

  return readFileAsync(templatePath, 'utf8')
    .then(data => {
      logger('info', 'Found default template');
      return data;
    })
    .catch(err => {
      logger('error', 'No default template found', err);
      return null;
    });
}


function readTemplateFile(template, logger) {
  debug('finding template file');

  if(!template){
    return Promise.resolve(null);
  }

  return readFileAsync(template, 'utf8')
    .then(data => {
      logger('info', 'Found template');
      return data;
    })
    .catch(err => {
      logger('error', 'No custom template found', err);
      return loadDefaultTemplate(logger);
    });
}


function loadTemplateFile(data) {
  const { printCommit, linkToCommit, linkToIssue, options } = this;

  log.call(this, 'debug','loading template from', options.template);
  
  const viewHelpers = {
    getCommitLinks: commit => linkToCommit(commit.hash),
    getCommitCloses: commit => commit.closes.map(linkToIssue, this),
    printCommit: printCommit.bind(this)
  };

  _.extend(data, viewHelpers);

  return readTemplateFile(options.template, log.bind(this))
    .then(contents => {
      if(contents){
        try{  
          const template = _.template(contents, data);
          return template(data);
        }catch(e){
          log.call(this, 'error', 'Invalid template file', e);
          throw `Invalid template file:\n ${e}`;
        }
      }else{
        return null;
      }
    });
}

module.exports = loadTemplateFile;
