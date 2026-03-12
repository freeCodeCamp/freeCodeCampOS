# Changelog

## [4.0.0]

### Change

- Remove `__helpers.getTemp`
- Remove `__helpers.getTerminalOut`

## [3.6.0] - 2024-03-20

### Add

- Use bash's `script` command to record terminal input and output
  - Existing `.logs/` files will be deprecated in favour of `script` command in `4.0`
  - `__helpers.getScriptOut` to get `.logs/.script_out.log` file

## [3.5.1] - 2024-03-19

### Fix

- Remove `watcher` from context in worker

## [3.5.0] - 2024-03-18

### Add

- `meta` to `getLesson`
  - `meta.watch` and `meta.ignore` to alter watch behaviour when lesson loads

### Fix

- Add `/` to end of `.git` in `defaultPathsToIgnore` to prevent files starting with `.git` from being ignored
- Trim `description` and `title` fields from parser

## [3.4.1] - 2024-03-11

### Fix

- Convert `Error` class to object in worker before sending to parent

## [3.4.0] - 2024-03-05

### Add

- `pluginEvents.onLessonLoad`
- Loader showing progress for reset step
-

## [3.3.0] - 2024-02-15

### Add

- `tags` to `getProjectMeta`

## [3.2.0] - 2024-02-12

### Add

- Parser API for curriculum files
  - `pluginEvents.getProjectMeta`
  - `pluginEvents.getLesson`

### Fix

- Refactor original regex Markdown parser to use `marked.lexer`
  - This allows for more complex Markdown files to be parsed
  - Render Markdown in server
  - Pass HTML string to client to render

## [3.1.0] - 2024-02-05

### Add

- `client.landing.locale.title` field for landing page `h1`

### Fix

- Give `.description` element a `max-width` of `750px`
- Add `ws` as dependency

## [3.0.0] - 2024-02-01

### Change

- Remove `freecodecamp.conf.json` fields controlled by `freecodecamp-courses` extension
- Allow hints for integrated projects
- Replace use of `FCC_OS_PORT` with `port` field in `freecodecamp.conf.json`
- Make `version` field required in `freecodecamp.conf.json`
- Move project title and description to curriculum markdown files
- Rename `.terminal-out.log` to `.terminal_out.log`

### Migration Guide

1. Configure the following settings for the freeCodeCamp - Courses extension, and remove them from the `freecodecamp.conf.json` file:

- `"freecodecamp-courses.autoStart"`
- `"freecodecamp-courses.path"`
- `"freecodecamp-courses.prepare"`
- `"freecodecamp-courses.scripts.develop-course"`
- `"freecodecamp-courses.scripts.run-course"`
- `"freecodecamp-courses.workspace.files"`
- `"freecodecamp-courses.workspace.previews"`
- `"freecodecamp-courses.workspace.terminals"`

2. Instead of `FCC_OS_PORT` environment variable, use `port` field in `freecodecamp.conf.json` file
3. Add a SemVer compliant `version` field to `freecodecamp.conf.json` file
4. Remove the `title` and `description` fields in the `project.json`, and add the `description` to each corresponding Markdown file immediately after the `title`
5. Rename the `.terminal-out.log` file to `.terminal_out.log`

## [2.1.0] - 2024-01-23

### Add

- Worker threads to run tests in parallel
- `### --after-each--` to run code after each test
- `Cancel Tests` button that terminates all workers
- Plugin system for events:
  - `onTestsStart`
  - `onTestsEnd`
  - `onProjectStart`
  - `onLessonPassed`
  - `onLessonFailed`
  - `onProjectFinished`
- `/script/injectable.js` static file to inject a JS script into the client
- `__run-client-code` websocket event to run code in the server's context
- Add `create-freecodecamp-os-app` cli for creating the boilerplate

### Update

