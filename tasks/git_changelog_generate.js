#!/usr/bin/env node
/*
 * git-changelog
 * https://github.com/rafinskipg/git-changelog
 *
 * Copyright (c) 2013 rafinskipg
 * Licensed under the MIT license.
 */

var child = require('child_process');
var fs = require('fs');
var util = require('util');
var q = require('q');

var OPTS = {};
var PROVIDER, GIT_LOG_CMD, GIT_NOTAG_LOG_CMD, 
	//ALLOWED_COMMITS = '^fix|^feat|^docs|BREAKING',
	//git-describe - Show the most recent tag that is reachable from a commit
	GIT_TAG_CMD  = 'git describe --tags --abbrev=0', 
	HEADER_TPL = '<a name="%s">%s</a>\n# %s (%s)\n\n', 
	LINK_ISSUE, 
	LINK_COMMIT, 
	EMPTY_COMPONENT = '$$';

// I have to clean that mess
var init = function(params){
	OPTS = params;
	//G \ B \ ---
    PROVIDER = OPTS.repo_url.indexOf('github.com') !== -1 ? 'G' :'B';

    //Log commits
    GIT_LOG_CMD = 'git log ' + OPTS.branch_name + ' --grep="%s" -E --format=%s %s..HEAD';
    GIT_NOTAG_LOG_CMD = 'git log ' + OPTS.branch_name + ' --grep="%s" -E --format=%s';

    //This is just in case they differ their urls at some point in the future. Also brings the posibility of adding more providers
    LINK_ISSUE = ({
                    G: '[#%s]('+OPTS.repo_url+'/issues/%s)',
                    B : '[#%s]('+OPTS.repo_url+'/issues/%s)'})
                    [PROVIDER];

    LINK_COMMIT = ({ 
                    G: '[%s]('+OPTS.repo_url+'/commits/%s)',
                    B: '[%s]('+OPTS.repo_url+'/commits/%s)'})
                    [PROVIDER];
};




var warn = function() {
    console.log('WARNING:', util.format.apply(null, arguments));
};


var parseRawCommit = function(raw) {
    if (!raw) { return null; }

    var lines = raw.split('\n');
    var msg = {}, match;

    msg.hash = lines.shift();
    msg.subject = lines.shift();

    msg.closes = [];
    msg.breaks = [];

    lines.forEach(function(line) {
        match = line.match(/(?:Closes|Fixes)\s#(\d+)/);
        if (match) { msg.closes.push(parseInt(match[1], 10)); }
    });

    match = raw.match(/BREAKING CHANGE:([\s\S]*)/);
    if (match) {
        msg.breaking = match[1];
    }


    msg.body = lines.join('\n');
    match = msg.subject.match(/^(.*)\((.*)\)\:\s(.*)$/);

    if(!match){
        match = msg.subject.match(/^(.*)\:\s(.*)$/);
        if(!match){
            warn('Incorrect message: %s %s', msg.hash, msg.subject);
            return null;
        }
        msg.type = match[1];
        msg.subject = match[2];

        return msg;
    }

    msg.type = match[1];
    msg.component = match[2];
    msg.subject = match[3];
    return msg;
};


var linkToIssue = function(issue) {
    return util.format(LINK_ISSUE, issue, issue);
};


var linkToCommit = function(hash) {
    return util.format(LINK_COMMIT, hash.substr(0, 8), hash);
};


var currentDate = function() {
    var now = new Date();
    var pad = function(i) {
        return ('0' + i).substr(-2);
    };

    return util.format('%d-%s-%s', now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()));
};


var printSection = function(stream, title, section, printCommitLinks) {
    printCommitLinks = printCommitLinks === undefined ? true : printCommitLinks;
    var components = Object.getOwnPropertyNames(section).sort();

    if (!components.length) {return; }

    stream.write(util.format('\n## %s\n\n', title));

    components.forEach(function(name) {
        var prefix = '-';
        var nested = section[name].length > 1;

        if (name !== EMPTY_COMPONENT) {
            if (nested) {
                stream.write(util.format('- **%s:**\n', name));
                prefix = '  -';
            } else {
                prefix = util.format('- **%s:**', name);
            }
        }

        section[name].forEach(function(commit) {
            if (printCommitLinks) {
                stream.write(util.format('%s %s\n  (%s', prefix, commit.subject, linkToCommit(commit.hash)));
                if (commit.closes.length) {
                    stream.write(',\n   ' + commit.closes.map(linkToIssue).join(', '));
                }
                stream.write(')\n');
            } else {
                stream.write(util.format('%s %s', prefix, commit.subject));
            }
        });
    });

    stream.write('\n');
};



