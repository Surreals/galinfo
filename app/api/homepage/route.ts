import { NextResponse } from 'next/server';
import {
  getEnvironmentData,
  getCategoryData,
  getNewsData,
  getRubricNewsData,
  getAdvertisingData,
  getPatternData,
  getMediaData,
  getLanguageData
} from './services';

export async function GET() {
  try {
    // Fetch all data using services
    const [
      environmentData,
      categoryData,
      newsData,
      rubricNewsData,
      advertisingData,
      patternData,
      mediaData,
      languageData
    ] = await Promise.all([
      getEnvironmentData(),
      getCategoryData(),
      getNewsData(),
      getRubricNewsData(),
      getAdvertisingData(),
      getPatternData(),
      getMediaData(),
      getLanguageData()
    ]);

    // Compile all data
    const homePageData = {
      ...environmentData,
      ...categoryData,
      ...newsData,
      ...rubricNewsData,
      ...advertisingData,
      ...patternData,
      ...mediaData,
      ...languageData
    };
    
    return NextResponse.json(homePageData);
    
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home page data' },
      { status: 500 }
    );
  }
}
