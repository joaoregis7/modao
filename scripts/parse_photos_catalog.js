import fs from 'fs';

const rawPhotos = `
C:\\Users\\Na‡ao digital\\Music\\A Saudade ‚ Uma Pedra - Zez‚ di Camargo e Luciano\\A Saudade ‚ Uma Pedra - Zez‚ di Camargo e Luciano.jpg
C:\\Users\\Na‡ao digital\\Music\\Aline - JoÆo Mineiro e Marciano\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Altha¡r & Alexandre - Ata¡de e Alexandre em Vit¢ria-ES (Ao Vivo)\\ab67616d0000b27368d55b4a919741c603affd2c.jpg
C:\\Users\\Na‡ao digital\\Music\\Amaremos - Barrerito\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Amaremos Acapella - Barrerito\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Amor Selvagem - Zez‚ di Camargo e Luciano\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Anjo Loiro - Milion rio e Jos‚ Rico\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Ara Po - TiÆo Carreiro e Pardinho\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Arrependida - Gino e Geno\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Barco de Papel - Trio Parada Dura\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Bate Cora‡Æo - Leandro e Leonardo\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Beijo do Adeus Sublime Ren£ncia - Di Paulo e Paulino\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Blusa vermelha - Trio Parada Dura\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Boate Azul - Bruno e Marrone\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Cada Volta  Um Recome‡o - Zez‚ Di Camargo e Luciano\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Can‡Æo da Madrugada - Dombar e Domzete\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Chico Rey & Panar  - Topic - Chico Rey & Panar \\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Chico Rey & Paran  - Chico Rey & Paran  (ao Vivo)\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Chrystian & Ralf - Sozinho em Nova York\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Dei A Ela Minha Vida - Zez‚ di Camargo e Luciano\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Deixe Seu Recado - Gino e Geno\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Di Paullo & Paulino\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\DJ IAGO BALA\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Do Mundo Nada se Leva - Edson & Hudson\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Duas Vezes Vocˆ - Cezar e Paulinho\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Ela ‚ Demais - Rick e Renner\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Escolta de Vagalumes - Rick e Renner\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Essa Noite Como Lembran‡a - JoÆo Mineiro e Marciano\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Estrela de Ouro - Gino e Geno\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Eu Disse NÆo Como Lembran‡a - Di Paulo e Paulino\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Eu J  Fui de Vocˆ - Gino e Geno\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Eu te Amo - Zez‚ di Camargo e Luciano\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Faz Mais Uma Vez - Zez‚ di Camargo e Luciano\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Faz um Ano - Milion rio e Jos‚ Rico\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Filho da Liberdade - TiÆo Carreiro e Pardinho\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Fio de Cabelo - ChitÆozinho e Xoror¢\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Flor do Meu SertÆo - Leonardo\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Fui Dando Porrada - Leandro e Leonardo\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Goiano, Paranaense - Goiano & Paranaense, Vol. 1\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Goiano, Paranaense - O Poder do Criador, Vol. 4\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Guilherme & Santiago - Ac£stico 20 anos\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Henrique & Hernane - Topic - Henrique & Hernane - Topic\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Hoje Eu Quero Te Amar - Zez‚ di Camargo e Luciano\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\IrmÆo da Lua, Amigo das Estrelas - Zez‚ di Camargo e Luciano\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Jayne\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Jeito Caipira - Gino e Geno\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Jogo do Amor - Milion rio e Jos‚ Rico\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\J  Tem Algu‚m No Seu Lugar - Os Gargantas de Ouro\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Linda Demais - Eduardo Costa\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\L grimas Geladas - Rionegro e Solimäes\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Marciano - Meu Oficio  Cantar (Ao Vivo)\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Marco Brasil\\images ca‡ador de coracoes.jpg
C:\\Users\\Na‡ao digital\\Music\\Marco Brasil\\images do outro lado da cidade.jpg
C:\\Users\\Na‡ao digital\\Music\\Me Apaixonei - Eduardo Costa\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Melhor ou Pior - Eduardo Costa\\melhor.jpg
C:\\Users\\Na‡ao digital\\Music\\Menina - Bruno e Marrone\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Meu Cora‡Æo S¢ Quer Chorar - Zez‚ di Camargo e Luciano\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Meu SertÆo - Jad e Jefferson\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Minha Mensagem - JoÆo Paulo e Daniel\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Minha Serenata - Chico Rey e Paran \\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Minha Vida - TiÆo Carreiro e Pardinho\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Morena Bonita - Gino e Geno\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Morto de Saudade - Cezar e Paulinho\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Morto por Dentro - Barrerito\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Mulheres do Brasil - Mato Grosso e Mathias\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Mulheres do Brasil - Mato Grosso e Mathias\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Nada Mudou - Di Paullo e Paulino\\images (2).jpg
C:\\Users\\Na‡ao digital\\Music\\Nem ‚ Bom Lembrar - Zez‚ di Camargo e Luciano\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\No C‚u dos Bra‡os Seus - Di Paullo e Paulino\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Nois Enverga Mas NÆo Quebra - Gino e Geno\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Nos Bares da Cidade - Rick e Renner\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Oh TiÆo Carreiro - L‚o Goiano & Rafael\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Olhos Claros - JoÆo Paulo e Daniel\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Onde Anda Meu Amor - L‚o MagalhÆes\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Onde Anda Vocˆ - Di Paullo e Paulino\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Pagode de Viola - Mayck e Lyan\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\PaixÆo Recolhida - Solevano e Solene\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Passe Livre - Teodoro e Sampaio\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Pela Porta da Frente - Bruno e Marrone\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Pelejando - Rick e Renner part. Gino e Geno\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\PeÆo Paulista - Tangar  e PavÆo Norte\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Por Amor te Deixo Ir - Zez‚ di Camargo e Luciano\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Pra NÆo Pensar Em Vocˆ - Zez‚ di Camargo e Luciano\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Pra Salvar Minha Vida - Gino e Geno\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\P‚ na Bunda - Trio Parada Dura\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Quando Um Grande Amor se Faz - Gian e Giovani\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Que Bicho Que  - Gino e Geno\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Quem  - Leandro e Leonardo\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Quero Falar com Ela - Rick e Renner\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Reis do Rodeio\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Rumo a Barretos - MenajÆo Muladeiro\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Saudade Bandida - Zez‚ di Camargo e Luciano\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Saudade da Minha Terra - ChitÆozinho e Xoror¢\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Se Eu NÆo Puder te Esquecer - JoÆo Mineiro e Marciano\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Ser  Que foi Saudade - Zez‚ di Camargo e Luciano\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Sessenta Dias Apaixonado - Milion rio e Jos‚ Rico\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Seus Olhos - Zez‚ di Camargo e Luciano\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Sistema Caipira - Gino e Geno e Continental\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\SolidÆo Por Perto - Eduardo Costa\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Sonho Por Sonho - Leandro e Leonardo\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Sublime Ren£ncia - Leandro e Leonardo\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\S¢ d  Vocˆ na Minha Vida - JoÆo Paulo e Daniel\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Te Amo Demais - Leonardo\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Telefone Mudo - Trio Parada Dura\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Tempo ao Tempo - Di Paullo e Paulino\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Temporal de Amor - Leandro e Leonardo\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\TiÆo Carreiro & Pardinho - Modas Sertanejas\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Toalha Branca - Gino e Geno\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Tocando em Frente - Paula Fernandes Part. Leonardo\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Trˆs Cuiabanas - TiÆo Carreiro e Pardinho\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\T“ Ficando - Gino e Geno\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Um Degrau Na Escada - Chico Rey e Paran \\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Um sonhador - NÆo olhe assim - ChitÆozinho e Xoror¢ Part. Leonardo\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Us Mininus da Precu ria\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Viva a Vida - Milion rio e Jos‚ Rico\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Voando Sem Asas - Zez‚ di Camargo e Luciano\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Voce ‚ tudo que pedi pra Deus - Cezar e Paulinho\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\Vontade Dividida - Milion rio e Jos‚ Rico\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\Vou Beber de Novo - Renan e Ray\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\ o Amor - Zez‚ di Camargo e Luciano\\images (1).jpg
C:\\Users\\Na‡ao digital\\Music\\?DJ Ledie\\images.jpg
C:\\Users\\Na‡ao digital\\Music\\?NOSSO BUTECO - XandyDJ Produ‡äes\\images.jpg
`;

