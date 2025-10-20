/**
 * Nofollow Plugin for CKEditor 4
 * - Adds a "nofollow" checkbox to the link dialog.
 * - Adds a toolbar button to apply "nofollow" to all external links.
 */
CKEDITOR.plugins.add('nofollow', {
    init: function(editor) {

        // --- Частина 1: Кнопка масового редагування (Nofollow All) ---

        editor.addCommand('nofollowAllLinks', {
            exec: function(editor) {
                var content = editor.document.getBody().getHtml();
                var tempDiv = new CKEDITOR.dom.element('div');
                tempDiv.setHtml(content);

                var links = tempDiv.find('a');
                var linksChanged = 0;
                var siteHost = window.location.hostname;

                for (var i = 0; i < links.count(); i++) {
                    var link = links.getItem(i);
                    var href = link.getAttribute('href');

                    // Застосовуємо nofollow тільки до зовнішніх посилань
                    if (href && !href.startsWith('#') && href.indexOf(siteHost) === -1) {
                        var rel = link.getAttribute('rel') || '';
                        if (rel.indexOf('nofollow') === -1) {
                            rel = rel ? rel.trim() + ' nofollow' : 'nofollow';
                            link.setAttribute('rel', rel);
                            linksChanged++;
                        }
                    }
                }

                if (linksChanged > 0) {
                    editor.setData(tempDiv.getHtml(), {
                        callback: function() {
                            editor.fire('saveSnapshot');
                            editor.showNotification('Додано nofollow до ' + linksChanged + ' зовнішніх посилань.', 'info', 3000);
                        }
                    });
                } else {
                    editor.showNotification('Зовнішніх посилань для оновлення не знайдено.', 'info', 3000);
                }
            }
        });

        editor.ui.addButton('NofollowAll', {
            label: 'Закрити зовнішні посилання (nofollow)',
            command: 'nofollowAllLinks',
            toolbar: 'correction',
            icon: this.path + 'icons/nofollowall.png'
        });


        // --- Частина 2: Чекбокс у діалоговому вікні посилання ---

        CKEDITOR.on('dialogDefinition', function(ev) {
            var dialogName = ev.data.name;
            var dialogDefinition = ev.data.definition;

            if (dialogName === 'link') {
                var infoTab = dialogDefinition.getContents('info');

                if (infoTab) {
                    infoTab.add({
                        type: 'checkbox',
                        id: 'noFollow',
                        label: 'Заборонити індексацію (nofollow)',
                        'default': 'checked',
                        setup: function(data) {
                            if (data.adv && data.adv.advRel) {
                                this.setValue(data.adv.advRel.match(/nofollow/) ? 'checked' : '');
                            } else {
                                this.setValue('checked');
                            }
                        },
                        commit: function(data) {
                            var dialog = this.getDialog();
                            var relInput = dialog.getContentElement('advanced', 'advRel');

                            if (relInput) {
                                var rel = relInput.getValue() || '';
                                rel = rel.replace(/\s?nofollow\s?/, ' ').trim();
                                if (this.getValue()) {
                                    rel = rel ? rel + ' nofollow' : 'nofollow';
                                }
                                relInput.setValue(rel);
                            }
                        }
                    }, 'linkType');
                }
            }
        });
    }
});