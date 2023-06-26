# freeCodeCamp - Courses

The [freeCodeCamp - Courses VSCode Extension](https://marketplace.visualstudio.com/items?itemName=freeCodeCamp.freecodecamp-courses) makes working with `freecodecamp-os` in VSCode feature-rich.

## Features

### Commands

`freeCodeCamp: Develop Course`

Runs the `develop-course` script in the `freecodecamp.conf.json` of the current workspace. Also, enables debug-level logging in the terminal by setting `NODE_ENV=development`.

Also, with `NODE_ENV=development`, your workspace is validated following: <https://github.com/freeCodeCamp/freeCodeCampOS/blob/main/.freeCodeCamp/tooling/validate.js>

`freeCodeCamp: Run Course`

Runs the `run-course` script in the `freecodecamp.conf.json` of the current workspace.

`freeCodeCamp: Shutdown Course`

Disposes all terminals, and closes the visible text editors.

`freeCodeCamp: Create New Course`

Within an empty directory, this sets up the boilerplate for a new course.

`freeCodeCamp: Open Course`

Within a new directory, this command shows the available courses to clone and then clones the selected course in the current workspace.
