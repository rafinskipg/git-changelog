'use strict';

const log = require('./log');
const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);

const debug = require('debug')('changelog:loadChangelogRc');

function readChangelogRcFile(changelogrc, logger) {
  debug('finding changelogrc file');

  if(!changelogrc){
    return Promise.reject();
  }

  return readFileAsync(changelogrc, 'utf8')
    .then(data => {
      logger('info', 'Found changelog rc');
      return data;
    })
    .catch(err => {
      logger('error', 'No changelog found', err);
      throw err;
    });
}


function loadChangelogRc() {
  const { changelogrc, sections } = this.options;

  log.call(this, 'debug','loading changelog rc specification from', changelogrc);

  return readChangelogRcFile(this.options.changelogrc, log.bind(this))
    .then(contents => {

      try{
        contents = JSON.parse(contents);
        return contents;
      }catch(e){
        log.call(this, 'error', 'Invalid changelogrc file:\r\n', e);
        throw `Invalid changelogrc file:\r\n ${e}`;
      }

    })
    .catch(() => {
      var sectionNames = sections.map(section => section.title).join(', ');

      log.call(this, 'error', 'No .changelog.rc file found, using default settings');
      log.call(this, 'info', 'Sections: ', sectionNames);
      return {};
    });
}

module.exports = loadChangelogRc;