- dependency @types/node to v18.18.13
- dependency @types/react-dom to v18.2.17
- dependency typescript to v5.3.2
- dependency ts-loader to v9.5.1
- dependency marked-highlight to v2.0.7
- dependency marked to v9.1.6
- babel monorepo to v7.23.3
- dependency @types/prismjs to v1.26.3
- dependency @types/react to v18.2.36
- actions/setup-node digest to 1a4442c (#380)
- dependency chai to v4.3.10
- dependency @types/marked to v5.0.2

## [2.0.0 - deprecated] - 2023-09-25

### Add

- make `watcher` global
- `process.env.FCC_OS_PORT || 8080` for server listen port
- working `hints`

### Change

- remove `__helpers.makeDirectory`
- remove `__helpers.runCommand`
- remove `__helpers.writeJsonFile`
- remove `__helpers.getDirectory`
- remove `__helpers.getFile`
- remove `__helpers.getJsonFile`
- remove `__helpers.copyDirectory`
- remove `__helpers.copyProjectFiles`
- remove `__helpers.fileExists`
- update `controlWrapper` to match documented API
- start lessons at `0` instead of `1`
- remove landing page topic (`h2`)
- `config.path` is no longer required
- Remove `postinstall` script
- Tests no longer have `--before-all--` context

### Update

- dependency babel-loader to v9.1.2
- dependency marked to v9
  - Markedjs had multiple major releases within 2 months
- dependency typescript to v5.0.4
- dependency webpack-cli to v5.1.1

### Migration Guide

1. Refactor tests to use Nodejs API instead of removed `__helpers` functions.
2. Change all lesson numbers to be zero-based (start at `0`)
3. Manually build client before running tooling server (`npm run build:client`)
   1. **Suggestion:** Add `cd ./node_modules/@freecodecamp/freecodecamp-os/ && npm run build:client` to `freecodecamp.conf.json > prepare`
4. Change `--before-all--` into `--before-each--`
   1. Probably remove `--after-all--`
   2. No longer use `global` in tests

## [1.10.0] - 2023-08-08

### Add

- `config.client.static` to serve files (e.g. images) in client

## [1.9.2] - 2023-06-17

### Fix

- remove seeding files from watch during seeding

### Update

- react monorepo (#313)
- github actions (#311)
- react monorepo
- dependency @types/node to v18.16.18

## [1.9.1] - 2023-05-30

### Fix

- fix `1.9.0` introduced bug of hanging tests

### Update

- dependency webpack-dev-server to v4.15.0
- dependency @types/react to v18.2.6
- dependency @types/marked to v4.3.0
- react monorepo
- dependency @types/node to v18.16.5
- dependency @babel/core to v7.21.8
- babel monorepo to v7.21.5
- pin dependencies (#241)

## [1.9.0] - 2023-05-20

### Fix

- adjust build path
- set `$HOME` for Gitpod

### Add

- add `blockingTests` flag
- add `breakOnFailure` flag

### Bugs

- when `blockingTests && breakOnFailure`, proceeding tests appear to hang in client

## [1.8.4] - 2023-04-19

### Fix

- seed files on lesson (#237)

### Update

- dependency webpack-dev-server to v4.13.3
- dependency html-webpack-plugin to v5.5.1
- dependency @types/react to v18.0.35
- dependency @types/node to v18.15.11
- babel monorepo to v7.21.4

## [1.8.3] - 2023-03-30

### Fix

- adjust import pathing (#225)

### Update

- dependency @types/node to v18.15.10
- dependency marked to v4.3.0
- dependency nodemon to v2.0.22
- dependency @types/node to v18.15.9
- dependency @types/node to v18.15.8
- dependency @types/react to v18.0.29
- dependency webpack-dev-server to v4.13.1
- dependency webpack-dev-server to v4.13.0
- dependency style-loader to v3.3.2
- dependency @types/node to v18.15.3
- dependency @babel/core to v7.21.3
- dependency @types/node to v18.15.0
- dependency nodemon to v2.0.21
- dependency @types/node to v18.14.6

## [1.8.2] - 2023-03-03

### Fix

- parse crlf line endings (#210)

## [1.8.1] - 2023-03-02

### Fix

- use node_module pathing (#209)

## [1.8.0] - 2023-03-02

### Change

- do not copy `.freeCodeCamp` into root (#208)

### Update

- dependency @types/node to v18.14.2
- babel monorepo to v7.21.0
- dependency @types/node to v18.14.1
- dependency @types/node to v18.14.0
- dependency @types/react-dom to v18.0.11
- dependency @types/react to v18.0.28
- dependency @types/node to v18.13.0

## [1.7.3] - 2023-02-08

### Fix

- handle completed projects (#197)
- set default terminal (#200)

### Update

- dependency @types/node to v18.11.19
- dependency typescript to v4.9.5

## [1.7.2] - 2023-01-31

### Fix

- apply css to all code blocks (#196)

## [1.7.1] - 2023-01-31

### Add

- validate curriculum on develop (#182)

### Update

- dependency @types/react to v18.0.27
- dependency marked to v4.2.12
- dependency @babel/core to v7.20.12
- dependency @types/node to v18.11.18
- dependency marked to v4.2.5
- dependency @types/react-dom to v18.0.10
- dependency @babel/core to v7.20.7
- dependency @types/node to v18.11.17
- dependency css-loader to v6.7.3
- dependency @types/node to v18.11.16

## [1.7.0] - 2023-01-31

### Add

- create cache-busting helper (#181)

### Update

- dependency @types/node to v18.11.13
- dependency typescript to v4.9.4
- dependency marked to v4.2.4
- dependency @types/node to v18.11.12

## [1.6.9] - 2022-12-08

### Fix

- pass WebSocket to reset function (#174)

## [1.6.8] - 2022-12-07

### Change

- remove `.env` file from npm (#173)

## [1.6.7] - 2022-12-07

### Add

- create mkdir helper function (#172)

## [1.6.6] - 2022-12-06

### Fix

- handle file parser errors (#166)

### Update

- readme docs (#160)
- dependency ts-loader to v9.4.2
- dependency @types/react to v18.0.26
- dependency @types/node to v18.11.10
- dependency @babel/core to v7.20.5
- dependency typescript to v4.9.3
- dependency marked to v4.2.3
- dependency @types/react-dom to v18.0.9
- dependency css-loader to v6.7.2
- dependency chai to v4.3.7
- dependency marked to v4.2.2
- babel monorepo
- dependency @types/react to v18.0.25
- dependency @types/node to v18.11.9
- dependency @types/node to v18.11.8
- dependency @types/node to v18.11.7
- dependency @babel/plugin-syntax-import-assertions to v7.20.0
- dependency @types/react-dom to v18.0.8
- dependency @types/react to v18.0.24
- dependency @babel/core to v7.19.6
- dependency @babel/preset-env to v7.19.4
- dependency express to v4.18.2
- dependency typescript to v4.8.4
- dependency marked to v4.1.1
- babel monorepo to v7.19.3

## [1.6.5] - 2022-09-28

### Fix

- reset project, prevent lesson under/over -flow (#139)
- patch and enable reset button (#133)
- step skipping buttons (#138)
- docker settings (#137)

### Add

- feat: add script for camper info (#132)

### Update

- dependency ts-loader to v9.4.1
- dependency webpack-dev-server to v4.11.1
- dependency @types/react to v18.0.21

### Change

- updated styles for error page (#131)

## [1.6.4] - 2022-09-19

### Add

- progress to projects (#121)

### Change

- disable reset button (#128)

## [1.6.3] - 2022-09-19

### Add

- create test-util to get .temp.log file (#127)

### Update

- dependency nodemon to v2.0.20
- dependency @types/react to v18.0.20
- babel monorepo to v7.19.1
- pin dependency logover to 2.0.0

## [1.6.2] - 2022-09-16

### Fix

- fetch project on hot-reload

## [1.6.1] - 2022-09-15

### Fix

- optional chaining to hot-reload in server (#119)

## [1.6.0] - 2022-09-14

### Add

- versioning
- hot-ignore (#118)

## [1.5.5] - 2022-09-12

### Change

- replace spark with fade in (#116)

### Update

- dependency webpack-dev-server to v4.11.0
- dependency @types/react to v18.0.19
- babel monorepo to v7.19.0
- dependency typescript to v4.8.3
- dependency @types/react to v18.0.18
- dependency @types/marked to v4.0.7
- pin dependency @types/node to 18.7.15

## [1.5.4] - 2022-09-09

### Change

- UI revamp (#108)

## [1.5.3] - 2022-09-07

### Fix

- correctly show/hide files in production mode (#107)

## [1.5.2] - 2022-09-07

### Fix

- add controlWrapper function (#106)

## [1.5.1] - 2022-09-07

### Fix

- fix npm deps and installation (#105)

## [1.5.0] - 2022-09-06

### Add

- before-all and before-each hooks (#82)
- git build script for multiple projects (#58)
- loader config for version 1.1.1 (#44)

### Change

- all major changes (#97)
- with small improvements and updates (#54)
- Improved client styling (#42)

### Fix

- ignoring of Mac files (#60)
- pinning Ubuntu to version 20.04 (#53)
- updating of dependency marked to v4.0.19 (598e2e7)
- updating of dependency logover to v1.3.5 (1866487)
- updating of dependency logover to v1.3.4 (513d189)
- updating of dependency ws to v8.8.1 (ece46b5)
- updating of dependency marked to v4.0.18 (a13a865)
- updating of dependency logover to v1.3.2 (e1e6b10)
- updating of dependency nodemon to v2.0.19 (459d450)
- updating of dependency marked to v4.0.17 (bce9486)
- updating of dependency ws to v8.8.0 (fc52646)
- updating of dependency ws to v8.7.0 (36fc630)
- updating of dependency ws to v8.6.0 (9ad962a)
- updating of dependency express to v4.18.1 (0b7e21f)
- updating of dependency prismjs to v1.28.0 (29734ff)
- updating of dependency marked to v4.0.14 (17856ed)
- updating of dependency marked to v4.0.13 (e482c37)
- pinning of dependency nodemon to v2.0.15 (73e53e5)

### Update

- dependency marked to v4.0.19 (598e2e7)
- dependency @types/react to v18.0.17 (4ca81e9)
- dependency @types/react to v17.0.48 (7e68a76)
- dependency @types/react to v17.0.47 (f419a80)
- dependency @babel/core to v7.18.5 (f94eec6)
- dependency @types/react to v17.0.45 (f44ab1c)
- dependency @types/react-dom to v17.0.17 (014323f)
- dependency @types/react-dom to v17.0.16 (f496e14)
- dependency ts-loader to v9.3.1 (a4bb535)
- dependency nodemon to v2.0.18 (c1540dd)
- dependency typescript to v4.7.4 (a2ba270)
- dependency typescript to v4.7.3 (f5cb880)
- dependency typescript to v4.7.2 (29e5897)
- dependency ts-loader to v9.3.0 (5081424)
- dependency typescript to v4.6.4 (b1e8fe5)
- dependency nodemon to v2.0.16 (68b6da7)
- dependency @types/react-dom to v17.0.16 (f496e14)
- dependency webpack-cli to v4.10.0 (85e4326)
- dependency webpack-dev-server to v4.10.0 (b36bd79)
