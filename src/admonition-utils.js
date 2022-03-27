export function getRelatedAdmonition( selection ) {
    const viewElement = selection.getSelectedElement();
    if ( viewElement) {
        console.log({viewElement})
        return viewElement;
    }

    let parent = selection.getFirstPosition().parent;
    while ( parent ) {
        if ( parent.is( 'element' ) && (('name' in parent && parent.name === 'admonition') || ('hasClass' in parent && parent.hasClass('admonition')))) {
            return parent;
        }

        parent = parent.parent;
    }

    return null;
}