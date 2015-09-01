'use strict';

var debug = require('debug')('changelog:printSalute');

function printSalute(stream) {
  debug('printing salute');
  stream.write('\n\n---\n');
  stream.write('<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problems or suggestions, create an issue.* :) **Thanks** </sub></sup>');
}

module.exports = printSalute;
