var htmlparser  = require('htmlparser2');
var domutils    = require('domutils');

module.exports = function(html, allowable_tags) {
    var allowed_tags = parseAllowableTags(allowable_tags),
        strippedDom = [],
        domhandler = new htmlparser.DomHandler(function(error, dom) {
            if (!error) {
                strippedDom = stripDom(dom, allowed_tags);
            }
        }),
        parser = new htmlparser.Parser(domhandler);


    parser.write(html);
    parser.end();

    return strippedDom.map(domutils.getOuterHTML).join('');
};

function stripDom(element, allowed_tags) {
    if (Array.isArray(element)) {
        return element.reduce(function(previous, current) {
            return previous.concat(stripDom(current, allowed_tags));
        }, []).filter(Object);
    }

    if (element.type == 'tag') {
        if (element.children) {
            element.children = stripDom(element.children, allowed_tags);
        }

        return (element.name in allowed_tags ? element : element.children);
    }

    return element;
}

var tagRegex = /<(w+)>/g;
function parseAllowableTags(allowable_tags) {
    var tagRegex = /<(\w+)>/g,
        tags = {},
        match;

    while (match = tagRegex.exec(allowable_tags)) {
        tags[match[1]] = true;
    }
    return tags;
}
