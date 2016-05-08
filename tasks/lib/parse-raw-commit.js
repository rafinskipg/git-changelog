'use strict';

var debug = require('debug')('changelog:parseRawCommit');

function parseLine(msg, line) {
  var match = line.match(/(?:Closes|Fixes)\s#(\d+)/);
  if (match) {
    msg.closes.push(parseInt(match[1], 10));
  }
}

function parseRawCommit(raw) {
  debug('parsing raw commit');
  if (!raw) {
    return null;
  }

  var lines = raw.split('\n');
  var msg = {}, match;

  msg.closes = [];
  msg.breaks = [];

  lines.forEach(parseLine.bind(null, msg));

  msg.hash = lines.shift();
  msg.subject = lines.shift();

  match = raw.match(/BREAKING CHANGE:([\s\S]*)/);
  if (match) {
    msg.breaking = match[1];
  }

  msg.body = lines.join('\n');
  match = msg.subject.match(/^(.*)\((.*)\)\:\s(.*)$/);
  //@TODO: match merges and pull request messages
  if (!match) {
    match = msg.subject.match(/^(.*)\:\s(.*)$/);
    
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
