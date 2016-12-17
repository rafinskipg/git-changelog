'use strict';

var debug = require('debug')('changelog:loadTemplateFile');
var q = require('q');
var _ = require('lodash');
var fs = require('fs');

function readTemplateFile(template, logger) {
  debug('finding template file');

  if(!template){
    return Promise.resolve(null);
  }

  var dfd = q.defer();

  fs.readFile(template, 'utf8' ,function (err, data) {
    if (err) {
      logger('error', 'No template found', err);
      dfd.resolve(null);
    }else{
      logger('info', 'Found template rc');
      dfd.resolve(data);
    }
  });

  return dfd.promise;
}


function loadTemplateFile(data) {
  this.log('debug','loading template from', this.options.template);
  
  var module = this;

  var viewHelpers = {
    getCommitLinks: function(commit){
      return module.linkToCommit(commit.hash);
    },
    getCommitCloses: function(commit){
      return commit.closes.map(module.linkToIssue, module);
    }
  };

  _.extend(data, viewHelpers);

  return readTemplateFile(this.options.template, this.log.bind(this))
    .then(function(contents){
      if(contents){
        try{  
          var fn = _.template(contents, data);
          var tpl =  fn(data);
          return tpl;
        }catch(e){
          module.log('warn', 'Invalid template file', e);
          throw 'Invalid template file \n' + e;
        }
      }else{
        return null;
      }
    });
}

module.exports = loadTemplateFile;
