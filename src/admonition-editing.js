import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter'
import {
	toWidget,
	toWidgetEditable,
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import {
	InsertAdmonitionCommand,
	AdmonitionChangeTypeCommand,
} from './admonition-command';
import {isAdmonition} from './admonition-utils'

export default class AdmonitionEditing extends Plugin {
	static get requires() {
		return [Widget, ShiftEnter];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add(
			'insertAdmonition',
			new InsertAdmonitionCommand(this.editor)
		);

		this.editor.commands.add(
			'changeAdmonitionType',
			new AdmonitionChangeTypeCommand(this.editor)
		);


		const editor = this.editor;
		const viewDocument = this.editor.editing.view.document;
		const selection = editor.model.document.selection;



		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
			if ( !selection.isCollapsed || !('isSoft' in data) || !data.isSoft) {
				return;
			}
			const positionParent = selection.getLastPosition().parent;
			editor.model.change( writer => {
				// writer.insertElement('paragraph',{},positionParent.parent.parent,'after')
				writer.setSelection(positionParent.parent.parent,'after')
				// writer.rename( positionParent, 'paragraph' );
			})
			data.preventDefault();
			evt.stop();
		}, { context: [ isAdmonition ] } );

	}

	_defineSchema() {
		// ADDED
		const schema = this.editor.model.schema;

		schema.register('admonition', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block',
			allowAttributes: ['name'],
		});

		schema.register('admonitionTitle', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'admonition',

			// Allow content which is allowed in blocks (i.e. text with attributes).
			allowContentOf: '$root',
		});

		schema.register('admonitionContent', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'admonition',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root',
		});
	}
	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for('upcast').elementToElement({
			model: (viewElement, { writer: modelWriter }) => {
				// Extract type/name
				const name = viewElement.getAttribute('name');
				return modelWriter.createElement('admonition', { name });
			},
			view: {
				name: 'div',
				classes: ['admonition'],
			},
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'admonition',
			view: (modelElement, { writer: viewWriter }) => {
				const name = modelElement.getAttribute('name');
				const section = viewWriter.createContainerElement('div', {
					class: `admonition ${name}`,
					name: name,
				});

				return toWidget(section, viewWriter, {
					label: 'admonition widget',
				});
			},
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'admonition',
			view: (modelElement, { writer: viewWriter }) => {
				const name = modelElement.getAttribute('name');
				const section = viewWriter.createContainerElement('div', {
					class: `admonition ${name}`,
					name: name,
				});

				return toWidget(section, viewWriter, {
					label: 'admonition widget',
				});
			},
		});

		conversion.for('upcast').elementToElement({
			model: 'admonitionTitle',
			view: {
				name: 'div',
				classes: 'admonition-title',
			},
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'admonitionTitle',
			view: {
				name: 'div',
				classes: 'admonition-title',
			},
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'admonitionTitle',
			view: (modelElement, { writer: viewWriter }) => {
				const summary = viewWriter.createEditableElement('div', {
					class: 'admonition-title',
				});

				return toWidgetEditable(summary, viewWriter);
			},
		});

		conversion.for('upcast').elementToElement({
			model: 'admonitionContent',
			view: {
				name: 'div',
				classes: 'admonition-content',
			},
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'admonitionContent',
			view: {
				name: 'div',
				classes: 'admonition-content',
			},
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'admonitionContent',
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createEditableElement('div', {
					class: 'admonition-content',
				});

				return toWidgetEditable(div, viewWriter);
			},
		});
	}
}
