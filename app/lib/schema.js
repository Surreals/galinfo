import { CATEGORY_IDS } from "./categoryUtils";

const COLUMN_NEWS = 'ColumnNews'
const CATEGORY_NEWS = 'CategoryNews'

export const mainPageSchema = {
    blocks: [
        {type: COLUMN_NEWS, categoryId: CATEGORY_IDS.POLITICS, sideCategoryId: CATEGORY_IDS.ATO},
        {type: CATEGORY_NEWS, categoryId: CATEGORY_IDS.EVROPA},
    ]
}

export const categoryPageSiderMap = {
    [CATEGORY_IDS.SOCIETY]: [CATEGORY_IDS.POLITICS, CATEGORY_IDS.ECONOMICS, CATEGORY_IDS.CULTURE,  CATEGORY_IDS.SPORT],
}