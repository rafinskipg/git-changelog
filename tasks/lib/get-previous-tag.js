'use strict';

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const log = require('./log');
const debug = require('debug')('changelog:getPreviousTag');

function cmdDone({code, stdout}) {
  debug('returning from git tag');
  //I think this command it's actually not working and always return empty
  // Consider trying git describe --abbrev=0 --tags
  if (code) {
    throw 'Could not return previous git tag';
  } else {
    return stdout.replace('\n', '');
  }
}

function getPreviousTag() {

  if (this.options.tag) {
    return Promise.resolve(this.options.tag);
  } else if (this.options.tag === false) {
    return Promise.resolve(false);
  } else {
    log.call(this, 'debug', 'Getting last tag');
    //IF we dont find a previous tag, we get all the commits from the beggining - The bigbang of the code
    debug('calling git tag command');
    return execAsync(this.cmd.gitTag).then(cmdDone.bind(this));
  }
    
}

module.exports = getPreviousTag;
