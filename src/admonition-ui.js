import {
	addListToDropdown,
	createDropdown,
} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import '../theme/admonition.css';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';
import { getRelatedAdmonition } from './admonition-utils';

import admonition from '../theme/icons/admonition.svg';

export default class AdmonitionUI extends Plugin {
	static get requires() {
		return [WidgetToolbarRepository];
	}

	init() {

		const editor = this.editor;
		const t = editor.t;

		const admonitionTypes = editor.config.get('admonition.types') || [
			'default',
			'note',
			'todo',
			'check',
			'help',
			'tip',
			'example',
			'quote',
			'danger',
			'warning',
		];

		editor.ui.componentFactory.add('admonition', (locale) => {
			const dropdownView = createDropdown(locale);
			addListToDropdown(
				dropdownView,
				getDropdownItemsDefinitions(admonitionTypes)
			);

			dropdownView.buttonView.set({
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t('Insert Admonition'),
				icon: admonition,
				tooltip: true,
				// withText: true
			});

			// Bind the state of the button to the command.
			const command = editor.commands.get('insertAdmonition');
			dropdownView.bind('isEnabled').to(command);

			// Execute the command when the button is clicked (executed).
			this.listenTo(dropdownView, 'execute', (evt) => {
				editor.execute('insertAdmonition', {
					value: evt.source.commandParam,
				});
				editor.editing.view.focus();
			});
			return dropdownView;
		});

		editor.ui.componentFactory.add('admonitionType', (locale) => {
			const dropdownView = createDropdown(locale);
			addListToDropdown(
				dropdownView,
				getDropdownItemsDefinitions(admonitionTypes)
			);

			dropdownView.buttonView.set({
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t('Type'),
				tooltip: true,
				withText: true,
			});

			// Bind the state of the button to the command.
			const command = editor.commands.get('changeAdmonitionType');
			dropdownView.bind('isEnabled').to(command);

			// Execute the command when the button is clicked (executed).
			this.listenTo(dropdownView, 'execute', (evt) => {
				editor.execute('changeAdmonitionType', {
					value: evt.source.commandParam,
				});
				editor.editing.view.focus();
			});
			return dropdownView;
		});
	}

	afterInit() {
		const editor = this.editor;
		const t = editor.t;
		const widgetToolbarRepository = editor.plugins.get(
			WidgetToolbarRepository
		);
		widgetToolbarRepository.register('admonition', {
			ariaLabel: t('Change admonition type'),
			items: ['admonitionType'],
			getRelatedElement: (selection) => getRelatedAdmonition(selection),
		});
	}
}

function getDropdownItemsDefinitions(admonitionTypes) {
	const itemDefinitions = new Collection();

	for (const type of admonitionTypes) {
		const definition = {
			type: 'button',
			model: new Model({
				commandParam: type,
				label: type,
				withText: true,
			}),
		};

		// Add the item definition to the collection.
		itemDefinitions.add(definition);
	}

	return itemDefinitions;
}
