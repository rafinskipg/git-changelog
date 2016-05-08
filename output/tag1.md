<img width="300px" src="https://github.com/rafinskipg/git-changelog/raw/master/images/git-changelog-logo.png" />

__Since tag 1 changelog__

# squeezy potatoe  (2016-05-08)



---

## Bug Fixes

- correctly get branch name from the command line
  ([4baa075b](https://github.com/rafinskipg/git-changelog/commit/4baa075bd93f878ee708817f911fe89c102dec02))
- correctly detect when running under grunt on Windows
  ([4205ea49](https://github.com/rafinskipg/git-changelog/commit/4205ea49a893e4d1807a39268739c13754d40cf2))
- Stream didn't close properly
  ([99f228cf](https://github.com/rafinskipg/git-changelog/commit/99f228cfa5cb26c46ef9e3b00171a5e3d38fd844))
- Github commit url
  ([c186f2d8](https://github.com/rafinskipg/git-changelog/commit/c186f2d877e7907305953610bcaaef331406178a))
- **Options:** use repo_url instead of url
  ([346b3949](https://github.com/rafinskipg/git-changelog/commit/346b39491923a49a3421f174a566b204d5fc7db9))
- **checkPath:** add missing require('path')
  ([e5dab826](https://github.com/rafinskipg/git-changelog/commit/e5dab826062bd22dd37c8c3d3c24a4d9b4701f6d))
- **generate:** create path to file if it does not already exist
  ([62f6210f](https://github.com/rafinskipg/git-changelog/commit/62f6210f6895bcf5f9984b26948178b1a93cbc9e))
- **git_changelog_generate:** pass tag if it exists to gitReadLog
  ([7c801927](https://github.com/rafinskipg/git-changelog/commit/7c801927672792fc9a818653b74c78d77c7bff9e),
   [#5](https://github.com/rafinskipg/git-changelog/issues/5))
- **nested lists:** nested list fix. Closes #9
  ([22855518](https://github.com/rafinskipg/git-changelog/commit/2285551810919bd4d8a749ae3ddd88f9cedcdd0e),
   [#9](https://github.com/rafinskipg/git-changelog/issues/9))
- **package.json:** move q to dependancies since it is required to run
  ([257119cf](https://github.com/rafinskipg/git-changelog/commit/257119cf2bb6d8f341a5d65a2f47bcf803dff205))
- **params:** Restores versionName in CLI
  ([1d97f952](https://github.com/rafinskipg/git-changelog/commit/1d97f952bd5d37f67c1febdf161f4ce9b310eebf))


## Features

- improve `git log` synthax command to use the branch name
  ([4ce61281](https://github.com/rafinskipg/git-changelog/commit/4ce6128103ece64b44695ac196b457e63649229b))
- CLI option with git-changelog
  ([50af9f0a](https://github.com/rafinskipg/git-changelog/commit/50af9f0aeba14e88254aaf1bfd6433c4c6bc9fbe))
- Working on new API
  ([121b9928](https://github.com/rafinskipg/git-changelog/commit/121b99285d2a04f9159951fa0e3f849d0d618fef))
- **bootstrap:** creating initial structure
  ([dea45d68](https://github.com/rafinskipg/git-changelog/commit/dea45d68ce9555e876680bf7c0778add2f367a30))
- **grunt-plugin:**
  - Commit for research purposes
  ([5afbb7a9](https://github.com/rafinskipg/git-changelog/commit/5afbb7a95c9f0e985f78666e7e231967524a8928))
  - Now it is ready to be a grunt plugin
  ([6422e055](https://github.com/rafinskipg/git-changelog/commit/6422e0552b30f6e94d11b03310a23c1342aa5965))
- **options:** Added ignore tags option
  ([95362e8b](https://github.com/rafinskipg/git-changelog/commit/95362e8b57a673e810ffe54ff3337de1ea5109a8))
- **output:** added logo in printHeader
  ([6b489450](https://github.com/rafinskipg/git-changelog/commit/6b489450a90172dc57059d7fd55fb4c6110152b2))
- **package:** Added global install so you can run via command
  ([86eae3f0](https://github.com/rafinskipg/git-changelog/commit/86eae3f013ace1c5c23afc32b2e8f878a69629f1))


## Documentation

- Updated options and tagging info
- added documentation for explaining the commit message
- Added docs
- **README:**
  - Follow proper style in example commits
  - added more commit examples and npm versioning usage
  - add logo
- **readme:** Final readme Fixes #1 Closes #1



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problems or suggestions, create an issue.* :) **Thanks** </sub></sup>