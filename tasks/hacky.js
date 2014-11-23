
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
