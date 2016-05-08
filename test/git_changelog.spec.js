'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var q = require('q');
var grunt = require('grunt');
var changelog = require('../tasks/git_changelog_generate');

describe('git_changelog.js', function() {

  before(function() {
    sinon.spy(grunt, 'registerMultiTask');
    sinon.stub(changelog, 'generate', function() {
      var deferred = q.defer();
      deferred.resolve();
      return deferred.promise;
    });
  });

  after(function() {
    grunt.registerMultiTask.restore();
    changelog.generate.restore();
  });

  it('should call grunt.registerMultiTask()', function() {
    var taskRegister = require('../tasks/git_changelog');

    taskRegister(grunt);
    expect(grunt.registerMultiTask).to.have.been.calledOnce;
    expect(grunt.registerMultiTask.getCall(0).args.length).to.equal(3);
    expect(grunt.registerMultiTask).to.have.been.calledWith('git_changelog', 'A git changelog tool');
    expect(grunt.registerMultiTask.getCall(0).args[2]).to.be.a('function');
  });

  it('should register the "git_changelog" task', function() {
    expect(grunt.task.exists('git_changelog')).to.be.true;
  });

  it('shoud call "changelog.generate()" when task is run', function() {
    var config = {
      git_changelog: {
        minimal: {
          options: {
            app_name : 'test-app'
          }
        }
      }
    };

    grunt.task.clearQueue();
    grunt.config.init(config);
    grunt.task.run('git_changelog:minimal');
    grunt.task.start();
    expect(changelog.generate).to.have.been.calledOnce;
  });

});
