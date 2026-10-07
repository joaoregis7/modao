import { Track } from '../types';

/**
 * Normaliza strings para busca insensível a maiúsculas/minúsculas,
 * acentos gráficos (á, é, í, ó, ú, â, ê, ô, ã, õ, ç, etc.) e caracteres especiais.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentuação
    .replace(/[^\w\s]/gi, ' ') // remove pontuações como traços, aspas, etc.
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Distância de Damerau-Levenshtein simples para tolerância de digitação
 * (permite inserções, remoções, substituições e inversões de 2 letras).
 */
function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const d: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // remoção
        d[i][j - 1] + 1, // inserção
        d[i - 1][j - 1] + cost // substituição
      );

      // Transposição adjacente
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}

/**
 * Verifica se um token de busca confere com alguma palavra do texto alvo
 * considerando prefixo, sufixo e distância de edição (erros de digitação).
 */
function tokenMatchesWords(queryToken: string, targetWords: string[]): boolean {
  if (queryToken.length <= 1) {
    return targetWords.some(w => w.startsWith(queryToken));
  }

  for (const tWord of targetWords) {
    // Igualdade ou prefixo
    if (tWord === queryToken || tWord.startsWith(queryToken) || queryToken.startsWith(tWord)) {
      return true;
    }

    // Substring direta
    if (tWord.includes(queryToken) || (queryToken.length >= 4 && queryToken.includes(tWord))) {
      return true;
    }

    // Tolerância a erros de digitação (1 erro para palavras pequenas, 2 para maiores)
    const maxEdits = queryToken.length <= 4 ? 1 : 2;
    if (Math.abs(tWord.length - queryToken.length) <= maxEdits) {
      if (damerauLevenshtein(queryToken, tWord) <= maxEdits) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Avalia se uma faixa musical corresponde à busca digitada pelo usuário,
 * tolerando ausência de acentos, pontuação, troca de letras e palavras em ordem diferente.
 */
export function matchesSearchQuery(track: Track, query: string): boolean {
  const normQuery = normalizeText(query);
  if (!normQuery) return true;

  const normTitle = normalizeText(track.title);
  const normArtist = normalizeText(track.artist);
  const normGenre = normalizeText(track.genre || '');
  const combined = `${normTitle} ${normArtist} ${normGenre}`;

  // 1. Verificação direta de substring contínua
  if (combined.includes(normQuery)) {
    return true;
  }

  // 2. Verificação de todas as palavras da consulta
  const queryTokens = normQuery.split(' ').filter(t => t.length > 0);
  const targetWords = combined.split(' ').filter(t => t.length > 0);

  // Cada palavra digitada pelo usuário deve casar com ao menos um termo do modão
  const allTokensMatch = queryTokens.every(qToken => {
    // Se for uma preposição comum, pode ser mais flexível
    if (['de', 'da', 'do', 'e', 'em'].includes(qToken)) {
      return true;
    }
    return tokenMatchesWords(qToken, targetWords);
  });

  return allTokensMatch;
}

/**
 * Categorias de filtro generosas para garantir que sempre haja um catálogo
 * rico de músicas em cada seção selecionada pelo ouvinte.
 */
export const GENRE_FILTERS = [
  { id: 'all', label: 'Todos os Modões' },
  { id: 'Modão Raiz', label: 'Modão Raiz' },
  { id: 'Moda de Viola', label: 'Moda de Viola' },
  { id: 'Modão de Boteco', label: 'Modão de Boteco' },
  { id: 'Modão de Estrada', label: 'Modão de Estrada' },
  { id: 'Sofrência das Antigas', label: 'Sofrência das Antigas' },
  { id: 'Românticas', label: 'Românticas' },
  { id: 'Clássicos Sertanejos', label: 'Clássicos Sertanejos' },
  { id: 'Rodeio & Peão', label: 'Rodeio & Peão' },
] as const;

export type GenreFilterId = (typeof GENRE_FILTERS)[number]['id'];

/**
 * Classificação generosa de gênero: se a música se encaixa ou conversa
 * com o tema do filtro, ela é exibida para proporcionar uma experiência farta.
 */
export function matchesGenreFilter(track: Track, filter: string): boolean {
  if (!filter || filter === 'all') return true;

  const tTitle = normalizeText(track.title);
  const tArtist = normalizeText(track.artist);
  const tGenre = normalizeText(track.genre || '');

  switch (filter) {
    case 'Modão Raiz':
      return (
        tGenre.includes('raiz') ||
        tGenre.includes('viola') ||
        tGenre.includes('classicos') ||
        [
          'tiao carreiro',
          'milionario',
          'trio parada dura',
          'goiano',
          'gino e geno',
          'cezar e paulinho',
          'barrerito',
          'menajao',
          'dombar',
          'chico rey',
          'teodoro',
        ].some(a => tArtist.includes(a))
      );

    case 'Moda de Viola':
      return (
        tGenre.includes('viola') ||
        tGenre.includes('raiz') ||
        ['tiao carreiro', 'goiano', 'menajao', 'pardinho', 'dombar'].some(a =>
          tArtist.includes(a)
        ) ||
        [
          'viola',
          'pagode',
          'boi',
          'carreiro',
          'sertao',
          'terra',
          'boiadeiro',
          'caboclo',
          'peao',
          'mineiro',
        ].some(w => tTitle.includes(w))
      );

    case 'Modão de Boteco':
      return (
        tGenre.includes('boteco') ||
        [
          'bruno e marrone',
          'eduardo costa',
          'gino e geno',
          'trio parada dura',
          'gargantas de ouro',
          'teodoro',
        ].some(a => tArtist.includes(a)) ||
        [
          'boate',
          'pinga',
          'bar',
          'boteco',
          'cerveja',
          'copo',
          'mesa',
          'bebida',
          'garcom',
          'porrada',
          'saudade',
          'bebendo',
          'dose',
        ].some(w => tTitle.includes(w))
      );

    case 'Modão de Estrada':
      return (
        tGenre.includes('estrada') ||
        ['menajao', 'tiao carreiro', 'goiano', 'cezar e paulinho', 'rick e renner'].some(
          a => tArtist.includes(a)
        ) ||
        [
          'estrada',
          'caminho',
          'viagem',
          'caminhao',
          'barretos',
          'madrugada',
          'noite',
          'saudade',
          'volta',
          'distancia',
          'rodovia',
          'destino',
        ].some(w => tTitle.includes(w))
      );

    case 'Sofrência das Antigas':
      return (
        tGenre.includes('sofrencia') ||
        [
          'di paulo',
          'chico rey',
          'chrystian',
          'joao mineiro',
          'barrerito',
          'rionegro',
          'ataide',
        ].some(a => tArtist.includes(a)) ||
        [
          'saudade',
          'lembranca',
          'lagrima',
          'choro',
          'adeus',
          'solidao',
          'dor',
          'arrependida',
          'recado',
          'renuncia',
          'sozinho',
          'perdao',
        ].some(w => tTitle.includes(w))
      );

    case 'Românticas':
      return (
        tGenre.includes('romantico') ||
        [
          'zeze di camargo',
          'leandro e leonardo',
          'joao paulo e daniel',
          'rick e renner',
          'chrystian',
          'jayne',
          'eduardo costa',
        ].some(a => tArtist.includes(a)) ||
        [
          'amor',
          'te amo',
          'paixao',
          'beijo',
          'anjo',
          'flor',
          'linda',
          'coracao',
          'menina',
          'mulher',
          'sonho',
          'declaracao',
        ].some(w => tTitle.includes(w))
      );

    case 'Clássicos Sertanejos':
      return (
        tGenre.includes('classicos') ||
        [
          'chitaozinho',
          'milionario',
          'leandro e leonardo',
          'trio parada dura',
          'zeze di camargo',
          'bruno e marrone',
          'chrystian e ralf',
          'joao mineiro',
        ].some(a => tArtist.includes(a))
      );

    case 'Rodeio & Peão':
      return (
        tGenre.includes('rodeio') ||
        ['marco brasil', 'menajao', 'goiano', 'tiao carreiro', 'rionegro'].some(a =>
          tArtist.includes(a)
        ) ||
        [
          'barretos',
          'peao',
          'rodeio',
          'arena',
          'boiadeiro',
          'muladeiro',
          'touro',
          'berrante',
          'locucao',
          'festa',
        ].some(w => tTitle.includes(w))
      );

    default:
      return true;
  }
}
