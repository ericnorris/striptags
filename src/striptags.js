var htmlparser = require('htmlparser2');
var domutils   = require('domutils');

module.exports = function(html, allowableTags) {
    var allowedTags = parseAllowableTags(allowableTags),
        strippedDom = [],
        domhandler = new htmlparser.DomHandler(function(error, dom) {
            if (!error) {
                strippedDom = stripDom(dom, allowedTags);
            }
        }),
        parser = new htmlparser.Parser(domhandler);


    parser.write(html);
    parser.end();

    return strippedDom.map(domutils.getOuterHTML).join('');
};

function stripDom(element, allowedTags) {
    if (Array.isArray(element)) {
        return element.reduce(function(previous, current) {
            return previous.concat(stripDom(current, allowedTags));
        }, []).filter(Object);
    }

    if (element.type == 'tag') {
        if (element.children) {
            element.children = stripDom(element.children, allowedTags);
        }

        return (element.name in allowedTags ? element : element.children);
    }

    return element;
}

function parseAllowableTags(allowableTags) {
    var tagRegex = /<(\w+)>/g,
        tags = {},
        match;

    while (match = tagRegex.exec(allowableTags)) {
        tags[match[1]] = true;
    }
    return tags;
}
