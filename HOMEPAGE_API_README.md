# Home Page API Documentation

This document describes the new home page API endpoint that fetches comprehensive data from the database for the main page.

## API Endpoint

**URL:** `/api/homepage`  
**Method:** `GET`  
**Response:** JSON

## Overview

The home page API endpoint consolidates multiple SQL queries into a single request, fetching all necessary data for the main page including:

- News articles (main, special, slide, headline, popular, suggested)
- Categories and classifications
- Environment data
- Advertisement data
- Poll data
- Media content
- Pattern templates

## Data Structure

The API returns a comprehensive object with the following structure:

```typescript
interface HomePageData {
  enviro: any[];                    // Environment data
  newsCount: number;                // Total count of approved news
  categories: any[];                // Categories (rubrics and regions)
  languages: any[];                 // Available languages
  treeData: any[];                  // Site structure tree
  metaData: any[];                  // Homepage metadata
  patterns: {                       // Pattern templates
    chief?: string;
    htmlHeader?: string;
    justList?: string;
  };
  mainCategories: any[];            // Main category list
  specialCategories: any[];         // Special categories (limit 5)
  environews: any[];                // Environment news
  latestNewsDate?: number;          // Latest news timestamp
  specialNews: any[];               // Special section news (limit 4)
  mainNews: any[];                  // Main news feed (limit 48)
  slideNews: any[];                 // Slide news (limit 8)
  headlineNews: any[];              // Headline news (limit 7)
  popularNews: any[];               // Popular news (limit 10)
  suggestedNews: any[];             // Suggested news (limit 10)
  adData: {                         // Advertisement data
    home3001: { places: any[]; banners: any[] };
    home3002501: { places: any[]; banners: any[] };
    home300250: { places: any[]; banners: any[] };
  };
  pollData: any[];                  // Current poll data
  mediaBlock: any[];                // Media block content
  userNews: any[];                  // User-generated news
  rubricNews: {                     // Rubric-specific news
    rubric4: { main?: any; additional: any[] };
    rubric3: { main?: any; additional: any[] };
    rubric2: { main?: any; additional: any[] };
    rubric103: { main?: any; additional: any[] };
    rubric5: { main?: any; additional: any[] };
    rubric101: { main?: any; additional: any[] };
  };
  pictures: {                       // Picture data for news
    specialNews: any[];
    slideNews: any[];
    headlineNews: any[];
    popularNews: any[];
    suggestedNews: any[];
  };
}
```

## Usage

### 1. Using the Custom Hook

```typescript
import { useHomePageData } from '@/app/hooks/useHomePageData';

function MyComponent() {
  const { data, loading, error } = useHomePageData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>Total News: {data.newsCount}</h1>
      {/* Use other data properties */}
    </div>
  );
}
```

### 2. Direct API Call

```typescript
async function fetchHomePageData() {
  try {
    const response = await fetch('/api/homepage');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
```

## Database Queries

The API executes the following SQL queries:

### Core Data
- `SELECT * FROM a_enviro` - Environment data
- `SELECT COUNT(*) FROM a_news WHERE approved = 1` - News count
- `SELECT * FROM a_cats WHERE isvis = 1` - Categories

### News Queries
- **Special News:** News with special section IDs
- **Main News:** 48 most recent approved news items
- **Slide News:** 8 news items with slide headers
- **Headline News:** 7 headline block news items
- **Popular News:** 10 most viewed news items
- **Suggested News:** 10 suggested news items

### Additional Data
- **Patterns:** HTML templates and patterns
- **Advertisements:** Banner and placement data
- **Polls:** Current poll questions and options
- **Media:** Pictures and media content
- **Rubric News:** Category-specific news sections

## Error Handling

The API includes comprehensive error handling:

- Database connection errors
- Query execution failures
- Data validation
- HTTP status codes

## Testing

A test page is available at `/test-homepage-api` to verify the API functionality:

- Test API endpoint
- View response data
- Check data structure
- Verify error handling

## Performance Considerations

- **Connection Pooling:** Uses MySQL connection pool for efficient database connections
- **Query Optimization:** Complex queries use appropriate indexes (USE KEY)
- **Data Limiting:** News queries include LIMIT clauses to prevent excessive data transfer
- **Error Recovery:** Graceful fallbacks for failed queries

## Security

- **Parameterized Queries:** All SQL queries use parameterized statements
- **Input Validation:** API validates all input parameters
- **Error Sanitization:** Error messages don't expose sensitive database information

## Dependencies

- `mysql2/promise` - MySQL database driver
- `next/server` - Next.js server components
- React hooks for client-side data fetching

## File Structure

```
app/
├── api/
│   └── homepage/
│       └── route.ts          # API endpoint
├── hooks/
│   └── useHomePageData.ts    # Custom hook
├── page.tsx                  # Updated main page
└── test-homepage-api/
    └── page.tsx              # Test page
```

## Future Enhancements

- **Caching:** Implement Redis or in-memory caching
- **Pagination:** Add pagination for large datasets
- **Real-time Updates:** WebSocket integration for live data
- **Data Filtering:** Add query parameters for filtering
- **Performance Monitoring:** Add metrics and monitoring

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in environment variables
   - Verify database server is running
   - Check network connectivity

2. **Query Timeout**
   - Review query performance
   - Check database indexes
   - Consider query optimization

3. **Memory Issues**
   - Reduce data limits in queries
   - Implement pagination
   - Add data streaming for large datasets

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=true
```

This will provide detailed query execution information and error details.
