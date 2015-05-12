'use strict';

var debug = require('debug')('changelog:linkToIssue');
var format = require('util').format;

function linkToIssue(issue) {
  debug('generating link to issue');
  return format(this.links.issue, issue, issue);
}

module.exports = linkToIssue;
