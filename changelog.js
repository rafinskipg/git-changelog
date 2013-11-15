#!/usr/bin/env node

// TODO(vojta): pre-commit hook for validating messages
// TODO(vojta): report errors, currently Q silence everything which really sucks

var child = require('child_process');
var fs = require('fs');
var util = require('util');
var q = require('qq');

var BRANCH_NAME = ''; 

var GIT_LOG_CMD = 'git log '+BRANCH_NAME+' --grep="%s" -E --format=%s %s..HEAD';
var GIT_NOTAG_LOG_CMD = 'git log '+BRANCH_NAME+' --grep="%s" -E --format=%s';

var GIT_TAG_CMD = 'git describe --tags --abbrev=0';

var PROVIDER = 'G'; //[G]ithub [B]itbucket
var HEADER_TPL = '<a name="%s">%s</a>\n# %s (%s)\n\n';
var USER_NAME = 'rafinskipg';
var PROJECT_NAME = 'Git-change-log';

var LINK_ISSUE = ({
                G: '[#%s](https://github.com/'+USER_NAME+ '/'+ PROJECT_NAME+'/issues/%s)',
                B : '[#%s](https://bitbucket.org/'+USER_NAME+ '/'+PROJECT_NAME+'/issues/%s)'})
                [PROVIDER];

var LINK_COMMIT = ({ 
                G: '[%s](https://github.com/'+USER_NAME+ '/' +PROJECT_NAME+'/commits/%s)',
                B: '[%s](https://bitbucket.org/'+USER_NAME+ '/'+PROJECT_NAME +'/commits/%s)'})
                [PROVIDER];

var EMPTY_COMPONENT = '$$';

var warn = function() {
    console.log('WARNING:', util.format.apply(null, arguments));
};


var parseRawCommit = function(raw) {
    if (!raw) return null;

    var lines = raw.split('\n');
    var msg = {}, match;

    msg.hash = lines.shift();
    msg.subject = lines.shift();

    msg.closes = [];
    msg.breaks = [];

    lines.forEach(function(line) {
        match = line.match(/(?:Closes|Fixes)\s#(\d+)/);
        if (match) msg.closes.push(parseInt(match[1]));
    });

    match = raw.match(/BREAKING CHANGE:([\s\S]*)/);
    if (match) {
        msg.breaking = match[1];
    }


    msg.body = lines.join('\n');
    match = msg.subject.match(/^(.*)\((.*)\)\:\s(.*)$/);
    console.log(match);
    if (!match || !match[1] || !match[3]) {
        warn('Incorrect message: %s %s', msg.hash, msg.subject);
        return null;
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

    if (!components.length) return;

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


var readGitLog = function(grep, from) {
    var deferred = q.defer();
    //TODO if there is no tag , create a 0.0.0 Tag automattically
    var command = from != 'NONETAG' ? GIT_LOG_CMD: GIT_NOTAG_LOG_CMD ;
    if(from == 'NONETAG'){
        command = util.format(command, grep, '%H%n%s%n%b%n==END==');
    }else{
        command = util.format(command, grep, '%H%n%s%n%b%n==END==', from);
    }
    
    // TODO(vojta): if it's slow, use spawn and stream it instead
    child.exec(command , function(code, stdout, stderr) {

        var commits = [];

        stdout.split('\n==END==\n').forEach(function(rawCommit) {

            var commit = parseRawCommit(rawCommit);
            if (commit) commits.push(commit);
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
        problems: {},
        docs: {}
    };

    sections.breaks[EMPTY_COMPONENT] = [];

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
        };
    });

    stream.write(util.format(HEADER_TPL, options.version, options.appName, options.version, currentDate()));
    printSection(stream, 'Documentation', sections.docs);
    printSection(stream, 'Bug Fixes', sections.fix);
    printSection(stream, 'Features', sections.feat);
    printSection(stream, 'Breaking Changes', sections.breaks, false);
    printSection(stream, 'Client Problems', sections.problems, false);
}


var getPreviousTag = function() {

    var deferred = q.defer();
   
    child.exec(GIT_TAG_CMD, function(code, stdout, stderr) {
       if (code ) deferred.resolve('NONETAG');
       else deferred.resolve(stdout.replace('\n', ''));
    });

    return deferred.promise;
};


var generate = function() {
   
    getPreviousTag().then(function(tag) {
        console.log('Reading git log since', tag);
        readGitLog('^fix|^feat|^docs|BREAKING', tag).then(function(commits) {
            console.log('Parsed', commits.length, 'commits');
            console.log('Generating changelog to', options.file || 'stdout', '(', options.version, ')');
            writeChangelog(options.file ? fs.createWriteStream(options.file) : process.stdout, commits);
        },
        function(){
            console.log("It seems that that tag doesn't exists");
        });
    });
};


// publish for testing
exports.parseRawCommit = parseRawCommit;

var options = {
    version : 'ALL',
    file: 'Changelog.MD',
    appName : 'My app - Changelog'
};

// hacky start if not run by jasmine :-D
if (process.argv.join('').indexOf('jasmine-node') === -1) {
    
    if (process.argv[5] != undefined) {
        if (process.argv[5] == 'G' || process.argv[5] == 'B') {
            PROVIDER = process.argv[5];
           
        }
    }

    var params = {
        version :  process.argv[2],
        file :  process.argv[3],
        appName :   process.argv[4]
    } 
     
    for (var attrname in params) { options[attrname] = (typeof(params[attrname]) != 'undefined' ? params[attrname]: options[attrname]); }

    generate();
    //node changelog.js 1.0.0 changelog.md "My App" "G"
}
