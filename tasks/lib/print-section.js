'use strict';

var debug = require('debug')('changelog:printSection');
var format = require('util').format;

function printCommit(stream, printCommitLinks, prefix, commit) {
  if (printCommitLinks) {
    stream.write(format('%s %s\n  (%s', prefix, commit.subject, this.linkToCommit(commit.hash)));

    if (commit.closes.length) {
      stream.write(',\n   ' + commit.closes.map(this.linkToIssue, this).join(', '));
    }
    stream.write(')\n');
  } else {
    stream.write(format('%s %s\n', prefix, commit.subject));
  }
}

function printComponent(stream, section, printCommitLinks, name) {
  var prefix = '-';
  var nested = section[name].length > 1;

  if (name !== this.emptyComponent) {
    if (nested) {
      stream.write(format('- **%s:**\n', name));
      prefix = '  -';
    } else {
      prefix = format('- **%s:**', name);
    }
  }

  section[name].forEach(printCommit.bind(this, stream, printCommitLinks, prefix), this);
}

function printSection(stream, title, section, printCommitLinks) {
  debug('printing section ...');
  printCommitLinks = printCommitLinks === undefined ? true : printCommitLinks;
  var components = Object.keys(section).sort();

  if (!components.length) {
    return;
  }

  stream.write(format('\n## %s\n\n', title));

  components.forEach(printComponent.bind(this, stream, section, printCommitLinks), this);

  stream.write('\n');
}

module.exports = printSection;
