import { executeQuery } from '@/app/lib/db';

export async function getLanguageData() {
  try {
    // Fetch languages
    const languages = await executeQuery('SELECT * FROM a_lang WHERE isactive<>0 ORDER BY id');
    
    return {
      languages
    };
  } catch (error) {
    console.error('Error fetching language data:', error);
    throw error;
  }
}
