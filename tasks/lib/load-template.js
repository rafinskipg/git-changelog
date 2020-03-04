'use strict';


const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);
const _ = require('lodash');
const log = require('./log');
const debug = require('debug')('changelog:loadTemplateFile');


function loadDefaultTemplate(templatePath, logger){
  
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


function readTemplateFile(template, defaultTemplate, logger) {
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
      return loadDefaultTemplate(defaultTemplate, logger);
    });
}

function loadCommitTemplateFile(file, defaultTemplate, log) {
  return readTemplateFile(file, defaultTemplate, log)
  .then(contents => {
    log('debug', 'Commit template loaded');
    return contents;
  })
  .catch(err => {
    log('error', 'Error loading commit template', err);
    return null;
  });
}

function loadTemplateFile(data) {

  this.log('debug','loading template from', this.options.template);
  this.log('debug', 'loading commit template from ', this.options.commit_template);
  const { printCommit, linkToCommit, linkToIssue, options } = this;

  const commitTemplatePath =  `${__dirname}/../../templates/commit_template.md`;
  const templatePath = `${__dirname}/../../templates/template.md`;
  
  return loadCommitTemplateFile(options.commit_template, commitTemplatePath, this.log.bind(this))
    .then(commitTemplate => {
 
      const viewHelpers = {
        getCommitLinks: commit => linkToCommit(commit.hash),
        getCommitCloses: commit => commit.closes.map(linkToIssue, this),
        printCommit: (commit, printCommitLinks) => printCommit.bind(this)(commit, printCommitLinks, commitTemplate)
      };

      _.extend(data, viewHelpers);
      

      return readTemplateFile(options.template, templatePath,  log.bind(this))
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

    });
  
}

module.exports = loadTemplateFile;
