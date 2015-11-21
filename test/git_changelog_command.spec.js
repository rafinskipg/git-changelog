'use strict';

var fs = require('fs');
var child = require('child_process');
var path = require('path');
var concat = require('concat-stream');

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');

var defaults = require('../tasks/defaults');
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('command.js', function() {
  before(function() {
    var cliPath = path.join(__dirname, '../tasks/command.js');
    this.cli = function(opts) {
      opts.unshift(cliPath);
      return child.spawn("node", opts);
    };

    /** I can't find a way to stub defaults */
    sinon.stub(defaults, 'exports', function() {
      var defaultsJson = fs.readFileSync('./test/fixtures/cli-defaults.json', { encoding: 'utf-8' });
      return JSON.parse(defaultsJson);
    });
  });

  describe('with default options', function() {
    it('should use git remote', function() {
      var proc = this.cli(["--debug", "true"]);

      proc.stdout.pipe(concat(function(output){
        console.log(output.toString("utf8"));
      }));
    });
  });
});
