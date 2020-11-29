# striptags

An implementation of PHP's [strip_tags](https://www.php.net/manual/en/function.strip-tags.php) in Typescript.

**Note:** this is a total rewrite from [v3](https://github.com/ericnorris/striptags/tree/v3.x.x), and as such, is currently in an alpha state. Feel free to use this during the alpha period and provide feedback before it is released as v4.

## Highlights

- No dependencies
- Prevents XSS by default

## Installing

```
npm install striptags@alpha
```

## Basic Usage

```typescript
striptags(text: string, options?: Partial<StateMachineOptions>): string;
```

### Examples

```javascript
// commonjs
const striptags = require("striptags").striptags;

// alternatively, as an es6 import
// import { striptags } from "striptags";

var html = `
<a href="https://example.com">lorem ipsum <strong>dolor</strong> <em>sit</em> amet</a>
`.trim();

console.log(striptags(html));
console.log(striptags(html, { allowedTags: new Set(["strong"]) }));
console.log(striptags(html, { tagReplacementText: "🍩" }));
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
// commonjs
const StateMachine = require("striptags").StateMachine;

// alternatively, as an es6 import
// import { StateMachine } from "striptags";

const instance = new StateMachine();

console.log(instance.consume("some text with <a") + instance.consume("tag>and more text"));
```

Outputs:

```
some text with and more text
```

## Safety

`striptags` is safe to use by default; the output is guaranteed to be free of potential XSS vectors if used as text within a tag. **Specifying either `allowedTags` or `disallowedTags` in the options argument removes this guarantee**, however. For example, a malicious user may achieve XSS via an attribute in an allowed tag: `<img onload="alert(1);">`.

In addition, `striptags` will automatically HTML encode `<` and `>` characters followed by whitespace. While most browsers tested treat `<` or `>` followed by whitespace as a non-tag string, it is safer to escape the characters. You may change this behavior via the `encodePlaintextTagDelimiters` option described below.

## `Partial<StateMachineOptions>`

**`allowedTags?: Set<string>`**

A set containing a list of tag names to allow (e.g. `new Set(["tagname"])`). Tags not in this list will be removed. This option takes precedence over the `disallowedTags` option.

Default: `undefined`

**`disallowedTags?: Set<string>`**

A set containing a list of tag names to disallow ((e.g. `new Set(["tagname"])`). Tags not in this list will be allowed. Ignored if `allowedTags` is set.

Default: `undefined`

**`tagReplacementText?: string`**

A string to use as replacement text when a tag is found and not allowed.

Default: `""`

**`encodePlaintextTagDelimiters?: boolean`**

Setting this option to true will cause `<` and `>` characters immediately followed by whitespace to be HTML encoded. This is safe to set to `false` if the output is expected to be used only as plaintext (i.e. it will not be displayed alongside other HTML).

Default: `true`
