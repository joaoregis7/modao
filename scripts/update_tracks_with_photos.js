import fs from 'fs';

const verifiedWithPhotos = JSON.parse(fs.readFileSync('scripts/tracks_with_photos.json', 'utf8'));

function cleanTitleAndArtist(folder, file) {
  const isSpecial = 
    folder.includes('DJ IAGO BALA') ||
    folder.includes('Marco Brasil') ||
    folder.includes('Do Mundo Nada se Leva') ||
    folder.includes('Mulheres do Brasil') ||
    folder.includes('Pagode de Viola') ||
    folder === 'Di Paullo & Paulino' ||
    folder.includes('Reis do Rodeio');

  if (isSpecial) {
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

const tracksCode = verifiedWithPhotos.map((item, idx) => {
  const { title, artist } = cleanTitleAndArtist(item.folder, item.file);
  const { stationId, genre } = getStationAndGenre(artist, title);
  
  // If Empreitada Perigosa, use Tião Carreiro cover
  let coverUrl = item.coverUrl;
  if (!item.hasCustomCover && item.folder.includes('Empreitada Perigosa')) {
    coverUrl = 'https://pub-e61f6969a7e54904b6e2de540add8d0a.r2.dev/Ara%20Po%20-%20Ti%C3%A3o%20Carreiro%20e%20Pardinho/images.jpg';
  }

  const artistSlug = artist.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `track-${idx + 1}`;

  return `  {
    id: '${id}',
    title: ${JSON.stringify(title)},
    artist: ${JSON.stringify(artist)},
    artistId: 'artist-${artistSlug}',
    duration: 215,
    durationFormatted: '03:35',
    coverUrl: ${JSON.stringify(coverUrl)},
    audioUrl: ${JSON.stringify(item.audioUrl)},
    stationId: '${stationId}',
    genre: '${genre}',
    year: 1980 + (${idx} % 30),
    bpm: 95 + (${idx} % 25),
    musicalKey: ['A', 'D', 'E', 'G', 'C'][${idx} % 5],
  }`;
}).join(',\n');

const fullFile = `import { Track } from '../types/index';

export const TRACKS: Track[] = [
${tracksCode}
];

export const ALL_TRACKS: Track[] = TRACKS;
`;

fs.writeFileSync('src/data/tracks.ts', fullFile);
console.log(`Updated src/data/tracks.ts with ${verifiedWithPhotos.length} tracks and real custom photos from R2!`);