var readGitLog = function( git_log_command, from) {
    var deferred = q.defer();

    git_log_command  =  git_log_command === GIT_LOG_CMD ? util.format(git_log_command, OPTS.grep_commits, '%H%n%s%n%b%n==END==', from) : util.format(git_log_command, OPTS.grep_commits, '%H%n%s%n%b%n==END==');
    
    console.log('Executing : ', git_log_command);

    child.exec(git_log_command , {timeout: 1000}, function(code, stdout, stderr) {

        var commits = [];

        stdout.split('\n==END==\n').forEach(function(rawCommit) {

            var commit = parseRawCommit(rawCommit);
            if (commit) {commits.push(commit);}
        });

        deferred.resolve(commits);
    });

    return deferred.promise;
};


var writeChangelog = function(stream, commits) {
    var sections = {
        fix: {},
        feat: {},
        breaks: {},
        style: {},
        refactor: {},
        test: {},
        chore: {},
        docs: {}
    };

    sections.breaks[EMPTY_COMPONENT] = [];

    organizeCommitsInSections(commits, sections)

    stream.write(util.format(HEADER_TPL, OPTS.version, OPTS.appName, OPTS.version, currentDate()));
    printSection(stream, 'Documentation', sections.docs);
    printSection(stream, 'Bug Fixes', sections.fix);
    printSection(stream, 'Features', sections.feat);
    printSection(stream, 'Refactor', sections.refactor, false);
    printSection(stream, 'Style', sections.style, false);
    printSection(stream, 'Test', sections.test, false);
    printSection(stream, 'Chore', sections.chore, false);
    printSection(stream, 'Docs', sections.docs, false);
    printSection(stream, 'Breaking Changes', sections.breaks, false);
};

var organizeCommitsInSections = function(commits, sections){
    commits.forEach(function(commit) {
        var section = sections[commit.type];
        var component = commit.component || EMPTY_COMPONENT;

        if (section) {
            section[component] = section[component] || [];
            section[component].push(commit);
        }

        if (commit.breaking) {
            sections.breaks[component] = sections.breaks[component] || [];
            sections.breaks[component].push({
                subject: util.format("due to %s,\n %s", linkToCommit(commit.hash), commit.breaking),
                hash: commit.hash,
                closes: []
            });
        }
    });
    return sections;
}



var getPreviousTag = function() {
    var deferred = q.defer();
 
    //IF we dont find a previous tag, we get all the commits from the beggining - The bigbang of the code
    child.exec(GIT_TAG_CMD, function(code, stdout, stderr) {
       if (code ){ deferred.resolve();
       }else{ deferred.resolve(stdout.replace('\n', '')); }
    });

    return deferred.promise;
};


var generate = function(params) {
    var deferred = q.defer();
    init(params);


    getPreviousTag().then(function(tag) {
        var fn ;

        if(typeof(tag) !== 'undefined'){
            console.log('Reading git log since', tag);
            fn = function(){ return readGitLog(GIT_LOG_CMD, tag);};
        }else{
            console.log('Reading git log since the beggining');
            fn = function(){ return readGitLog(GIT_NOTAG_LOG_CMD);};
        }

        fn().then(function(commits) {
            console.log('Parsed', commits.length, 'commits');
            console.log('Generating changelog to', OPTS.file || 'stdout', '(', OPTS.version, ')');
            writeChangelog(OPTS.file ? fs.createWriteStream(OPTS.file) : process.stdout, commits);
            deferred.resolve();
        });
        
    });

    return deferred.promise;
};

// hacky start if not run by Grunt -> Can be usefull for using git_changelog in other ways
if (process.argv.join('').indexOf('/grunt') === -1) {
    //node changelog.js "http://github.com/myuser/myrepo" 1.0.0 changelog.md "My App" "development_branch" 
    console.log('Starting custom mode');
    var defaults = {
        branch_name : '',
        //[G]ithub [B]itbucket supported at the momment
        repo_url: '',
        version : '',
        file: 'CHANGELOG.md',
        appName : 'My app - Changelog',
        grep_commits: '^fix|^feat|^docs|BREAKING'
    };

    var params = {
        repo_url: process.argv[2],
        version :  process.argv[3],
        file :  process.argv[4],
        appName :   process.argv[5],
        branch_name : process.argv[6]
    };
     
    for (var attrname in defaults) { params[attrname] = (typeof(params[attrname]) !== 'undefined' ? params[attrname]: defaults[attrname]); }

    generate(params);
}


// publish for testing
exports.parseRawCommit = parseRawCommit;
exports.organizeCommitsInSections = organizeCommitsInSections;
exports.generate = generate;

