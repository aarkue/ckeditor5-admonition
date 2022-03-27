import Command from '@ckeditor/ckeditor5-core/src/command';

import { getRelatedAdmonition } from './admonition-utils';

export class InsertAdmonitionCommand extends Command {
	execute({ value }) {
		this.editor.model.change((writer) => {
			// Insert <admonition>*</admonition> at the current selection position
			// in a way that will result in creating a valid model structure.
			this.editor.model.insertContent(createAdmonition(writer, value));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(
			selection.getFirstPosition(),
			'admonition'
		);

		this.isEnabled = allowedIn !== null;
	}
}

function createAdmonition(writer, value) {
	const admonition = writer.createElement('admonition', { name: value });
	const admonitionTitle = writer.createElement('admonitionTitle');
	const admonitionContent = writer.createElement('admonitionContent');

	writer.append(admonitionTitle, admonition);
	writer.append(admonitionContent, admonition);

	// There must be at least one paragraph for the description to be editable.
	// See https://github.com/ckeditor/ckeditor5/issues/1464.
	writer.appendElement('paragraph', admonitionContent);
	writer.appendElement('heading2', admonitionTitle);
	// writer.appendText('Title',{'bold': 'true'},admonitionTitle)
	return admonition;
}

export class AdmonitionChangeTypeCommand extends Command {
	execute({ value }) {
		this.editor.model.change((writer) => {
			let admonitionEl = getRelatedAdmonition(
				this.editor.model.document.selection
			);
			if (!admonitionEl) {
				return;
			}
			writer.setAttribute('name', value, admonitionEl);
			let newEl = writer.cloneElement(admonitionEl, true);
			writer.setSelection(admonitionEl, 'on');
			this.editor.model.deleteContent(
				this.editor.model.document.selection
			);
			this.editor.model.insertContent(newEl);
		});
	}

	refresh() {
		this.isEnabled = true;
	}
}
