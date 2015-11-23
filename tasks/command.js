#!/usr/bin/env node

'use strict';

var program = require('commander');
var git_changelog = require('./git_changelog_generate');
var defaults = require('./defaults');
var _ = require('lodash');
var options = _.defaults({}, defaults);


if (process.argv.join('').replace(/\\/g,'/').indexOf('/grunt') === -1) {

  program
    .version('0.1.7')
    .option('-e, --extended', 'Extended log')
    .option('-a, --app_name [app_name]', 'Name [app_name]')
    .option('-b, --branch [branch_name]', 'Branch name [branch_name]')
    .option('-f, --file [file]', 'File [file]')
    .option('-r, --repo_url [url]', 'Repo url [url]')
    .option('-l, --logo [logo]', 'Logo path [logo]')
    .option('-i, --intro [intro]', 'intro text [intro]')
    .option('-t, --tag [tag]', 'Since tag [tag]')
    .option('-g, --grep [grep]', 'Grep commits for [grep]')
    .option('-d, --debug', 'Debugger')
    .parse(process.argv);

  console.log('Executing git changelog:');
  if (program.extended){
    console.log('  - Extended, getting log since the BigBang');
    options.tag = false;
  }

  if (program.app_name){
    options.app_name = program.app_name;
  }

  if (program.branch_name){
    options.branch_name = program.branch_name;
    console.log('  - Branch %s', program.branch);
  }
  if (program.debug){
    console.log('Debug enabled');
    options.debug = program.debug;
  }

  if (program.file){
    options.file = program.file;
  }

  if (program.logo){
    options.logo = program.logo;
  }
  if (program.intro){
    options.intro = program.intro;
  }

  if (program.url){
    options.repo_url = program.url;
    console.log('  - With URL %s', program.url);
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

  if (program.grep){
    options.grep_commits = program.grep;
  }

  console.log('  - The APP name is %s', options.app_name);
  console.log('  - The output file is %s', options.file);

  git_changelog.generate(options).then(function(){
    console.log('Finished generating log Yai!');
  });

}
