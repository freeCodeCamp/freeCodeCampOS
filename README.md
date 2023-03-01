# freeCodeCampOS

## How To Create A Course

1. Install `freecodecamp-os` in your project root:

```bash
npm install @freecodecamp/freecodecamp-os
```

2. Add a `freecodecamp.conf.json` file to your project root:

```json
{
  "path": ".",
  "prepare": "echo 'prep'",
  "scripts": {
    "develop-course": "NODE_ENV=development node ./node_modules/@freecodecamp/freecodecamp-os/.freeCodeCamp/tooling/server.js",
    "run-course": "NODE_ENV=production node ./node_modules/@freecodecamp/freecodecamp-os/.freeCodeCamp/tooling/server.js",
    "test": {
      "functionName": "handleMessage",
      "arguments": [
        {
          "message": "Hello World!",
          "type": "info"
        }
      ]
    }
  },
  "workspace": {
    "previews": [
      {
        "open": true,
        "url": "http://localhost:8080",
        "showLoader": true,
        "timeout": 20000
      }
    ]
  },
  "bash": {
    ".bashrc": "./bash/.bashrc",
    "sourcerer.sh": "./bash/sourcerer.sh"
  },
  "client": {
    "assets": {
      "header": "./client/assets/fcc_primary_large.svg",
      "favicon": "./client/assets/fcc_primary_small.svg"
    },
    "landing": {
      "description": "Placeholder description",
      "faq-link": "#",
      "faq-text": "Link to FAQ related to course"
    }
  },
  "config": {
    "projects.json": "./config/projects.json",
    "state.json": "./config/state.json"
  },
  "curriculum": {
    "locales": {
      "english": "./curriculum/locales/english"
    }
  },
  "tooling": {
    "helpers": "./tooling/helpers.js"
  }
}
```

3. Add all the necessary files to your project (_use this repo as a reference_)

## How this Works

This repo consists of:

- `.freeCodeCamp/` - the directory that is published to NPM
  - `client/` - SPA showcasing the curricula content
  - `tooling/` - directory containing Nodejs scripts to run a server serving the client
- `.logs/` - directory containing files with terminal log data
- `bash/` - directory for bash configuration
- `client/` - directory for assets used in `.freeCodeCamp/client/`
- `config/` - directory for project configuration and state
- `curriculum/` - directory for curriculum content
  - `locales/` - directory for different language versions of the curriculum
- `tooling/` - directory for Nodejs scripts integrated with `.freeCodeCamp/tooling/` but specific to the curriculum

The course content served on the client is written in Markdown files. The lesson/project tests run on the Nodejs server are written in the same markdown files.

The `freecodecamp.conf.json` file is used to configure the course, and define the actions taken by the [freeCodeCamp - Courses](https://marketplace.visualstudio.com/items?itemName=freeCodeCamp.freecodecamp-courses) extension. The `freecodecamp-os` package version used should match the minor version used for the extension. This is configured in the `.devcontainer/devcontainer.json` file.
