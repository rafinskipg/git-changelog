
var debug = require('debug')('changelog:printSection');
var format = require('util').format;

function printCommit(commit, printCommitLinks) {
  var prefix = '';
  var result = '';

  if (printCommitLinks) {
    result += format('%s\n  (%s', commit.subject, this.linkToCommit(commit.hash));

    if (commit.closes.length) {
     result += ',\n   ' + commit.closes.map(this.linkToIssue, this).join(', ');
    }
    result += ')\n';
  } else {
    result += format('%s\n', commit.subject);
  }

  return result;
}

module.exports = printCommit;