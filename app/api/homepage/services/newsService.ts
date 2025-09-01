import { executeQuery } from '@/app/lib/db';

export async function getNewsData() {
  try {
    // Fetch news count
    const newsCount = await executeQuery(
      'SELECT COUNT(*) as count FROM a_news WHERE a_news.udate < UNIX_TIMESTAMP() AND approved = 1 AND udate > "1755163680"'
    );
    
    // Fetch latest news date
    const latestNewsDate = await executeQuery(
      'SELECT udate FROM a_news USE KEY(udate) WHERE lang = "1" AND a_news.udate < UNIX_TIMESTAMP() AND approved = 1 ORDER BY udate DESC LIMIT 1'
    );
    
    // Fetch special news (section 1)
    const specialNews = await executeQuery(`
      SELECT a_news.*, a_news_headers.nheader, a_news_headers.nteaser, 
             a_news_slideheaders.sheader, a_news_slideheaders.steaser
      FROM a_news USE KEY (PRIMARY)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_news_slideheaders USE KEY (PRIMARY) ON a_news.id = a_news_slideheaders.id
      LEFT JOIN a_news_specialids ON a_news.id = a_news_specialids.newsid
      WHERE a_news_specialids.section = 1 AND a_news_specialids.newsid <> 0 
            AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
      ORDER BY a_news_specialids.id LIMIT 4
    `);
    
    // Fetch main news (48 items)
    const mainNews = await executeQuery(`
      SELECT a_news.id, a_news.ndate, a_news.ntime, a_news.ntype, a_news.images, 
             a_news.urlkey, a_news.photo, a_news.video, a_news_headers.nheader,
             a_news_headers.nsubheader, a_news.nweight, a_news.comments,
             a_news.printsubheader, a_statcomm.qty
      FROM a_news USE KEY(udate)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) USING (id)
      LEFT JOIN a_statcomm USE KEY (PRIMARY) USING (id)
      WHERE lang = "1" AND a_news.udate < UNIX_TIMESTAMP() 
            AND approved = 1 AND rated = 1
      ORDER BY udate DESC LIMIT 48
    `);
    
    // Fetch slide news (8 items)
    const slideNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news_headers.nteaser,
             a_news.ntype, a_news.comments, a_news.images, a_news.urlkey,
             a_news.photo, a_news.video, a_news.ndate, a_news.nweight,
             a_news_slideheaders.sheader, a_news_slideheaders.steaser, a_statcomm.qty
      FROM a_news_headers USE KEY (PRIMARY)
      LEFT JOIN a_news USE KEY (datetype) ON a_news_headers.id = a_news.id
      LEFT JOIN a_statcomm USE KEY (PRIMARY) ON a_news.id = a_statcomm.id
      LEFT JOIN a_news_slideheaders ON a_news.id = a_news_slideheaders.id
      WHERE a_news.udate < UNIX_TIMESTAMP() AND approved = 1 
            AND a_news.ntype=2 AND nweight > 0
      ORDER BY udate DESC LIMIT 8
    `);
    
    // Fetch headline news (7 items)
    const headlineNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news_headers.nteaser,
             a_news.ntype, a_news.comments, a_news.images, a_news.urlkey,
             a_news.photo, a_news.video, a_news.ndate, a_news.udate, a_news.nweight, a_statcomm.qty
      FROM a_news_headers USE KEY (PRIMARY)
      LEFT JOIN a_news ON a_news_headers.id = a_news.id
      LEFT JOIN a_statcomm USE KEY (PRIMARY) ON a_news.id = a_statcomm.id
      WHERE a_news.udate < UNIX_TIMESTAMP() AND approved = 1 
            AND a_news.headlineblock = 1
      ORDER BY udate DESC LIMIT 7
    `);
    
    // Fetch popular news (10 items)
    const popularNews = await executeQuery(`
      SELECT subnews.id, subnews.ndate, subnews.ntime, subnews.ntype, 
             subnews.urlkey, subnews.photo, subnews.video, a_news_headers.nheader, subnews.nweight
      FROM (
        SELECT a_news.id, ndate, ntime, nweight, ntype, urlkey, photo, video
        FROM a_news RIGHT JOIN a_statview USING (id)
        WHERE lang = "1" AND ndate >= DATE(DATE_SUB(NOW(), INTERVAL 2 DAY))
              AND a_news.udate < UNIX_TIMESTAMP() AND approved=1
        ORDER BY a_statview.qty DESC, udate DESC LIMIT 10
      ) AS subnews
      LEFT JOIN a_news_headers USING (id)
    `);
    
    // Fetch suggested news (10 items)
    const suggestedNews = await executeQuery(`
      SELECT subnews.id, subnews.ndate, subnews.ntime, subnews.ntype,
             subnews.urlkey, subnews.photo, subnews.video, a_news_headers.nheader, subnews.nweight
      FROM (
        SELECT a_news.id, ndate, ntime, nweight, ntype, urlkey, photo, video
        FROM a_news WHERE lang = "1" AND suggest=1 AND approved=1 
              AND a_news.udate < UNIX_TIMESTAMP()
        ORDER BY udate DESC LIMIT 10
      ) AS subnews
      LEFT JOIN a_news_headers USING (id)
    `);
    
    // Fetch user news (limit 0 for now)
    const userNews = await executeQuery(`
      SELECT DISTINCT N1.id, N1.images, N1.ntype, N1.urlkey, N1.photo, N1.video,
             N1.printsubheader, a_news_headers.nheader, a_news_headers.nteaser,
             a_users.name, a_users.id as uuserid, a_picsu.filename, a_statcomm.qty
      FROM (
        SELECT a_news.id, a_news.images, a_news.userid, a_news.ntype, a_news.urlkey,
               a_news.printsubheader, a_news.photo, a_news.video
        FROM a_news USE KEY (ntype)
        WHERE lang = "1" AND ntype=20 AND a_news.approved=1 AND userid <> 0
              AND a_news.udate < UNIX_TIMESTAMP()
        ORDER BY udate DESC LIMIT 0
      ) AS N1
      LEFT JOIN a_news_headers USING (id)
      LEFT JOIN a_statcomm USING(id)
      LEFT JOIN a_users ON N1.userid = a_users.id
      LEFT JOIN a_picsu ON a_users.id = a_picsu.userid
    `);
    
    return {
      newsCount: newsCount[0]?.count || 0,
      latestNewsDate: latestNewsDate[0]?.udate,
      specialNews,
      mainNews,
      slideNews,
      headlineNews,
      popularNews,
      suggestedNews,
      userNews
    };
  } catch (error) {
    console.error('Error fetching news data:', error);
    throw error;
  }
}
