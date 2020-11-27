# striptags (WIP)

An implementation of PHP's [strip_tags](https://www.php.net/manual/en/function.strip-tags.php) in Typescript.

## Highlights

- No dependencies
- Prevents XSS by default

## Installing

```
npm install striptags
```

## Basic Usage

```typescript
// commonjs format
striptags(text: string, options?: Partial<StateMachineOptions>): string;
```

### Examples

```javascript
// commonjs format
const striptags = require("striptags").striptags;

// alternatively:
// import { striptags } from "striptags";

var html = `
<a href="https://example.com">lorem ipsum <strong>dolor</strong> <em>sit</em> amet</a>
`.trim();

console.log(striptags(html));
console.log(striptags(html, {allowedTags: new Set(["strong"])}));
console.log(striptags(html, {tagReplacementText: "🍩"}));
```

Outputs:

```
lorem ipsum dolor sit amet
lorem ipsum <strong>dolor</strong> sit amet
🍩lorem ipsum 🍩dolor🍩 🍩sit🍩 amet🍩
```

## Advanced Usage

```typescript
class StateMachine {
    constructor(partialOptions?: Partial<StateMachineOptions>);
    consume(text: string): string;
}
```

The `StateMachine` class is similar to the `striptags` function, but persists state across calls to `consume()` so that you may safely pass in a stream of text. For example:

```javascript
const StateMachine = require("striptags").StateMachine;

// alternatively:
// import { StateMachine } from "striptags";

const instance = new StateMachine();

console.log(
  instance.consume("some text with <a") + instance.consume("tag>and more text")
);
```

Outputs:

```
some text with and more text
```

## Options

* `allowedTags: Set<string>` a set containing a list of tag names to allow (e.g. `new Set(["tagname"])`), default: `new Set([])`.
* `tagReplacementText: string` a string to use as replacement text when a tag is found and not allowed, default: `""`.
* `encodePlaintextTagDelimiters: boolean` true if `<` and `>` characters immediately followed by whitespace should be HTML encoded, default: `true`. This is safe to set to `false` if the output is expected to be used only as plaintext.
