/**
 * Internal dependencies
 */
import {
	clickBlockAppender,
	getEditedPostContent,
	newPost,
	pressWithModifier,
	META_KEY,
} from '../support/utils';

describe( 'undo', () => {
	beforeEach( async () => {
		await newPost();
	} );

	it( 'should undo typing after mouse move', async () => {
		await clickBlockAppender();

		await page.keyboard.type( 'before move' );
		await page.mouse.move( 200, 300, { steps: 10 } );
		await page.keyboard.type( ' after move' );

		expect( await getEditedPostContent() ).toMatchSnapshot();

		await pressWithModifier( META_KEY, 'z' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should undo typing after non input change', async () => {
		await clickBlockAppender();

		await page.keyboard.type( 'before keyboard ' );
		await pressWithModifier( META_KEY, 'b' );
		await page.keyboard.type( 'after keyboard' );

		expect( await getEditedPostContent() ).toMatchSnapshot();

		await pressWithModifier( META_KEY, 'z' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should undo typing after arrow navigation', async () => {
		await clickBlockAppender();

		await page.keyboard.type( 'before keyboard' );
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.type( ' after keyboard' );

		expect( await getEditedPostContent() ).toMatchSnapshot();

		await pressWithModifier( META_KEY, 'z' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'Should undo to expected level intervals', async () => {
		await clickBlockAppender();

		await page.keyboard.type( 'This' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'is' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'test' );

		expect( await getEditedPostContent() ).toMatchSnapshot();

		await pressWithModifier( META_KEY, 'z' ); // Undo 3rd paragraph text.
		await pressWithModifier( META_KEY, 'z' ); // Undo 3rd block.
		await pressWithModifier( META_KEY, 'z' ); // Undo 2nd paragraph text.
		await pressWithModifier( META_KEY, 'z' ); // Undo 2nd block.
		await pressWithModifier( META_KEY, 'z' ); // Undo 1st paragraph text.
		await pressWithModifier( META_KEY, 'z' ); // Undo 1st block.

		// After undoing every action, there should be no more undo history.
		await page.waitForSelector( '.editor-history__undo:disabled' );

		expect( await getEditedPostContent() ).toBe( '' );
	} );
} );
