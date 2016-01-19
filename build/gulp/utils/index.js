var gutil = require('gulp-util');

var DEV = 1;
var PROD = 2;

var env = ((gutil.env.mode && gutil.env.mode.indexOf('prod') > -1) ? PROD : DEV);

function isDev() {
    return env !== PROD;
}

function isProd() {
    return env === PROD;
}

var pkg = require('../../../src/package.json');
var bundle = require('../../../src/bundle.json');
var banner = ['/**',
    ' * generator-qapp - a generator for create qnet app',
    ' * @author v[object Object]',
    ' * @version v0.1.0',
    ' * @link https://github.com/honwlee/generator-qapp#readme',
    ' * @license ',
    ' */',
    ''
].join('\n');

module.exports = {
    env: ((gutil.env.mode && gutil.env.mode.indexOf('prod') > -1) ? PROD : DEV),
    dev: DEV,
    prod: PROD,
    src: '../src/',
    dest: '../dist/',
    isDev: isDev,
    isProd: isProd,
    assetSrc: '../src/',
    assetDest: '../dist/',
    banner: banner,
    bundle: bundle,
    pkg: pkg

};
