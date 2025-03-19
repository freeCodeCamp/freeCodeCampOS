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

```

If I pass, the before-each hook successfully run.

```python

```

### --before-all--

```python
# write "hello world" to ./test.txt
with open('test.txt', 'w') as f:
    f.write('hello world')
```

### --before-each--

```python
a = 100
```

### --after-each--

```python

```

### --after-all--

```python
# remove ./test.txt
import os
os.remove('test.txt')
```

## --fcc-end--
