import { executeQuery } from '@/app/lib/db';

export interface MenuItem {
  id: number;
  param: string;
  title: string;
  link: string;
  class?: string;
  cattype: number;
}

export interface MenuData {
  mainCategories: MenuItem[];
  regions: MenuItem[];
  additionalItems: MenuItem[];
  specialThemes: MenuItem[];
}

export async function getMenuData(): Promise<MenuData> {
  try {
    // Get main categories (cattype = 1) - equivalent to getRubrics()
    const mainCategories = await executeQuery<MenuItem>(
      `SELECT id, param, title, cattype, 
              CONCAT('/category/', param, '/') as link
       FROM a_cats 
       WHERE cattype = 1 AND isvis = 1 AND lng = "1" 
       ORDER BY orderid`
    );

    // Get regions (cattype = 3) - equivalent to getRegions()
    const regions = await executeQuery<MenuItem>(
      `SELECT id, param, title, cattype,
              CONCAT('/category/', param, '/') as link
       FROM a_cats 
       WHERE cattype = 3 AND isvis = 1 AND lng = "1" 
       ORDER BY orderid`
    );

    // Get special themes (cattype = 2) - equivalent to special categories
    const specialThemes = await executeQuery<MenuItem>(
      `SELECT id, param, title, cattype,
              CONCAT('/category/', param, '/') as link
       FROM a_cats 
       WHERE cattype = 2 AND isvis = 1 AND lng = "1" 
       ORDER BY orderid 
       LIMIT 5`
    );

    // Additional menu items that were hardcoded in the old PHP
    const additionalItems: MenuItem[] = [
      {
        id: 0,
        param: 'news',
        title: 'Новини',
        link: '/news/',
        cattype: 0
      },
      {
        id: 0,
        param: 'subject',
        title: 'Статті',
        link: '/subject/',
        cattype: 0
      },
      {
        id: 0,
        param: 'announce',
        title: 'Анонси',
        link: '/announce/',
        cattype: 0
      },
      {
        id: 0,
        param: 'archive',
        title: 'Архів',
        link: '/archive/',
        cattype: 0
      },
      {
        id: 0,
        param: 'about',
        title: 'Агенція',
        link: '/about/',
        cattype: 0
      },
      {
        id: 0,
        param: 'commercial',
        title: 'Реклама',
        link: '/commercial/',
        cattype: 0
      }
    ];

    return {
      mainCategories,
      regions,
      additionalItems,
      specialThemes
    };
  } catch (error) {
    console.error('Error fetching menu data:', error);
    throw error;
  }
}
