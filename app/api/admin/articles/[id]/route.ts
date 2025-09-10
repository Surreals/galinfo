import { NextRequest, NextResponse } from 'next/server';

// Мокові дані новини (в реальному проекті це буде з БД)
const MOCK_ARTICLE = {
  id: 1,
  nheader: 'Приклад новини',
  nsubheader: 'Підзаголовок новини',
  nteaser: 'Короткий опис новини для ліду',
  nbody: '<p>Повний текст новини з HTML розміткою.</p>',
  
  // Спеціальні заголовки
  sheader: 'Спеціальний заголовок для слайдшоу',
  steaser: 'Спеціальний лід для слайдшоу',
  
  // Мета дані
  ntitle: 'Meta Title для SEO',
  ndescription: 'Meta Description для SEO',
  nkeywords: 'ключові, слова, для, SEO',
  
  // Налаштування
  ntype: 1,
  rubric: [1, 2, 3], // ID рубрик
  region: [12, 13], // ID регіонів
  theme: 8, // ID теми
  tags: ['Львівщина', 'полювання', 'природа'],
  
  // Автори
  nauthor: 1, // ID редактора
  userid: 5, // ID автора/журналіста
  showauthor: true,
  
  // Пріоритет та шаблон
  nweight: 1,
  layout: 2,
  
  // Додаткові параметри
  rated: true,
  headlineblock: false,
  hiderss: false,
  nocomment: false,
  maininblock: false,
  idtotop: 0,
  suggest: false,
  photo: true,
  video: false,
  
  // Час публікації
  ndate: '2024-01-15',
  ntime: '14:30:00',
  
  // Публікація
  approved: true,
  to_twitter: false,
  
  // Зображення
  images: 'image1.jpg,image2.jpg',
  
  // Мова
  lang: 'ua',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    // В реальному проекті тут буде запит до БД
    // const article = await getArticleById(Number(id));
    
    // Поки що повертаємо мокові дані
    const article = { ...MOCK_ARTICLE, id: Number(id) };

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    // В реальному проекті тут буде оновлення в БД
    // const updatedArticle = await updateArticle(Number(id), body);
    
    console.log('Updating article:', { id, body });

    return NextResponse.json({
      success: true,
      data: { id: Number(id), ...body },
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    // В реальному проекті тут буде видалення з БД
    // await deleteArticle(Number(id));
    
    console.log('Deleting article:', id);

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
