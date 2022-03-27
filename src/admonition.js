import AdmonitionEditing from './admonition-editing';
import AdmonitionUI from './admonition-ui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
export default class Admonition extends Plugin {
    static get requires() {
        return [ AdmonitionEditing, AdmonitionUI ];
    }

    static get pluginName() {
		return 'Admonition';
	}
}
