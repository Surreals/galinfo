import { executeQuery } from '@/app/lib/db';

export async function getCategoryData() {
  try {
    const categories = await executeQuery(
      'SELECT id, param, title, cattype FROM a_cats WHERE (cattype="1" OR cattype="3") AND isvis = 1 AND lng="1" ORDER BY orderid'
    );
    
    const mainCategories = await executeQuery(
      'SELECT * FROM a_cats WHERE lng = "1" AND isvis=1 AND cattype <> 2 ORDER BY orderid'
    );
    
    const specialCategories = await executeQuery(
      'SELECT a_cats.* FROM a_cats WHERE a_cats.isvis =1 AND a_cats.cattype = 2 LIMIT 5'
    );
    
    const treeData = await executeQuery('SELECT * FROM a_tree WHERE lng="1" ORDER BY level, id');
    
    return {
      categories,
      mainCategories,
      specialCategories,
      treeData
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    throw error;
  }
}
