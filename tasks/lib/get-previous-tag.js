'use strict';

var debug = require('debug')('changelog:getPreviousTag');
var child = require('child_process');

function cmdDone(resolve, reject, code, stdout, stderr) {
  debug('returning from git tag');
  if (code) {
    reject();
  } else {
    resolve(stdout.replace('\n', ''));
  }
}

function getPreviousTag() {
  var module = this;

  return new Promise(function(resolve, reject){
    if (module.options.tag) {
      resolve(module.options.tag);
    } else if (module.options.tag === false) {
      resolve(false);
    } else {
      module.log('debug', 'Getting last tag');
      //IF we dont find a previous tag, we get all the commits from the beggining - The bigbang of the code
      debug('calling git tag command');
      child.exec(module.cmd.gitTag, cmdDone.bind(null, resolve, reject));
    }  
  });
}

module.exports = getPreviousTag;
