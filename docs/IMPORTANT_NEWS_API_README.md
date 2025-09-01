# API для отримання важливих новин

Цей документ описує API endpoints для отримання важливих новин на основі поля `nweight`.

## Рівні важливості (nweight)

- **0** - Звичайна новина
- **1** - Важлива новина (виділення жирним)
- **2** - Топ новина (слайдшоу) - найвищий рівень
- **3** - Фотоновина (для стрічки, для рубрик в якості головної)
- **4** - Ілюструюча новина

## API Endpoints

### 1. Отримання всіх важливих новин (nweight > 0)

**URL:** `GET /api/news/important`

**Параметри:**
- `limit` (опціонально) - кількість новин (за замовчуванням: 5)
- `lang` (опціонально) - мова (за замовчуванням: 1)

**Приклади:**

```bash
# Отримати останні 5 важливих новин
GET /api/news/important

# Отримати останні 10 важливих новин
GET /api/news/important?limit=10

# Отримати важливі новини українською мовою
GET /api/news/important?lang=1&limit=5
```

**Відповідь:**
```json
{
  "importantNews": [
    {
      "id": 12345,
      "ndate": "2024-01-15",
      "ntime": "14:30:00",
      "ntype": 1,
      "images": [...],
      "urlkey": "important-news-title",
      "photo": 1,
      "video": 0,
      "comments": 25,
      "printsubheader": 0,
      "rubric": "1,2",
      "nweight": 2,
      "nheader": "Важлива новина",
      "nsubheader": "Підзаголовок",
      "nteaser": "Короткий опис новини",
      "comments_count": 25,
      "views_count": 1500
    }
  ],
  "total": 5,
  "filters": {
    "lang": "1",
    "limit": 5
  }
}
```

### 2. Отримання новин з конкретним рівнем важливості

**URL:** `GET /api/news/important/{level}`

**Параметри:**
- `level` - рівень важливості (0-4)
- `limit` (опціонально) - кількість новин (за замовчуванням: 5)
- `lang` (опціонально) - мова (за замовчуванням: 1)

**Приклади:**

```bash
# Отримати останні 5 топ новин (nweight = 2)
GET /api/news/important/2

# Отримати останні 10 важливих новин (nweight = 1)
GET /api/news/important/1?limit=10

# Отримати звичайні новини (nweight = 0)
GET /api/news/important/0?limit=20
```

**Відповідь:**
```json
{
  "importantNews": [...],
  "total": 5,
  "importanceLevel": 2,
  "filters": {
    "lang": "1",
    "limit": 5
  }
}
```

## Сервісні функції

### Використання в коді

```typescript
import { 
  getImportantNewsData, 
  getImportantNewsByLevel, 
  getTopImportantNews 
} from '@/app/api/homepage/services/importantNewsService';

// Отримати всі важливі новини
const importantNews = await getImportantNewsData(5, '1');

// Отримати новини з конкретним рівнем важливості
const topNews = await getImportantNewsByLevel(2, 5, '1');

// Отримати топ важливі новини (nweight = 2)
const topImportantNews = await getTopImportantNews(5, '1');
```

### Інтеграція в Homepage

```typescript
// В app/api/homepage/route.ts
import { getImportantNewsData } from './services/importantNewsService';

export async function GET() {
  try {
    const [environmentData, categoryData, newsData, importantNewsData] = await Promise.all([
      getEnvironmentData(),
      getCategoryData(),
      getNewsData(),
      getImportantNewsData(5, '1') // Додати важливі новини
    ]);

    const homePageData = {
      ...environmentData,
      ...categoryData,
      ...newsData,
      ...importantNewsData // Включити важливі новини
    };
    
    return NextResponse.json(homePageData);
  } catch (error) {
    // Обробка помилок
  }
}
```

## Поля відповіді

Кожна новина містить наступні поля:

- `id` - унікальний ідентифікатор
- `ndate` - дата публікації
- `ntime` - час публікації
- `ntype` - тип новини (1-новина, 2-стаття, тощо)
- `images` - масив зображень
- `urlkey` - URL ключ для посилання
- `photo` - чи є фото (1/0)
- `video` - чи є відео (1/0)
- `comments` - кількість коментарів
- `printsubheader` - чи друкувати підзаголовок
- `rubric` - рубрики (через кому)
- `nweight` - рівень важливості (0-4)
- `nheader` - заголовок новини
- `nsubheader` - підзаголовок
- `nteaser` - короткий опис
- `comments_count` - кількість коментарів
- `views_count` - кількість переглядів

## Обробка помилок

API повертає помилки у наступному форматі:

```json
{
  "error": "Опис помилки"
}
```

**Коди помилок:**
- `400` - Невірні параметри (наприклад, невірний рівень важливості)
- `500` - Внутрішня помилка сервера

## Приклади використання у фронтенді

```typescript
// React компонент для відображення важливих новин
const ImportantNewsComponent = () => {
  const [importantNews, setImportantNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImportantNews = async () => {
      try {
        const response = await fetch('/api/news/important?limit=5');
        const data = await response.json();
        setImportantNews(data.importantNews);
      } catch (error) {
        console.error('Error fetching important news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImportantNews();
  }, []);

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className="important-news">
      <h2>Важливі новини</h2>
      {importantNews.map(news => (
        <div key={news.id} className={`news-item importance-${news.nweight}`}>
          <h3>{news.nheader}</h3>
          <p>{news.nteaser}</p>
          <span className="importance-badge">
            {news.nweight === 2 ? 'ТОП' : 'ВАЖЛИВО'}
          </span>
        </div>
      ))}
    </div>
  );
};
```
