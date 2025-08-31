import { executeQuery } from '@/app/lib/db';

export async function getPatternData() {
  try {
    // Fetch meta data for homepage
    const metaData = await executeQuery('SELECT * FROM a_metas WHERE page="homepage"');
    
    // Fetch pattern data
    const chiefPattern = await executeQuery('SELECT patternbody FROM a_patterns WHERE pattid = "chief"');
    const htmlHeaderPattern = await executeQuery('SELECT patternbody FROM a_patterns WHERE pattid = "htmlheader"');
    const justListPattern = await executeQuery('SELECT patternbody FROM a_patterns WHERE pattid = "justlist"');
    
    return {
      metaData,
      patterns: {
        chief: chiefPattern[0]?.patternbody,
        htmlHeader: htmlHeaderPattern[0]?.patternbody,
        justList: justListPattern[0]?.patternbody
      }
    };
  } catch (error) {
    console.error('Error fetching pattern data:', error);
    throw error;
  }
}
