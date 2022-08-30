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
			if ( !selection.isCollapsed ) {
				return;
			}
			const positionParent = selection.getLastPosition().parent;

			if ( positionParent.isEmpty && 'isSoft' in data && !data.isSoft ) {
				editor.model.change( writer => {
					writer.setSelection(positionParent.parent.parent,'after')
					writer.remove(positionParent);
				})
				data.preventDefault();
				evt.stop();
			}
		}, { context: [ isAdmonition ] } );

	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register('admonition', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,
			allowWhere: ['$root','$block'],
			allowAttributes: ['name','id'],
			isLimit: true,
			isBlock: true
		});

		schema.register('admonitionTitle', {
			// Cannot be split or left by the caret.

			allowIn: 'admonition',

			// Allow content which is allowed in blocks (i.e. text with attributes).
			allowContentOf: '$root',
		});

		schema.register('admonitionContent', {
			// Cannot be split or left by the caret.
			
			allowIn: 'admonition',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root'
		});
	}
	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for('upcast').elementToElement({
			model: (viewElement, { writer: modelWriter }) => {
				// Extract type/name
				const name = viewElement.getAttribute('name');
				const id = viewElement.getAttribute('id');
				return modelWriter.createElement('admonition', { name, id });
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
				const id = modelElement.getAttribute('id');
				const section = viewWriter.createContainerElement('div', {
					class: `admonition ${name}`,
					name: name,
					id: id
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
				const id = modelElement.getAttribute('id');
				const section = viewWriter.createContainerElement('div', {
					class: `admonition ${name}`,
					name: name,
					id: id
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
