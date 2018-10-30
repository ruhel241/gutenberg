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
import PluginPostPublishPanel from '../';

jest.mock( '../../../../../../components/src/button' );

describe( 'PluginPostPublishPanel', () => {
	test( 'renders fill properly', () => {
		const tree = ReactTestRenderer.create(
			<SlotFillProvider>
				<PluginPostPublishPanel
					className="my-plugin-post-publish-panel"
					title="My panel title"
					initialOpen={ true }
				>
					My panel content
				</PluginPostPublishPanel>
				<PluginPostPublishPanel.Slot />
			</SlotFillProvider>
		).toJSON();

		expect( tree ).toMatchSnapshot();
	} );
} );
