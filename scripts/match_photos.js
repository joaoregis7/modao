import fs from 'fs';

const verified = JSON.parse(fs.readFileSync('scripts/verified_200_tracks.json', 'utf8'));
const photoMap = JSON.parse(fs.readFileSync('scripts/parsed_photos.json', 'utf8'));

// Default fallback rustic covers in case any single track does not have a custom photo
const fallbackCovers = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80'
];

async function checkAndApplyPhotos() {
  console.log(`Checking photos for ${verified.length} verified tracks...`);
  let matchedCount = 0;

  for (let i = 0; i < verified.length; i++) {
    const item = verified[i];
    const folder = item.folder;

    // Check photos for this folder
    const photos = photoMap[folder] || [];
    let photoUrl = null;

    if (photos.length > 0) {
      // If folder has multiple photos (like Marco Brasil), pick matching
      let chosen = photos[0];
      if (photos.length > 1) {
        if (folder.includes('Marco Brasil')) {
          if (item.file.includes('Caçador') || item.file.includes('Debaixo')) {
            chosen = photos.find(p => p.file.includes('caçador')) || photos[0];
          } else {
            chosen = photos.find(p => p.file.includes('outro lado')) || photos[1];
          }
        }
      }

      // Test R2 URL
      const candidateUrl = `https://pub-e61f6969a7e54904b6e2de540add8d0a.r2.dev/${encodeURIComponent(folder)}/${encodeURIComponent(chosen.file)}`;
      try {
        const res = await fetch(candidateUrl, { method: 'HEAD', signal: AbortSignal.timeout(2500) });
        if (res.status === 200) {
          photoUrl = candidateUrl;
          matchedCount++;
        }
      } catch (e) {}
    }

    item.coverUrl = photoUrl || fallbackCovers[i % fallbackCovers.length];
    if (photoUrl) {
      item.hasCustomCover = true;
    }
  }

  console.log(`Matched ${matchedCount} custom photos from Cloudflare R2!`);
  fs.writeFileSync('scripts/tracks_with_photos.json', JSON.stringify(verified, null, 2));
}

checkAndApplyPhotos();
