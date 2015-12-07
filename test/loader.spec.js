var fs = require('fs');
var path = require('path');
var assign = require('object-assign');
var expect = require('expect.js');
var webpack = require('webpack');

describe('Loader', function() {
    'use strict';

    var outputDir = path.resolve(__dirname, './output'),
        bundleFileName = 'bundle.js',
        getBundleFile = function() {
            return path.join(outputDir, bundleFileName);
        };
    var svgUrlLoader = path.resolve(__dirname, '../');
    var globalConfig = {
        output: {
            path: outputDir,
            filename: bundleFileName
        },
        module: {
            loaders: [
                {
                    test: /\.svg/,
                    loader: svgUrlLoader,
                    query: {},
                    exclude: /node_modules/
                }
            ]
        }
    };

    // Clean generated cache files before each test so that we can call each test with an empty state.
    afterEach(function(done) {
        fs.unlink(getBundleFile(), done);
    });


    it('should convert SVG file to utf-8 encoded data-uri string, enclosed in quotes', function(done) {
        var config = assign({}, globalConfig, {
            entry: './test/input/icon.js',
        });
        config.module.loaders[0].query.noquotes = false;

        webpack(config, function(err, stats) {
            expect(err).to.be(null);
            fs.readFile(getBundleFile(), function(err, data) {
                expect(err).to.be(null);
                var encoded = (0,eval)(data.toString());
                expect(encoded.indexOf('"')).to.be(0);
                expect(encoded.lastIndexOf('"')).to.be(encoded.length - 1);
                expect(encoded.indexOf('data:image/svg+xml;charset=utf8,%3Csvg')).to.be(1);
                return done();
            });
        });
    });


    it('should not enclose output in quotes if \'noquotes\' option is specified', function(done) {
        var config = assign({}, globalConfig, {
            entry: './test/input/icon.js',
        });
        config.module.loaders[0].query.noquotes = true;

        webpack(config, function(err, stats) {
            expect(err).to.be(null);
            fs.readFile(getBundleFile(), function(err, data) {
                expect(err).to.be(null);
                var encoded = (0,eval)(data.toString());
                expect(encoded.indexOf('data:image/svg+xml;charset=utf8,%3Csvg')).to.be(0);
                expect(encoded.lastIndexOf('svg%3E')).to.be(encoded.length - 'svg%3E'.length - 1);
                return done();
            });
        });
    });
});
