
/**
 * Internal dependencies
 */
import {
	isInvalidLinkURL,
} from '../utils';

describe( 'isInvalidLinkURL', () => {
	it( 'returns false if the URL does not start with http', () => {
		expect( isInvalidLinkURL( 'this://is/valid' ) ).toBe( false );
		expect( isInvalidLinkURL( 'ht#tp://this/is/valid' ) ).toBe( false );
		expect( isInvalidLinkURL( 'ht#tp://th&is/is/valid' ) ).toBe( false );
		expect( isInvalidLinkURL( 'anythingisvalidreally' ) ).toBe( false );
	} );

	describe( 'URLs beginning with "http"', () => {
		it( 'returns true if the URL has no TLD', () => {
			expect( isInvalidLinkURL( 'http://test/' ) ).toBe( true );
		} );

		it( 'returns true if the URL has a forward slash before its TLD', () => {
			expect( isInvalidLinkURL( 'http://test/test.com' ) ).toBe( true );
		} );

		it( 'returns true if the URL has an invalid character directly after the protocol', () => {
			expect( isInvalidLinkURL( 'http://-test.com' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://?test.com' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://#test.com' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://.test.com' ) ).toBe( true );
		} );

		it( 'returns true if the URL has an invalid character in the domain or TLD', () => {
			expect( isInvalidLinkURL( 'http://te?st.com' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://te#st.com' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://te..st.com' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://test.co?m' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://test.co#m' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://test.c..om' ) ).toBe( true );
		} );

		it( 'returns true if the URL has whitespace', () => {
			expect( isInvalidLinkURL( 'http:/ /test.com' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://te st.com' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http:// test.com' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://test.c om' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://test.com/ee ee/' ) ).toBe( true );
			expect( isInvalidLinkURL( 'http://test.com/eeee?qwd qwdw' ) ).toBe( true );
		} );

		it( 'returns false for valid URLs', () => {
			expect( isInvalidLinkURL( 'http://test.com' ) ).toBe( false );
			expect( isInvalidLinkURL( 'https://test.com' ) ).toBe( false );
			expect( isInvalidLinkURL( 'http://test-with-hyphen.com' ) ).toBe( false );
			expect( isInvalidLinkURL( 'http://test.com/' ) ).toBe( false );
			expect( isInvalidLinkURL( 'http://test.com/with/path/separators' ) ).toBe( false );
			expect( isInvalidLinkURL( 'http://test.com/with?query=string&params' ) ).toBe( false );
		} );
	} );
} );

