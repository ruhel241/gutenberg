/**
 * Internal dependencies
 */
import { toTree } from './to-tree';

const matchNodePath = /([a-z0-9()]+)\[(\d)+]/;

function createEmpty( type ) {
	return { type };
}

function getLastChild( { children } ) {
	return children && children[ children.length - 1 ];
}

function append( parent, object, pos = -1 ) {
	if ( typeof object === 'string' ) {
		object = { text: object };
	}

	object.pos = pos;
	object.parent = parent;
	parent.children = parent.children || [];
	parent.children.push( object );
	return object;
}

function appendText( object, text ) {
	object.text += text;
}

function getParent( { parent } ) {
	return parent;
}

function isText( { text } ) {
	return typeof text === 'string';
}

function getText( { text } ) {
	return text;
}

function remove( object ) {
	const index = object.parent.children.indexOf( object );

	if ( index !== -1 ) {
		object.parent.children.splice( index, 1 );
	}

	return object;
}

function isNodeType( type, child ) {
	return child.hasOwnProperty( 'type' ) && type === child.type;
}

function findNodeWithIndex( type, index, children = [] ) {
	let count = 0;
	let foundNode = false;

	children.forEach( ( child ) => {
		if (
			( type === 'text()' && isText( child ) ) ||
			isNodeType( type, child )
		) {
			if ( count === index ) {
				foundNode = child;
			}

			count++;
		}
	} );

	return foundNode;
}

/**
 * Matches an XPath to a certain value.
 *
 * Has certain assumptions about the XPath:
 *
 * * The XPath is continuous: So all nodes until the deepest node are included.
 * * The XPath starts from the root element of the RichText.
 * * The leaf node should always be a text() node.
 *
 * @param {Object} record Rich text value.
 * @param {string} xpath XPath to match.
 *
 * @return {number} The position of the matched 'element'.
 */
export function matchXPath( record, xpath ) {
	const tree = toTree( record, false, {
		createEmpty,
		append,
		getLastChild,
		getParent,
		isText,
		getText,
		remove,
		appendText,
	} );

	const pathParts = xpath.split( '/' );
	let pointer = tree;

	pathParts.forEach( ( pathPart ) => {
		const matches = matchNodePath.exec( pathPart );
		const nodeType = matches[ 1 ];

		// XPaths start counting at 1, so decrement by 1.
		const nodeIndex = parseInt( matches[ 2 ], 10 ) - 1;

		const { children } = pointer;

		pointer = findNodeWithIndex( nodeType, nodeIndex, children );
	} );

	// The leaf node must be a text node.
	return isText( pointer ) ? pointer.pos : false;
}
