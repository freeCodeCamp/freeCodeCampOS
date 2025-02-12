# Project Reset

```json
{
  "id": 3,
  "dashedName": "project-reset",
  "isIntegrated": false,
  "isPublic": true,
  "runTestsOnWatch": false,
  "seedEveryLesson": false,
  "isResetEnabled": true,
  "blockingTests": false,
  "breakOnFailure": false
}
```

This project tests the reset functionality of `freecodecamp-os`

## 0

### --description--

The first lesson does not necessarily need to have a seed, because, on reset, `git clean -f -q -- <PROJECT_DASHED_NAME>` is run.

### --hints--

#### 0

**Note:** `git clean` only works if Campers have not committed any changes. Otherwise, it is best to write a custom seed command for the first lesson.

### --tests--

This test always passes for testing.

```js
await new Promise(resolve => setTimeout(resolve, 1000));
```

## 1

### --description--

This lesson's seed adds the `a.md` file, and runs a command which takes 2 seconds to complete.

### --tests--

This test always passes for testing.

```js
await new Promise(resolve => setTimeout(resolve, 1000));
```

### --seed--

#### --"project-reset/a.md"--

```md
File from lesson 1
```

#### --cmd--

```bash
echo "Lesson 1" && sleep 2
```

## 2

### --description--

This lesson's seed adds the `b.md` file, and runs a command which takes 2 seconds to complete.

### --tests--

This test always passes for testing.

```js
await new Promise(resolve => setTimeout(resolve, 1000));
```

### --seed--

#### --"project-reset/b.md"--

```md
File from lesson 2
```

#### --cmd--

```bash
echo "Lesson 2" && sleep 2
```

## 3

### --description--

This lesson's seed adds the `c.md` file, and runs a command which takes 2 seconds to complete.

### --tests--

This test always passes for testing.

```js
await new Promise(resolve => setTimeout(resolve, 1000));
```

### --seed--

#### --"project-reset/c.md"--

```md
File from lesson 3
```

#### --cmd--

```bash
echo "Lesson 3" && sleep 2
```

## --fcc-end--
