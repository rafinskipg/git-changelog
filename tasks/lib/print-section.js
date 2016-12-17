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

function printComponent(stream, printCommitLinks, component) {
  var prefix = '-';
  
  var nested = component.commits.length > 1;
  if (nested) {
    stream.write(format('- **%s:**\n', component.name));
    prefix = '  -';
  } else {
    prefix = format('- **%s:**', component.name);
  }

  component.commits.forEach(printCommit.bind(this, stream, printCommitLinks, prefix), this);
}

function printSection(stream, section) {
  try{

  debug('printing section ...');

  if (!section.commits.length && !section.components.length) {
    return;
  }


  stream.write(format('\n## %s\n\n', section.title));

  section.commits.forEach(printCommit.bind(this, stream, section.printCommitLinks, '-'), this);
 
  section.components.forEach(printComponent.bind(this, stream, section.printCommitLinks), this);

  stream.write('\n');

  }catch(e){
    console.log(e);
  }
}

module.exports = printSection;
