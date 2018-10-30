/**
 * External dependencies
 */
import ReactTestRenderer from 'react-test-renderer';

/**
 * WordPress dependencies
 */
import { SlotFillProvider } from '@wordpress/components';

/**
 * Internal dependencies
 */
import PluginPrePublishPanel from '../';

jest.mock( '../../../../../../components/src/button' );

describe( 'PluginPrePublishPanel', () => {
	test( 'renders fill properly', () => {
		const tree = ReactTestRenderer.create(
			<SlotFillProvider>
				<PluginPrePublishPanel
					className="my-plugin-pre-publish-panel"
					title="My panel title"
					initialOpen={ true }
				>
					My panel content
				</PluginPrePublishPanel>
				<PluginPrePublishPanel.Slot />
			</SlotFillProvider>
		).toJSON();

		expect( tree ).toMatchSnapshot();
	} );
} );
