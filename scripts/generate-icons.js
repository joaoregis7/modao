import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Icon SVG with retro radio and viola caipira / acoustic soundwaves vibe
const svgStandard = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#221C16"/>
      <stop offset="60%" stop-color="#181512"/>
      <stop offset="100%" stop-color="#121212"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3E7D3"/>
      <stop offset="35%" stop-color="#E2A03F"/>
      <stop offset="70%" stop-color="#C98A2E"/>
      <stop offset="100%" stop-color="#996016"/>
    </linearGradient>
    <linearGradient id="amberGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#D97706" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#D97706" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  <rect width="504" height="504" x="4" y="4" rx="106" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-opacity="0.6"/>

  <!-- Subtle Vintage Vinyl Grooves in background -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#26211B" stroke-width="2"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="#26211B" stroke-width="1.5"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#26211B" stroke-width="1.5"/>

  <!-- Viola Caipira & Radio dial emblem -->
  <g filter="url(#shadow)">
    <!-- Acoustic Viola Body Silhouette -->
    <path d="M 256 120 
             C 285 120 306 142 306 172 
             C 306 195 292 214 278 226
             C 310 242 334 275 334 320
             C 334 372 299 414 256 414
             C 213 414 178 372 178 320
             C 178 275 202 242 234 226
             C 220 214 206 195 206 172
             C 206 142 227 120 256 120 Z" 
          fill="#1C1814" stroke="url(#goldGrad)" stroke-width="7"/>

    <!-- Sound Hole / Radio Dial Ring -->
    <circle cx="256" cy="320" r="48" fill="#121212" stroke="url(#goldGrad)" stroke-width="5"/>
    <circle cx="256" cy="320" r="38" fill="#1C1814" stroke="#996016" stroke-width="2"/>

    <!-- Radio Soundwave / Equalizer bars inside soundhole -->
    <rect x="236" y="310" width="4" height="20" rx="2" fill="#E2A03F"/>
    <rect x="244" y="300" width="4" height="40" rx="2" fill="#F3E7D3"/>
    <rect x="252" y="292" width="4" height="56" rx="2" fill="url(#goldGrad)"/>
    <rect x="260" y="302" width="4" height="36" rx="2" fill="#F3E7D3"/>
    <rect x="268" y="312" width="4" height="16" rx="2" fill="#E2A03F"/>

    <!-- Viola Strings -->
    <line x1="250" y1="120" x2="250" y2="270" stroke="#F3E7D3" stroke-opacity="0.7" stroke-width="2"/>
    <line x1="254" y1="120" x2="254" y2="270" stroke="#F3E7D3" stroke-opacity="0.9" stroke-width="2"/>
    <line x1="258" y1="120" x2="258" y2="270" stroke="#F3E7D3" stroke-opacity="0.9" stroke-width="2"/>
    <line x1="262" y1="120" x2="262" y2="270" stroke="#F3E7D3" stroke-opacity="0.7" stroke-width="2"/>

    <!-- Bridge -->
    <rect x="240" y="380" width="32" height="6" rx="3" fill="#C98A2E"/>

    <!-- Radio Antenna / Waves -->
    <path d="M 330 150 A 130 130 0 0 1 365 240" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round"/>
    <path d="M 355 125 A 170 170 0 0 1 398 230" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round" stroke-opacity="0.6"/>

    <path d="M 182 150 A 130 130 0 0 0 147 240" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round"/>
    <path d="M 157 125 A 170 170 0 0 0 114 230" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round" stroke-opacity="0.6"/>
  </g>

  <!-- Star accents / Raiz authentic branding -->
  <path d="M 256 86 L 260 97 L 272 99 L 263 107 L 266 119 L 256 112 L 246 119 L 249 107 L 240 99 L 252 97 Z" fill="url(#goldGrad)"/>
