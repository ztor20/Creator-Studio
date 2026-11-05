/* js/release-links.js — 各版本的網址清單（唯一一份，放在完整版網址；舊分支也從這裡讀）。
   新切一個 release 就在這裡加一筆，再部署完整版。devtools.js 的版本面板讀 window.ZTOR_RELEASES。 */
window.ZTOR_RELEASES = [
  { key: 'full', name: '最終版', url: 'https://ztor-v2-creator-studio.vercel.app', desc: '完整版，全部功能；日常編修都改這一版' },
  { key: 'release2.4', name: 'release2.4（開發中）', url: 'https://ztor-cs-rel24.vercel.app', desc: '粉絲管理與媒體庫；目前開發版本' },
  { key: 'release2.3', name: 'release2.3（凍結版）', url: 'https://ztor-cs-rel23.vercel.app', desc: '活動交付版' },
  { key: 'release2.2', name: 'release2.2（凍結版）', url: 'https://ztor-cs-release2-3.vercel.app', desc: 'E-Shop 交付版' }
];
