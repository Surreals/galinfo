/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config )
{	
	/*config.filebrowserBrowseUrl = '/public/kcfinder/browse.php?type=files';
	config.filebrowserImageBrowseUrl = '/public/kcfinder/browse.php?type=images';
	config.filebrowserFlashBrowseUrl = '/public/kcfinder/browse.php?type=flash';*/
	
	//config.filebrowserUploadUrl = '/apphlp/pushpics.php';
	/*config.filebrowserImageUploadUrl = '/public/kcfinder/upload.php?type=images';
	config.filebrowserFlashUploadUrl = '/public/kcfinder/upload.php?type=flash';*/

	// Define changes to default configuration here. For example:
	 config.language = 'uk';
	// config.uiColor = '#AADC6E';
	config.height = 450;
	///config.contentsCss = ['/css/gi2back.css'];
	//config.startupMode = 'source';
	config.autoParagraph = false;
	config.protectedSource.push( /{<[\s\S:]+>}/g );   // PHP code
	config.FormatSource		= false ;
	config.FormatOutput		= false ;
	config.allowedContent	= true

	//config.toolbar = 'Full';

	config.toolbar = [
    { name: 'document', items: [ 'Source', '-', 'NewPage', 'Preview', '-', 'Templates' ] },
    { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
    { name: 'basicstyles', items: [ 'Bold', 'Italic' ] },
	{ name: 'insert', items : [ 'Image','Table','SpecialChar','Link','Unlink','Iframe'] }
];
 
	/*config.toolbar_Full =
	[
		{ name: 'document', items : [ 'Source'] },
		{ name: 'clipboard', items : [ 'Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
		{ name: 'insert', items : [ 'Image','Table','SpecialChar','Link','Unlink','Iframe'] },
		{ name: 'paragraph', items : [ 'NumberedList','BulletedList','Outdent','Indent',
		'JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock' ] },
		'/',
		{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
		{ name: 'styles', items : [ 'Format','Font','FontSize' ] },
		{ name: 'colors', items : [ 'TextColor','BGColor' ] },
		{ name: 'tools', items : [ 'Maximize', 'ShowBlocks','-','About' ] }
	];*/
};

