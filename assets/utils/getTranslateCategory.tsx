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