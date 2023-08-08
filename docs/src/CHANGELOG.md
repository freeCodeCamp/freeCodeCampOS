# Changelog

## [Unreleased]

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

- dependency @types/react to v18.0.38
- dependency @types/node to v18.15.13

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
- dependency @types/react to v18.0.33
- dependency @types/react to v18.0.32
- dependency webpack-dev-server to v4.13.2
- dependency @types/react to v18.0.31
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
