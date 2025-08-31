import { executeQuery } from '@/app/lib/db';

export async function getAdvertisingData() {
  try {
    // Fetch ad data
    const adPlaces = await executeQuery('SELECT * FROM a_adplaces WHERE adid = "home3001" ORDER BY parentid');
    const adBanners = await executeQuery(`
      SELECT a_adbanners.*, a_admanage.percent, a_admanage.qty, a_admanage.id AS mid, 
             a_admanage.ddate, DATE(NOW()) as ndate
      FROM a_adbanners, a_admanage
      WHERE a_adbanners.id = a_admanage.bannerid AND a_admanage.placeid = "1"
            AND active=1 AND (
              (a_admanage.dfrom < NOW() AND (a_admanage.dto > NOW() OR a_admanage.dto ="0000-00-00 00:00:00")) 
              OR a_admanage.usetimer = 0
            )
    `);
    
    // Fetch additional ad data
    const adPlaces3002501 = await executeQuery('SELECT * FROM a_adplaces WHERE adid = "home3002501" ORDER BY parentid');
    const adPlaces300250 = await executeQuery('SELECT * FROM a_adplaces WHERE adid = "home300250" ORDER BY parentid');
    
    const adBanners3002501 = await executeQuery(`
      SELECT a_adbanners.*, a_admanage.percent, a_admanage.qty, a_admanage.id AS mid, 
             a_admanage.ddate, DATE(NOW()) as ndate
      FROM a_adbanners, a_admanage
      WHERE a_adbanners.id = a_admanage.bannerid AND a_admanage.placeid = "13"
            AND active=1 AND (
              (a_admanage.dfrom < NOW() AND (a_admanage.dto > NOW() OR a_admanage.dto ="0000-00-00 00:00:00")) 
              OR a_admanage.usetimer = 0
            )
    `);
    
    const adBanners300250 = await executeQuery(`
      SELECT a_adbanners.*, a_admanage.percent, a_admanage.qty, a_admanage.id AS mid, 
             a_admanage.ddate, DATE(NOW()) as ndate
      FROM a_adbanners, a_admanage
      WHERE a_adbanners.id = a_admanage.bannerid AND a_admanage.placeid = "7"
            AND active=1 AND (
              (a_admanage.dfrom < NOW() AND (a_admanage.dto > NOW() OR a_admanage.dto ="0000-00-00 00:00:00")) 
              OR a_admanage.usetimer = 0
            )
    `);
    
    return {
      adData: {
        home3001: { places: adPlaces, banners: adBanners },
        home3002501: { places: adPlaces3002501, banners: adBanners3002501 },
        home300250: { places: adPlaces300250, banners: adBanners300250 }
      }
    };
  } catch (error) {
    console.error('Error fetching advertising data:', error);
    throw error;
  }
}
