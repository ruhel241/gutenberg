/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';

const name = 'core/annotation';

export const annotation = {
	name,
	title: __( 'Annotation' ),
	match: {
		tagName: 'mark',
	},
	attributes: {
		className: 'class',
	},
	edit() {
		return <Fragment />;
	},
};
