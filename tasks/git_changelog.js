/*
 * git-changelog
 * https://github.com/rafinskipg/git-changelog
 *
 * Copyright (c) 2013 rafinskipg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  
  //Separated Logic in other file 
  var git_changelog = require('./git_changelog_generate');

  var defaults = {
    branch_name : '',
    //[G]ithub [B]itbucket supported at the momment
    repo_url: '',
    version : '',
    file: 'CHANGELOG.md',
    appName : 'My app - Changelog',
    grep_commits: '^fix|^feat|^docs|BREAKING',
    sections: [
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
    ]

  };

  grunt.registerMultiTask('git_changelog', 'A git changelog based on ANGULAR JS commit standards', function() {

    var done = this.async();
    // Options object 
    var options = this.options(defaults);

    if(options.repo_url.length === 0 ){ return;}

    git_changelog.generate(options).then(function(){
      done();
    });

  });
  

 

};
