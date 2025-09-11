import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { newsData, headers, body } = await request.json();

    if (!newsData || !headers || !body) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!headers.nheader?.trim()) {
      return NextResponse.json(
        { error: 'News header is required' },
        { status: 400 }
      );
    }

    if (!body.nbody?.trim()) {
      return NextResponse.json(
        { error: 'News body is required' },
        { status: 400 }
      );
    }

    let newsId: number;

    if (newsData.id) {
      // Update existing news
      console.log('Updating existing news with ID:', newsData.id);
      
      // Update main news table
      await executeQuery(
        `UPDATE a_news SET 
          ndate = ?, ntime = ?, images = ?, ntype = ?, nauthor = ?, 
          nauthorplus = ?, showauthor = ?, rubric = ?, region = ?, theme = ?, 
          nweight = ?, nocomment = ?, hiderss = ?, approved = ?, lang = ?, 
          rated = ?, urlkey = ?, userid = ?, layout = ?, comments = ?, 
          bytheme = ?, ispopular = ?, supervideo = ?, printsubheader = ?, 
          topnews = ?, isexpert = ?, photo = ?, video = ?, subrubric = ?, 
          imagescopy = ?, suggest = ?, headlineblock = ?, twitter_status = ?, 
          youcode = ?, _todel1 = ?, _todel2 = ?, _todel3 = ?, _stage = ?, 
          maininblock = ?, udate = ?
        WHERE id = ?`,
        [
          newsData.ndate, newsData.ntime, newsData.images, newsData.ntype, newsData.nauthor,
          newsData.nauthorplus, newsData.showauthor, newsData.rubric, newsData.region, newsData.theme || 0,
          newsData.nweight, newsData.nocomment, newsData.hiderss, newsData.approved, newsData.lang,
          newsData.rated, newsData.urlkey, newsData.userid, newsData.layout, newsData.comments,
          newsData.bytheme, newsData.ispopular, newsData.supervideo, newsData.printsubheader,
          newsData.topnews, newsData.isexpert, newsData.photo, newsData.video, newsData.subrubric,
          newsData.imagescopy, newsData.suggest, newsData.headlineblock, newsData.twitter_status,
          newsData.youcode, newsData._todel1, newsData._todel2, newsData._todel3, newsData._stage,
          newsData.maininblock, newsData.udate, newsData.id
        ]
      );

      // Update news headers
      await executeQuery(
        `UPDATE a_news_headers SET 
          nheader = ?, nteaser = ?, nsubheader = ?, _stage = ?
        WHERE id = ?`,
        [headers.nheader, headers.nteaser, headers.nsubheader, headers._stage, newsData.id]
      );

      // Update news body
      await executeQuery(
        `UPDATE a_news_body SET 
          nbody = ?
        WHERE id = ?`,
        [body.nbody, newsData.id]
      );

      newsId = newsData.id;
      
    } else {
      // Create new news
      console.log('Creating new news');
      
      // Insert into main news table
      const newsResult = await executeQuery(
        `INSERT INTO a_news (
          ndate, ntime, images, ntype, nauthor, nauthorplus, showauthor, 
          rubric, region, theme, nweight, nocomment, hiderss, approved, 
          lang, rated, urlkey, userid, layout, comments, bytheme, 
          ispopular, supervideo, printsubheader, topnews, isexpert, 
          photo, video, subrubric, imagescopy, suggest, headlineblock, 
          twitter_status, youcode, _todel1, _todel2, _todel3, _stage, 
          maininblock, udate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newsData.ndate, newsData.ntime, newsData.images, newsData.ntype, newsData.nauthor,
          newsData.nauthorplus, newsData.showauthor, newsData.rubric, newsData.region, newsData.theme || 0,
          newsData.nweight, newsData.nocomment, newsData.hiderss, newsData.approved, newsData.lang,
          newsData.rated, newsData.urlkey, newsData.userid, newsData.layout, newsData.comments,
          newsData.bytheme, newsData.ispopular, newsData.supervideo, newsData.printsubheader,
          newsData.topnews, newsData.isexpert, newsData.photo, newsData.video, newsData.subrubric,
          newsData.imagescopy, newsData.suggest, newsData.headlineblock, newsData.twitter_status,
          newsData.youcode, newsData._todel1, newsData._todel2, newsData._todel3, newsData._stage,
          newsData.maininblock, newsData.udate
        ]
      );

      newsId = newsResult.insertId;

      // Insert into news headers table
      await executeQuery(
        `INSERT INTO a_news_headers (
          id, nheader, nteaser, nsubheader, _stage
        ) VALUES (?, ?, ?, ?, ?)`,
        [newsId, headers.nheader, headers.nteaser, headers.nsubheader, headers._stage]
      );

      // Insert into news body table
      await executeQuery(
        `INSERT INTO a_news_body (
          id, nbody
        ) VALUES (?, ?)`,
        [newsId, body.nbody]
      );
    }

    // Fetch the complete news data to return
    const [newsResult] = await executeQuery(
      `SELECT a_news.*, a_news_headers.nheader, a_news_headers.nteaser, a_news_headers.nsubheader
       FROM a_news 
       LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
       WHERE a_news.id = ?`,
      [newsId]
    );

    const [bodyResult] = await executeQuery(
      'SELECT nbody FROM a_news_body WHERE id = ?',
      [newsId]
    );

    return NextResponse.json({
      success: true,
      message: newsData.id ? 'News updated successfully' : 'News created successfully',
      newsId: newsId,
      data: {
        news: newsResult,
        headers: {
          id: newsId,
          nheader: headers.nheader,
          nteaser: headers.nteaser,
          nsubheader: headers.nsubheader,
          _stage: headers._stage
        },
        body: {
          id: newsId,
          nbody: bodyResult?.nbody || body.nbody
        }
      }
    });

  } catch (error) {
    console.error('Error saving news:', error);
    return NextResponse.json(
      { error: 'Failed to save news' },
      { status: 500 }
    );
  }
}
