# Web3 - Build a TomTom

## 1

### --description--

**User Stories:**

- Tom can join the meeting
- Tom can see other members in the meeting room
- Tom can present his screen
- Tom can see his screen being presented
- Tom can speak to the other members
- Tom can hear other members speak
- Tom's screen does not freeze mid-presentation
- Tom's TomTom takes Tom to Tennessee to temporarily try towing taxis
- Tom can see `inline-code` and it is `beautiful`

```rust
fn main() {
  let test_tom = Tom::test();
}
```

```typescript
class Tom {
  public static name = "TomTom";
  constructor() {
    this.hunger = true;
  }
  eatFood() {
    this.hunger = false;
  }
  get isHungry() {
    return this.hunger;
  }
}
```

```sql
CREATE TABLE IF NOT EXISTS `tom` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hunger` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### --tests--

Tom can join the meeting

```js
await timeout(1564);
assert(true);
```

Tom can see other members in the meeting room

```js
await timeout(1756);
assert(true);
```

Tom can present his screen

```js
await timeout(1863);
assert(false, "Tom cannot present his screen");
```

Tom can see his screen being presented

```js
await timeout(1114);
assert(true);
```

Tom can speak to the other members

```js
await timeout(2214);
assert(true);
```

Tom can hear other members speak

```js
await timeout(4861);
assert(true);
```

Tom's screen does not freeze mid-presentation

```js
await timeout(2222);
assert(
  false,
  "Tom's screen still freezes... Probably from the Wisconsin cold."
);
```

Tom's TomTom takes Tom to Tennessee to temporarily try towing taxis

```js
await timeout(2000);
assert(true);
```

### --before-all--

```js
console.log("I run before the tests do");
var _radom = "test";
console.log("2: ", _radom);
```

### --before-each--

```js
console.log("I run before each test runs");
```

## --fcc-end--
