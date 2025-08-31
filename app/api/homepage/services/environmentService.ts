import { executeQuery } from '@/app/lib/db';

export async function getEnvironmentData() {
  try {
    const enviroData = await executeQuery('SELECT * FROM a_enviro');
    const environews = await executeQuery('SELECT * FROM a_environews');
    
    return {
      enviro: enviroData,
      environews
    };
  } catch (error) {
    console.error('Error fetching environment data:', error);
    throw error;
  }
}
