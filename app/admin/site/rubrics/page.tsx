'use client';

import { useState } from 'react';
import AdminNavigation from '../../components/AdminNavigation';
import styles from './rubrics.module.css';

interface Rubric {
  id: number;
  name: string;
  nameEn: string;
  visible: boolean;
  order: number;
}

export default function RubricsPage() {
  const [rubrics, setRubrics] = useState<Rubric[]>([
    { id: 4, name: 'Суспільство', nameEn: 'Society', visible: true, order: 1 },
    { id: 2, name: 'Політика', nameEn: 'Politics', visible: true, order: 2 },
    { id: 3, name: 'Економіка', nameEn: 'Economy', visible: true, order: 3 },
    { id: 9, name: 'Статті', nameEn: 'Articles', visible: true, order: 4 },
    { id: 5, name: 'Культура', nameEn: 'Culture', visible: true, order: 5 },
    { id: 11, name: 'Інтерв\'ю', nameEn: 'Interview', visible: true, order: 6 },
    { id: 101, name: 'Здоров\'я', nameEn: 'Health', visible: true, order: 7 },
    { id: 109, name: 'Війна з Росією', nameEn: 'War with Russia', visible: true, order: 8 },
    { id: 103, name: 'Спорт', nameEn: 'Sport', visible: true, order: 9 },
    { id: 100, name: 'Кримінал', nameEn: 'Crime', visible: true, order: 10 },
    { id: 106, name: 'Надзвичайні події', nameEn: 'Emergency Events', visible: true, order: 11 },
  ]);

  const [language, setLanguage] = useState('УКР');

  const moveUp = (id: number) => {
    setRubrics(prev => {
      const newRubrics = [...prev];
      const index = newRubrics.findIndex(r => r.id === id);
      if (index > 0) {
        [newRubrics[index], newRubrics[index - 1]] = [newRubrics[index - 1], newRubrics[index]];
        newRubrics[index].order = index + 1;
        newRubrics[index - 1].order = index;
      }
      return newRubrics;
    });
  };

  const moveDown = (id: number) => {
    setRubrics(prev => {
      const newRubrics = [...prev];
      const index = newRubrics.findIndex(r => r.id === id);
      if (index < newRubrics.length - 1) {
        [newRubrics[index], newRubrics[index + 1]] = [newRubrics[index + 1], newRubrics[index]];
        newRubrics[index].order = index + 1;
        newRubrics[index + 1].order = index + 2;
      }
      return newRubrics;
    });
  };

  const toggleVisibility = (id: number) => {
    setRubrics(prev => 
      prev.map(r => r.id === id ? { ...r, visible: !r.visible } : r)
    );
  };

  const deleteRubric = (id: number) => {
    if (confirm('Ви впевнені, що хочете видалити цю рубрику?')) {
      setRubrics(prev => prev.filter(r => r.id !== id));
    }
  };

  const addRubric = () => {
    const name = prompt('Введіть назву нової рубрики:');
    if (name) {
      const newId = Math.max(...rubrics.map(r => r.id)) + 1;
      const newRubric: Rubric = {
        id: newId,
        name,
        nameEn: name,
        visible: true,
        order: rubrics.length + 1,
      };
      setRubrics(prev => [...prev, newRubric]);
    }
  };

  return (
    <div className={styles.rubricsPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Рубрики</h1>
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
          <button onClick={addRubric} className={styles.addButton}>
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
          <table className={styles.rubricsTable}>
            <thead>
              <tr>
                <th className={styles.nameColumn}>Назва</th>
                <th className={styles.operationsColumn}>Операції</th>
              </tr>
            </thead>
            <tbody>
              {rubrics.map((rubric) => (
                <tr key={rubric.id} className={styles.tableRow}>
                  <td className={styles.nameCell}>
                    <span className={styles.rubricName}>
                      {language === 'УКР' ? rubric.name : rubric.nameEn}
                    </span>
                    <span className={styles.rubricId}> ID: {rubric.id}</span>
                  </td>
                  <td className={styles.operationsCell}>
                    <div className={styles.operationButtons}>
                      <button
                        onClick={() => moveUp(rubric.id)}
                        className={styles.operationButton}
                        title="Перемістити вгору"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(rubric.id)}
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
                        onClick={() => toggleVisibility(rubric.id)}
                        className={`${styles.operationButton} ${styles.visibilityButton} ${rubric.visible ? styles.visible : styles.hidden}`}
                        title={rubric.visible ? 'Приховати' : 'Показати'}
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => deleteRubric(rubric.id)}
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
