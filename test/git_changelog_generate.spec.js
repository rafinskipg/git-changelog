'use strict';

var fs = require('fs');
var child = require('child_process');

var chai = require('chai')
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var defaults = require('../tasks/defaults');
var _ = require('lodash');



var changelog = require('../tasks/git_changelog_generate');

describe('git_changelog_generate.js', function() {

  before(function() {
    this.randomHash = function randomHash() {
      var hex = '0123456789abcdef';
      var hash = '';
      var count;
      var random;

      for (count = 0; count < 40; count++) {
        random = Math.floor(Math.random() * 15);
        hash += hex.charAt(random);
      }

      return hash;
    };
  });

  describe('Changelog()', function() {

    afterEach(function() {
      changelog.setDefaults();
    })

    it('should return an object', function() {
      expect(changelog).to.be.an('object');
    });

    it('should initialize options property', function() {
      expect(changelog).to.have.property('options');
      expect(changelog).to.have.property('cmd');

      expect(changelog).to.have.deep.property('cmd.gitTag');
      expect(changelog.cmd.gitTag).to.equal('git describe --tags --abbrev=0');

      expect(changelog).to.have.deep.property('cmd.gitRepoUrl');
      expect(changelog.cmd.gitRepoUrl).to.equal('git config --get remote.origin.url');


      expect(changelog).to.have.deep.property('cmd.gitLog');
      expect(changelog.cmd.gitLog).to.be.null;

      expect(changelog).to.have.deep.property('cmd.gitLogNoTag');
      expect(changelog.cmd.gitLogNoTag).to.be.null;

      expect(changelog).to.have.property('header', '<a name="%s">%s</a>\n# %s (%s)\n\n');
      expect(changelog).to.have.property('emptyComponent', '$$');
      expect(changelog).to.have.property('links', null);
      expect(changelog).to.have.property('provider', null);
    });

    describe('.message()', function() {

      it('should append ";", when single arg', function() {
        changelog.message('test')
        expect(changelog.options.msg).to.contain('test;');
      });

      it('should separate with ":" and append ";", when multiple args', function() {
        changelog.message('name', 'value');
        expect(changelog.options.msg).to.contain('name: value;');
      });

    });

    describe('.initOptions()', function() {

      it('should store "name" if passed as an option', function() {
        changelog.initOptions({ app_name: 'test' });
        expect(changelog.options.app_name).to.equal('test');
        expect(changelog.options.msg).to.contain('name: test');
      });

      it('should store "file" if passed as an option', function() {
        changelog.initOptions({ file: 'test' });
        expect(changelog.options.file).to.equal('test');
        expect(changelog.options.msg).to.contain('file: test');
      });

      it('should store "grep_commits" if passed as an option', function() {
        changelog.initOptions({ grep_commits: 'test' });
        expect(changelog.options.grep_commits).to.equal('test');
        expect(changelog.options.msg).to.contain('grep_commits: test');
      });

      it('should store "debug" if passed as an option', function() {
        changelog.initOptions({ debug: 'test' });
        expect(changelog.options.debug).to.equal('test');
        expect(changelog.options.msg).to.contain('debug: test');
      });

      it('should store "version" if passed as an option', function() {
        changelog.initOptions({ version: 'test' });
        expect(changelog.options.version).to.equal('test');
        expect(changelog.options.msg).to.contain('version: test');
      });

      it('should store any other option, but not save in msg', function() {
        changelog.initOptions({ other: 'test' });
        expect(changelog.options.other).to.equal('test');
        expect(changelog.options.msg).to.not.contain('other: test');
      });

    });

    describe('.getProviderLinks()', function() {

      it('should set provider/links to GitHub', function() {
        var repo_url = 'https://www.github.com/owner/repo';
        changelog.options.repo_url = repo_url;
        changelog.getProviderLinks();

        expect(changelog.provider).to.equal('github');

        expect(changelog.links.issue).to.contain(repo_url);
        expect(changelog.links.issue).to.contain('issue');

        expect(changelog.links.commit).to.contain(repo_url);
        expect(changelog.links.commit).to.contain('commit');
      });

      it('should set provider/links to BitBucket', function() {
        var repo_url = 'https://www.bitbuket.com/owner/repo';
        changelog.options.repo_url = repo_url;
        changelog.getProviderLinks();

        expect(changelog.provider).to.equal('bitbucket');

        expect(changelog.links.issue).to.contain(repo_url);
        expect(changelog.links.issue).to.contain('issue');

        expect(changelog.links.commit).to.contain(repo_url);
        expect(changelog.links.commit).to.contain('commit');
      });

    });

    describe('.getGitLogCommands()', function () {

      it('should generate "git log" commands for "branch_name"', function() {
        var branch_name = 'master';
        changelog.options.branch_name = branch_name;
        changelog.getGitLogCommands();

        expect(changelog.cmd.gitLog).to.include('git log ' + branch_name);
        expect(changelog.cmd.gitLogNoTag).to.include('git log ' + branch_name);
      });

    });

    xdescribe('.init()', function () {

    });

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
            'when destroying 10k nested scopes where each scope has a $destroy listener\n')
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

        expect(sections.fix.myModule.length).to.equal(10);
      });

    });

    describe('.linkToIssue()', function() {

      it('should issue links based on "repo_url" and "issue" number', function() {
        var repo_url = 'https://www.github.com/owner/repo';
        var issue;
        var link;

        changelog.options.repo_url = repo_url;
        changelog.getProviderLinks();

        for (issue = 100; issue < 110; issue++) {
          link = changelog.linkToIssue(issue);
          expect(link).to.contain(repo_url);
          expect(link).to.contain('issue');
          expect(link).to.contain('#' + issue.toString());
        }
      });

    });

    describe('.linkToCommit()', function() {

      it('should issue links based on "repo_url" and "issue" number', function() {
        var repo_url = 'https://www.github.com/owner/repo';
        var index;
        var hash;
        var link;

        changelog.options.repo_url = repo_url;
        changelog.getProviderLinks();

        for (index = 0; index < 10; index++) {
          hash = this.randomHash();
          link = changelog.linkToCommit(hash);
          expect(link).to.contain(repo_url);
          expect(link).to.contain('[' + hash.substr(0, 8) + ']')
          expect(link).to.contain(hash.toString());
        }
      });

    });

    describe('.currentDate()', function() {

      it('should return the current data in "yyyy-mm-dd" format', function() {
        var currentDate = changelog.currentDate();
        var now = new Date();

        expect(currentDate).to.be.a('string');
        expect(currentDate).to.have.length(10);
        expect(parseInt(currentDate.substr(0,4))).to.equal(now.getFullYear());
        expect(parseInt(currentDate.substr(5,4))).to.equal(now.getMonth() + 1);
        expect(parseInt(currentDate.substr(8,4))).to.equal(now.getDate());
      });

    });

    xdescribe('.printSection()', function() {

    });

    describe('.printSalute()', function() {

      beforeEach(function() {
        this.stream = {
          write: sinon.stub()
        };
        changelog.printSalute(this.stream);
      });

      afterEach(function() {
        this.stream = null;
      })

      it('should call stream.write() twice', function() {
        expect(this.stream.write).to.have.been.calledTwice;
      });

      it('should call stream.write() with git-changelog message', function() {
        expect(this.stream.write).to.have.been.calledWithMatch(/Generated with \[git-changelog\]/);
      });

    });

    describe('.readGitLog()', function() {

      before(function(done) {
        changelog.init({ app_name: 'test', debug: true }).then(function() {
          this.stub = sinon.stub(child, 'exec', function(cmd, opts, cb) {
            var commits = fs.readFileSync('./test/fixtures/list.txt', { encoding: 'utf-8' });
            cb(null, commits, null);
          });
          done();
        }.bind(this));
      });

      after(function () {
        this.stub.restore();
      });

      it('should read log and parse commits', function(done) {
        changelog.readGitLog(changelog.cmd.gitLog, 'tag').then(function(results) {
          expect(this.stub).to.have.been.calledOnce;
          expect(results).to.be.an('array');
          expect(results).to.have.length(6);
          done();
        }.bind(this));
      });

    });

    describe('.writeChangelog()', function() {

    });

  });


  describe('File creation', function(){
    it('should create A CHANGELOG.md', function(){
      var  exists_file = fs.existsSync('CHANGELOG.md');
      expect(exists_file).to.equal(true);
    });

    it('should create tag1.md', function(){
      var  exists_file = fs.existsSync('output/tag1.md');
      expect(exists_file).to.equal(true);
    });

    it('should create A EXTENDEDCHANGELOG.md', function(){
      var  exists_file = fs.existsSync('EXTENDEDCHANGELOG.md');
      expect(exists_file).to.equal(true);
    });
  });

  describe('Get git settings', function(){
    it('Should pick correct repo url', function(done){
      changelog.getRepoUrl()
        .then(function(url){
          done();
        })
    });
  });

  describe('Params tests', function() {
    it('should read log since beggining if tag is false', function(done) {

      var options = {
        tag : false
      };

      changelog.generate(options)
        .then(function(opts){
          expect(opts.msg).to.be.a('string');
          expect(opts.msg.indexOf('since beggining')).to.not.equal(-1);
          done();
        })
        .catch(function(err){
          console.log('error', err);
          done();
        });
    });

    it('should read log since specified tag if tag is present', function(done) {

      var options = {
        tag : 'v0.0.1'
      };

      changelog.generate(options)
        .then(function(opts){
          expect(opts.msg).to.be.a('string');
          expect(opts.msg.indexOf('tag: v0.0.1')).to.not.equal(-1);
          done();
        })
        .catch(function(err){
          console.log('error', err);
          done();
        });
    });

    it('should add the application name', function(done) {

      var options = {
        app_name : 'my name'
      };

      changelog.generate(options)
        .then(function(opts){
          expect(opts.msg).to.be.a('string');
          expect(opts.msg.indexOf('name: my name')).to.not.equal(-1);
          done();
        })
        .catch(function(err){
          console.log('error', err);
          done();
        });
    });

  });

});
