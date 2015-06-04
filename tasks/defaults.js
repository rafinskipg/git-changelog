//Defaults options
module.exports = {
  branch_name : '',
  //[G]ithub [B]itbucket supported at the momment
  repo_url: '',
  version : '',
  file: 'CHANGELOG.md',
  app_name : 'My app - Changelog',
  grep_commits: '^fix|^feat|^docs|BREAKING',
  tag: null,
  logo : null,
  debug: false,
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