</svg>
`;

// Maskable icon with safe-zone margin (central 80%)
const svgMaskable = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#241E18"/>
      <stop offset="60%" stop-color="#181512"/>
      <stop offset="100%" stop-color="#121212"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3E7D3"/>
      <stop offset="35%" stop-color="#E2A03F"/>
      <stop offset="70%" stop-color="#C98A2E"/>
      <stop offset="100%" stop-color="#996016"/>
    </linearGradient>
  </defs>

  <!-- Full-bleed background -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>
  <circle cx="256" cy="256" r="230" fill="none" stroke="#2A241D" stroke-width="4"/>
  <circle cx="256" cy="256" r="200" fill="none" stroke="#221C16" stroke-width="2"/>

  <!-- Centered scaled content safe inside 80% circle -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <!-- Acoustic Viola Body Silhouette -->
    <path d="M 256 115 
             C 285 115 306 137 306 167 
             C 306 190 292 209 278 221
             C 310 237 334 270 334 315
             C 334 367 299 409 256 409
             C 213 409 178 367 178 315
             C 178 270 202 237 234 221
             C 220 209 206 190 206 167
             C 206 137 227 115 256 115 Z" 
          fill="#1C1814" stroke="url(#goldGrad)" stroke-width="8"/>

    <!-- Sound Hole / Radio Dial Ring -->
    <circle cx="256" cy="315" r="48" fill="#121212" stroke="url(#goldGrad)" stroke-width="6"/>

    <!-- Radio Soundwave / Equalizer bars inside soundhole -->
    <rect x="236" y="305" width="4" height="20" rx="2" fill="#E2A03F"/>
    <rect x="244" y="295" width="4" height="40" rx="2" fill="#F3E7D3"/>
    <rect x="252" y="287" width="4" height="56" rx="2" fill="url(#goldGrad)"/>
    <rect x="260" y="297" width="4" height="36" rx="2" fill="#F3E7D3"/>
    <rect x="268" y="307" width="4" height="16" rx="2" fill="#E2A03F"/>

    <!-- Viola Strings -->
    <line x1="250" y1="115" x2="250" y2="265" stroke="#F3E7D3" stroke-opacity="0.8" stroke-width="2.5"/>
    <line x1="254" y1="115" x2="254" y2="265" stroke="#F3E7D3" stroke-opacity="1" stroke-width="2.5"/>
    <line x1="258" y1="115" x2="258" y2="265" stroke="#F3E7D3" stroke-opacity="1" stroke-width="2.5"/>
    <line x1="262" y1="115" x2="262" y2="265" stroke="#F3E7D3" stroke-opacity="0.8" stroke-width="2.5"/>

    <rect x="240" y="375" width="32" height="6" rx="3" fill="#C98A2E"/>

    <!-- Waves -->
    <path d="M 330 145 A 130 130 0 0 1 365 235" fill="none" stroke="url(#goldGrad)" stroke-width="7" stroke-linecap="round"/>
    <path d="M 355 120 A 170 170 0 0 1 398 225" fill="none" stroke="url(#goldGrad)" stroke-width="7" stroke-linecap="round" stroke-opacity="0.6"/>

    <path d="M 182 145 A 130 130 0 0 0 147 235" fill="none" stroke="url(#goldGrad)" stroke-width="7" stroke-linecap="round"/>
    <path d="M 157 120 A 170 170 0 0 0 114 225" fill="none" stroke="url(#goldGrad)" stroke-width="7" stroke-linecap="round" stroke-opacity="0.6"/>

    <path d="M 256 81 L 260 92 L 272 94 L 263 102 L 266 114 L 256 107 L 246 114 L 249 102 L 240 94 L 252 92 Z" fill="url(#goldGrad)"/>
  </g>
</svg>
`;

async function main() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgStandard);

  const stdBuffer = Buffer.from(svgStandard);
  const maskBuffer = Buffer.from(svgMaskable);

  // 192x192
  await sharp(stdBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(stdBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Maskable 512x512
  await sharp(maskBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Apple touch icon 180x180
  await sharp(stdBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicon 48x48
  await sharp(stdBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Successfully generated all PWA icons!');
}

main().catch(console.error);
