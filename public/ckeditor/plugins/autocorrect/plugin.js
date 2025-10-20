CKEDITOR.plugins.add('autocorrect', {
    icons: 'autocorrect',
    init: function(editor) {
        var pluginRules = [];

        var rulesPath = this.path + 'rules.json';
        fetch(rulesPath)
            .then(response => response.json())
            .then(data => {
                pluginRules = data;
            })
            .catch(error => console.error('Помилка завантаження правил автокоректури:', error));

        editor.addCommand('runAutocorrect', {
            exec: function(editor) {
                if (pluginRules.length === 0) {
                    editor.showNotification('Правила автокоректури ще не завантажено або файл порожній.', 'warning');
                    return;
                }

                // 1. СТВОРЮЄМО ЗНІМОК ПЕРЕД ЗМІНАМИ
                editor.fire('saveSnapshot');

                var content = editor.getData();
                var originalContent = content;
                var correctionsCount = 0;

                pluginRules.forEach(function(rule) {
                    try {
                        var regex = new RegExp(rule.find, 'g');
                        var matches = content.match(regex);
                        if (matches) {
                            correctionsCount += matches.length;
                        }
                        content = content.replace(regex, rule.replace);
                    } catch (e) {
                        console.error('Некоректний регулярний вираз у правилі:', rule.find);
                    }
                });

                if (originalContent !== content) {
                    editor.setData(content, {
                        callback: function() {
                            // 2. СТВОРЮЄМО ЗНІМОК ПІСЛЯ ЗМІН
                            editor.fire('saveSnapshot');
                            editor.showNotification('Зроблено виправлень: ' + correctionsCount + '.', 'info', 3000);
                        }
                    });
                } else {
                    editor.showNotification('Виправлень не знайдено.', 'info', 3000);
                }
            }
        });

        editor.ui.addButton('Autocorrect', {
            label: 'Автокоректура тексту',
            command: 'runAutocorrect',
            toolbar: 'correction',
            icon: this.path + 'icons/autocorrect.png'
        });
    }
});