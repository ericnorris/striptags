'use strict';
/* global describe, it */

const assert    = require('assert');
const fs        = require('fs');
const vm        = require('vm');
const striptags = require('../');


describe('striptags', function() {
    describe('#module', function() {
        const path   = require.resolve('../');
        const src    = fs.readFileSync(path);
        const script = new vm.Script(src);

        it('should define a Node module', function() {
            const module = { exports: {} };

            script.runInNewContext({module});

            assert.equal(module.exports.toString(), striptags.toString());
        });

        it('should define an AMD module', function() {
            let module = null;
            const define = function(module_factory) {
                module = module_factory();
            };

            define.amd = true;

            script.runInNewContext({define});

            assert.equal(module.toString(), striptags.toString());
        });

        it('should define a browser global', function() {
            const global = {};

            script.runInNewContext(global);

            assert.notEqual(global.striptags, null);
        });
    });

    describe('with no optional parameters', function() {
        it('should not strip invalid tags', function() {
            const text = 'lorem ipsum < a> < div>';

            assert.equal(striptags(text), text);
        });

        it('should remove simple HTML tags', function() {
            const html = '<a href="">lorem <strong>ipsum</strong></a>',
                text = 'lorem ipsum';

            assert.equal(striptags(html), text);
        });

        it('should remove comments', function() {
            const html = '<!-- lorem -- ipsum -- --> dolor sit amet',
                text = ' dolor sit amet';

            assert.equal(striptags(html), text);
        });

        it('should strip tags within comments', function() {
            const html = '<!-- <strong>lorem ipsum</strong> --> dolor sit',
                text = ' dolor sit';

            assert.equal(striptags(html), text);
        });


        it('should not fail with nested quotes', function() {
            const html = '<article attr="foo \'bar\'">lorem</article> ipsum',
                text = 'lorem ipsum';

            assert.equal(striptags(html), text);
        });
    });

    describe('#allowed_tags', function() {
        it('should parse a string', function() {
            const html = '<strong>lorem ipsum</strong>',
                allowed_tags = '<strong>';

            assert.equal(striptags(html, allowed_tags), html);
        });

        it('should take an array', function() {
            const html = '<strong>lorem <em>ipsum</em></strong>',
                allowed_tags = ['strong', 'em'];

            assert.equal(striptags(html, allowed_tags), html);
        });
    });

    describe('with allowable_tags parameter', function() {
        it('should leave attributes when allowing HTML', function() {
            const html = '<a href="https://example.com">lorem ipsum</a>',
                allowed_tags = '<a>';

            assert.equal(striptags(html, allowed_tags), html);
        });

        it('should strip extra < within tags', function() {
            const html = '<div<>>lorem ipsum</div>',
                text = '<div>lorem ipsum</div>',
                allowed_tags = '<div>';

            assert.equal(striptags(html, allowed_tags), text);
        });

        it('should strip <> within quotes', function() {
            const html = '<a href="<script>">lorem ipsum</a>',
                text = '<a href="script">lorem ipsum</a>',
                allowed_tags = '<a>';

            assert.equal(striptags(html, allowed_tags), text);
        });
    });

    describe('with tag_replacement parameter', function() {
        it('should replace tags with that parameter', function() {
            var html = 'Line One<br>Line Two',
                allowed_tags = [],
                tag_replacement = '\n',
                text = 'Line One\nLine Two';

            assert.equal(striptags(html, allowed_tags, tag_replacement), text);
        });
    });

    describe('#streaming_mode', function() {
        it('should strip streamed HTML', function() {
            const striptags_stream = striptags.init_streaming_mode();

            const part_one   = striptags_stream('lorem ipsum <stro');
            const part_two   = striptags_stream('ng>dolor sit <');
            const part_three = striptags_stream(' amet');

            assert.equal(part_one, 'lorem ipsum ');
            assert.equal(part_two, 'dolor sit ');
            assert.equal(part_three, '< amet');
        });

        it('should work with allowable_tags', function() {
            const striptags_stream = striptags.init_streaming_mode(['strong']);

            const part_one   = striptags_stream('lorem ipsum <stro');
            const part_two   = striptags_stream('ng>dolor sit <');
            const part_three = striptags_stream(' amet');

            assert.equal(part_one, 'lorem ipsum ');
            assert.equal(part_two, '<strong>dolor sit ');
            assert.equal(part_three, '< amet');
        });
    });
});
