const parser = require('./post.peg.js');

module.exports = function myParse( document ) {
    return parser.parse( document );
};