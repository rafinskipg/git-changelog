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

    before(function() {
      changelog.setDefaults();
    });

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

      beforeEach(function() {
        changelog.setDefaults();
      });

      it('should append ";", when single arg', function() {
        changelog.message('test');
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

      it('should store "changelogrc" if passed as an option', function() {
        changelog.initOptions({ changelogrc: 'test' });
        expect(changelog.options.changelogrc).to.equal('test');
        expect(changelog.options.msg).to.contain('changelogrc: test');
      });

      it('should store "logo" if passed as an option', function() {
        changelog.initOptions({ logo: 'test' });
        expect(changelog.options.logo).to.equal('test');
        expect(changelog.options.msg).to.contain('logo: test');
      });

      it('should store "intro" if passed as an option', function() {
        changelog.initOptions({ intro: 'test' });
        expect(changelog.options.intro).to.equal('test');
        expect(changelog.options.msg).to.contain('intro: test');
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

      beforeEach(function() {
        changelog.setDefaults();
      });

      it('should set provider/links to GitHub', function() {
        var repo_url = 'https://github.com/owner/repo';
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

      beforeEach(function() {
        changelog.setDefaults();
      });

      it('should generate "git log" commands for "branch"', function() {
        var branch = 'master';
        changelog.options.branch = branch;
        changelog.getGitLogCommands();
        expect(changelog.cmd.gitLog).to.include('git log ')
            .and.include('..' + branch);

        expect(changelog.cmd.gitLogNoTag).to.include('git log ' + branch);
      });

    });

    describe('.init()', function () {

      after(function() {
        changelog.getRepoUrl.restore();
      });

      it('should succeed with options when repo specified or remote found', function() {
        var options = {
          app_name: 'app',
          repo_url: 'https://github.com/owner/repo'
        };
        return expect(changelog.init(options))
          .to.eventually.be.fulfilled;
      });

      it('should fail when no repo specified and no remote found', function() {
        var options = {
          app_name: 'app'
        };

        // simulate no remote returned by .getRepoUrl()
        sinon.stub(changelog, 'getRepoUrl').returns(Q.reject());

        return expect(changelog.init(options))
          .to.eventually.be.rejected;
      });

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

    describe('.linkToIssue()', function() {

      it('should issue links based on "repo_url" and "issue" number', function() {
        var repo_url = 'https://github.com/owner/repo';
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
        var repo_url = 'https://github.com/owner/repo';
        var index;
        var hash;
        var link;

        changelog.options.repo_url = repo_url;
        changelog.getProviderLinks();

        for (index = 0; index < 10; index++) {
          hash = this.randomHash();
          link = changelog.linkToCommit(hash);
          expect(link).to.contain(repo_url);
          expect(link).to.contain('[' + hash.substr(0, 8) + ']');
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
      });

      it('should call stream.write() twice', function() {
        expect(this.stream.write).to.have.been.calledTwice;
      });

      it('should call stream.write() with git-changelog message', function() {
        expect(this.stream.write).to.have.been.calledWithMatch(/Generated with \[git-changelog\]/);
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

    describe('.writeChangelog()', function() {

      describe('without breaking commits', function() {
        var sections = [
          {
            title: 'Bug Fixes',
            grep: '^fix'
          },
          {
            title: 'Features',
            grep: '^feat'
          },
          {
            title: 'Documentation',
            grep: '^docs'
          },
          {
            title: 'Refactor',
            grep: '^refactor'
          },
          {
            title: 'Style',
            grep: '^style'
          },
          {
            title: 'Test',
            grep: '^test'
          },
          {
            title: 'Chore',
            grep: '^chore'
          },
          {
            title: 'Breaking changes',
            grep: 'BREAKING'
          }
        ];

        before(function(done) {
          this.stream = {
            write: sinon.stub(),
            end : function(){

            },
            on: sinon.spy(function(event, callback) {
              callback();
            })
          };
          this.commits = require('./fixtures/commits.js').withoutBreaking;

          sinon.stub(changelog, 'organizeCommits');
          sinon.stub(changelog, 'printSalute');
          sinon.stub(changelog, 'printSection');
          sinon.stub(changelog, 'printHeader');

          changelog.initOptions({ app_name: 'app', version: 'version', sections: sections });
          changelog.writeChangelog(this.stream, this.commits).then(function() {
            done();
          });
        });

        after(function() {
          changelog.organizeCommits.restore();
          changelog.printSection.restore();
          changelog.printHeader.restore();
          changelog.printSalute.restore();
        });

        it('should organize commits', function() {
          expect(changelog.organizeCommits).to.have.been.calledOnce;
          expect(changelog.organizeCommits).to.have.been.calledWith(this.commits);
        });

        it('should write the header to the stream', function() {
          expect(changelog.printHeader).to.have.been.calledOnce;
          expect(changelog.printSalute).to.have.been.calledWith(this.stream);
        });

        it('should print 7 sections', function() {
          expect(changelog.printSection.callCount).to.equal(7);
          sections.forEach(function(section, index) {
            var call = changelog.printSection.getCall(index);
            if(!call){
              expect(section.title).to.equals('Breaking changes');
            }else{
              expect(call.args).to.include(section.title);
            }
          });
        });

        it('should print salute', function() {
          expect(changelog.printSalute).to.have.been.calledOnce;
          expect(changelog.printSalute).to.have.been.calledWith(this.stream);
        });

      });

      describe('with breaking commits', function() {
        var sections = [
          {
            title: 'Bug Fixes',
            grep: '^fix'
          },
          {
            title: 'Features',
            grep: '^feat'
          },
          {
            title: 'Documentation',
            grep: '^docs'
          },
          {
            title: 'Refactor',
            grep: '^refactor'
          },
          {
            title: 'Style',
            grep: '^style'
          },
          {
            title: 'Test',
            grep: '^test'
          },
          {
            title: 'Chore',
            grep: '^chore'
          },
          {
            title: 'Breaking Changes',
            grep: 'BREAKING'
          }
        ];

        before(function(done) {
          this.stream = {
            write: sinon.stub(),
            end : function(){

            },
            on: sinon.spy(function(event, callback) {
              callback();
            })
          };
          this.commits = require('./fixtures/commits.js').withBreaking;

          sinon.stub(changelog, 'organizeCommits', function(commits, sections) {
            sections.BREAKING[changelog.emptyComponent] = [ 'breaking commit'];
          });
          sinon.stub(changelog, 'printSalute');
          sinon.stub(changelog, 'printSection');
          sinon.stub(changelog, 'printHeader');

          changelog.initOptions({ app_name: 'app', version: 'version', sections: sections });
          changelog.writeChangelog(this.stream, this.commits).then(function() {
            done();
          });
        });

        after(function() {
          changelog.organizeCommits.restore();
          changelog.printSection.restore();
          changelog.printSalute.restore();
          changelog.printHeader.restore();
        });

        it('should organize commits', function() {
          expect(changelog.organizeCommits).to.have.been.calledOnce;
          expect(changelog.organizeCommits).to.have.been.calledWith(this.commits);
        });

        it('should write the header to the stream', function() {
          expect(changelog.printHeader).to.have.been.calledOnce;
          expect(changelog.printHeader).to.have.been.calledWith(this.stream, changelog.options);
        });

        it('should print 8 sections', function() {
          expect(changelog.printSection.callCount).to.equal(8);
          sections.forEach(function(section, index) {
            var call = changelog.printSection.getCall(index);
            expect(call.args).to.include(section.title);
          });
        });

        it('should print salute', function() {
          expect(changelog.printSalute).to.have.been.calledOnce;
          expect(changelog.printSalute).to.have.been.calledWith(this.stream);
        });

      });

    });

    describe('.organizeCommits()', function() {

      describe('without breaking commits', function () {

        before(function() {
          changelog.setDefaults();
          this.sections = {
            fix: {},
            feat: {},
            BREAKING: {},
            style: {},
            refactor: {},
            test: {},
            chore: {},
            docs: {}
          };
          this.commits = require('./fixtures/commits.js').withoutBreaking;
          this.sections = changelog.organizeCommits(this.commits, this.sections);
        });

        it('should return 8 sections', function() {
          expect(Object.keys(this.sections).length).to.equal(8);
        });

        it('should fix section to have 1 commit', function() {
          expect(this.sections.fix.$scope.length).to.equal(1);
        });

        it('should feat section to have 1 commit', function() {
          expect(this.sections.feat.$scope.length).to.equal(1);
        });

        it('should breaks section to be empty', function() {
          expect(this.sections.BREAKING).to.deep.equal({});
        });

        it('should style section to be empty', function() {
          expect(this.sections.style).to.deep.equal({});
        });

        it('should refactor section be empty', function() {
          expect(this.sections.refactor).to.deep.equal({});
        });

        it('should test section to be empty', function() {
          expect(this.sections.test).to.deep.equal({});
        });

        it('should chore section to have 1 commit', function() {
          expect(this.sections.chore.$scope.length).to.equal(3);
        });

        it('should docs section to be empty', function() {
          expect(this.sections.docs).to.deep.equal({});
        });

      });

      describe('with breaking commits', function () {

        before(function() {
          changelog.setDefaults();
          this.sections = {
            fix: {},
            feat: {},
            BREAKING: {},
            style: {},
            refactor: {},
            test: {},
            chore: {},
            docs: {}
          };
          var repo_url = 'https://github.com/owner/repo';
          changelog.options.repo_url = repo_url;
          changelog.getProviderLinks();

          this.commits = require('./fixtures/commits.js').withBreaking;
          this.sections = changelog.organizeCommits(this.commits, this.sections);
        });

        it('should return 8 sections', function() {
          expect(Object.keys(this.sections).length).to.equal(8);
        });

        it('should fix section to have 1 commit', function() {
          expect(this.sections.fix.$scope.length).to.equal(1);
        });

        it('should feat section to have 1 commit', function() {
          expect(this.sections.feat.$scope.length).to.equal(1);
        });

        it('should breaks section to be empty', function() {
          expect(this.sections.BREAKING.$scope.length).to.equal(1);
        });

        it('should style section to be empty', function() {
          expect(this.sections.style).to.deep.equal({});
        });

        it('should refactor section be empty', function() {
          expect(this.sections.refactor).to.deep.equal({});
        });

        it('should test section to be empty', function() {
          expect(this.sections.test).to.deep.equal({});
        });

        it('should chore section to have 1 commit', function() {
          expect(this.sections.chore.$scope.length).to.equal(3);
        });

        it('should docs section to be empty', function() {
          expect(this.sections.docs).to.deep.equal({});
        });

      });

    });

    describe('.getPreviousTag()', function() {

      before(function() {
        changelog.setDefaults();
      });

      afterEach(function() {
        if (child.exec.restore) {
          child.exec.restore();
        }
      });

      it('should succeed when tag option is specified', function() {
        changelog.options.tag = 'tag';
        return expect(changelog.getPreviousTag())
          .to.eventually.become('tag');
      });

      it('should succeed when tag option is false', function() {
        changelog.options.tag = false;
        return expect(changelog.getPreviousTag())
          .to.eventually.become(false);
      });

      it('should call "git describe --tags" when no tag options', function() {
        changelog.options.tag = null;

        // simulate return tag
        sinon.stub(child, 'exec', function(cmd, callback) {
          callback(null, 'tag');
        });
        return expect(changelog.getPreviousTag())
          .to.eventually.become('tag');
      });

      it('should fail when "git describe" returns a code', function() {
        changelog.options.tag = null;

        // simulate failure
        sinon.stub(child, 'exec', function(cmd, callback) {
          callback(-1);
        });
        return expect(changelog.getPreviousTag())
          .to.eventually.be.rejected;
      });

    });

    describe('.getRepoUrl()', function() {

      before(function() {
        changelog.setDefaults();
        this.repo = 'https://github.com/owner/repo';
      });

      afterEach(function() {
        if (child.exec.restore) {
          child.exec.restore();
        }
      });

      it('should succeed when repo_url option is specified', function() {
        changelog.options.repo_url = this.repo;
        return expect(changelog.getRepoUrl())
          .to.eventually.become(this.repo);
      });

      it('should call "git describe --tags" when no tag options', function() {
        changelog.options.repo_url = null;

        // simulate return tag
        sinon.stub(child, 'exec', function(cmd, callback) {
          callback(null, this.repo);
        }.bind(this));
        return expect(changelog.getRepoUrl())
          .to.eventually.become(this.repo);
      });

      it('should fail when "git describe" returns a code', function() {
        changelog.options.repo_url = null;

        // simulate failure
        sinon.stub(child, 'exec', function(cmd, callback) {
          callback(-1);
        });
        return expect(changelog.getRepoUrl())
          .to.eventually.be.rejected;
      });

    });

    xdescribe('.generate()', function () {

    });

    describe('.log()', function() {

      beforeEach(function() {
        sinon.stub(console, 'log');
      });

      it('should call console.log() when debug option is true', function () {
        changelog.options.debug = true;

        changelog.log('test');
        expect(console.log).to.have.been.calledOnce;

        expect(console.log).to.have.been.calledWithMatch('test');
        console.log.restore();
      });

      xit('should call console.log() when debug option is true', function () {
        changelog.options.debug = false;

        changelog.log('test');
        expect(console.log).to.not.have.been.called;
        console.log.restore();
      });

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
