'use strict';

const proxyquire = require('proxyquire');

const child = require('child_process');

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");

const changelog = require('../tasks/git_changelog_generate');

const { promisify } = require('util');
const { readFile } = require('fs');
const readFileAsync = promisify(readFile);

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('changelogrc.spec.js', function() {

  before(function() {
    
  });

  describe('Changelog()', function() {


    describe('.parseRawCommit()', function() {

      it('should parse raw commit', function() {
        const msg = changelog.parseRawCommit(
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
        const msg = changelog.parseRawCommit(
            '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
            'feat(ng-list): Allow custom separator\n' +
            'bla bla bla\n\n' +
            'Closes #123\nCloses #25\n');

        expect(msg.closes[0]).to.equal(123);
        expect(msg.closes[1]).to.equal(25);
      });

      it('should parse closed issues in the body comment', function() {
        const msg = changelog.parseRawCommit(
            '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
            'feat(ng-list): Allow custom separator and Closes #33\n');

        expect(msg.closes[0]).to.equal(33);
      });

      it('should parse breaking changes', function() {
        const msg = changelog.parseRawCommit(
            '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
            'feat(ng-list): Allow custom separator\n' +
            'bla bla bla\n\n' +
            'BREAKING CHANGE: first breaking change\nsomething else\n' +
            'another line with more info\n');

        expect(msg.breaking).to.equal(' first breaking change\nsomething else\nanother line with more info\n');
      });

      it('should organize commits', function() {
        const msg = changelog.parseRawCommit(
            '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
            'feat(ng-list): Allow custom separator\n' +
            'bla bla bla\n\n' +
            'BREAKING CHANGE: first breaking change\nsomething else\n' +
            'another line with more info\n');

        const commits = [];
        let sections = [{
          title: 'Bug Fixes',
          grep: '^fix'
        }];

        for(let i = 0; i < 10; i++){
          commits.push(changelog.parseRawCommit(
            '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
            'fix(myModule): Allow custom separator\n' +
            'bla bla bla\n\n'));
        }

        sections = changelog.organizeCommits(commits, sections);
        expect(sections[0].components[0].name).to.equal('mymodule');
        expect(sections[0].components[0].commits.length).to.equal(10);
      });

    });

    describe('.readGitLog()', function() {
      let execStub;

      before(done => {
          changelog.init({app_name: 'test'})
            .then(() => readFileAsync('./test/fixtures/list.txt', {encoding: 'utf-8'}))
            .then(fakeCommits => {
                execStub = sinon
                    .stub(child, 'exec')
                    .callsFake((cmd, opts, callback) => callback(null, {code: null, stdout: fakeCommits, stderr: null}));
                changelog.readGitLog = proxyquire('../tasks/lib/read-gitlog', { 'child_process': { exec: execStub } });

                done();
            });
      });

      after(function () {
          execStub.restore();
      });

      it('should read log and parse commits', function() {
        return expect(changelog.readGitLog(changelog.cmd.gitLog, 'tag'))
          .to.eventually.be.fulfilled
          .then(commits => {
            expect(execStub).to.have.been.calledOnce;
            expect(execStub).to.have.been.calledWithMatch(/^git log/);
            expect(commits).to.be.an('array');
            expect(commits).to.have.length(6);
          });
      });

    });

    

  });

});
