export function getRelatedAdmonition( selection ) {
    const viewElement = selection.getSelectedElement();
    if ( viewElement) {
        if(viewElement.name === 'admonition'){
            return viewElement;
        }else{
            return null;
        }
    }

    let parent = selection.getFirstPosition().parent;
    while ( parent ) {
        if ( parent.is( 'element' ) && (('name' in parent && parent.name === 'admonition') || ('hasClass' in parent && parent.hasClass('admonition-title')))) {
            return parent;
        }

        parent = parent.parent;
    }

    return null;
}

export function isAdmonition( node ) {
	if ( !node.is( 'element' ) ||!!node.getCustomProperty( 'widget' )  ) {
		return false;
	}
	return 'hasClass' in node && node.hasClass('admonition-content');
}
