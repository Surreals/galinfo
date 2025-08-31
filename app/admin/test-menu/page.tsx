"use client";

import { useMenuData } from "@/app/hooks/useMenuData";
import { MenuItem } from "@/app/api/homepage/services/menuService";

export default function TestMenuPage() {
  const { menuData, loading, error } = useMenuData();

  if (loading) {
    return <div className="p-8">Loading menu data from /api/menu...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (!menuData) {
    return <div className="p-8">No menu data available</div>;
  }

  const renderMenuSection = (title: string, items: MenuItem[]) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id || item.param} className="border p-4 rounded">
            <div className="font-semibold">{item.title}</div>
            <div className="text-sm text-gray-600">Link: {item.link}</div>
            <div className="text-xs text-gray-500">Type: {item.cattype}</div>
            {item.id && <div className="text-xs text-gray-500">ID: {item.id}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Menu Data Test Page</h1>
      <div className="mb-4 p-4 bg-green-100 rounded">
        <p className="text-green-800">
          ✅ Now using dedicated <code>/api/menu</code> endpoint for efficient data fetching
        </p>
      </div>
      
      {renderMenuSection("Main Categories (cattype = 1)", menuData.mainCategories)}
      {renderMenuSection("Regions (cattype = 3)", menuData.regions)}
      {renderMenuSection("Additional Items", menuData.additionalItems)}
      {renderMenuSection("Special Themes (cattype = 2)", menuData.specialThemes)}
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Raw Data:</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(menuData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
