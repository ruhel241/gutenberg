/**
 * Internal dependencies
 */

import { matchXPath } from '../xpath';

// eslint-disable-next-line no-console
console.log.mockRestore();

describe( 'matchXPath', () => {
	it( 'should match a plain structure', () => {
		const plainRecord = {
			formats: [ , , , ],
			text: 'Text',
		};
		const xpath = 'text()[1]';
		const expected = 0;

		const actual = matchXPath( plainRecord, xpath );

		expect( actual ).toEqual( expected );
	} );

	it( 'should match the first text node', () => {
		const record = {
			formats: [ , [ { type: 'strong' } ], , , , ],
			text: ' Text',
		};

		// There will be a text node with an empty string before the strong.
		expect( matchXPath( record, 'text()[1]' ) ).toEqual( 0 );
		expect( matchXPath( record, 'text()[2]' ) ).toEqual( 2 );
	} );

	it( 'should match deeper trees', () => {
		const strong = { type: 'strong' };
		const em = { type: 'em' };
		const s = { type: 's' };
		const record = {
			formats: [
				[],
				[ strong ],
				[ strong, em ],
				[ strong, em, s ],
				[ strong, em ],
				[ strong ],
				[],
			],
			text: 'Textual',
		};

		expect( matchXPath( record, 'text()[1]' ) ).toEqual( 0 );
		expect( matchXPath( record, 'strong[1]/text()[1]' ) ).toEqual( 1 );
		expect( matchXPath( record, 'strong[1]/em[1]/text()[1]' ) ).toEqual( 2 );
		expect( matchXPath( record, 'strong[1]/em[1]/s[1]/text()[1]' ) ).toEqual( 3 );
		expect( matchXPath( record, 'strong[1]/em[1]/text()[2]' ) ).toEqual( 4 );
		expect( matchXPath( record, 'strong[1]/text()[2]' ) ).toEqual( 5 );
		expect( matchXPath( record, 'text()[2]' ) ).toEqual( 6 );
	} );

	it( 'should gracefully fail if no position can be found', () => {
		const record = {
			formats: [ , , , ],
			text: 'Text',
		};

		expect( matchXPath( record, 'text()[2]' ) ).toEqual( false );
		expect( matchXPath( record, 'mark[1]/text()[1]' ) ).toEqual( false );
		expect( matchXPath( record, 'mark[1]/strong[1]/text()[1]' ) ).toEqual( false );
	} );
} );
