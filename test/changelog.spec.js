'use strict';
var fs = require('fs'),
expect = require('chai').expect;
var defaults = require('../tasks/defaults');
var _ = require('lodash');

describe('changelog.js', function() {
  var ch = require('../tasks/git_changelog_generate');

  describe('parseRawCommit', function() {
    it('should parse raw commit', function() {
      var msg = ch.parseRawCommit(
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
      var msg = ch.parseRawCommit(
          '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
          'feat(ng-list): Allow custom separator\n' +
          'bla bla bla\n\n' +
          'Closes #123\nCloses #25\n');

      expect(msg.closes[0]).to.equal(123);
      expect(msg.closes[1]).to.equal(25);
    });


    it('should parse closed issues in the body comment', function() {
      var msg = ch.parseRawCommit(
          '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
          'feat(ng-list): Allow custom separator and Closes #33\n');

      expect(msg.closes[0]).to.equal(33);
    });


    it('should parse breaking changes', function() {
      var msg = ch.parseRawCommit(
          '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
          'feat(ng-list): Allow custom separator\n' +
          'bla bla bla\n\n' +
          'BREAKING CHANGE: first breaking change\nsomething else\n' +
          'another line with more info\n');

      expect(msg.breaking).to.equal(' first breaking change\nsomething else\nanother line with more info\n');
    });


    it('Should organize commits', function() {
      var msg = ch.parseRawCommit(
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
        commits.push(ch.parseRawCommit(
          '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
          'fix(myModule): Allow custom separator\n' +
          'bla bla bla\n\n'));
      }

      sections = ch.organizeCommitsInSections(commits, sections);

      expect(sections.fix.myModule.length).to.equal(10);
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
      ch.getRepoUrl()
        .then(function(url){
          done();
        })
    });
  });

  describe('Params tests', function() {
    it('should read log since beggining if tag is false', function(done) {

      var options = _.cloneDeep(defaults);

      options.tag = false;
      options.name = 'my name';

      ch.generate(options)
        .then(function(opts){
          expect(opts.msg).to.be.a('string');
          expect(opts.msg.indexOf('since beggining')).to.not.equal(-1);
          done();
        })
        .catch(function(err){
          console.log('error', err);
        })
    });
  });
});