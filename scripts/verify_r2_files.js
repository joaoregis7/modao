import fs from 'fs';

const items = JSON.parse(fs.readFileSync('scripts/parsed_list.json', 'utf8'));

async function checkAll() {
  const results = [];
  const errors = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // Test URL
    const url = `https://pub-e61f6969a7e54904b6e2de540add8d0a.r2.dev/${encodeURIComponent(item.folder)}/${encodeURIComponent(item.file)}`;
    
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status === 200) {
        results.push({ ...item, status: 200, url });
      } else {
        // Try raw without fixCp850 or variations
        const urlRaw = `https://pub-e61f6969a7e54904b6e2de540add8d0a.r2.dev/${encodeURIComponent(item.rawFolder)}/${encodeURIComponent(item.rawFile)}`;
        const resRaw = await fetch(urlRaw, { method: 'HEAD' });
        if (resRaw.status === 200) {
          results.push({ ...item, status: 200, url: urlRaw, usedRaw: true });
        } else {
          errors.push({ index: i, folder: item.folder, file: item.file, rawFolder: item.rawFolder, rawFile: item.rawFile, status: res.status });
        }
      }
    } catch (e) {
      errors.push({ index: i, folder: item.folder, file: item.file, error: e.message });
    }
  }

  console.log(`Verified ${results.length} / ${items.length} files successfully!`);
  if (errors.length > 0) {
    console.log(`Failed ${errors.length} files:`);
    console.log(JSON.stringify(errors.slice(0, 10), null, 2));
  }
  fs.writeFileSync('scripts/verified_results.json', JSON.stringify({ results, errors }, null, 2));
}

checkAll();
