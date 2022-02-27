# freeCodeCamp - External Project Template

## Shaun's TODO:

- [ ] Add workflow for translations to Crowdin
- [ ] Enable seed parsing for resetting
- Feature Flags:
  - [x] Always use seed on next lesson
  - [ ] Use Git build for seed on production
  - [x] Run tests on watch
- [ ] Enable use of Git build on production

### Feature Flags

- `RUN_TESTS_ON_WATCH` - whether or not to run the tests on every input/save/change - defaults to `false`
- `CURRENT_PROJECT` - must match `/tooling/locales/en/<project_name>.md` filename
- `LAST_KNOWN_LESSON_WITH_HASH` - legacy, but left in case we want a Git-saving workflow
- `TEST_POLLING_RATE` - how often to refresh for changes in `ms`
- `LOCALE` - one of `/tooling/locales/conf.js` - defaults to `english`

## How To Run the Course

### In Gitpod!

1. Ensure you have the Gitpod extension. _Otherwise [click here](https://gitpod.io/#https://github.com/ShaunSHamilton/external-project)_
2. Once Gitpod opens, ensure it is done doing its stuffs
3. Open Command Palette, run `freeCodeCamp: Develop Course`

**Notes**

- When doing the course, ensure you are in the root directory

### Locally

1. Create an empty directory:

```bash
mkdir course
cd course
```

2. Download/Install `freeCodeCamp Courses` extension in VSCode.

```bash
wget https://github.com/ShaunSHamilton/courses-plus/raw/main/freecodecamp-courses-patch.vsix
code --install-extension freecodecamp-courses-patch.vsix
```

3. Open VSCode

```bash
code .
```

4. `Ctrl + Shift + P` and select `freeCodeCamp: Open Course`

5. Choose the course you want to run

6. `Ctrl + Shift + P` and select `Remote-Containers: Rebuild and Reopen in Container`

7. `Ctrl + Shift + P` and select `freeCodeCamp: Run Course`

## Ideal Dev Setup

1. Create an empty directory:

```bash
mkdir course
cd course
```

2. `Ctrl + Shift + P` -> `freeCodeCam: Create New Course`

3. Follow development steps in [Creating a Course](#creating-a-course)

## Creating a Course (_In Progress_)

### General Information

- You should not need to make any changes other than to the following files:
  - `.freeCodeCamp/tooling/locales/english/project-1.md`
  - Edit this `README.md` to include information about the course

### Adding the Course to the `freeCodeCamp Courses` Extension

1. Go to the [freeCodeCamp/freecodecamp-course repo](https://github.com/freeCodeCamp/freecodecamp-course)
2. Open a PR adding to the [resources/courses.json](https://github.com/freeCodeCamp/freecodecamp-course/blob/master/resources/courses.json) file.

## Markdown Syntax

### Headers

- `## <number>` - Lesson number heading _(required)_
- `### --description--` - Lesson description _(required)_
- `### --tests--` - Tests for lesson _(required)_
- `### --seed--` - Seed for lesson _(optional)_
- `#### --cmd--` - Command for lesson seed (Camper will see) _(optional)_
- `#### --"<string>"--` - File name and seed heading _(optional)_

### Example

````markdown
## 1

### --description--

Teach Campers amazing things here...

### --tests--

At least one line as a hint in the tests

```js
assert("Chai.js tests with async code");
```

### --seed--

#### --force--

#### --cmd--

```bash
cd somewhere
```

#### --"somewhere/index.rs"--

```rust
let seed_for_file = "I am what the 'somewhere/index.rs' file should start with'";
```

#### --cmd--

```bash
echo "All seed is run in order"
```

## 2
````

### Notables

- It is very easy to change the course to use multiple markdown files as lessons (e.g. https://github.com/freeCodeCamp/euler-rust)
- Below is the template for the course README

---

# freeCodeCamp - Rust: CLI Calculator

## Course Desciption

Add a description of the course here. Example:

_This course will introduce you to the Rust programming language._

## Prerequisites

- Intermediate knowledge of at least one other programming language
- Basic knowledge of Bash

## Learning Outcomes

- Variables
- Primitives
- Typing
- Ownership
- Handling Environment Arguments
- Parsing Strings into Floats
- Functions
- Structs
- Tuples
- Enums
- Vecs
- Control Flow
- Testing
- Traits
- Decoding Images
- Building
- Error Handling

## How to Get Started

Instructions for how to run the course on different platforms (e.g. Locally, Gitpod, Replit)
