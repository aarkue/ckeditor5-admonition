import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat";
import blockAutoformatEditing from '@ckeditor/ckeditor5-autoformat/src/blockautoformatediting';
import inlineAutoformatEditing from '@ckeditor/ckeditor5-autoformat/src/inlineautoformatediting';

export default class AdmonitionAutoformat extends Plugin {
    static get requires() {
		return [ Autoformat ];
	}

    afterInit(){
      const admonitionTypes = this.editor.config.get('admonition.types') || [
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

        if(this.editor.commands.get('insertAdmonition')){
            blockAutoformatEditing(this.editor,this,/^\!\!\[*\! (.+) $/, (x) => {
              console.log(x.match[1])
              if(admonitionTypes.includes(x.match[1])){
                this.editor.execute('insertAdmonition',{value: x.match[1] || 'note'});
              }else{
                this.editor.execute('insertAdmonition',{value: 'note'});
              }
            })
        //     inlineAutoformatEditing(this.editor,this,/(?:^|\s)(\!\!)(\[*)(\!)(.+) $/g, ( writer, rangesToFormat ) => {
        //     console.log({rangesToFormat,writer})
        //     this.editor.execute('insertAdmonition',{value: 'note'});
        // })
            
        }
    }
}