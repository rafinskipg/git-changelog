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
    .option('-r, --repo_url [repo_url]', 'Repo url [repo_url]')
    .option('-l, --logo [logo]', 'Logo path [logo]')
    .option('-i, --intro [intro]', 'intro text [intro]')
    .option('-t, --tag [tag]', 'Since tag [tag]')
    .option('-rc, --changelogrc [changelogrc]', '.changelogrc relative path [changelogrc]')
    .option('-g, --grep [grep]', 'Grep commits for [grep]')
    .option('-d, --debug', 'Debugger')
    .parse(process.argv);

  console.log('Executing git changelog:');

  if (program.extended){
    console.log('  - Extended, getting log since the BigBang');
    options.tag = false;
  }

  if (program.version_name){
    options.versionName = program.version_name;
  }

  if (program.app_name){
    options.app_name = program.app_name;
  }

  if (program.branch){
    options.branch = program.branch;
    console.log('  - Branch %s', program.branch);
  }
  if (program.debug){
    console.log('Debug enabled');
    options.debug = program.debug;
  }

  if (program.file){
    options.file = program.file;
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
