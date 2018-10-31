# Annotations

Annotations are a way to highlight a specific piece in a Gutenberg post. Examples of this include commenting on a piece of text and spellchecking. Both can use the annotations API to mark a piece of text.

## API

To see the API for yourself the easiest way is to have a block that is at least 200 characters long without formatting and putting the following in the console:

```js
wp.data.dispatch( 'core/editor' ).addAnnotation( {
	source: "my-annotations-plugin",
	blockClientId: wp.data.select( 'core/editor' ).getBlockOrder()[0],
	startXPath: "text()[1]",
	startOffset: 50,
	endXPath: "text()[1]",
	endOffset: 100
} );
```

If you add some bold text to that same block, you can annotate inside the bold text by changing the XPath:

```js
wp.data.dispatch( 'core/editor' ).addAnnotation( {
	source: "my-annotations-plugin",
	blockClientId: wp.data.select( 'core/editor' ).getBlockOrder()[0],
	startXPath: "text()[1]",
	startOffset: 5,
	endXPath: "strong[1]/text()[1]",
	endOffset: 3
} );
```

All available properties can be found in the API documentation of the `addAnnotation` action. 

## Block annotation

It is also possible to annotate a block completely. In that case just provide the `blockAnnotation` property and set it to `true`:

```js
wp.data.dispatch( 'core/editor' ).addAnnotation( {
	source: "my-annotations-plugin",
	blockClientId: wp.data.select( 'core/editor' ).getBlockOrder()[0],
	isBlockAnnotation: true,
} );
```

This doesn't provide any styling out of the box, so you have to provide some CSS to make sure your annotation is shown:

```css
.is-annotated-by-my-annotations-plugin {
	outline: 1px solid black;
}
```

## Text annotation

The text annotation is controled by the `startXPath`, `startOffset`, `endXPath` and `endOffset` properties. Because HTML is a tree based structure, simple position based annotation don't work. So the `startOffset` and `endOffset` properties refer to the position within the XPath that has been matched.

The XPaths you can provide are a subset of normal XPaths:

1. The XPath must be relative from the RichText it is matching text in. For the `core/paragraph` this means that the XPath must match the HTML content in the paragraph block.
1. The XPath must be continuous: It must have all depths of the tree. So to match a `strong` inside an `em` you must use: `strong[1]/em[1]/text()[1]`.
1. The last node in the XPath must be a `text()` node. So `strong[1]` is a valid XPath, but will not work for this API.

Note: XPaths start from index `1`, not `0`. So to match the first `a` in a paragraph you need to use `a[1]`, to match the third you use `a[3]`.
