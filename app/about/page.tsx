'use client';

import { useState, useEffect } from 'react';
import { EditorialPageRenderer } from '@/app/components/EditorialPageRenderer';

export default function AboutPage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  const breadcrumbs = [
    { name: 'Головна', item: 'https://galinfo.com.ua/' },
    { name: 'Про редакцію', item: 'https://galinfo.com.ua/about' }
  ];

  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        const response = await fetch('/api/admin/templates');
        const result = await response.json();
        
        if (result.success && result.data) {
          const aboutTemplate = result.data.find((template: any) => template.template_id === 'about-page');
          if (aboutTemplate) {
            setPageData(aboutTemplate.schema_json);
          }
        }
      } catch (error) {
        console.error('Error fetching template data:', error);
        // Fallback до статичних даних
        setPageData({
          pageTitle: "ПРО РЕДАКЦІЮ",
          ageWarning: "Увага ! Матеріали сайту призначені для осіб старше 21 року (21+)",
          sections: [
            {
              id: "about-agency",
              title: "Про Агенцію",
              content: [
                "Агенція інформації та аналітики «Гал-інфо» працює в інформаційній сфері Львівської області та України з початку 2005 року. Є зареєстрованим суб'єктом у сфері онлайн-медіа. Рішення Національної ради з питань телебачення та радіомовлення №259 від 01.02.2024. Ідентифікатор медіа R40-02551.",
                "Основними видами діяльності Агенції є одержання та поширення інформації, надання інформаційних послуг, формування якісного мультимедійного контенту.",
                "Головну увагу Агенція зосереджує на подіях та явищах в галузі політики, економіки, культури, охорони здоров'я, а також у соціальній, екологічній, міжнародній та інших сферах.",
                "Діяльність Агенції насамперед спрямована на поширення добірних щоденних новин, передачу нових знань та організацію громадського дискурсу з актуальних суспільних тем.",
                "У своїй діяльності Гал-інфо керується стандартами новинної журналістики."
              ]
            },
            {
              id: "contact-info",
              title: "Контактна інформація",
              content: [
                {
                  type: "contact",
                  phone: "(093) 77-07-018",
                  email: "info@galinfo.com.ua"
                },
                {
                  type: "address",
                  title: "Адреса для листування:",
                  lines: [
                    "79008, м.Львів",
                    "вул. Гуцульська 9а",
                    "ТзОВ\"Агенція інформації та аналітики «Гал-інфо»"
                  ]
                }
              ]
            },
            {
              id: "journalist-registry",
              title: "Реєстр журналістських посвідчень АІА \"Гал-інфо\"",
              content: [
                {
                  type: "list",
                  items: [
                    "LV-G-001-UA - головний редактор Андрій Маринюк",
                    "LV-G-002-UA - журналістка Марічка Твардовська",
                    "LV-G-003-UA - журналістка Вікторія Тимофій",
                    "LV-G-004-UA - журналіст Мирослав Ватащук",
                    "LV-G-010-UA - посвідчення практиканта",
                    "LV-G-011-UA - посвідчення практиканта",
                    "LV-G-012-UA - посвідчення практиканта",
                    "LV-G-013-UA - посвідчення практиканта"
                  ]
                },
                "Посвідчення чинні до 01.03.2027"
              ]
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ПРО РЕДАКЦІЮ</h1>
        <p>Помилка завантаження даних сторінки.</p>
      </div>
    );
  }

  return <EditorialPageRenderer data={pageData} breadcrumbs={breadcrumbs} />;
}