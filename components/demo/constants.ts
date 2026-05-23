export const PLATFORMS = [
  { name: 'TikTok', emoji: '🎵' },
  { name: 'Meta (Facebook/Instagram)', emoji: '🔵' },
  { name: 'Zoom', emoji: '📹' },
  { name: 'Discord', emoji: '🎮' },
  { name: 'Roblox', emoji: '🧱' },
  { name: 'Snapchat', emoji: '👻' },
] as const;

export const NCMEC = { name: 'NCMEC CyberTipline', emoji: '🏛️', mandatory: true } as const;

export const SCENARIOS = [
  {
    tag: 'S01 · CRITICAL',
    title: 'Cross-platform grooming — Discord → Snapchat',
    text: "Account on Discord has been DMing minors in a public game server, requesting they move to Snapchat and send photos. Account created 4 days ago, 280 followers, similar pattern to previous accounts we've flagged. Multiple reports from parents.",
  },
  {
    tag: 'S02 · HIGH',
    title: 'Coordinated scam network on TikTok',
    text: "12 accounts on TikTok running coordinated 'investment opportunity' livestreams targeting elderly users, redirecting to WhatsApp. Estimated $40k in reported losses over 72 hours.",
  },
  {
    tag: 'S03 · HIGH',
    title: 'Impersonation of public figure on Instagram',
    text: 'Account impersonating verified journalist, posting fabricated quotes and screenshots. 14k followers gained in 48 hours. Original journalist has filed report.',
  },
  {
    tag: 'S04 · MEDIUM',
    title: 'Repeat harassment across Roblox & Discord',
    text: 'Same user pattern harassing a minor across Roblox game lobbies and Discord servers — 3 prior reports, behaviour escalating to threats.',
  },
  {
    tag: 'S05 · CRITICAL',
    title: 'CSAM material flagged by user report',
    text: 'User reported a TikTok account uploading content that contains suspected child sexual abuse material. Account is fresh, 0 followers, posts every 4 minutes.',
  },
  {
    tag: 'S06 · MEDIUM',
    title: 'Zoom bombing of school session',
    text: 'Public school Zoom session disrupted by coordinated raid from a Discord server. Slurs and hateful imagery shared. School has filed complaint.',
  },
] as const;

export const CHART_DATA = [
  { month: 'Dec', incidents: 120 },
  { month: 'Jan', incidents: 195 },
  { month: 'Feb', incidents: 248 },
  { month: 'Mar', incidents: 426 },
  { month: 'Apr', incidents: 312 },
  { month: 'May', incidents: 358 },
  { month: 'Jun', incidents: 394 },
];
