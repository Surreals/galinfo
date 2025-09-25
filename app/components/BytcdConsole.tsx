'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function BytcdConsole() {
  const pathname = usePathname();

  useEffect(() => {
    // Only show console output on non-admin pages
    if (pathname.startsWith('/admin')) {
      return;
    }
    // ASCII art for BYTCD team
    const asciiArt = `
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║                                                                              ║
    ║                  ██████╗ ██╗   ██╗████████╗ ██████╗██████╗                   ║
    ║                  ██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔══██╗                  ║
    ║                  ██████╔╝ ╚████╔╝    ██║   ██║     ██║  ██║                  ║
    ║                  ██╔══██╗  ╚██╔╝     ██║   ██║     ██║  ██║                  ║
    ║                  ██████╔╝   ██║      ██║   ╚██████╗██████╔╝                  ║
    ║                  ╚═════╝    ╚═╝      ╚═╝    ╚═════╝╚═════╝                   ║
    ║                                                                              ║
    ║                                                                              ║
    ║                                 bytcd.com                                    ║
    ║                                                                              ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
    `;

    // Console output with styling
    console.log('%c' + asciiArt, 'color: #c7084f; font-family: monospace; font-size: 12px;');
    console.log('%cРозроблено командою BYTCD', 'color: #c7084f; font-weight: bold; font-size: 14px;');
    console.log('%c--bytcd.com--', 'color: #666; font-style: italic;');
  }, [pathname]);

  return null; // This component doesn't render anything visible
}
