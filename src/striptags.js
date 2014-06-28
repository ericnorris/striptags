var htmlparser  = require('htmlparser2');
var domutils    = require('domutils');

module.exports = function(html, allowable_tags) {
    var allowable_tags = (allowable_tags === undefined ? '' : allowable_tags);
    var tags = parseAllowableTags(allowable_tags);
    var strippedDom = [];
    var parser = new htmlparser.Parser(new htmlparser.DomHandler(function(error, dom) {
        strippedDom = stripDom(dom, tags);
    }));
    parser.write(html);
    parser.end();

    return strippedDom ? strippedDom.map(domutils.getOuterHTML).join('') : '';
};

function stripDom(element, allowed_tags) {
    if (Array.isArray(element)) {
        var results = [];
        element.forEach(function(elem) {
            var stripped = stripDom(elem, allowed_tags);
            if (Array.isArray(stripped)) {
                results = results.concat(stripped);
            } else if (stripped) {
                results.push(stripped);
            }
        });

        return (results.length ? results : null);
    }

    if (element.type == 'tag') {
        if (element.children) {
            element.children = stripDom(element.children, allowed_tags);
        }

        if (!(element.name in allowed_tags)) {
            return element.children;
        } else {
            return element;
        }
    }

    return element;
}

var tagRegex = /<(w+)>/g;
function parseAllowableTags(allowable_tags) {
    var tagRegex = /<(\w+)>/g;
    var match;
    var tags = {};
    while (match = tagRegex.exec(allowable_tags)) {
        tags[match[1]] = true;
    }
    return tags;
}
