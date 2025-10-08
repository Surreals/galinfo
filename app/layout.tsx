import type { Metadata } from "next";
import { Open_Sans, Rubik } from "next/font/google";
import { ConfigProvider } from "antd";
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import locale from 'antd/locale/uk_UA';
import '@ant-design/v5-patch-for-react-19';

import {MobileProvider} from "@/app/contexts/MobileContext";
import {MenuProvider} from "@/app/contexts/MenuContext";
import {AdminAuthProvider} from "@/app/contexts/AdminAuthContext";
import BytcdConsole from "@/app/components/BytcdConsole";
import ConditionalLayout from "@/app/components/ConditionalLayout";

import "./globals.css";
import "antd/dist/reset.css";

// Configure dayjs to use Ukrainian locale
dayjs.locale('uk');

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "cyrillic", "hebrew"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const customTheme = {
  token: {
    colorPrimary: "#c7084f",
    borderRadius: 8,
    controlHeight: 46,
  },
  components: {
    Carousel: {
      arrowSize: 14,
      dotActiveWidth: 34,
      dotGap: 5,
      colorBgContainer: "#c7084f",
      dotHeight: 12,
      dotOffset: -34,
    },
    Input: {
      activeBorderColor: "#c7084f",
      hoverBorderColor: "#c7084f",
      colorBorder: "rgb(207,207,207)",
      controlHeight: 46,
      borderRadius: 8,
      activeShadow: '',
    },
    Tabs: {
      itemSelectedColor: "#c7084f",
      inkBarColor: "#c7084f",
      itemActiveColor: "#c7084f",
      titleFontSize: 15,
      titleFontWeight: 600,
    },
    Upload: {
      colorPrimary: "#c7084f",
      colorPrimaryHover: "#a70641",
      colorBorder: "rgb(207,207,207)",
      borderRadiusLG: 8,
    },
    Select: {
      activeBorderColor: "#c7084f",
      hoverBorderColor: "#c7084f",
      borderRadius: 8,
      controlHeight: 46,
    },
    Checkbox: {
      colorPrimary: "#c7084f",
      colorPrimaryHover: "#a70641",
      borderRadiusSM: 4,
    },
    DatePicker: {
      activeBorderColor: "#c7084f",
      hoverBorderColor: "#c7084f",
      borderRadius: 8,
      controlHeight: 46,
      colorPrimary: "#c7084f",
    },
    Radio: {
      colorPrimary: "#c7084f",
      colorPrimaryHover: "#a70641",
      dotSize: 12,
      borderRadiusSM: 4,
    },
  },
};

export const metadata: Metadata = {
  title: {
    default: 'Гал-Інфо - Агенція інформації та аналітики',
    template: '%s | Гал-Інфо'
  },
  description: 'Агенція інформації та аналітики "Гал-інфо" - останні новини Львова та регіону. Політика, економіка, суспільство, культура, спорт.',
  keywords: [
    'новини',
    'Львів', 
    'Гал-Інфо',
    'агенція',
    'інформація',
    'аналітика',
    'політика',
    'економіка',
    'суспільство',
    'культура',
    'спорт',
    'здоров\'я',
    'кримінал',
    'надзвичайні події'
  ],
  authors: [{ name: 'Гал-Інфо' }],
  creator: 'Гал-Інфо',
  publisher: 'Гал-Інфо',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://galinfo.com.ua'),
  alternates: {
    canonical: '/',
    languages: {
      'uk-UA': '/',
      'ru-UA': '/ru',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: 'https://galinfo.com.ua',
    siteName: 'Гал-Інфо',
    title: 'Гал-Інфо - Агенція інформації та аналітики',
    description: 'Агенція інформації та аналітики "Гал-інфо" - останні новини Львова та регіону',
    images: [
      {
        url: '/im/logo-rss-100.png',
        width: 100,
        height: 100,
        alt: 'Гал-Інфо',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@galinfo_lviv',
    creator: '@galinfo_lviv',
    title: 'Гал-Інфо - Агенція інформації та аналітики',
    description: 'Агенція інформації та аналітики "Гал-інфо" - останні новини Львова та регіону',
    images: ['/im/logo-rss-100.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#c7084f',
    'theme-color': '#c7084f',
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${openSans.variable} ${rubik.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ConfigProvider
          theme={customTheme}
          locale={locale}
        >
          <AdminAuthProvider>
            <MobileProvider>
              <MenuProvider>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                <BytcdConsole />
              </MenuProvider>
            </MobileProvider>
          </AdminAuthProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}