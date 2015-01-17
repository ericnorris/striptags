# striptags [![Build Status](https://travis-ci.org/ericnorris/striptags.svg)](https://travis-ci.org/ericnorris/striptags)
A fast implementation of PHP's [strip_tags](http://www.php.net/manual/en/function.strip-tags.php) in Node.js.

## Changes from v1.0.0
- Completely rewritten to use a state machine to remove tags (similar to how PHP's strip_tags works)
- 100% test code coverage
- Output is no longer constructed from parsing input, so output is identical to input minus HTML tags
- Zero dependencies

## Installing
```
npm install striptags
```

## Usage
```javascript
striptags(html, allowedTags);
```

### Example
```javascript
var striptags = require('striptags');

var html = 
    '<a href="https://example.com">' +
        'lorem ipsum <strong>dolor</strong> <em>sit</em> amet' +
    '</a>';

striptags(html);
striptags(html, '<a><strong>');
```

Outputs:
```
'lorem ipsum dolor sit amet'
```

```
'<a href="https://example.com">lorem ipsum <strong>dolor</strong> sit amet</a>'
```

## Tests
You can run tests (powered by [mocha](http://mochajs.org/)) locally via:
```
npm test
```

Generate test coverage (powered by [blanket.js](http://blanketjs.org/)) via :
```
npm run test-coverage
```
or
```
mocha --require blanket -R html-cov > coverage.html
```

## Differences between PHP strip_tags and striptags
In this version, not much! This now closely resembles a 'port' from PHP 5.5's internal implementation of strip_tags, [php_strip_tags_ex](http://lxr.php.net/xref/PHP_5_5/ext/standard/string.c#php_strip_tags_ex).

One major difference is that this JS version does not strip PHP-style tags (e.g. "<?php echo 'hello'; ?>") - it seemed out of place in a node.js project. Let me know if this is important enough to consider including.

## Don't use regular expressions
striptags does not use any regular expressions for stripping HTML tags ([this](src/striptags.js#L7) is used for detecting whitespace, not finding HTML). Regular expressions are not capable of preventing all possible scripting attacks (see [this](http://stackoverflow.com/a/535022)). Here is a [great StackOverflow answer](http://stackoverflow.com/a/5793453) regarding how strip_tags (**when used without specifying allowableTags**) is not vulnerable to scripting attacks.
