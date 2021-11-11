'use strict';

var debug = require('debug')('changelog:parseRawCommit');

function parseLine(msg, line) {
  var match = line.match(/(?:Closes|Fixes)\s#(\d+)/);
  if (match) {
    msg.closes.push(parseInt(match[1], 10));
  }
}

function isPRMergeCommit(msg) {
  var match = msg && msg.match(/Merge pull/);

  return (match) ? true : false;
}

function parseRawCommit(raw, useCommitBody) {
  debug('parsing raw commit');
  if (!raw) {
    return null;
  }

  if (!useCommitBody) {
    useCommitBody = false;
  }

  var lines = raw.split('\n');
  var msg = {}, match;

  msg.closes = [];
  msg.breaks = [];

  lines.forEach(parseLine.bind(null, msg));
  
  msg.hash = lines.shift();
  msg.subject = lines.length > 0 ? lines.shift() : '';

  match = raw.match(/BREAKING CHANGE:([\s\S]*)/);
  
  if (match) {
    msg.breaking = match[1];
  }

  if (msg.subject && lines.length > 0 && isPRMergeCommit(msg.subject) && useCommitBody) {
    // Replace subject with first line of the merge commit
    msg.subject = lines.shift();
  }

  msg.body = lines.join('\n');

  const subjectWithScopeRegex = /^(.*)\((.*)\)\:\s(.*)$/;
  const subjectWithoutScopeRegex = /^(.*)\:\s(.*)$/;
  match = msg.subject.match(subjectWithScopeRegex);

  //@TODO: match merges and pull request messages
  if (!match) {
    match = msg.subject && msg.subject.match(subjectWithoutScopeRegex);

    if (!match) {
      //console.log(msg.subject, '------------');
      this.log('warn', 'Incorrect message:', msg.hash, msg.subject);

      //return null;
    }
    msg.type = match ? match[1] : null;
    msg.subject = match ? match[2] : msg.subject;

    return msg;
  }

  msg.type = match[1];
  msg.component = match[2];
  msg.subject = match[3];

  return msg;
}

module.exports = parseRawCommit;
