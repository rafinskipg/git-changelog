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
const { readFile, existsSync } = require('fs');
const readFileAsync = promisify(readFile);

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('git_changelog_generate.js', () => {

    before(() => {
        this.randomHash = function randomHash() {
            const hex = '0123456789abcdef';
            let hash = '';
            let count;
            let random;

            for (count = 0; count < 40; count++) {
                random = Math.floor(Math.random() * 15);
                hash += hex.charAt(random);
            }

            return hash;
        };
    });

    describe('Changelog()', () => {

        before(() => {
            changelog.setDefaults();
        });

        it('should return an object', () => {
            expect(changelog).to.be.an('object');
        });

        it('should initialize options property', () => {
            expect(changelog).to.have.property('options');
            expect(changelog).to.have.property('cmd');

            expect(changelog).to.have.nested.property('cmd.gitTag');
            expect(changelog.cmd.gitTag).to.equal('git tag -l --sort=v:refname | tail -n1');

            expect(changelog).to.have.nested.property('cmd.gitRepoUrl');
            expect(changelog.cmd.gitRepoUrl).to.equal('git config --get remote.origin.url');


            expect(changelog).to.have.nested.property('cmd.gitLog');
            expect(changelog.cmd.gitLog).to.be.null;

            expect(changelog).to.have.nested.property('cmd.gitLogNoTag');
            expect(changelog.cmd.gitLogNoTag).to.be.null;

            expect(changelog).to.have.property('header', '<a name="%s">%s</a>\n# %s (%s)\n\n');
            expect(changelog).to.have.property('emptyComponent', '$$');
            expect(changelog).to.have.property('links', null);
            expect(changelog).to.have.property('provider', null);
        });

        describe('.message()', () => {

            beforeEach(() => {
                changelog.setDefaults();
            });

            it('should append ";", when single arg', () => {
                changelog.message('test');
                expect(changelog.options.msg).to.contain('test;');
            });

            it('should separate with ":" and append ";", when multiple args', () => {
                changelog.message('name', 'value');
                expect(changelog.options.msg).to.contain('name: value;');
            });

        });

        describe('.initOptions()', () => {

            it('should store "name" if passed as an option', () => {
                changelog.initOptions({app_name: 'test'});
                expect(changelog.options.app_name).to.equal('test');
                expect(changelog.options.msg).to.contain('name: test');
            });

            it('should store "file" if passed as an option', () => {
                changelog.initOptions({file: 'test'});
                expect(changelog.options.file).to.equal('test');
                expect(changelog.options.msg).to.contain('file: test');
            });

            it('should store "changelogrc" if passed as an option', () => {
                changelog.initOptions({changelogrc: 'test'});
                expect(changelog.options.changelogrc).to.equal('test');
                expect(changelog.options.msg).to.contain('changelogrc: test');
            });

            it('should store "logo" if passed as an option', () => {
                changelog.initOptions({logo: 'test'});
                expect(changelog.options.logo).to.equal('test');
                expect(changelog.options.msg).to.contain('logo: test');
            });

            it('should store "intro" if passed as an option', () => {
                changelog.initOptions({intro: 'test'});
                expect(changelog.options.intro).to.equal('test');
                expect(changelog.options.msg).to.contain('intro: test');
            });


            it('should store "debug" if passed as an option', () => {
                changelog.initOptions({debug: 'test'});
                expect(changelog.options.debug).to.equal('test');
                expect(changelog.options.msg).to.contain('debug: test');
            });

            it('should store "version_name" if passed as an option', () => {
                changelog.initOptions({version_name: 'test'});
                expect(changelog.options.version_name).to.equal('test');
                expect(changelog.options.msg).to.contain('version_name: test');
            });

            it('should store any other option, but not save in msg', () => {
                changelog.initOptions({other: 'test'});
                expect(changelog.options.other).to.equal('test');
                expect(changelog.options.msg).to.not.contain('other: test');
            });

        });

        describe('Params tests', () => {
            it('should read log since beggining if tag is false', done => {
    
                const options = {
                    tag: false
                };
    
                changelog.generate(options)
                    .then(opts => {
                        expect(opts.msg).to.be.a('string');
                        expect(opts.msg.indexOf('since beggining')).to.not.equal(-1);
                        done();
                    })
                    .catch(err => {
                        console.log('error', err);
                        done(err);
                    });
            });
    
            it('should read log since specified tag if tag is present', done => {
    
                const options = {
                    tag: 'v0.0.1'
                };
    
                changelog.generate(options)
                    .then(opts => {
                        expect(opts.msg).to.be.a('string');
                        expect(opts.msg.indexOf('tag: v0.0.1')).to.not.equal(-1);
                        done();
                    })
                    .catch(err => {
                        console.log('error', err);
                        done(err);
                    });
            });
    
            it('should add the application name', done => {
    
                const options = {
                    app_name: 'my name'
                };
    
                changelog.generate(options)
                    .then(opts => {
                        expect(opts.msg).to.be.a('string');
                        expect(opts.msg.indexOf('name: my name')).to.not.equal(-1);
                        done();
                    })
                    .catch(err => {
                        console.log('error', err);
                        done(err);
                    });
            });
    
        });

        describe('.getProviderLinks()', () => {

            beforeEach(() => {
                changelog.setDefaults();
            });

            it('should take the provider passed in the options in priority', () => {
                const repo_url = 'https://github.com/owner/repo';
                changelog.options.repo_url = repo_url;

                changelog.options.provider = 'gitlab';
                changelog.getProviderLinks();
                expect(changelog.provider).to.equal('gitlab');

            });
            it('should ignore unknown providers', () => {
                const repo_url = 'https://github.com/owner/repo';
                changelog.options.repo_url = repo_url;

                changelog.options.provider = 'foobar';
                changelog.getProviderLinks();
                expect(changelog.provider).to.equal('github');

            });





            it('should set provider/links to GitHub', () => {
                const repo_url = 'https://github.com/owner/repo';
                changelog.options.repo_url = repo_url;
                changelog.getProviderLinks();

                expect(changelog.provider).to.equal('github');

                expect(changelog.links.issue).to.contain(repo_url);
                expect(changelog.links.issue).to.contain('issues/%s');

                expect(changelog.links.commit).to.contain(repo_url);
                expect(changelog.links.commit).to.contain('commit/%s');
            });

            it('should set provider/links to BitBucket', () => {
                const repo_url = 'https://www.bitbucket.com/owner/repo';
                changelog.options.repo_url = repo_url;
                changelog.getProviderLinks();

                expect(changelog.provider).to.equal('bitbucket');

                expect(changelog.links.issue).to.contain(repo_url);
                expect(changelog.links.issue).to.contain('issues/%s');

                expect(changelog.links.commit).to.contain(repo_url);
                expect(changelog.links.commit).to.contain('commits/%s');
            });

            it('should set provider/links to GitLab', () => {
                const repo_url = 'https://gitlab.com/owner/repo';
                changelog.options.repo_url = repo_url;
                changelog.getProviderLinks();

                expect(changelog.provider).to.equal('gitlab');

                expect(changelog.links.issue).to.contain(repo_url);
                expect(changelog.links.issue).to.contain('issues/%s');

                expect(changelog.links.commit).to.contain(repo_url);
                expect(changelog.links.commit).to.contain('commit/%s');
            });

        });

        describe('.getGitLogCommands()', () => {

            beforeEach(() => {
                changelog.setDefaults();
            });

            it('should generate "git log" commands for "branch"', () => {
                const branch = 'master';
                changelog.options.branch = branch;
                changelog.getGitLogCommands();
                expect(changelog.cmd.gitLog).to.include('git log ')
                    .and.include('..' + branch);

                expect(changelog.cmd.gitLogNoTag).to.include('git log ' + branch);
            });

        });

        describe('.init()', () => {

            after(() => {
                changelog.getRepoUrl.restore();
            });

            it('should succeed with options when repo specified or remote found', () => {
                const options = {
                    app_name: 'app',
                    repo_url: 'https://github.com/owner/repo'
                };
                return expect(changelog.init(options))
                    .to.eventually.be.fulfilled;
            });

            it('should fail when no repo specified and no remote found', () => {
                const options = {
                    app_name: 'app'
                };

                // simulate no remote returned by .getRepoUrl()
                sinon.stub(changelog, 'getRepoUrl').returns(Promise.reject());

                return expect(changelog.init(options))
                    .to.eventually.be.rejected;
            });

        });

        describe('.parseRawCommit()', () => {

            it('should parse raw commit', () => {
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

            it('should parse closed issues', () => {
                const msg = changelog.parseRawCommit(
                    '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
                    'feat(ng-list): Allow custom separator\n' +
                    'bla bla bla\n\n' +
                    'Closes #123\nCloses #25\n');

                expect(msg.closes[0]).to.equal(123);
                expect(msg.closes[1]).to.equal(25);
            });

            it('should parse closed issues in the body comment', () => {
                const msg = changelog.parseRawCommit(
                    '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
                    'feat(ng-list): Allow custom separator and Closes #33\n');

                expect(msg.closes[0]).to.equal(33);
            });

            it('should parse breaking changes', () => {
                const msg = changelog.parseRawCommit(
                    '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
                    'feat(ng-list): Allow custom separator\n' +
                    'bla bla bla\n\n' +
                    'BREAKING CHANGE: first breaking change\nsomething else\n' +
                    'another line with more info\n');

                expect(msg.breaking).to.equal(' first breaking change\nsomething else\nanother line with more info\n');
            });

            it('should add everything as a message if there are 2 sections', () => {
                const msg = changelog.parseRawCommit(
                    '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
                    'feat(ad): make new ad\n' +
                    'some note here\n' +
                    'reg(ad): need a walk through\n');

                expect(msg.body).to.equals('some note here\nreg(ad): need a walk through\n');
            });

            it('should organize commits', () => {
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

                for (let i = 0; i < 10; i++) {
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

        describe('.linkToIssue()', () => {

            it('should issue links based on "repo_url" and "issue" number', () => {
                const repo_url = 'https://github.com/owner/repo';
                let issue;
                let link;

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

        describe('.linkToCommit()', () => {

            it('should issue links based on "repo_url" and "issue" number', () => {
                const repo_url = 'https://github.com/owner/repo';
                let index;
                let hash;
                let link;

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

        describe('.currentDate()', () => {

            it('should return the current data in "yyyy-mm-dd" format', () => {
                const currentDate = changelog.currentDate();
                const now = new Date();

                expect(currentDate).to.be.a('string');
                expect(currentDate).to.have.length(10);
                expect(parseInt(currentDate.substr(0, 4))).to.equal(now.getFullYear());
                expect(parseInt(currentDate.substr(5, 4))).to.equal(now.getMonth() + 1);
                expect(parseInt(currentDate.substr(8, 4))).to.equal(now.getDate());
            });

        });

        describe('.printSection()', () => {

        });

        describe('.printSalute()', () => {

            beforeEach(() => {
                this.stream = {
                    write: sinon.stub()
                };
                changelog.printSalute(this.stream);
            });

            afterEach(() => {
                this.stream = null;
            });

            it('should call stream.write() twice', () => {
                expect(this.stream.write).to.have.been.calledTwice;
            });

            it('should call stream.write() with git-changelog message', () => {
                expect(this.stream.write).to.have.been.calledWithMatch(/Generated with \[git-changelog\]/);
            });

        });

        describe('.readGitLog()', () => {
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

            after(() => {
                execStub.restore();
            });

            it('should read log and parse commits', () => {
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

        describe('.writeChangelog()', () => {

            describe('without breaking commits', () => {
                const sections = [
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

                before(done => {
                    this.timeout = 10000;

                    this.commits = require('./fixtures/commits.js').withoutBreaking;

                    sinon.stub(changelog, 'printSalute');
                    sinon.stub(changelog, 'printSection');
                    sinon.stub(changelog, 'printHeader');

                    changelog.initOptions({
                        app_name: 'app',
                        version_name: 'version_name',
                        sections: sections,
                        template: false
                    });
                    changelog.writeChangelog(this.commits)
                        .then(done)
                        .catch(err => {
                            console.log('error', err);
                        });
                });

                after(() => {
                    changelog.printSection.restore();
                    changelog.printHeader.restore();
                    changelog.printSalute.restore();
                });

                it('should write the header to the stream', () => {
                    expect(changelog.printHeader).to.have.been.calledOnce;
                });

                it('should print 3 sections', () => {
                    expect(changelog.printSection.callCount).to.equal(3);
                });

                it('should print salute', () => {
                    expect(changelog.printSalute).to.have.been.calledOnce;
                });

            });

            describe('with breaking commits', () => {
                const commits = require('./fixtures/commits.js').withBreaking;
                const sections = [
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

                before(done => {  
                    sinon.stub(changelog, 'organizeCommits').callsFake(() => {
                        return [{
                            type: 'BREAKING',
                            commits: [{
                                closes: [],
                                breaks: [],
                                hash: '1d4f604363094d4eee3b4d7b1ca01133edaad344',
                                subject: 'did 2 thing',
                                body: '',
                                type: 'feat',
                                component: '',
                                breaking: true
                            }],
                            components: [{
                                name: '$scope',
                                commits: [{
                                    closes: [],
                                    breaks: [],
                                    hash: '1d4f604363012394d4eee3b4d7b1ca01133edaad344',
                                    subject: 'did 4 thing',
                                    body: '',
                                    type: 'feat',
                                    component: '$scope',
                                    breaking: true
                                }]
                            }]
                        }];
                    });
                    sinon.stub(changelog, 'printSalute');
                    sinon.stub(changelog, 'printSection');
                    sinon.stub(changelog, 'printHeader');

                    changelog.initOptions({
                        app_name: 'app',
                        version_name: 'version_name',
                        sections: sections,
                        template: false
                    });
                    changelog.writeChangelog(commits).then(done);
                });

                after(() => {
                    changelog.organizeCommits.restore();
                    changelog.printSection.restore();
                    changelog.printSalute.restore();
                    changelog.printHeader.restore();
                });

                it('should organize commits', () => {
                    expect(changelog.organizeCommits).to.have.been.calledOnce;
                    expect(changelog.organizeCommits).to.have.been.calledWith(commits);
                });

                it('should write the header to the stream', () => {
                    expect(changelog.printHeader).to.have.been.calledOnce;
                });

                it('should print 1 sections', () => {
                    expect(changelog.printSection.callCount).to.equal(1);
                });

                it('should print salute', () => {
                    expect(changelog.printSalute).to.have.been.calledOnce;
                });

            });

        });

        describe('.organizeCommits()', () => {
            function findItem(key, value) {
                return item => item[key] === value;
            }

            describe('without breaking commits', () => {

                before(() => {
                    changelog.setDefaults();
                    this.sections = [
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
                            title: 'Breaking changes',
                            grep: 'BREAKING'
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
                        }
                    ];

                    this.commits = require('./fixtures/commits.js').withoutBreaking;
                    this.sections = changelog.organizeCommits(this.commits, this.sections);
                });

                it('should return 3 sections', () => {
                    expect(this.sections.length).to.equal(3);
                });

                it('should fix section to have 1 commit', () => {
                    expect(this.sections.find(findItem('type', 'fix')).components.find(findItem('name', '$scope')).commits.length).to.equal(1);
                });

                it('should feat section to have 1 commit', () => {
                    expect(this.sections.find(findItem('type', 'feat')).components.find(findItem('name', '$scope')).commits.length).to.equal(1);
                });

                it('should breaks section to be empty', () => {
                    expect(this.sections.find(findItem('type', 'BREAKING'))).to.equal(undefined);
                });

                it('should style section to be empty', () => {
                    expect(this.sections.find(findItem('type', 'style'))).to.equal(undefined);
                });

                it('should refactor section be empty', () => {
                    expect(this.sections.find(findItem('type', 'refactor'))).to.equal(undefined);
                });

                it('should test section to be empty', () => {
                    expect(this.sections.find(findItem('type', 'test'))).to.equal(undefined);
                });

                it('should chore section to have 1 commit', () => {
                    expect(this.sections.find(findItem('type', 'chore')).components.find(findItem('name', '$scope')).commits.length).to.equal(3);
                });

                it('should docs section to be empty', () => {
                    expect(this.sections.find(findItem('type', 'docs'))).to.equal(undefined);
                });

            });

            describe('with breaking commits', () => {

                before(() => {
                    changelog.setDefaults();
                    this.sections = [
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
                            title: 'Breaking changes',
                            grep: 'BREAKING'
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
                        }
                    ];
                    const repo_url = 'https://github.com/owner/repo';
                    changelog.options.repo_url = repo_url;
                    changelog.getProviderLinks();

                    this.commits = require('./fixtures/commits.js').withBreaking;
                    this.sections = changelog.organizeCommits(this.commits, this.sections);
                });

                it('should return 4 sections', () => {
                    expect(this.sections.length).to.equal(4);
                });

                it('should fix section to have 1 commit', () => {
                    expect(this.sections.find(findItem('type', 'fix')).components.find(findItem('name', '$scope')).commits.length).to.equal(1);
                });

                it('should feat section to have 1 commit', () => {
                    expect(this.sections.find(findItem('type', 'feat')).components.find(findItem('name', '$scope')).commits.length).to.equal(1);
                });

                it('should breaks have 1 component and 2 comits', () => {
                    expect(this.sections.find(findItem('type', 'BREAKING')).components.length).to.equals(1);
                    expect(this.sections.find(findItem('type', 'BREAKING')).components.find(findItem('name', '$scope')).commits.length).to.equal(1);
                });

                it('should chore section to have 3 commit', () => {
                    expect(this.sections.find(findItem('type', 'chore')).components.find(findItem('name', '$scope')).commits.length).to.equal(3);
                });

            });

        });

        describe('.getPreviousTag()', () => {
            let execStub;

            before(() => {
                changelog.setDefaults();
            });

            afterEach(() => {
                if (child.exec.restore) {
                    child.exec.restore();
                }
            });

            it('should succeed when tag option is specified', () => {
                changelog.options.tag = 'tag';
                return expect(changelog.getPreviousTag())
                    .to.eventually.become('tag');
            });

            it('should succeed when tag option is false', () => {
                changelog.options.tag = false;
                return expect(changelog.getPreviousTag())
                    .to.eventually.become(false);
            });

            it('should call "git describe --tags" when no tag options', () => {
                // simulate return tag
                execStub = sinon
                    .stub(child, 'exec')
                    .callsFake((cmd, callback) => callback(null, {code: null, stdout: 'tag', stderr: null}));
        
                changelog.getPreviousTag = proxyquire('../tasks/lib/get-previous-tag', { 'child_process': { exec: execStub } });
                changelog.options.tag = null;

                return expect(changelog.getPreviousTag())
                    .to.eventually.become('tag');
            });

            it('should fail when "git describe" returns a code', () => {
                // simulate failure
                execStub = sinon
                    .stub(child, 'exec')
                    .callsFake((cmd, callback) => callback(null, {code: -1, stdout: null, stderr: null}));
        
                changelog.getPreviousTag = proxyquire('../tasks/lib/get-previous-tag', { 'child_process': { exec: execStub } });
                changelog.options.tag = null;
                
                return expect(changelog.getPreviousTag())
                    .to.eventually.be.rejected;
            });

        });

        describe('.getGitRepoInfo()', () => {
            let gitRepoInfo = require('../tasks/lib/get-git-repo-info');
            
            before(() => {
                changelog.setDefaults();
            });

            it('should return initial http url if Invalid git url provided', () => {
                let invalidRepo = 'http://github.com/rafinskipg/git-changelog';

                return expect(Promise.resolve(
                        gitRepoInfo(invalidRepo).repoUrl
                    ))
                    .to.eventually.become(invalidRepo);
            });

            it('should return valid http url from Github git url', () => {
                let githubRepo = 'git@github.com:rafinskipg/git-changelog.git';
                let githubResult = 'https://github.com/rafinskipg/git-changelog';

                return expect(Promise.resolve(
                        gitRepoInfo(githubRepo).repoUrl
                    ))
                    .to.eventually.become(githubResult);
            });

            it('should return valid http url from Gitlab git url', () => {
                let gitlabRepo = 'https://gitlab.com/inkscape/inkscape.git';
                let gitlabResult = 'https://gitlab.com/inkscape/inkscape';

                return expect(Promise.resolve(
                        gitRepoInfo(gitlabRepo).repoUrl
                    ))
                    .to.eventually.become(gitlabResult);
            });

            it('should return valid http url from Bitbucket ssh url', () => {
                let bitbucketRepo = 'ssh://git@bitbucket.es.ad.adp.com:7999/upenv/configuration-values.git';
                let bitbucketResult = 'https://bitbucket.es.ad.adp.com:7999/upenv/configuration-values';

                return expect(Promise.resolve(
                        gitRepoInfo(bitbucketRepo).repoUrl
                    ))
                    .to.eventually.become(bitbucketResult);
            });
        });

        describe('.getRepoUrl()', () => {
            let execStub;

            before(() => {
                changelog.setDefaults();
                this.repo = 'https://github.com/owner/repo';
            });

            afterEach(() => {
                if (child.exec.restore) {
                    child.exec.restore();
                }
            });

            it('should succeed when repo_url option is specified', () => {
                changelog.options.repo_url = this.repo;
                return expect(changelog.getRepoUrl())
                    .to.eventually.become(this.repo);
            });

            it('should call "git describe --tags" when no tag options', () => {
                // simulate return tag
                execStub = sinon
                    .stub(child, 'exec')
                    .callsFake((cmd, callback) => callback(null, {code: null, stdout: this.repo, stderr: null}));
        
                changelog.getRepoUrl = proxyquire('../tasks/lib/get-repo-url', { 'child_process': { exec: execStub } });
                changelog.options.repo_url = null;

                return expect(changelog.getRepoUrl())
                    .to.eventually.become(this.repo);
            });

            it('should fail when "git describe" returns a code', () => {
                // simulate failure
                execStub = sinon
                    .stub(child, 'exec')
                    .callsFake((cmd, callback) => callback(null, {code: -1, stdout: null, stderr: null}));
        
                changelog.getRepoUrl = proxyquire('../tasks/lib/get-repo-url', { 'child_process': { exec: execStub } });
                changelog.options.repo_url = null;

                return expect(changelog.getRepoUrl())
                    .to.eventually.be.rejected;
            });

        });

        describe('.generate()', () => {

        });

        describe('.log()', () => {

            beforeEach(() => {
                sinon.stub(console, 'log');
            });

            afterEach(() => {
                console.log.restore();
            });

            it('should call console.log() when debug option is true', () => {
                changelog.options.debug = true;

                changelog.log('test');
                expect(console.log).to.have.been.calledOnce;

                expect(console.log).to.have.been.calledWithMatch('test');
            });

            it('should not call console.log() when type is unknown', () => {
                changelog.options.debug = false;
                
                changelog.log('faulty', 'type');
                expect(console.log).to.not.have.been.called;
            });

        });

    });

    describe('File creation', () => {
        it('should create A CHANGELOG.md', () => {
            const exists_file = existsSync('CHANGELOG.md');
            expect(exists_file).to.equal(true);
        });

        it('should create tag1.md', () => {
            const exists_file = existsSync('output/tag1.md');
            expect(exists_file).to.equal(true);
        });

        it('should create customTemplate.md', () => {
            const exists_file = existsSync('output/customTemplate.md');
            expect(exists_file).to.equal(true);
        });

        it('should create customCommitTemplate.md', () => {
            const exists_file = existsSync('output/customCommitTemplate.md');
            expect(exists_file).to.equal(true);
        });

        it('should create A EXTENDEDCHANGELOG.md', () => {
            const exists_file = existsSync('EXTENDEDCHANGELOG.md');
            expect(exists_file).to.equal(true);
        });
    });

});
