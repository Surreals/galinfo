export function getCategoryTitle(category: string): string {
  switch (category) {
    case "society":
      return "Суспільство";
    case "politics":
      return "Політика";
    case "economy":
      return "Економіка";
    case "culture":
      return "Культура";
    case "health":
      return "Здоров'я";
    case "sport":
      return "Спорт";
    case "crime":
      return "Кримінал";
    case "emergency":
      return "Надзвичайне";
    case "history":
      return "Історія";
    case "technologies":
      return "Технології";
    default:
      return "Невідома категорія";
  }
}

export function getBreadCrumbsNav(category: string): string {
  switch (category) {
    case  "суспільство":
      return "society";
    case  "політика":
      return "politics";
    case "економіка":
      return  "economy";
    case "культура":
      return "culture";
    case "здоров'я":
      return "health";
    case "спорт" :
      return "sport";
    case "кримінал" :
      return "crime";
    case "надзвичайне" :
      return "emergency";
    case "історія" :
      return "history";
    case "технології" :
      return "technologies";
    default:
      return "Невідома категорія";
  }
}