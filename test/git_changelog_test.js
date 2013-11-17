'use strict';

var grunt = require('grunt');
var git_changelog = require('../tasks/git_changelog_generate');
var fs = require('fs');
var defaults = {};
/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.git_changelog = {
  setUp: function(done) {
   
    // setup here if necessary
    done();
  },
  minimal: function(test) {
    test.expect(1);

    var  exists_file = fs.existsSync('CHANGELOG.md');
    test.ok(exists_file,'Should create a CHANGELOG.md file');
   
    test.done();
  },
  extended: function(test) {
    test.expect(1);

    var  exists_file = fs.existsSync('EXTENDEDCHANGELOG.md');
    test.ok(exists_file,'Should create a EXTENDEDCHANGELOG.md file');
   
    test.done();
  }
};
