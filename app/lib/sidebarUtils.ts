/**
 * Утиліти для роботи з sidebar
 */

interface SidebarBlock {
  type: string;
  categoryId?: number | string;
  config?: any;
  [key: string]: any;
}

/**
 * Фільтрує блоки категорій новин у sidebar
 * 
 * Правила фільтрації:
 * 1. Якщо в sidebar є 4+ категорійних блоки - пропускає поточну категорію і виводить максимум 3
 * 2. Якщо в sidebar менше 4 категорійних блоків - виводить всі без фільтрації
 * 
 * @param sidebarBlocks - Масив блоків sidebar
 * @param currentCategoryIds - ID поточної категорії/регіону або масив ID
 * @param maxBlocks - Максимальна кількість блоків для відображення (за замовчуванням 3)
 * @returns Відфільтрований масив блоків
 */
export function filterSidebarCategoryBlocks(
  sidebarBlocks: SidebarBlock[],
  currentCategoryIds?: number | string | null | (number | string)[],
  maxBlocks: number = 3
): SidebarBlock[] {
  if (!sidebarBlocks || sidebarBlocks.length === 0) {
    return sidebarBlocks;
  }

  // Підраховуємо кількість категорійних блоків у sidebar
  const totalCategoryBlocks = sidebarBlocks.filter(
    block => block.type === 'NEWS_LIST' || block.type === 'CATEGORY_NEWS'
  ).length;

  // Якщо категорійних блоків менше 4, не фільтруємо - повертаємо всі блоки
  if (totalCategoryBlocks < 4) {
    return sidebarBlocks;
  }

  // Якщо немає поточної категорії, повертаємо всі блоки
  if (currentCategoryIds === undefined || currentCategoryIds === null) {
    return sidebarBlocks;
  }

  // Якщо є 4+ категорійних блоки - фільтруємо поточну категорію
  // Нормалізуємо currentCategoryIds до масиву рядків
  const categoryIdsArray = (Array.isArray(currentCategoryIds) 
    ? currentCategoryIds 
    : [currentCategoryIds]
  ).map(id => id.toString());

  // Фільтруємо блоки NEWS_LIST та CATEGORY_NEWS
  const filteredBlocks: SidebarBlock[] = [];
  let categoryBlocksCount = 0;

  for (const block of sidebarBlocks) {
    // Пропускаємо не-категорійні блоки (банери, сепаратори, тощо)
    if (block.type !== 'NEWS_LIST' && block.type !== 'CATEGORY_NEWS') {
      filteredBlocks.push(block);
      continue;
    }

    // Якщо вже додали максимум категорійних блоків, пропускаємо
    if (categoryBlocksCount >= maxBlocks) {
      continue;
    }

    // Перевіряємо чи categoryId блоку співпадає з будь-якою з поточних категорій
    const blockCategoryId = block.categoryId;
    
    // Пропускаємо блок якщо його категорія співпадає з будь-якою поточною категорією
    if (blockCategoryId !== undefined && 
        blockCategoryId !== null && 
        categoryIdsArray.includes(blockCategoryId.toString())) {
      continue;
    }

    // Додаємо блок до результату
    filteredBlocks.push(block);
    categoryBlocksCount++;
  }

  return filteredBlocks;
}

/**
 * Підраховує кількість категорійних блоків у sidebar
 * 
 * @param sidebarBlocks - Масив блоків sidebar
 * @returns Кількість блоків NEWS_LIST та CATEGORY_NEWS
 */
export function countSidebarCategoryBlocks(sidebarBlocks: SidebarBlock[]): number {
  if (!sidebarBlocks || sidebarBlocks.length === 0) {
    return 0;
  }

  return sidebarBlocks.filter(
    block => block.type === 'NEWS_LIST' || block.type === 'CATEGORY_NEWS'
  ).length;
}

