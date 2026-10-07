import fs from 'fs';

const items = JSON.parse(fs.readFileSync('scripts/parsed_list.json', 'utf8'));

async function checkOne(item) {
  // Candidate 1: decoded with fixCp850
  const url1 = `https://pub-e61f6969a7e54904b6e2de540add8d0a.r2.dev/${encodeURIComponent(item.folder)}/${encodeURIComponent(item.file)}`;
  try {
    const res = await fetch(url1, { method: 'HEAD' });
    if (res.status === 200) {
      return { success: true, url: url1, folder: item.folder, file: item.file };
    }
  } catch (e) {}

  // Candidate 2: raw
  const url2 = `https://pub-e61f6969a7e54904b6e2de540add8d0a.r2.dev/${encodeURIComponent(item.rawFolder)}/${encodeURIComponent(item.rawFile)}`;
  try {
    const res = await fetch(url2, { method: 'HEAD' });
    if (res.status === 200) {
      return { success: true, url: url2, folder: item.rawFolder, file: item.rawFile };
    }
  } catch (e) {}

  return { success: false, folder: item.folder, file: item.file, rawFolder: item.rawFolder, rawFile: item.rawFile };
}

async function run() {
  console.log('Testing', items.length, 'tracks in parallel...');
  const results = [];
  const chunkSize = 15;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(checkOne));
    results.push(...chunkResults);
    process.stdout.write(`Done ${results.length}/${items.length}\r`);
  }

  const ok = results.filter(r => r.success);
  const fail = results.filter(r => !r.success);
  console.log(`\nFinished: OK = ${ok.length}, FAIL = ${fail.length}`);
  fs.writeFileSync('scripts/fast_results.json', JSON.stringify({ ok, fail }, null, 2));
}

run();
