<img width="300px" src="https://github.com/rafinskipg/git-changelog/raw/master/images/git-changelog-logo.png" />

__Since tag 1 changelog__

# squeezy potatoe  (2016-07-29)



---

## Bug Fixes

- Fix generation of logs
  ([cddb2408](https://github.com/rafinskipg/git-changelog/commit/cddb2408fa3017be704acac51dabbba9f477a547))
- correctly get branch name from the command line
  ([4baa075b](https://github.com/rafinskipg/git-changelog/commit/4baa075bd93f878ee708817f911fe89c102dec02))
- correctly detect when running under grunt on Windows
  ([4205ea49](https://github.com/rafinskipg/git-changelog/commit/4205ea49a893e4d1807a39268739c13754d40cf2))
- fixed tests
  ([2e60172a](https://github.com/rafinskipg/git-changelog/commit/2e60172a4666c70d27e66d15dad297b89fff9583))
- Stream didn't close properly
  ([99f228cf](https://github.com/rafinskipg/git-changelog/commit/99f228cfa5cb26c46ef9e3b00171a5e3d38fd844))
- Github commit url
  ([c186f2d8](https://github.com/rafinskipg/git-changelog/commit/c186f2d877e7907305953610bcaaef331406178a))
- **checkpath:** add missing require('path')
  ([e5dab826](https://github.com/rafinskipg/git-changelog/commit/e5dab826062bd22dd37c8c3d3c24a4d9b4701f6d))
- **generate:** create path to file if it does not already exist
  ([62f6210f](https://github.com/rafinskipg/git-changelog/commit/62f6210f6895bcf5f9984b26948178b1a93cbc9e))
- **git log:** Ignores letter case
  ([d4cff0a8](https://github.com/rafinskipg/git-changelog/commit/d4cff0a86c5ce46405f3c0dd03f9c49a7d620792),
   [#54](https://github.com/rafinskipg/git-changelog/issues/54))
- **git_changelog_generate:** pass tag if it exists to gitReadLog
  ([7c801927](https://github.com/rafinskipg/git-changelog/commit/7c801927672792fc9a818653b74c78d77c7bff9e),
   [#5](https://github.com/rafinskipg/git-changelog/issues/5))
- **nested lists:** nested list fix. Closes #9
  ([22855518](https://github.com/rafinskipg/git-changelog/commit/2285551810919bd4d8a749ae3ddd88f9cedcdd0e),
   [#9](https://github.com/rafinskipg/git-changelog/issues/9))
- **options:** use repo_url instead of url
  ([346b3949](https://github.com/rafinskipg/git-changelog/commit/346b39491923a49a3421f174a566b204d5fc7db9))
- **package.json:** move q to dependancies since it is required to run
  ([257119cf](https://github.com/rafinskipg/git-changelog/commit/257119cf2bb6d8f341a5d65a2f47bcf803dff205))
- **params:** Restores versionName in CLI
  ([1d97f952](https://github.com/rafinskipg/git-changelog/commit/1d97f952bd5d37f67c1febdf161f4ce9b310eebf))


## Pull requests merged

- Merge pull request #55 from kerimdzhanov/patch-1
  ([31d13896](https://github.com/rafinskipg/git-changelog/commit/31d1389637b59ac3a6c68c3f8fca99045675c36c))
- Merge pull request #50 from rafinskipg/changelogrc
  ([fd07a4bf](https://github.com/rafinskipg/git-changelog/commit/fd07a4bf039c7c8ddbb496c644dfd5fcc1627904))
- Merge pull request #41 from pmiossec/fix_branch_option
  ([6247118a](https://github.com/rafinskipg/git-changelog/commit/6247118a573259cbe71c6fdd28cb53dcb7f1b855))
- Merge pull request #45 from xcambar/versionName
  ([2e50373a](https://github.com/rafinskipg/git-changelog/commit/2e50373a6f42e53598612f0e474c008624d6e80c))
- Merge pull request #47 from Sjors/patch-1
  ([d786fd08](https://github.com/rafinskipg/git-changelog/commit/d786fd084d7c1c250c866bec3c5d0c73b9abe271))
- Merge pull request #46 from zoner14/master
  ([0485a1fd](https://github.com/rafinskipg/git-changelog/commit/0485a1fd4bf01662f50b93098c6b535eb7c527eb))
- Merge pull request #37 from richardthombs/fix-grunt-on-windows
  ([5f024339](https://github.com/rafinskipg/git-changelog/commit/5f02433963b5b603c5763bd5c1a37cf8ca9e3598))
- Merge pull request #33 from richardthombs/fix-typos
  ([2656d150](https://github.com/rafinskipg/git-changelog/commit/2656d150eb95c6ad9326e4265ba64edf8e49a11c))
- Merge pull request #30 from JohnnyEstilles/refactor/get-stream
  ([a52b1169](https://github.com/rafinskipg/git-changelog/commit/a52b1169a2510d83d6d4fd5113ce157f30c4d4d0))
- Merge pull request #25 from JohnnyEstilles/code-climate
  ([28053b92](https://github.com/rafinskipg/git-changelog/commit/28053b9292d3d61fb33a004f6088c244e653b76b))
- Merge pull request #23 from JohnnyEstilles/docs/readme-updates
  ([3079151a](https://github.com/rafinskipg/git-changelog/commit/3079151a8d5f90d0830aab4437a65dff4d837b2a))
- Merge pull request #20 from JohnnyEstilles/feature/code-refactoring
  ([be209f04](https://github.com/rafinskipg/git-changelog/commit/be209f04c22f1ce2cb82e6412c4ddf117897a9e7))
- Merge pull request #12 from jodybrewster/master
  ([219ea809](https://github.com/rafinskipg/git-changelog/commit/219ea8091ac81a55b0210c9a7fd41a7f0ee5660f))
- Merge pull request #7 from colegleason/fix-tags
  ([1d4f6043](https://github.com/rafinskipg/git-changelog/commit/1d4f604363094d4eee3b4d7b1ca01133edaad344))
- Merge pull request #6 from colegleason/add-q
  ([2a712b9c](https://github.com/rafinskipg/git-changelog/commit/2a712b9cfd912f36b6f7f70d16b336575881881a))



---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problems or suggestions, create an issue.* :) **Thanks** </sub></sup>