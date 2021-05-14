'use strict';


const chai = require('chai');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");

const changelog = require('../tasks/git_changelog_generate');

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('parse_commits.spec.js', function () {

  before(function () {

  });

  describe('Changelog()', function () {


    describe('.isPRMergeCommit()', function () {
      it('pr merge commits without scope', function () {
        const msg = changelog.parseRawCommit(
          '9b1aff905b638aa274a5fc8f88662df446d374bd\n' +
          'Merge pull request #187 from org/test-repo\n' +
          'fix: Fixed problem with deactivating last token.\n' +
          'Some output line\n' +
          'Some additional output line \n', true);

        expect(msg.type).to.equal('fix');
        expect(msg.hash).to.equal('9b1aff905b638aa274a5fc8f88662df446d374bd');
        expect(msg.subject).to.equal('Fixed problem with deactivating last token.');
        expect(msg.body).to.equal('Some output line\n' +
          'Some additional output line \n');
        expect(msg.component).to.equal(undefined);
      });

      it('commit_body flag is disabled for parseRawCommit', function () {
        const msg = changelog.parseRawCommit(
          '9b1aff905b638aa274a5fc8f88662df446d374bd\n' +
          'Merge pull request #187 from org/test-repo\n' +
          'fix: Fixed problem with deactivating last token.\n' +
          'Some output line\n' +
          'Some additional output line \n');

        expect(msg.type).to.equal(null);
        expect(msg.hash).to.equal('9b1aff905b638aa274a5fc8f88662df446d374bd');
        expect(msg.subject).to.equal('Merge pull request #187 from org/test-repo');
        expect(msg.body).to.equal('fix: Fixed problem with deactivating last token.\n' +
          'Some output line\n' +
          'Some additional output line \n');
        expect(msg.component).to.equal(undefined);
      });


      it('pr merge commits with scope', function () {
        const msg = changelog.parseRawCommit(
          '9b1aff905b638aa274a5fc8f88662df446d374bd\n' +
          'Merge pull request #187 from org/test-repo\n' +
          'fix(public): Fixed problem with deactivating last token.\n' +
          'Some output line\n' +
          'Some additional output line \n', true);

        expect(msg.type).to.equal('fix');
        expect(msg.hash).to.equal('9b1aff905b638aa274a5fc8f88662df446d374bd');
        expect(msg.subject).to.equal('Fixed problem with deactivating last token.');
        expect(msg.body).to.equal('Some output line\n' +
          'Some additional output line \n');
        expect(msg.component).to.equal("public");
      });
    });
  });

});
