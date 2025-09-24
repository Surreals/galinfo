"use client";

import { message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useTimeButtons } from "@/app/hooks/useTimeButtons";
import styles from "../NewsEditor.module.css";

interface TimeButtonsProps {
  publishAt: Dayjs | null;
  setPublishAt: (time: Dayjs | null) => void;
}

export default function TimeButtons({ publishAt, setPublishAt }: TimeButtonsProps) {
  const { timeData, refreshTimes } = useTimeButtons();

  const handleTimeClick = (timeString: string | null, successMessage: string) => {
    if (timeString) {
      try {
        // Парсимо час з формату "12.08.2025, 15:18:00"
        const [datePart, timePart] = timeString.split(', ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');
        
        // Створюємо dayjs об'єкт
        const newTime = dayjs()
          .year(parseInt(year))
          .month(parseInt(month) - 1) // dayjs місяці починаються з 0
          .date(parseInt(day))
          .hour(parseInt(hours))
          .minute(parseInt(minutes))
          .second(parseInt(seconds));
        
        setPublishAt(newTime);
        message.success(successMessage);
      } catch (error) {
        console.error('Error parsing time:', error);
        message.error('Помилка парсингу часу');
      }
    }
  };

  return (
    <div className={styles.timeHints}>
      <a 
        onClick={() => handleTimeClick(timeData.lastNewsTime, 'Встановлено час останньої новини')}
        style={{ 
          cursor: timeData.lastNewsTime ? 'pointer' : 'default',
          opacity: timeData.lastNewsTime ? 1 : 0.5 
        }}
        title={timeData.lastNewsTime ? `Клікніть, щоб встановити: ${timeData.lastNewsTime}` : 'Немає даних'}
      >
        » Час останньої новини {timeData.loading ? '(завантаження...)' : timeData.lastNewsTime ? `(${timeData.lastNewsTime})` : '(немає даних)'}
      </a>
      
      <a 
        onClick={() => handleTimeClick(timeData.lastPublishedTime, 'Встановлено час останньої опублікованої новини')}
        style={{ 
          cursor: timeData.lastPublishedTime ? 'pointer' : 'default',
          opacity: timeData.lastPublishedTime ? 1 : 0.5 
        }}
        title={timeData.lastPublishedTime ? `Клікніть, щоб встановити: ${timeData.lastPublishedTime}` : 'Немає даних'}
      >
        ♥ Час останньої опублікованої {timeData.loading ? '(завантаження...)' : timeData.lastPublishedTime ? `(${timeData.lastPublishedTime})` : '(немає даних)'}
      </a>
      
      <a 
        onClick={() => handleTimeClick(timeData.serverTime, 'Встановлено поточний час сервера')}
        style={{ 
          cursor: timeData.serverTime ? 'pointer' : 'default',
          opacity: timeData.serverTime ? 1 : 0.5 
        }}
        title={timeData.serverTime ? `Клікніть, щоб встановити: ${timeData.serverTime}` : 'Немає даних'}
      >
        » Час на сервері {timeData.loading ? '(завантаження...)' : timeData.serverTime ? `(${timeData.serverTime})` : '(немає даних)'}
      </a>
    </div>
  );
}
