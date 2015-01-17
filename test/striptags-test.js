'use strict';

var assert = require('assert'),
    striptags = require('../');

/* global describe, it */
describe('striptags', function() {
    it('should not modify plain text', function() {
        var text = 'lorem ipsum < a>';

        assert.equal(text, striptags(text));
    });

    it('should remove simple HTML tags', function() {
        var html = '<a href="">lorem <strong>ipsum</strong></a>',
            text = 'lorem ipsum';

        assert.equal(text, striptags(html));
    });

    it('should leave HTML tags if specified', function() {
        var html = '<strong>lorem ipsum</strong>',
            allowedTags = '<strong>';

        assert.equal(html, striptags(html, allowedTags));
    });

    it('should leave attributes when allowing HTML', function() {
        var html = '<a href="https://example.com">lorem ipsum</a>',
            allowedTags = '<a>';

        assert.equal(html, striptags(html, allowedTags));
    });

    it('should leave nested HTML tags if specified', function() {
        var html = '<div>lorem <strong>ipsum</strong></div>',
            strippedHtml = 'lorem <strong>ipsum</strong>',
            allowedTags = '<strong>';

        assert.equal(strippedHtml, striptags(html, allowedTags));
    });

    it('should leave outer HTML tags if specified', function() {
        var html = '<div>lorem <strong>ipsum</strong></div>',
            strippedHtml = '<div>lorem ipsum</div>',
            allowedTags = '<div>';

        assert.equal(strippedHtml, striptags(html, allowedTags));
    });

    it('should remove DOCTYPE declaration', function() {
        var html = '<!DOCTYPE html> lorem ipsum',
            text = 'lorem ipsum';

        assert.equal(text, striptags(html));
    });

    it('should remove comments', function() {
        var html = '<!-- lorem ipsum --> dolor sit amet',
            text = 'dolor sit amet';

        assert.equal(text, striptags(html));
    });
});
