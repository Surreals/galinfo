import { executeQuery } from '@/app/lib/db';

export async function getRubricNewsData() {
  try {
    // Fetch rubric-specific news for different sections
    const rubric4News = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.images, a_news.urlkey, a_news.udate, a_news.ndate, a_news.photo,
             a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (maininblock)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE maininblock =1 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 4
      ORDER BY udate DESC LIMIT 1
    `);
    
    const rubric3News = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.images, a_news.urlkey, a_news.udate, a_news.ndate, a_news.photo,
             a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (maininblock)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE maininblock =1 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 3
      ORDER BY udate DESC LIMIT 1
    `);
    
    const rubric2News = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.images, a_news.urlkey, a_news.udate, a_news.ndate, a_news.photo,
             a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (maininblock)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE maininblock =1 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 2
      ORDER BY udate DESC LIMIT 1
    `);
    
    const rubric103News = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.images, a_news.urlkey, a_news.udate, a_news.ndate, a_news.photo,
             a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (maininblock)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE maininblock =1 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 103
      ORDER BY udate DESC LIMIT 1
    `);
    
    const rubric5News = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.images, a_news.urlkey, a_news.udate, a_news.ndate, a_news.photo,
             a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (maininblock)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE maininblock =1 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 5
      ORDER BY udate DESC LIMIT 1
    `);
    
    const rubric101News = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.images, a_news.urlkey, a_news.udate, a_news.ndate, a_news.photo,
             a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (maininblock)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE maininblock =1 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 101
      ORDER BY udate DESC LIMIT 1
    `);
    
    // Fetch additional news for each rubric
    const rubric4AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 4 AND a_news.id <> 435996
      ORDER BY udate DESC LIMIT 2
    `);
    
    const rubric3AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 3 AND a_news.id <> 436000
      ORDER BY udate DESC LIMIT 2
    `);
    
    const rubric2AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 2 AND a_news.id <> 435647
      ORDER BY udate DESC LIMIT 2
    `);
    
    const rubric103AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 103 AND a_news.id <> 437201
      ORDER BY udate DESC LIMIT 2
    `);
    
    const rubric5AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 5 AND a_news.id <> 436058
      ORDER BY udate DESC LIMIT 2
    `);
    
    const rubric101AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_news.nweight, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 101 AND a_news.id <> 435728
      ORDER BY udate DESC LIMIT 2
    `);
    
    return {
      rubricNews: {
        rubric4: { main: rubric4News[0], additional: rubric4AdditionalNews },
        rubric3: { main: rubric3News[0], additional: rubric3AdditionalNews },
        rubric2: { main: rubric2News[0], additional: rubric2AdditionalNews },
        rubric103: { main: rubric103News[0], additional: rubric103AdditionalNews },
        rubric5: { main: rubric5News[0], additional: rubric5AdditionalNews },
        rubric101: { main: rubric101News[0], additional: rubric101AdditionalNews }
      }
    };
  } catch (error) {
    console.error('Error fetching rubric news data:', error);
    throw error;
  }
}
