/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	
    config.removePlugins = 'exportpdf';

	config.toolbarGroups = [
		{ name: 'correction', groups: [ 'correction' ] },
		{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
		{ name: 'forms', groups: [ 'forms' ] },
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
		{ name: 'links', groups: [ 'links' ] },
		{ name: 'insert', groups: [ 'insert' ] },
		{ name: 'emoji', groups: [ 'emoji' ] },
		{ name: 'styles', groups: [ 'styles' ] },
		{ name: 'colors', groups: [ 'colors' ] },
		{ name: 'tools', groups: [ 'tools' ] },
		{ name: 'others', groups: [ 'others' ] },
		{ name: 'about', groups: [ 'about' ] }
	];

	config.removeButtons = 'Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,HiddenField,CopyFormatting,CreateDiv,BidiLtr,BidiRtl,Language,Styles,Font,Save,NewPage,Templates,PasteFromWord,ExportPdf,ImageButton';
	
	// Вимикаємо повідомлення про небезпечну версію
	config.versionCheck = false;
	
    // Форматування блоків
    config.format_tags = 'p;h1;h2;h3;pre';
 
    // Додаємо наші плагіни
    config.extraPlugins = 'nofollow,autocorrect,insertvariable';

    // Налаштування для офіційного плагіна autogrow
    config.autoGrow_minHeight = 200; // Мінімальна висота
    config.autoGrow_maxHeight = 800; // Максимальна висота
    config.autoGrow_bottomSpace = 50; // Додатковий відступ знизу (50px)
    config.autoGrow_onStartup = true; // Застосувати авторозширення одразу при завантаженні
};