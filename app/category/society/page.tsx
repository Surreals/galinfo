export default function SocietyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">СУСПІЛЬСТВО</h1>
      <div className="grid gap-6">
        <article className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-2">
            <a href="#" className="hover:text-pink-400 transition-colors">
              Нові соціальні програми для підтримки молоді у Львові
            </a>
          </h2>
          <p className="text-gray-600 mb-2">15 грудня 2024</p>
          <p className="text-gray-800">
            Міська рада Львова запустила нові програми підтримки для молодих людей, 
            які включають гранти на освіту, підтримку підприємництва та культурні проекти.
          </p>
        </article>

        <article className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-2">
            <a href="#" className="hover:text-pink-400 transition-colors">
              Благодійна акція зі збору теплого одягу для переселенців
            </a>
          </h2>
          <p className="text-gray-600 mb-2">14 грудня 2024</p>
          <p className="text-gray-800">
            У Львові стартувала масштабна благодійна акція зі збору теплого одягу 
            та предметів першої необхідності для внутрішньо переміщених осіб.
          </p>
        </article>

        <article className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-2">
            <a href="#" className="hover:text-pink-400 transition-colors">
              Відкриття нового центру реабілітації для ветеранів
            </a>
          </h2>
          <p className="text-gray-600 mb-2">13 грудня 2024</p>
          <p className="text-gray-800">
            У Львівській області відкрився новий центр реабілітації для ветеранів, 
            який надаватиме комплексну медичну та психологічну підтримку.
          </p>
        </article>

        <article className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-2">
            <a href="#" className="hover:text-pink-400 transition-colors">
              Соціальний опитування: рівень довіри до місцевої влади
            </a>
          </h2>
          <p className="text-gray-600 mb-2">12 грудня 2024</p>
          <p className="text-gray-800">
            Результати нового соціального опитування показали зростання рівня довіри 
            громадян до місцевої влади у Львівській області.
          </p>
        </article>

        <article className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-2">
            <a href="#" className="hover:text-pink-400 transition-colors">
              Програма підтримки малого бізнесу в регіоні
            </a>
          </h2>
          <p className="text-gray-600 mb-2">11 грудня 2024</p>
          <p className="text-gray-800">
            Обласна адміністрація запустила нову програму підтримки малого та середнього 
            бізнесу з бюджетом у 50 мільйонів гривень.
          </p>
        </article>
      </div>
    </div>
  );
} 