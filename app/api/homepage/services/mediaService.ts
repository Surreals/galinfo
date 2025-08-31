import { executeQuery } from '@/app/lib/db';

export async function getMediaData() {
  try {
    // Fetch poll data
    const pollData = await executeQuery(`
      SELECT a_pollres.*, ho.subject
      FROM a_pollres, (
        SELECT a_polls.subject, a_polls.id 
        FROM a_polls WHERE lang = "1" AND isvis = 1
        ORDER BY orderid DESC LIMIT 1
      ) AS ho
      WHERE a_pollres.poll_id = ho.id
      ORDER BY a_pollres.orderid
    `);
    
    // Fetch media block data
    const mediaBlock = await executeQuery(`
      SELECT a_mediablock.*, a_pics.filename
      FROM a_mediablock
      LEFT JOIN a_pics ON a_mediablock.imageid = a_pics.id
      ORDER BY a_mediablock.id DESC
    `);
    
    // Fetch pictures for various news items
    const specialNewsPics = await executeQuery('SELECT * FROM a_pics WHERE id IN (279474,279478,279477,279476,279475,279473,279272,279471,279470,279469)');
    const slideNewsPics = await executeQuery('SELECT * FROM a_pics WHERE id IN (279339,279351,279350,279349,279348,279347,279346,279345,279344,279343,279342,279341,279340,279338,279336,279335,279334,279333,279332,279331,279330,279329,279327)');
    const headlineNewsPics = await executeQuery('SELECT * FROM a_pics WHERE id IN (279236,279235)');
    const popularNewsPics = await executeQuery('SELECT * FROM a_pics WHERE id IN (279124,279123,279125)');
    const suggestedNewsPics = await executeQuery('SELECT * FROM a_pics WHERE id IN (278898,278900,278899,278901)');
    
    return {
      pollData,
      mediaBlock,
      pictures: {
        specialNews: specialNewsPics,
        slideNews: slideNewsPics,
        headlineNews: headlineNewsPics,
        popularNews: popularNewsPics,
        suggestedNews: suggestedNewsPics
      }
    };
  } catch (error) {
    console.error('Error fetching media data:', error);
    throw error;
  }
}
