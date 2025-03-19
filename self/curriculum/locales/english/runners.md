# Runners

This tests all the runners available with freecodecamp-os.

## 0

### --description--

The following tests run Python code.

### --tests--

I never raise an error.

```python
a = 1
print(a)
```

I always raise an error.

```python
a = 2
if a == 2:
    raise Exception('This is a custom test assertion message. Click the > button to go to the next lesson')
```

## 1

### --description--

The following tests run Python code with hooks.

### --tests--

If I pass, the before-all hook successfully run.

```python
# Check if file exists and contains "hello world"
with open('./test.txt', 'r') as f:
    assert f.read() == 'hello world'
```

If I pass, the before-each hook successfully run.

```python
if a != 100:
    raise Exception('a is not 100')
```

### --before-all--

```python
# write "hello world" to ./test.txt
# if it does not exist, create it
with open('./test.txt', 'w') as f:
    f.write('hello world')
```

### --before-each--

```python
a = 100
```

### --after-each--

```python
print(a)
```

### --after-all--

```python
# remove ./test.txt
import os
os.remove('./test.txt')
```

## --fcc-end--
