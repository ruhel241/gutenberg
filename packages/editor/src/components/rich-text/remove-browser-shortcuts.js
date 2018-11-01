/**
 * WordPress dependencies
 */
import { rawShortcut } from '@wordpress/keycodes';
import { KeyboardShortcuts } from '@wordpress/components';

export function RemoveBrowserShortcuts() {
	return (
		<KeyboardShortcuts
			bindGlobal
			shortcuts={ {
				[ rawShortcut.primary( 'z' ) ]: () => false,
				[ rawShortcut.primaryShift( 'z' ) ]: () => false,
				[ rawShortcut.primary( 'y' ) ]: () => false,
			} }
		/>
	);
}
