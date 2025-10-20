CKEDITOR.plugins.add('insertvariable', {
    icons: 'insertvariable',
    init: function(editor) {
        // --- 1. Створюємо визначення для нашого діалогового вікна ---
        CKEDITOR.dialog.add('insertVariableDialog', function(editor) {
            return {
                title: 'Вставка числових змінних',
                minWidth: 300,
                minHeight: 100,
                contents: [{
                    id: 'tab-main',
                    label: 'Основні',
                    elements: [{
                        type: 'text',
                        id: 'numbers',
                        label: 'Введіть числа через кому',
                        // Функція валідації: спрацьовує при кожній зміні в полі
                        validate: function() {
                            // Регулярний вираз: дозволяє лише цифри та коми
                            var regex = /^[\d,]*$/;
                            if (!regex.test(this.getValue())) {
                                alert('Дозволено вводити лише числа та коми!');
                                return false; // Валідація не пройдена
                            }
                            return true; // Все добре
                        },
                        // Коли відкривається вікно, перевіряємо, чи є виділений текст
                        setup: function() {
                            var selectedText = editor.getSelection().getSelectedText();
                            // Очищуємо виділений текст від дужок і зайвих символів
                            if (selectedText) {
                                var cleanedText = selectedText.replace(/[{}]/g, '').replace(/[^\d,]/g, '');
                                this.setValue(cleanedText);
                            }
                        }
                    }]
                }],
                // Ця функція спрацьовує при натисканні "OK"
                onOk: function() {
                    var dialog = this;
                    var numbers = dialog.getValueOf('tab-main', 'numbers');
                    
                    // Видаляємо можливі коми на початку або в кінці
                    numbers = numbers.replace(/^,|,$/g, '').trim();

                    if (numbers) {
                        var textToInsert = '{{' + numbers + '}}';
                        editor.insertHtml(textToInsert);
                    }
                }
            };
        });

        // --- 2. Реєструємо команду, яка буде відкривати наше вікно ---
        editor.addCommand('insertVariable', new CKEDITOR.dialogCommand('insertVariableDialog'));

        // --- 3. Створюємо кнопку, яка викликає команду ---
        editor.ui.addButton('InsertVariable', {
            label: 'Вставити числову змінну {{1,2,3}}',
            command: 'insertVariable',
            toolbar: 'correction',
            icon: this.path + 'icons/insertvariable.png'
        });
    }
});