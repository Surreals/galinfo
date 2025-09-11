export function getCategoryTitle(category: string): string {
  switch (category) {
    case "society":
      return "Суспільство";
    case "politics":
      return "Політика";
    case "economics":
      return "Економіка";
    case "culture":
      return "Культура";
    case "health":
      return "Здоров'я";
    case "ato":
        return "Війна з Росією";
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
    case "lviv":
      return "Львів";
    case "ternopil":
      return "Тернопіль";
    case "volyn":
      return "Волинь";
    case "ukraine":
      return "Україна";
    case "evropa":
      return "Європа";
    case "svit":
      return "Світ";
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
      return  "economics";
    case "культура":
      return "culture";
    case "здоров'я":
      return "health";
    case "війна з Росією" :
      return "ato";
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
    case "Львів" :
      return "lviv";
    case "тернопіль" :
      return "ternopil";
    case "Волин" :
      return "volyn";
    case "Україна" :
      return "ukraine";
    case "Європа" :
      return "evropa";
    case "Світ" :
      return "svit";
    default:
      return "Невідома категорія";
  }
}