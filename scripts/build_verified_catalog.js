import fs from 'fs';

// Load parsed list
const rawItems = JSON.parse(fs.readFileSync('scripts/parsed_list.json', 'utf8'));

// Special corrections map for folders where Windows CP850 lost a character or had special names
const folderCorrections = {
  'Cada Volta  Um Recomeço - Zezé Di Camargo e Luciano': 'Cada Volta É Um Recomeço - Zezé Di Camargo e Luciano',
  'Marciano - Meu Oficio  Cantar (Ao Vivo)': 'Marciano - Meu Oficio É Cantar (Ao Vivo)',
  'Que Bicho Que  - Gino e Geno': 'Que Bicho Que É - Gino e Geno',
  'Quem  - Leandro e Leonardo': 'Quem É - Leandro e Leonardo',
  'o Amor - Zezé di Camargo e Luciano': 'É o Amor - Zezé di Camargo e Luciano',
  'Um Degrau Na Escada - Chico Rey e Paraná': 'Um Degrau Na Escada - Chico Rey e Paraná',
  'Voce é tudo que pedi pra Deus - Cezar e Paulinho': 'Voce é tudo que pedi pra Deus - Cezar e Paulinho'
};

const fileCorrections = {
  '00 - É o amor - eoamor.mp3': '00 - É o amor - eoamor.mp3'
};

async function verifyAndBuild() {
  const finalTracks = [];
  console.log(`Checking ${rawItems.length} items...`);

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    let folder = folderCorrections[item.folder] || item.folder;
    let file = fileCorrections[item.file] || item.file;

    // Build URL candidates
    const candidates = [
      `https://pub-e61f6969a7e54904b6e2de540add8d0a.r2.dev/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`,
      `https://pub-e61f6969a7e54904b6e2de540add8d0a.r2.dev/${encodeURIComponent(item.folder)}/${encodeURIComponent(item.file)}`,
      `https://pub-e61f6969a7e54904b6e2de540add8d0a.r2.dev/${encodeURIComponent(item.rawFolder)}/${encodeURIComponent(item.rawFile)}`
    ];

    let foundUrl = null;
    let matchedFolder = folder;
    let matchedFile = file;

    for (const url of candidates) {
      try {
        const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(2500) });
        if (res.status === 200) {
          foundUrl = url;
          break;
        }
      } catch (e) {}
    }

    if (foundUrl) {
      finalTracks.push({
        index: i + 1,
        folder: matchedFolder,
        file: matchedFile,
        audioUrl: foundUrl
      });
    } else {
      console.log('Missed:', item.folder, '::', item.file);
    }
  }

  console.log(`\nSuccessfully verified ${finalTracks.length} / ${rawItems.length} tracks with 200 OK!`);
  fs.writeFileSync('scripts/verified_200_tracks.json', JSON.stringify(finalTracks, null, 2));
}

verifyAndBuild();
