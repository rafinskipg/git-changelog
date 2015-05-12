'use strict';

var debug = require('debug')('changelog:writeChangelog');
var format = require('util').format;
var q = require('q');

function sendToStream(stream, sections, deferred) {
  stream.write(format(this.header, this.options.version, this.options.app_name, this.options.version, this.currentDate()));

  this.printSection(stream, 'Bug Fixes', sections.fix);
  this.printSection(stream, 'Features', sections.feat);
  this.printSection(stream, 'Refactor', sections.refactor, false);
  this.printSection(stream, 'Style', sections.style, false);
  this.printSection(stream, 'Test', sections.test, false);
  this.printSection(stream, 'Chore', sections.chore, false);
  this.printSection(stream, 'Documentation', sections.docs, false);
  if (sections.breaks[this.emptyComponent].length > 0 ) {
    this.printSection(stream, 'Breaking Changes', sections.breaks, false);
  }

  this.printSalute(stream);
  stream.end();
  stream.on('finish', deferred.resolve);
}

function writeChangelog(stream, commits) {
  debug('writing change log');
  var deferred = q.defer();
  var sections = {
    fix: {},
    feat: {},
    breaks: {},
    style: {},
    refactor: {},
    test: {},
    chore: {},
    docs: {}
  };

  sections.breaks[this.emptyComponent] = [];
  this.organizeCommits(commits, sections);
  stream.on('open', sendToStream.bind(this, stream, sections, deferred));

  return deferred.promise;
}

module.exports = writeChangelog;
