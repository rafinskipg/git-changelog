'use strict';

var fs = require('fs');
var child = require('child_process');

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require("chai-as-promised");

var defaults = require('../tasks/defaults');
var _ = require('lodash');

var changelog = require('../tasks/git_changelog_generate');
var Q = require('q');

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('changelogrc.spec.js', function() {

  before(function() {
    
  });

  describe('Changelog()', function() {


    describe('.parseRawCommit()', function() {

      it('should parse raw commit', function() {
        var msg = changelog.parseRawCommit(
            '9b1aff905b638aa274a5fc8f88662df446d374bd\n' +
            'feat(scope): broadcast $destroy event on scope destruction\n' +
            'perf testing shows that in chrome this change adds 5-15% overhead\n' +
            'when destroying 10k nested scopes where each scope has a $destroy listener\n');

        expect(msg.type).to.equal('feat');
        expect(msg.hash).to.equal('9b1aff905b638aa274a5fc8f88662df446d374bd');
        expect(msg.subject).to.equal('broadcast $destroy event on scope destruction');
        expect(msg.body).to.equal('perf testing shows that in chrome this change adds 5-15% overhead\n' +
            'when destroying 10k nested scopes where each scope has a $destroy listener\n');
        expect(msg.component).to.equal('scope');
      });

      it('should parse closed issues', function() {
        var msg = changelog.parseRawCommit(
            '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
            'feat(ng-list): Allow custom separator\n' +
            'bla bla bla\n\n' +
            'Closes #123\nCloses #25\n');

        expect(msg.closes[0]).to.equal(123);
        expect(msg.closes[1]).to.equal(25);
      });

      it('should parse closed issues in the body comment', function() {
        var msg = changelog.parseRawCommit(
            '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
            'feat(ng-list): Allow custom separator and Closes #33\n');

        expect(msg.closes[0]).to.equal(33);
      });

      it('should parse breaking changes', function() {
        var msg = changelog.parseRawCommit(
            '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
            'feat(ng-list): Allow custom separator\n' +
            'bla bla bla\n\n' +
            'BREAKING CHANGE: first breaking change\nsomething else\n' +
            'another line with more info\n');

        expect(msg.breaking).to.equal(' first breaking change\nsomething else\nanother line with more info\n');
      });

      it('should organize commits', function() {
        var msg = changelog.parseRawCommit(
            '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
            'feat(ng-list): Allow custom separator\n' +
            'bla bla bla\n\n' +
            'BREAKING CHANGE: first breaking change\nsomething else\n' +
            'another line with more info\n');

        var sections = {
          fix: {}
        };

        var commits = [];

        for(var i = 0; i < 10; i++){
          commits.push(changelog.parseRawCommit(
            '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
            'fix(myModule): Allow custom separator\n' +
            'bla bla bla\n\n'));
        }

        sections = changelog.organizeCommits(commits, sections);

        expect(sections.fix.mymodule.length).to.equal(10);
      });

    });

    describe('.readGitLog()', function() {

      before(function(done) {
        changelog.init({ app_name: 'test' }).then(function() {
          this.exec = sinon.stub(child, 'exec', function(cmd, opts, cb) {
            var commits = fs.readFileSync('./test/fixtures/list.txt', { encoding: 'utf-8' });
            cb(null, commits, null);
          });
          done();
        }.bind(this));
      });

      after(function () {
        this.exec.restore();
      });

      it('should read log and parse commits', function() {
        return expect(changelog.readGitLog(changelog.cmd.gitLog, 'tag'))
          .to.eventually.be.fulfilled
          .then(function(commits) {
            expect(this.exec).to.have.been.calledOnce;
            expect(this.exec).to.have.been.calledWithMatch(/^git log/);
            expect(commits).to.be.an('array');
            expect(commits).to.have.length(6);
          }.bind(this));
      });

    });

    

  });

});
