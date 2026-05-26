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

// Auto-detected incident pool — used by the live feed (mock classifier, not Claude API)
export const DETECTED_POOL = [
  {
    platform: 'Discord',
    text: "Account cluster on Discord exhibiting coordinated grooming pattern — 4 accounts created within 48h targeting a gaming server with 340 members aged 10-16. Accounts sending direct messages requesting platform migration to Snapchat and requesting photos. Pattern matches 3 prior flagged networks from this quarter.",
  },
  {
    platform: 'TikTok',
    text: "Coordinated network of 18 TikTok accounts running live investment scam livestreams targeting elderly users, redirecting to WhatsApp groups promising guaranteed 40% returns. $65k in reported losses. Accounts exhibit coordinated posting times and shared narration script.",
  },
  {
    platform: 'Snapchat',
    text: "Sextortion pattern detected — accounts soliciting intimate images from teenagers aged 14-17 using grooming script, then deploying images for financial coercion. 6 victims identified across Snapchat. Actor using VPN rotation and disposable account pattern to evade detection.",
  },
  {
    platform: 'Meta (Facebook/Instagram)',
    text: "Network of 23 fake accounts impersonating EU humanitarian aid organizations, soliciting cryptocurrency donations. Coordinated posting pattern with shared imagery. Estimated €14k raised from 90 victims over 6 days. No legitimate charity registration found.",
  },
  {
    platform: 'Roblox',
    text: "Repeated harassment campaign in Roblox game lobbies — same actor pattern across 5 accounts targeting a 13-year-old user. Behaviour escalating to direct threats and doxxing attempt. 4 prior bans bypassed via new account creation within 72h each time.",
  },
  {
    platform: 'Discord',
    text: "Discord server coordinating Zoom bombing attacks on school sessions. 47-member private server, raid coordination visible in #ops channel. 3 schools targeted this week. Hateful imagery, racial slurs, and extremist content deployed during attacks on sessions of ~30 students each.",
  },
  {
    platform: 'TikTok',
    text: "CSAM signal detected — TikTok account posting content with PhotoDNA hash matches against known CSAM database. Account active 72 hours, 0 followers, posting every 4 minutes. Cross-platform check indicates same actor operating under different handle on Discord.",
  },
  {
    platform: 'Meta (Facebook/Instagram)',
    text: "Romance scam network on Facebook targeting widowed users aged 55+. 11 interconnected fake accounts, average 10-week grooming cycle before requesting wire transfers. 7 confirmed victims identified, total reported losses $230k. Accounts share IP ranges and profile creation timestamps.",
  },
] as const;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const INCIDENT_COUNTS = [120, 195, 248, 426, 312, 358];

function buildChartData() {
  const now = new Date();
  return INCIDENT_COUNTS.map((incidents, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: MONTH_NAMES[d.getMonth()], incidents };
  });
}

export const CHART_DATA = buildChartData();
