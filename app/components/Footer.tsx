import Link from 'next/link';
import paths from '@/app/paths';

export default function Footer() {
  return (
    <footer className="bg-[#222222] text-[#E4E4E4]">
      {/* Верхня секція з колонками */}
      <div className="w-[1280px] mx-auto px-20 py-12">
        <div className="flex gap-[60px]">
          
          {/* АГЕНЦІЯ */}
          <div className="flex-shrink-0 w-[268px]">
            <h3 className="font-open-sans font-semibold text-[20px] leading-tight tracking-wide h-[28px] flex items-center capitalize">АГЕНЦІЯ</h3>
            <div className="h-px bg-[#E4E4E4] mb-4"></div>
            <ul className="space-y-4">
              <li>
                <Link href={paths.about} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ПРО РЕДАКЦІЮ
                </Link>
              </li>
              <li>
                <Link href={paths.editorialPolicy} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  РЕДАКЦІЙНА ПОЛІТИКА
                </Link>
              </li>
              <li>
                <Link href={paths.advertising} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ЗАМОВИТИ РЕКЛАМУ
                </Link>
              </li>
              <li>
                <Link href={paths.contacts} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  КОНТАКТИ
                </Link>
              </li>
              <li>
                <Link href={paths.termsOfUse} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ПРАВИЛА ВИКОРИСТАННЯ
                </Link>
              </li>
            </ul>
          </div>

          {/* ТОП ТЕМИ */}
          <div className="flex-shrink-0 w-[268px]">
            <h3 className="font-open-sans font-semibold text-[20px] leading-tight tracking-wide h-[28px] flex items-center capitalize">ТОП ТЕМИ</h3>
            <div className="h-px bg-[#E4E4E4] mb-4"></div>
            <ul className="space-y-4">
              <li>
                <Link href={paths.frankConversation} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ВІДВЕРТА РОЗМОВА З
                </Link>
              </li>
              <li>
                <Link href={paths.lvivDistricts} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  РАЙОНИ ЛЬВОВА
                </Link>
              </li>
              <li>
                <Link href={paths.pressService} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ПРЕССЛУЖБА
                </Link>
              </li>
            </ul>
          </div>

          {/* КАТЕГОРІЇ */}
          <div className="flex-1 w-[624px]">
            <h3 className="font-open-sans font-semibold text-[20px] leading-tight tracking-wide h-[28px] flex items-center capitalize">КАТЕГОРІЇ</h3>
            <div className="h-px bg-[#E4E4E4] mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {/* Підколонка 1 - Регіони */}
              <div className="space-y-4">
                <Link href={paths.lvivRegion} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ЛЬВІВЩИНА
                </Link>
                <Link href={paths.ternopilRegion} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ТЕРНОПІЛЬЩИНА
                </Link>
                <Link href={paths.volyn} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ВОЛИНЬ
                </Link>
                <Link href={paths.ukraine} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  УКРАЇНА
                </Link>
                <Link href={paths.eu} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ЄС
                </Link>
                <Link href={paths.world} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  СВІТ
                </Link>
              </div>

              {/* Підколонка 2 - Теми */}
              <div className="space-y-4">
                <Link href={paths.society} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  СУСПІЛЬСТВО
                </Link>
                <Link href={paths.politics} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ПОЛІТИКА
                </Link>
                <Link href={paths.economy} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ЕКОНОМІКА
                </Link>
                <Link href={paths.culture} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  КУЛЬТУРА
                </Link>
                <Link href={paths.health} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ЗДОРОВ'Я
                </Link>
              </div>

              {/* Підколонка 3 - Додаткові теми */}
              <div className="space-y-4">
                <Link href={paths.sport} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  СПОРТ
                </Link>
                <Link href={paths.crime} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  КРИМІНАЛ
                </Link>
                <Link href={paths.emergency} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  НАДЗВИЧАЙНІ ПОДІЇ
                </Link>
                <Link href={paths.history} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ІСТОРІЯ
                </Link>
                <Link href={paths.technologies} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ТЕХНОЛОГІЇ
                </Link>
              </div>

              {/* Підколонка 4 - Типи контенту */}
              <div className="space-y-4">
                <Link href={paths.news} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  НОВИНА
                </Link>
                <Link href={paths.article} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  СТАТТЯ
                </Link>
                <Link href={paths.interview} className="font-open-sans font-semibold text-[12px] leading-tight tracking-normal hover:text-pink-400 transition-colors block align-middle">
                  ІНТЕРВ'Ю
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Розділювальна лінія */}
      <div className="w-[1280px] h-px bg-gray-700 mx-auto"></div>

      {/* Нижня секція */}
      <div className="w-[1440px] mx-auto px-20 py-12">
        <div className="text-center">
          {/* Логотип */}
          <div className="text-xl font-bold mb-2">
            <span className="text-pink-500">g</span>alinfo
          </div>
          
          {/* Копірайт */}
          <div className="text-xs text-[#E4E4E4] mb-3">
            <div>© 2005-2018 Агенція інформації та аналітики</div>
            <div>Передрук матеріали тільки за наявності гіперпосилання на galinfo.com.ua</div>
          </div>

          {/* Соціальні мережі */}
          <div className="flex justify-center items-center space-x-4 mb-3">
            <Link href={paths.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </Link>
            <Link href={paths.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            <Link href={paths.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </Link>
          </div>

          {/* Кнопка IN-FOMO */}
          <div className="text-xs text-[#E4E4E4]">
            САЙТ СТВОРЕНИЙ <span className="text-pink-500 font-semibold">IN-FOMO.</span>
          </div>
        </div>
      </div>
    </footer>
  );
} 