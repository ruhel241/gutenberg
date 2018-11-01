const parser = require( './test-parser.js' );

module.exports = function myParse( document ) {
	return parser.parse( document );
};
