<img width="300px" src="https://github.com/rafinskipg/git-changelog/raw/master/images/git-changelog-logo.png" />

# Since tag 1 changelog

_This changelog is from the previous tag_

## squeezy potatoe v0.0.1 ( Tue Apr 21 2020 11:43:57 GMT+0200 (Central European Summer Time) )


## Bug Fixes
  - fix error messages [ee5068bf](git@github.com:rafinskipg/git-changelog/commit/ee5068bffdbb9c0e45c8ce9ce0c2f790440f19e3) 
    - Fix generation of logs [cddb2408](git@github.com:rafinskipg/git-changelog/commit/cddb2408fa3017be704acac51dabbba9f477a547) 
    - correctly get branch name from the command line [4baa075b](git@github.com:rafinskipg/git-changelog/commit/4baa075bd93f878ee708817f911fe89c102dec02) 
    - correctly detect when running under grunt on Windows [4205ea49](git@github.com:rafinskipg/git-changelog/commit/4205ea49a893e4d1807a39268739c13754d40cf2) 
    - fixed tests [2e60172a](git@github.com:rafinskipg/git-changelog/commit/2e60172a4666c70d27e66d15dad297b89fff9583) 
    - Stream didn't close properly [99f228cf](git@github.com:rafinskipg/git-changelog/commit/99f228cfa5cb26c46ef9e3b00171a5e3d38fd844) 
    - Github commit url [c186f2d8](git@github.com:rafinskipg/git-changelog/commit/c186f2d877e7907305953610bcaaef331406178a) 
  
  - **checkpath**
    - add missing require('path') [e5dab826](git@github.com:rafinskipg/git-changelog/commit/e5dab826062bd22dd37c8c3d3c24a4d9b4701f6d) 
  
  - **generate**
    - create path to file if it does not already exist [62f6210f](git@github.com:rafinskipg/git-changelog/commit/62f6210f6895bcf5f9984b26948178b1a93cbc9e) 
  
  - **git log**
    - Ignores letter case [d4cff0a8](git@github.com:rafinskipg/git-changelog/commit/d4cff0a86c5ce46405f3c0dd03f9c49a7d620792) ([#54](git@github.com:rafinskipg/git-changelog/issues/54))
  
  - **git tag**
    - get latest tag, regardless of branch for workflows that rely on git-flow releases [48800306](git@github.com:rafinskipg/git-changelog/commit/48800306fa5ac19b7e9a4c6d7f2f432ee8ae4d84) 
  
  - **git_changelog_generate**
    - pass tag if it exists to gitReadLog [7c801927](git@github.com:rafinskipg/git-changelog/commit/7c801927672792fc9a818653b74c78d77c7bff9e) ([#5](git@github.com:rafinskipg/git-changelog/issues/5))
  
  - **nested lists**
    - nested list fix. Closes #9 [22855518](git@github.com:rafinskipg/git-changelog/commit/2285551810919bd4d8a749ae3ddd88f9cedcdd0e) ([#9](git@github.com:rafinskipg/git-changelog/issues/9))
  
  - **options**
    - Use version_name instead of version [43fdac85](git@github.com:rafinskipg/git-changelog/commit/43fdac855bfd2f67a43acc93ecc8ef2e7a81f45c) 
      - use repo_url instead of url [346b3949](git@github.com:rafinskipg/git-changelog/commit/346b39491923a49a3421f174a566b204d5fc7db9) 
  
  - **package.json**
    - move q to dependancies since it is required to run [257119cf](git@github.com:rafinskipg/git-changelog/commit/257119cf2bb6d8f341a5d65a2f47bcf803dff205) 
  
  - **params**
    - Restores versionName in CLI [1d97f952](git@github.com:rafinskipg/git-changelog/commit/1d97f952bd5d37f67c1febdf161f4ce9b310eebf) 
  
  - **provider**
    - Added provider option in the command [8f3b3fef](git@github.com:rafinskipg/git-changelog/commit/8f3b3fef0d123e4fd11ea79bb9552285befc6689) 
  
  - **template**
    - Fixes missing space in version_name output in template [f494f4a9](git@github.com:rafinskipg/git-changelog/commit/f494f4a93a3c4a245f706cfb65f735a5ccccb2ce) ([#72](git@github.com:rafinskipg/git-changelog/issues/72))
  
  - **travis**
    - Removed 0.12 nodejs version, addd 7.3.0 [18190836](git@github.com:rafinskipg/git-changelog/commit/1819083690e70e0af28d0c155b6fa67cbeb1dfb3) 
  



## Pull requests merged
  - Merge pull request #87 from glebcha/refactor/node-v12-compatibility [069c8d3e](git@github.com:rafinskipg/git-changelog/commit/069c8d3e5440cb45d11b8dd2bdd229058705d3b1) 
    - Merge pull request #74 from Treyone/master [4d539ace](git@github.com:rafinskipg/git-changelog/commit/4d539ace7ff22a9be468270114109f2565203aa4) 
    - Merge pull request #73 from fabn/gitlab-links [6df54f09](git@github.com:rafinskipg/git-changelog/commit/6df54f09ab62175b89a853d3695e8d43bfedac95) 
    - Merge pull request #70 from rafinskipg/templating [5e60232c](git@github.com:rafinskipg/git-changelog/commit/5e60232cf92b66cf50f64f3a7734de98fe2637e7) 
    - Merge pull request #60 from seivan/feature/latest_tag_regardless_of_branch [1ff50d0d](git@github.com:rafinskipg/git-changelog/commit/1ff50d0dc03f8c0db9961c034945c3ef8f4268f7) 
    - Merge pull request #58 from olamothe/master [3fed7270](git@github.com:rafinskipg/git-changelog/commit/3fed727077168815f24aad7bbf5768913e3843ab) 
    - Merge pull request #55 from kerimdzhanov/patch-1 [31d13896](git@github.com:rafinskipg/git-changelog/commit/31d1389637b59ac3a6c68c3f8fca99045675c36c) 
    - Merge pull request #50 from rafinskipg/changelogrc [fd07a4bf](git@github.com:rafinskipg/git-changelog/commit/fd07a4bf039c7c8ddbb496c644dfd5fcc1627904) 
    - Merge pull request #41 from pmiossec/fix_branch_option [6247118a](git@github.com:rafinskipg/git-changelog/commit/6247118a573259cbe71c6fdd28cb53dcb7f1b855) 
    - Merge pull request #45 from xcambar/versionName [2e50373a](git@github.com:rafinskipg/git-changelog/commit/2e50373a6f42e53598612f0e474c008624d6e80c) 
    - Merge pull request #47 from Sjors/patch-1 [d786fd08](git@github.com:rafinskipg/git-changelog/commit/d786fd084d7c1c250c866bec3c5d0c73b9abe271) 
    - Merge pull request #46 from zoner14/master [0485a1fd](git@github.com:rafinskipg/git-changelog/commit/0485a1fd4bf01662f50b93098c6b535eb7c527eb) 
    - Merge pull request #37 from richardthombs/fix-grunt-on-windows [5f024339](git@github.com:rafinskipg/git-changelog/commit/5f02433963b5b603c5763bd5c1a37cf8ca9e3598) 
    - Merge pull request #33 from richardthombs/fix-typos [2656d150](git@github.com:rafinskipg/git-changelog/commit/2656d150eb95c6ad9326e4265ba64edf8e49a11c) 
    - Merge pull request #30 from JohnnyEstilles/refactor/get-stream [a52b1169](git@github.com:rafinskipg/git-changelog/commit/a52b1169a2510d83d6d4fd5113ce157f30c4d4d0) 
    - Merge pull request #25 from JohnnyEstilles/code-climate [28053b92](git@github.com:rafinskipg/git-changelog/commit/28053b9292d3d61fb33a004f6088c244e653b76b) 
    - Merge pull request #23 from JohnnyEstilles/docs/readme-updates [3079151a](git@github.com:rafinskipg/git-changelog/commit/3079151a8d5f90d0830aab4437a65dff4d837b2a) 
    - Merge pull request #20 from JohnnyEstilles/feature/code-refactoring [be209f04](git@github.com:rafinskipg/git-changelog/commit/be209f04c22f1ce2cb82e6412c4ddf117897a9e7) 
    - Merge pull request #12 from jodybrewster/master [219ea809](git@github.com:rafinskipg/git-changelog/commit/219ea8091ac81a55b0210c9a7fd41a7f0ee5660f) 
    - Merge pull request #7 from colegleason/fix-tags [1d4f6043](git@github.com:rafinskipg/git-changelog/commit/1d4f604363094d4eee3b4d7b1ca01133edaad344) 
    - Merge pull request #6 from colegleason/add-q [2a712b9c](git@github.com:rafinskipg/git-changelog/commit/2a712b9cfd912f36b6f7f70d16b336575881881a) 
  




---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problems or suggestions, create an issue.* :) **Thanks** </sub></sup>
