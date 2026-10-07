import fs from 'fs';

const verified = JSON.parse(fs.readFileSync('scripts/verified_200_tracks.json', 'utf8'));

// High quality rustic / sertanejo covers for variety
const covers = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
];

function cleanTitleAndArtist(folder, file) {
  // Check if multiple songs in folder or special DJ folder
  const isSpecial = 
    folder.includes('DJ IAGO BALA') ||
    folder.includes('Marco Brasil') ||
    folder.includes('Do Mundo Nada se Leva') ||
    folder.includes('Mulheres do Brasil') ||
    folder.includes('Pagode de Viola') ||
    folder === 'Di Paullo & Paulino' ||
    folder.includes('Reis do Rodeio');

  if (isSpecial) {
    // Extract title from filename
    let cleanFile = file
      .replace(/^0\d\s*-\s*/, '')
      .replace(/\(M4A_128K\)/gi, '')
      .replace(/\.mp3/gi, '')
      .replace(/Topic\s*-\s*/gi, '')
      .trim();

    if (folder.includes('DJ IAGO BALA')) {
      return {
        title: 'Faça já seu CD Personalizado (Mega Mix)',
        artist: 'DJ Iago Bala ft. Milionário & José Rico'
      };
    }
    if (folder.includes('Marco Brasil')) {
      if (cleanFile.includes('Caçador')) {
        return { title: 'Caçador de Corações / Debaixo da Água', artist: 'Marco Brasil' };
      } else {
        return { title: 'Do Outro Lado da Cidade / Garanhão', artist: 'Marco Brasil' };
      }
    }
    if (folder.includes('Do Mundo Nada se Leva')) {
      if (cleanFile.includes('Vá Pro Inferno')) {
        return { title: 'Vá Pro Inferno Com Seu Amor / Galopeira', artist: 'Edson & Hudson' };
      } else {
        return { title: 'Do Mundo Nada Se Leva (Ao Vivo)', artist: 'Edson & Hudson' };
      }
    }
    if (folder.includes('Mulheres do Brasil')) {
      if (cleanFile.includes('Século')) {
        return { title: 'Um Século Sem Ti', artist: 'Matogrosso & Mathias' };
      } else {
        return { title: 'Mulheres Do Brasil', artist: 'Matogrosso & Mathias' };
      }
    }
    if (folder.includes('Pagode de Viola')) {
      if (cleanFile.includes('Defendendo')) {
        return { title: 'Defendendo a Tradição', artist: 'Mayck & Lyan' };
      } else {
        return { title: 'Pagode / Linha De Frente / Chora Viola', artist: 'Mayck & Lyan' };
      }
    }
    if (folder.includes('Reis do Rodeio')) {
      return { title: '60 Dias Apaixonado', artist: 'Chitãozinho & Xororó' };
    }
    if (folder === 'Di Paullo & Paulino') {
      return { title: 'Avião das Nove', artist: 'Di Paullo & Paulino' };
    }
  }

  // Standard case: Title - Artist from folder name!
  if (folder.includes(' - ')) {
    const parts = folder.split(' - ');
    const title = parts[0].trim();
    const artist = parts.slice(1).join(' - ').replace(/\s+part\.\s+/i, ' feat. ').trim();
    return { title, artist };
  }

  return { title: folder, artist: 'Sertanejo Raiz' };
}

function getStationAndGenre(artist, title) {
  const text = (artist + ' ' + title).toLowerCase();
  if (text.includes('tião carreiro') || text.includes('viola') || text.includes('pagode')) {
    return { stationId: 'station-viola', genre: 'Moda de Viola' };
  }
  if (text.includes('boteco') || text.includes('beber') || text.includes('trio parada dura') || text.includes('barrerito') || text.includes('copo') || text.includes('bares')) {
    return { stationId: 'station-boteco', genre: 'Modão de Boteco' };
  }
  if (text.includes('estrada') || text.includes('milionário') || text.includes('rodeio') || text.includes('peão') || text.includes('boiadeiro')) {
    return { stationId: 'station-estrada', genre: 'Modão de Estrada' };
  }
  if (text.includes('romântico') || text.includes('amor') || text.includes('zezé') || text.includes('leandro e leonardo') || text.includes('chrystian')) {
    return { stationId: 'station-romantico', genre: 'Sertanejo Romântico' };
  }
  return { stationId: 'station-classicos', genre: 'Clássicos Sertanejos' };
}

const tracksCode = verified.map((item, idx) => {
  const { title, artist } = cleanTitleAndArtist(item.folder, item.file);
  const { stationId, genre } = getStationAndGenre(artist, title);
  const coverUrl = covers[idx % covers.length];
  const artistSlug = artist.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `track-${idx + 1}`;

  return `  {
    id: '${id}',
    title: ${JSON.stringify(title)},
    artist: ${JSON.stringify(artist)},
    artistId: 'artist-${artistSlug}',
    duration: 215,
    durationFormatted: '03:35',
    coverUrl: '${coverUrl}',
    audioUrl: ${JSON.stringify(item.audioUrl)},
    stationId: '${stationId}',
    genre: '${genre}',
    year: 1980 + (${idx} % 30),
    bpm: 95 + (${idx} % 25),
    musicalKey: ['A', 'D', 'E', 'G', 'C'][${idx} % 5],
  }`;
}).join(',\n');

const fullFile = `import { Track } from '../types';

export const TRACKS: Track[] = [
${tracksCode}
];

export const ALL_TRACKS: Track[] = TRACKS;
`;

fs.writeFileSync('src/data/tracks.ts', fullFile);
console.log(`Generated src/data/tracks.ts with ${verified.length} tracks!`);
