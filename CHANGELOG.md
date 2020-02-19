<img width="300px" src="https://github.com/rafinskipg/git-changelog/raw/master/images/git-changelog-logo.png" />

# Git changelog

_Git changelog is a utility tool for generating changelogs. It is free and opensource. :)_



## Bug Fixes
  - naming of pre/post scripts
  ([f9e283b3](git@github.com:rafinskipg/git-changelog/commit/f9e283b3ac82e598baac3d06d088163ff15c33d9))
  - return promises in getPreviousTag
  ([58626f23](git@github.com:rafinskipg/git-changelog/commit/58626f23c036eb5000f063318fe400589c61fbe9))




## Refactor
  - use proxyquire to stub module dependencies / migration to new sinon api
  ([d7685605](git@github.com:rafinskipg/git-changelog/commit/d76856053180503a28f0b64bf824bc27c0bafe8e))
  - prevent empty commit message subject to throw error
  ([bce83af7](git@github.com:rafinskipg/git-changelog/commit/bce83af7289847d9917dab5f2b53f361d138c3f4))
  - replaced Q with native promises
  ([dd08c16d](git@github.com:rafinskipg/git-changelog/commit/dd08c16d6a29f498686ba2bd47a738ac7236a898))
  - required node version is >= 8 / removed Q promise library
  ([52b5e30a](git@github.com:rafinskipg/git-changelog/commit/52b5e30a90a42b5628dfbae55ea2639822001584))
  - replaced deprecated createOutputStream method with createWriteStream
  ([f27a64c4](git@github.com:rafinskipg/git-changelog/commit/f27a64c4451e73d85dfe06c394e2368ce4d3c33a))

  - **log**
    - show log message (when second argument) passed if the type exist log('faulty', 'type') - type 'faulty' won't output log message 'type'
  ([fb44053f](git@github.com:rafinskipg/git-changelog/commit/fb44053ff5eb6cbebbfe2a2a75f36064d2953e51))




## Chore
  - attempt to investigate travis build failure
  ([bc2a0803](git@github.com:rafinskipg/git-changelog/commit/bc2a080332bb10dd3a5eec761429d8c74bf00e55))
  - use new mocha configuration format
  ([d42dd30a](git@github.com:rafinskipg/git-changelog/commit/d42dd30ab96c3055b5b2ac9d34d93c4c2c47aa01))
  - added new contributor in readme
  ([6828776a](git@github.com:rafinskipg/git-changelog/commit/6828776ac660cd92b3f2515b4250587e16d8b8c1))
  - updated dependencies
  ([ec6bea4d](git@github.com:rafinskipg/git-changelog/commit/ec6bea4dc7aa71d12e39747a4f7f9b49abc15a51))
  - added node v12 to travis config
  ([b527965b](git@github.com:rafinskipg/git-changelog/commit/b527965ba0922f16342801c258790349f7195766))
  - updated fs-extra version to latest
  ([99905e5c](git@github.com:rafinskipg/git-changelog/commit/99905e5c0d44fb33305d27fd94540304b145405e))

  - **ci**
    - use 8 and 10 node versions
  ([6b398517](git@github.com:rafinskipg/git-changelog/commit/6b3985177fd8f27d9b9933642814182ff7dd0670))





---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problems or suggestions, create an issue.* :) **Thanks** </sub></sup>
