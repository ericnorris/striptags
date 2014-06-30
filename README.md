# striptags
An implementation of PHP's [strip_tags](http://www.php.net/manual/en/function.strip-tags.php) in Node.js.
```
striptags(html, allowedTags);
```

## Installing
```
npm install striptags
```

## Usage
```
var striptags = require('striptags');

var html = '<html><a href="#meow" class="default">hello world</a><button disabled> I am the walrus</button></html>';

striptags(html);
striptags(html, '<a><button>');
```

Output:
```
'hello world I am the walrus'
```

```
<a href="meow" class="default">hello world</a><button disabled=""> I am the walrus</button>
```

## Differences between PHP strip_tags and striptags
striptags.js uses a full-bodied HTML parser ([htmlparser2](https://github.com/fb55/htmlparser2)) to determine and remove tags from a string, whereas strip_tags uses "the same tag stripping state machine as the fgetss() function."

Because striptags.js uses an actual parser, this should avoid the pitfalls of using a Regular Expression against HTML (see [here](http://stackoverflow.com/a/1732454)).
