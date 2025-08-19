'use client';

import { useState } from 'react';
import AdminNavigation from '../../components/AdminNavigation';
import styles from './themes.module.css';

interface Theme {
  id: number;
  name: string;
  nameEn: string;
  visible: boolean;
  order: number;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([
    { id: 105, name: 'Весняні мотиви', nameEn: 'Spring motives', visible: false, order: 1 },
    { id: 104, name: 'Голос народу', nameEn: 'Voice of the people', visible: false, order: 2 },
    { id: 114, name: 'Львівська міська виборча комісія', nameEn: 'Lviv city election commission', visible: false, order: 3 },
    { id: 115, name: 'Львівська обласна виборча комісія', nameEn: 'Lviv regional election commission', visible: false, order: 4 },
    { id: 116, name: 'Бліц-інтерв\'ю', nameEn: 'Blitz interview', visible: false, order: 5 },
    { id: 117, name: 'Олімпійські ігри в Ріо 2016', nameEn: 'Olympic Games in Rio 2016', visible: false, order: 6 },
    { id: 136, name: 'Відверта Розмова_з', nameEn: 'Frank Conversation_with', visible: true, order: 7 },
    { id: 137, name: 'ТВК', nameEn: 'TVK', visible: false, order: 8 },
    { id: 138, name: 'Вибори', nameEn: 'Elections', visible: true, order: 9 },
    { id: 139, name: 'Журналістика змін', nameEn: 'Journalism of changes', visible: false, order: 10 },
    { id: 140, name: 'Пресслужба', nameEn: 'Press service', visible: false, order: 11 },
    { id: 141, name: 'Вибори ректора ЛНУ', nameEn: 'Elections of LNU rector', visible: true, order: 12 },
    { id: 142, name: 'Райони Львова', nameEn: 'Districts of Lviv', visible: true, order: 13 },
  ]);

  const [language, setLanguage] = useState('УКР');

  const moveUp = (id: number) => {
    setThemes(prev => {
      const newThemes = [...prev];
      const index = newThemes.findIndex(t => t.id === id);
      if (index > 0) {
        [newThemes[index], newThemes[index - 1]] = [newThemes[index - 1], newThemes[index]];
        newThemes[index].order = index + 1;
        newThemes[index - 1].order = index;
      }
      return newThemes;
    });
  };

  const moveDown = (id: number) => {
    setThemes(prev => {
      const newThemes = [...prev];
      const index = newThemes.findIndex(t => t.id === id);
      if (index < newThemes.length - 1) {
        [newThemes[index], newThemes[index + 1]] = [newThemes[index + 1], newThemes[index]];
        newThemes[index].order = index + 1;
        newThemes[index + 1].order = index + 2;
      }
      return newThemes;
    });
  };

  const toggleVisibility = (id: number) => {
    setThemes(prev => 
      prev.map(t => t.id === id ? { ...t, visible: !t.visible } : t)
    );
  };

  const deleteTheme = (id: number) => {
    if (confirm('Ви впевнені, що хочете видалити цю тему?')) {
      setThemes(prev => prev.filter(t => t.id !== id));
    }
  };

  const addTheme = () => {
    const name = prompt('Введіть назву нової теми:');
    if (name) {
      const newId = Math.max(...themes.map(t => t.id)) + 1;
      const newTheme: Theme = {
        id: newId,
        name,
        nameEn: name,
        visible: false,
        order: themes.length + 1,
      };
      setThemes(prev => [...prev, newTheme]);
    }
  };

  return (
    <div className={styles.themesPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Тема</h1>
          <div className={styles.languageSelector}>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className={styles.languageSelect}
            >
              <option value="УКР">УКР</option>
              <option value="ENG">ENG</option>
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={addTheme} className={styles.addButton}>
            <span className={styles.plusIcon}>+</span>
          </button>
          <div className={styles.bulkActions}>
            <button className={styles.bulkAction}>?</button>
            <button className={styles.bulkAction}>?</button>
            <button className={styles.bulkAction}>?</button>
            <button className={styles.bulkAction}>?</button>
            <button className={styles.bulkAction}>?</button>
            <button className={styles.bulkAction}>?</button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.themesTable}>
            <thead>
              <tr>
                <th className={styles.nameColumn}>Назва</th>
                <th className={styles.operationsColumn}>Операції</th>
              </tr>
            </thead>
            <tbody>
              {themes.map((theme) => (
                <tr key={theme.id} className={styles.tableRow}>
                  <td className={styles.nameCell}>
                    <span className={styles.themeName}>
                      {language === 'УКР' ? theme.name : theme.nameEn}
                    </span>
                    <span className={styles.themeId}> ID: {theme.id}</span>
                  </td>
                  <td className={styles.operationsCell}>
                    <div className={styles.operationButtons}>
                      <button
                        onClick={() => moveUp(theme.id)}
                        className={styles.operationButton}
                        title="Перемістити вгору"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(theme.id)}
                        className={styles.operationButton}
                        title="Перемістити вниз"
                      >
                        ↓
                      </button>
                      <button
                        className={styles.operationButton}
                        title="Редагувати"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => toggleVisibility(theme.id)}
                        className={`${styles.operationButton} ${styles.visibilityButton} ${theme.visible ? styles.visible : styles.hidden}`}
                        title={theme.visible ? 'Приховати' : 'Показати'}
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => deleteTheme(theme.id)}
                        className={`${styles.operationButton} ${styles.deleteButton}`}
                        title="Видалити"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
