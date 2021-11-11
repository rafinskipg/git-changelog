#!/usr/bin/env node

'use strict';

var program = require('commander');
var git_changelog = require('./git_changelog_generate');
var defaults = require('./defaults');
var _ = require('lodash');
var options = _.defaults({}, defaults);


if (process.argv.join('').replace(/\\/g,'/').indexOf('/grunt') === -1) {

  program
    .version(require('../package').version)
    .option('-e, --extended', 'Extended log')
    .option('-n, --version_name [version_name]', 'Name of the version')
    .option('-a, --app_name [app_name]', 'Name [app_name]')
    .option('-b, --branch [branch]', 'Branch name [branch]')
    .option('-f, --file [file]', 'File [file]')
    .option('-cb, --commit_body', 'Analyze the commit body as well as the commit subject. This is useful when you have to analyze Merge commits')
    .option('-strictcc, --strict_conv_commits', 'Enforce type detected from conventional commits standard')
    .option('-tpl, --template [template]', 'Template [template]')
    .option('-ctpl, --commit_template [commit_template]', 'Commit Template [commit_template]')
    .option('-r, --repo_url [repo_url]', 'Repo url [repo_url]')
    .option('-l, --logo [logo]', 'Logo path [logo]')
    .option('-i, --intro [intro]', 'intro text [intro]')
    .option('-t, --tag [tag]', 'Since tag [tag]')
    .option('-rc, --changelogrc [changelogrc]', '.changelogrc relative path [changelogrc]')
    .option('-g, --grep [grep]', 'Grep commits for [grep]')
    .option('-d, --debug', 'Debugger')
    .option('-p, --provider [provider]', 'Provider: gitlab, github, bitbucket (Optional)')
    .parse(process.argv);

  console.log('Executing git changelog:');

  if (program.extended){
    console.log('  - Extended, getting log since the BigBang');
    options.tag = false;
  }

  if (program.version_name){
    options.version_name = program.version_name;
  }

  if (program.app_name){
    options.app_name = program.app_name;
  }

  if (program.branch){
    options.branch = program.branch;
    console.log('  - Branch %s', program.branch);
  }

  if (program.strict_conv_commits){
    options.strict_conv_commits = program.strict_conv_commits;
  }

  if (program.debug){
    console.log('Debug enabled');
    options.debug = program.debug;
  }

  if (program.file){
    options.file = program.file;
  }

  if (program.template){
    options.template = program.template;
  }

  if (program.commit_template){
    options.commit_template = program.commit_template;
  }

  if (program.commit_body){
    options.commit_body = program.commit_body;
  }

  if (program.changelogrc){
    options.changelogrc = program.changelogrc;
  }

  if (program.logo){
    options.logo = program.logo;
  }
  if (program.intro){
    options.intro = program.intro;
  }

  if (program.repo_url){
    options.repo_url = program.repo_url;
    console.log('  - With URL %s', program.repo_url);
  }

  if (program.provider){
    options.provider = program.provider;
    console.log('  - With forced provider %s', program.provider);
  }

  if (program.tag !== undefined){
    if(program.tag === false || program.tag === "false"){
      options.tag = false;
      console.log('  - No tag, getting log since the BigBang');
    }else{
      options.tag = program.tag;
      console.log('  - Generating log since tag %s', program.tag);
    }
  }

  git_changelog.generate(options, true).then(function(){
    git_changelog.log('success', 'Finished generating log Yai!');
  });

}