function fixCp850(str) {
  if (!str) return '';
  return str
    .replace(/‚/g, 'é')
    .replace(/ /g, 'á')
    .replace(/¡/g, 'í')
    .replace(/¢/g, 'ó')
    .replace(/£/g, 'ú')
    .replace(/Æ/g, 'ã')
    .replace(/ä/g, 'õ')
    .replace(/‡/g, 'ç')
    .replace(/ˆ/g, 'ê')
    .replace(/“/g, 'ô')
    .replace(/µ/g, 'Á')
    .replace(/Ç/g, 'Ã')
    .replace(/\?/g, '');
}

const folderCorrections = {
  'Cada Volta  Um Recomeço - Zezé Di Camargo e Luciano': 'Cada Volta É Um Recomeço - Zezé Di Camargo e Luciano',
  'Marciano - Meu Oficio  Cantar (Ao Vivo)': 'Marciano - Meu Oficio É Cantar (Ao Vivo)',
  'Que Bicho Que  - Gino e Geno': 'Que Bicho Que É - Gino e Geno',
  'Quem  - Leandro e Leonardo': 'Quem É - Leandro e Leonardo',
  'o Amor - Zezé di Camargo e Luciano': 'É o Amor - Zezé di Camargo e Luciano',
  'Um Degrau Na Escada - Chico Rey e Paraná': 'Um Degrau Na Escada - Chico Rey e Paraná',
  'Voce é tudo que pedi pra Deus - Cezar e Paulinho': 'Voce é tudo que pedi pra Deus - Cezar e Paulinho'
};

const lines = rawPhotos.split('\n').map(l => l.trim()).filter(l => l.endsWith('.jpg') || l.endsWith('.png'));

const photoMap = {};

for (const line of lines) {
  const parts = line.split('\\');
  // parts: [C:, Users, Nacao digital, Music, Folder, File]
  if (parts.length >= 6) {
    const rawFolder = parts[4];
    const rawFile = parts[5];
    let folder = fixCp850(rawFolder).trim();
    folder = folderCorrections[folder] || folder;
    const file = fixCp850(rawFile).trim();

    photoMap[folder] = photoMap[folder] || [];
    photoMap[folder].push({ file, rawFile, rawFolder, line });
  }
}

fs.writeFileSync('scripts/parsed_photos.json', JSON.stringify(photoMap, null, 2));
console.log('Parsed photo folders:', Object.keys(photoMap).length);
