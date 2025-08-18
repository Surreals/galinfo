import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function GET() {
  try {
    // Fetch environment data
    const enviroData = await executeQuery('SELECT * FROM a_enviro');
    
    // Fetch news count
    const newsCount = await executeQuery(
      'SELECT COUNT(*) as count FROM a_news WHERE a_news.udate < UNIX_TIMESTAMP() AND approved = 1 AND udate > "1755163680"'
    );
    
    // Fetch categories (rubrics and regions)
    const categories = await executeQuery(
      'SELECT id, param, title, cattype FROM a_cats WHERE (cattype="1" OR cattype="3") AND isvis = 1 AND lng="1" ORDER BY orderid'
    );
    
    // Fetch languages
    const languages = await executeQuery('SELECT * FROM a_lang WHERE isactive<>0 ORDER BY id');
    
    // Fetch tree structure
    const treeData = await executeQuery('SELECT * FROM a_tree WHERE lng="1" ORDER BY level, id');
    
    // Fetch meta data for homepage
    const metaData = await executeQuery('SELECT * FROM a_metas WHERE page="homepage"');
    
    // Fetch pattern data
    const chiefPattern = await executeQuery('SELECT patternbody FROM a_patterns WHERE pattid = "chief"');
    const htmlHeaderPattern = await executeQuery('SELECT patternbody FROM a_patterns WHERE pattid = "htmlheader"');
    
    // Fetch main categories
    const mainCategories = await executeQuery(
      'SELECT * FROM a_cats WHERE lng = "1" AND isvis=1 AND cattype <> 2 ORDER BY orderid'
    );
    
    // Fetch special categories (limit 5)
    const specialCategories = await executeQuery(
      'SELECT a_cats.* FROM a_cats WHERE a_cats.isvis =1 AND a_cats.cattype = 2 LIMIT 5'
    );
    
    // Fetch environment news
    const environews = await executeQuery('SELECT * FROM a_environews');
    
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
             a_news.photo, a_news.video, a_news.ndate,
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
             a_news.photo, a_news.video, a_news.ndate, a_news.udate, a_statcomm.qty
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
    
    // Fetch patterns
    const justListPattern = await executeQuery('SELECT patternbody FROM a_patterns WHERE pattid = "justlist"');
    
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
    
    // Fetch rubric-specific news for different sections
    const rubric4News = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.images, a_news.urlkey, a_news.udate, a_news.ndate, a_news.photo,
             a_news.video, a_statcomm.qty
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
             a_news.video, a_statcomm.qty
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
             a_news.video, a_statcomm.qty
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
             a_news.video, a_statcomm.qty
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
             a_news.video, a_statcomm.qty
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
             a_news.video, a_statcomm.qty
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
             a_news.urlkey, a_news.photo, a_news.video, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 4 AND a_news.id <> 435996
      ORDER BY udate DESC LIMIT 2
    `);
    
    const rubric3AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 3 AND a_news.id <> 436000
      ORDER BY udate DESC LIMIT 2
    `);
    
    const rubric2AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 2 AND a_news.id <> 435647
      ORDER BY udate DESC LIMIT 2
    `);
    
    const rubric103AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 103 AND a_news.id <> 437201
      ORDER BY udate DESC LIMIT 2
    `);
    
    const rubric5AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 5 AND a_news.id <> 436058
      ORDER BY udate DESC LIMIT 2
    `);
    
    const rubric101AdditionalNews = await executeQuery(`
      SELECT a_news_headers.id, a_news_headers.nheader, a_news.ntype, a_news.comments,
             a_news.urlkey, a_news.photo, a_news.video, a_statcomm.qty
      FROM a_news USE KEY (udate)
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      WHERE nweight >0 AND approved=1 AND a_news.udate < UNIX_TIMESTAMP()
            AND a_news.ntype<=6 AND a_news.rubric = 101 AND a_news.id <> 435728
      ORDER BY udate DESC LIMIT 2
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
    
    // Fetch pictures for various news items
    const specialNewsPics = await executeQuery('SELECT * FROM a_pics WHERE id IN (279474,279478,279477,279476,279475,279473,279272,279471,279470,279469)');
    const slideNewsPics = await executeQuery('SELECT * FROM a_pics WHERE id IN (279339,279351,279350,279349,279348,279347,279346,279345,279344,279343,279342,279341,279340,279338,279336,279335,279334,279333,279332,279331,279330,279329,279327)');
    const headlineNewsPics = await executeQuery('SELECT * FROM a_pics WHERE id IN (279236,279235)');
    const popularNewsPics = await executeQuery('SELECT * FROM a_pics WHERE id IN (279124,279123,279125)');
    const suggestedNewsPics = await executeQuery('SELECT * FROM a_pics WHERE id IN (278898,278900,278899,278901)');
    
    // Compile all data
    const homePageData = {
      enviro: enviroData,
      newsCount: newsCount[0]?.count || 0,
      categories,
      languages,
      treeData,
      metaData,
      patterns: {
        chief: chiefPattern[0]?.patternbody,
        htmlHeader: htmlHeaderPattern[0]?.patternbody,
        justList: justListPattern[0]?.patternbody
      },
      mainCategories,
      specialCategories,
      environews,
      latestNewsDate: latestNewsDate[0]?.udate,
      specialNews,
      mainNews,
      slideNews,
      headlineNews,
      popularNews,
      suggestedNews,
      adData: {
        home3001: { places: adPlaces, banners: adBanners },
        home3002501: { places: adPlaces3002501, banners: adBanners3002501 },
        home300250: { places: adPlaces300250, banners: adBanners300250 }
      },
      pollData,
      mediaBlock,
      userNews,
      rubricNews: {
        rubric4: { main: rubric4News[0], additional: rubric4AdditionalNews },
        rubric3: { main: rubric3News[0], additional: rubric3AdditionalNews },
        rubric2: { main: rubric2News[0], additional: rubric2AdditionalNews },
        rubric103: { main: rubric103News[0], additional: rubric103AdditionalNews },
        rubric5: { main: rubric5News[0], additional: rubric5AdditionalNews },
        rubric101: { main: rubric101News[0], additional: rubric101AdditionalNews }
      },
      pictures: {
        specialNews: specialNewsPics,
        slideNews: slideNewsPics,
        headlineNews: headlineNewsPics,
        popularNews: popularNewsPics,
        suggestedNews: suggestedNewsPics
      }
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
