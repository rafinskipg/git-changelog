'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const grunt = require('grunt');
const changelog = require('../tasks/git_changelog_generate');

describe('git_changelog.js', () => {

  before(() => {
    sinon.spy(grunt, 'registerMultiTask');
    sinon.stub(changelog, 'generate').callsFake(() => {
      return Promise.resolve();
    });
  });

  after(() => {
    grunt.registerMultiTask.restore();
    changelog.generate.restore();
  });

  it('should call grunt.registerMultiTask()', () => {
    const taskRegister = require('../tasks/git_changelog');

    taskRegister(grunt);
    expect(grunt.registerMultiTask).to.have.been.calledOnce;
    expect(grunt.registerMultiTask.getCall(0).args.length).to.equal(3);
    expect(grunt.registerMultiTask).to.have.been.calledWith('git_changelog', 'A git changelog tool');
    expect(grunt.registerMultiTask.getCall(0).args[2]).to.be.a('function');
  });

  it('should register the "git_changelog" task', () => {
    expect(grunt.task.exists('git_changelog')).to.be.true;
  });

  it('shoud call "changelog.generate()" when task is run', () => {
    const config = {
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
