## 0

### --seed--

#### --cmd--

```bash
rm -f external-seed/index.js
rm -f external-seed/log
```

## 1

### --seed--

#### --"external-seed/index.js"--

```js
const a = 'seeding works';
console.log(a);
```

#### --cmd--

```bash
touch external-seed/log
node external-seed/index.js > external-seed/log
```

## --fcc-end--
