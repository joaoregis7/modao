import fs from 'fs';

const raw = `C:\\Users\\Na‡ao digital\\Music\\A Saudade ‚ Uma Pedra - Zez‚ di Camargo e Luciano\\00 - A Saudade ‚ Uma Pedra - lv_0_20260403173513.mp3
C:\\Users\\Na‡ao digital\\Music\\Aline - JoÆo Mineiro e Marciano\\00 - Aline - JoÆo Mineiro e Marciano.mp3
C:\\Users\\Na‡ao digital\\Music\\Altha¡r & Alexandre - Ata¡de e Alexandre em Vit¢ria-ES (Ao Vivo)\\00 - Altha¡r & Alexandre - La‡o Aberto (Ao Vivo)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Amaremos - Barrerito\\00 - Amaremos - amaremos.mp3
C:\\Users\\Na‡ao digital\\Music\\Amaremos Acapella - Barrerito\\00 - Amaremos Acapella - amaremosacapella.mp3
C:\\Users\\Na‡ao digital\\Music\\Amor Selvagem - Zez‚ di Camargo e Luciano\\00 - Amor Selvagem - lv_0_20260403162554.mp3
C:\\Users\\Na‡ao digital\\Music\\Anjo Loiro - Milion rio e Jos‚ Rico\\00 - Anjo Loiro - anjoloiro.mp3.mp3
C:\\Users\\Na‡ao digital\\Music\\Ara Po - TiÆo Carreiro e Pardinho\\00 - Ara po - arapo.mp3.mp3
C:\\Users\\Na‡ao digital\\Music\\Arrependida - Gino e Geno\\00 - Arrependida - lv_0_20260403161855.mp3
C:\\Users\\Na‡ao digital\\Music\\Barco de Papel - Trio Parada Dura\\00 - Barco de Papel - lv_0_20260403163637.mp3
C:\\Users\\Na‡ao digital\\Music\\Bate Cora‡Æo - Leandro e Leonardo\\00 - Bate cora‡Æo - lv_0_20260403172741.mp3
C:\\Users\\Na‡ao digital\\Music\\Beijo do Adeus Sublime Ren£ncia - Di Paulo e Paulino\\00 - Beijo do adeus sublime ren£ncia - beijodoadeus.mp3
C:\\Users\\Na‡ao digital\\Music\\Blusa vermelha - Trio Parada Dura\\00 - Blusa vermelha - lv_0_20260403154917.mp3
C:\\Users\\Na‡ao digital\\Music\\Boate Azul - Bruno e Marrone\\00 - Boate Azul - boateazul.mp3
C:\\Users\\Na‡ao digital\\Music\\Cada Volta  Um Recome‡o - Zez‚ Di Camargo e Luciano\\00 - Cada volta ‚ um recome‡o - cadavoltaeumrecomeco.mp3.mp3
C:\\Users\\Na‡ao digital\\Music\\Can‡Æo da Madrugada - Dombar e Domzete\\00 - Can‡Æo da madrugada - cancaodamadrugada.mp3
C:\\Users\\Na‡ao digital\\Music\\Chico Rey & Panar  - Topic - Chico Rey & Panar \\00 - Chico Rey & Panar  - Topic - Canarinho Prisioneiro _ O N£mero UM (Verso)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Chico Rey & Paran  - Chico Rey & Paran  (ao Vivo)\\00 - Chico Rey & Paran  - PaixÆo Proibida (Ao Vivo)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Chrystian & Ralf - Sozinho em Nova York\\00 - Chrystian & Ralf - De cara cheia(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Dei A Ela Minha Vida - Zez‚ di Camargo e Luciano\\00 - Dei a ela minha vida - lv_0_20260403160641.mp3
C:\\Users\\Na‡ao digital\\Music\\Deixe Seu Recado - Gino e Geno\\00 - Deixe seu recado - Gino e Geno .mp3
C:\\Users\\Na‡ao digital\\Music\\Di Paullo & Paulino\\00 - Di Paullo & Paulino - Topic - Aviao Das Nove(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\DJ IAGO BALA\\00 - DJ IAGO BALA - Fa‡a j  seu CD Personalizado. Contato WhatsApp (65)99605-0637 - Milion rio e Jos‚ Rico.mp3
C:\\Users\\Na‡ao digital\\Music\\Do Mundo Nada se Leva - Edson & Hudson\\00 - Edson & Hudson - Topic - Do Mundo Nada Se Leva (Ao Vivo)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Do Mundo Nada se Leva - Edson & Hudson\\00 - Edson & Hudson - Topic - V  Pro Inferno Com Seu Amor _ Galopeira (Galopera) (Ao Vivo)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Duas Vezes Vocˆ - Cezar e Paulinho\\00 - Duas vezes voce - duasvezesvoce.mp3
C:\\Users\\Na‡ao digital\\Music\\Ela ‚ Demais - Rick e Renner\\00 - Ela ‚ demais - Rick e Renner.mp3
C:\\Users\\Na‡ao digital\\Music\\Empreitada Perigosa - TiÆo Carreiro e Pardinho\\00 - Empreitada Perigosa - TiÆo Carreiro e Pardinho.mp3
C:\\Users\\Na‡ao digital\\Music\\Escolta de Vagalumes - Rick e Renner\\00 - Escolta de Vagalumes - lv_0_20260403104318.mp3
C:\\Users\\Na‡ao digital\\Music\\Essa Noite Como Lembran‡a - JoÆo Mineiro e Marciano\\00 - Essa noite como lembran‡a - essa noite como lembran‡a.mp3.mp3
C:\\Users\\Na‡ao digital\\Music\\Estrela de Ouro - Gino e Geno\\00 - Estrela de Ouro - lv_0_20260403163202.mp3
C:\\Users\\Na‡ao digital\\Music\\Eu Disse NÆo Como Lembran‡a - Di Paulo e Paulino\\00 - Eu disse nÆo   Como lembran‡a - eudissenao.mp3
C:\\Users\\Na‡ao digital\\Music\\Eu J  Fui de Vocˆ - Gino e Geno\\00 - Eu j  fui de vocˆ - Gino e Geno.mp3
C:\\Users\\Na‡ao digital\\Music\\Eu te Amo - Zez‚ di Camargo e Luciano\\00 - Eu te amo - lv_0_20260403112207.mp3
C:\\Users\\Na‡ao digital\\Music\\Faz Mais Uma Vez - Zez‚ di Camargo e Luciano\\00 - Faz mais uma vez - fazmaisumavezcomigo.mp3
C:\\Users\\Na‡ao digital\\Music\\Faz um Ano - Milion rio e Jos‚ Rico\\00 - Faz um ano - fazumano.mp3
C:\\Users\\Na‡ao digital\\Music\\Filho da Liberdade - TiÆo Carreiro e Pardinho\\00 - Filho da Liberdade - TiÆo Carreiro e Pardinho.mp3
C:\\Users\\Na‡ao digital\\Music\\Fio de Cabelo - ChitÆozinho e Xoror¢\\00 - Fio de Cabelo - fiodecabelo.mp3
C:\\Users\\Na‡ao digital\\Music\\Flor do Meu SertÆo - Leonardo\\00 - Flor do Meu SertÆo - Leonardo .mp3
C:\\Users\\Na‡ao digital\\Music\\Fui Dando Porrada - Leandro e Leonardo\\00 - Fui dando porrada - lv_0_20260403110330.mp3
C:\\Users\\Na‡ao digital\\Music\\Goiano, Paranaense - Goiano & Paranaense, Vol. 1\\00 - Goiano, Paranaense - BailÆo do Marco Brasil - ( Goiano e Paranaense ) - A Viola e a Saudade(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Goiano, Paranaense - O Poder do Criador, Vol. 4\\00 - Goiano, Paranaense - O Poder do Criador(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Guilherme & Santiago - Ac£stico 20 anos\\00 - Guilherme & Santiago - Franguinho Na Panela(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Henrique & Hernane - Topic - Henrique & Hernane - Topic\\00 - Henrique & Hernane - Topic - Aguenta Cora‡Æo _ Apaixonado(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Hoje Eu Quero Te Amar - Zez‚ di Camargo e Luciano\\00 - Hoje eu quero te amar - lv_0_20260403165217.mp3
C:\\Users\\Na‡ao digital\\Music\\IrmÆo da Lua, Amigo das Estrelas - Zez‚ di Camargo e Luciano\\00 - IrmÆo da Lua, Amigo das estrelas - Zez‚ di Camargo e Luciano.mp3
C:\\Users\\Na‡ao digital\\Music\\Jayne\\00 - Jayne - Topic - Dia de Formatura _Loira se vocˆ soubesse (Verso)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Jeito Caipira - Gino e Geno\\00 - Jeito caipira - jeitocaipira.mp3
C:\\Users\\Na‡ao digital\\Music\\Jogo do Amor - Milion rio e Jos‚ Rico\\00 - Jogo do Amor - Milion rio e Jos‚ Rico.mp3
C:\\Users\\Na‡ao digital\\Music\\J  Tem Algu‚m No Seu Lugar - Os Gargantas de Ouro\\00 - J  tem algu‚m no seu lugar - jatemalguemnoseulugarsomodaoedits.mp3
C:\\Users\\Na‡ao digital\\Music\\Linda Demais - Eduardo Costa\\00 - Linda Demais - Eduardo Costa.mp3
C:\\Users\\Na‡ao digital\\Music\\L grimas Geladas - Rionegro e Solimäes\\00 - L grimas geladas - lv_0_20260403133244.mp3
C:\\Users\\Na‡ao digital\\Music\\Marciano - Meu Oficio  Cantar (Ao Vivo)\\00 - Marciano - Amor Clandestino (Ao Vivo)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Marco Brasil\\00 - Marco Brasil - Topic - Ca‡ador de Cora‡äes _ Debaixo da µgua (Verso)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Marco Brasil\\00 - Marco Brasil - Topic - Do Outro Lado da Cidade _ GaranhÆo (Verso)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Me Apaixonei - Eduardo Costa\\00 - Me Apaixonei - lv_0_20260403172405.mp3
C:\\Users\\Na‡ao digital\\Music\\Melhor ou Pior - Eduardo Costa\\00 - Melhor ou pior - melhoroupior.mp3
C:\\Users\\Na‡ao digital\\Music\\Menina - Bruno e Marrone\\00 - Menina - lv_0_20260403111745.mp3
C:\\Users\\Na‡ao digital\\Music\\Meu Cora‡Æo S¢ Quer Chorar - Zez‚ di Camargo e Luciano\\00 - Meu cora‡Æo s¢ quer chorar - lv_0_20260403155721.mp3
C:\\Users\\Na‡ao digital\\Music\\Meu SertÆo - Jad e Jefferson\\00 - Meu sertÆo - Jad e Jefferson.mp3
C:\\Users\\Na‡ao digital\\Music\\Minha Mensagem - JoÆo Paulo e Daniel\\00 - Minha Mensagem - JoÆo Paulo e Daniel.mp3
C:\\Users\\Na‡ao digital\\Music\\Minha Serenata - Chico Rey e Paran \\00 - Minha Serenata - lv_0_20260403173019.mp3
C:\\Users\\Na‡ao digital\\Music\\Minha Vida - TiÆo Carreiro e Pardinho\\00 - Minha Vida - lv_0_20260403084032.mp3
C:\\Users\\Na‡ao digital\\Music\\Morena Bonita - Gino e Geno\\00 - Morena bonita - morenabonita.mp3
C:\\Users\\Na‡ao digital\\Music\\Morto de Saudade - Cezar e Paulinho\\00 - Morto de saudade - mortodesaudadesua.mp3
C:\\Users\\Na‡ao digital\\Music\\Morto por Dentro - Barrerito\\00 - Morto por dentro - mortopordentro.mp3
C:\\Users\\Na‡ao digital\\Music\\Mulheres do Brasil - Mato Grosso e Mathias\\00 - Matogrosso - Topic - Mulheres Do Brasil(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Mulheres do Brasil - Mato Grosso e Mathias\\00 - Matogrosso - Topic - Um S‚culo Sem Ti (Un Siglo Sin Ti)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Nada Mudou - Di Paullo e Paulino\\00 - Nada mudou - Di Paullo e Paulino .mp3
C:\\Users\\Na‡ao digital\\Music\\Nem ‚ Bom Lembrar - Zez‚ di Camargo e Luciano\\00 - Nem ‚ bom lembrar - lv_0_20260403105506.mp3
C:\\Users\\Na‡ao digital\\Music\\No C‚u dos Bra‡os Seus - Di Paullo e Paulino\\00 - No C‚u dos Bra‡os seus - Di Paullo e Paulino .mp3
C:\\Users\\Na‡ao digital\\Music\\Nois Enverga Mas NÆo Quebra - Gino e Geno\\00 - Nois enverga mas nÆo quebra - noisenvergamaisnaoquebra.mp3
C:\\Users\\Na‡ao digital\\Music\\Nos Bares da Cidade - Rick e Renner\\00 - Nos bares da cidade - nosbaresdacidade.mp3
C:\\Users\\Na‡ao digital\\Music\\Oh TiÆo Carreiro - L‚o Goiano & Rafael\\00 - Oh TiÆo Carreiro - L‚o Goiano & Rafael.mp3
C:\\Users\\Na‡ao digital\\Music\\Olhos Claros - JoÆo Paulo e Daniel\\00 - Olhos claros - JoÆo Paulo e Daniel.mp3
C:\\Users\\Na‡ao digital\\Music\\Onde Anda Meu Amor - L‚o MagalhÆes\\00 - Onde anda meu amor - L‚o MagalhÆes .mp3
C:\\Users\\Na‡ao digital\\Music\\Onde Anda Vocˆ - Di Paullo e Paulino\\00 - Onde anda vocˆ - Di Paullo e Paulino .mp3
C:\\Users\\Na‡ao digital\\Music\\Pagode de Viola - Mayck e Lyan\\00 - Mayck & Lyan - Topic - Defendendo A Tradi‡ao(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Pagode de Viola - Mayck e Lyan\\00 - Mayck & Lyan - Topic - Pagode _ Linha De Frente _ Chora Viola (Ao Vivo)(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\PaixÆo Recolhida - Solevano e Solene\\00 - PaixÆo Recolhida - lv_0_20260403182300.mp3
C:\\Users\\Na‡ao digital\\Music\\Passe Livre - Teodoro e Sampaio\\00 - Passe livre - passelivre.mp3
C:\\Users\\Na‡ao digital\\Music\\Pela Porta da Frente - Bruno e Marrone\\00 - Pela porta da frente - Bruno e Marrone .mp3
C:\\Users\\Na‡ao digital\\Music\\Pelejando - Rick e Renner part. Gino e Geno\\00 - Pelejando - lv_0_20260403164353.mp3
C:\\Users\\Na‡ao digital\\Music\\PeÆo Paulista - Tangar  e PavÆo Norte\\00 - PeÆo Paulista - lv_0_20260403101840.mp3
C:\\Users\\Na‡ao digital\\Music\\Por Amor te Deixo Ir - Zez‚ di Camargo e Luciano\\00 - Por amor te deixo ir - lv_0_20260403160324.mp3
C:\\Users\\Na‡ao digital\\Music\\Pra NÆo Pensar Em Vocˆ - Zez‚ di Camargo e Luciano\\00 - Pra NÆo Pensar Em Vocˆ - Zez‚ di Camargo e Luciano.mp3
C:\\Users\\Na‡ao digital\\Music\\Pra Salvar Minha Vida - Gino e Geno\\00 - Pra salvar minha vida - Gino e Geno.mp3
C:\\Users\\Na‡ao digital\\Music\\P‚ na Bunda - Trio Parada Dura\\00 - P‚ na Bunda - Trio Parada Dura .mp3
C:\\Users\\Na‡ao digital\\Music\\Quando Um Grande Amor se Faz - Gian e Giovani\\00 - Quando um grande amor se faz - Gian e Giovani.mp3
C:\\Users\\Na‡ao digital\\Music\\Que Bicho Que  - Gino e Geno\\00 - Que bicho que ‚ - quebichoquee.mp3
C:\\Users\\Na‡ao digital\\Music\\Quem  - Leandro e Leonardo\\00 - Quem ‚ - queme.mp3
C:\\Users\\Na‡ao digital\\Music\\Quero Falar com Ela - Rick e Renner\\00 - Quero falar com ela - Rick e Renner.mp3
C:\\Users\\Na‡ao digital\\Music\\Reis do Rodeio\\03 - ChitÆozinho & Xoror¢ - 60 Dias Apaixonado.mp3
C:\\Users\\Na‡ao digital\\Music\\Rumo a Barretos - MenajÆo Muladeiro\\00 - Rumo a Barretos - lv_0_20260403152856.mp3
C:\\Users\\Na‡ao digital\\Music\\Saudade Bandida - Zez‚ di Camargo e Luciano\\00 - Saudade Bandida - Zez‚ di Camargo e Luciano .mp3
C:\\Users\\Na‡ao digital\\Music\\Saudade da Minha Terra - ChitÆozinho e Xoror¢\\00 - Saudade da Minha Terra - lv_0_20260403133713.mp3
C:\\Users\\Na‡ao digital\\Music\\Se Eu NÆo Puder te Esquecer - JoÆo Mineiro e Marciano\\00 - Se eu nÆo puder te esquecer - JoÆo Mineiro e Marciano.mp3
C:\\Users\\Na‡ao digital\\Music\\Ser  Que foi Saudade - Zez‚ di Camargo e Luciano\\00 - Ser  que foi saudade - seraquefoisaudade.mp3
C:\\Users\\Na‡ao digital\\Music\\Sessenta Dias Apaixonado - Milion rio e Jos‚ Rico\\00 - Sessenta dias apaixonado - lv_0_20260403100350.mp3
C:\\Users\\Na‡ao digital\\Music\\Seus Olhos - Zez‚ di Camargo e Luciano\\00 - Seus olhos - lv_0_20260403165900.mp3
C:\\Users\\Na‡ao digital\\Music\\Sistema Caipira - Gino e Geno e Continental\\00 - Sistema Caipira - sistemacaipira.mp3
C:\\Users\\Na‡ao digital\\Music\\SolidÆo Por Perto - Eduardo Costa\\00 - SolidÆo por perto - solidaoporperto.mp3.mp3
C:\\Users\\Na‡ao digital\\Music\\Sonho Por Sonho - Leandro e Leonardo\\00 - Sonho Por Sonho - Leandro e Leonardo.mp3
C:\\Users\\Na‡ao digital\\Music\\Sublime Ren£ncia - Leandro e Leonardo\\00 - Sublime ren£ncia - lv_0_20260403134256.mp3
C:\\Users\\Na‡ao digital\\Music\\S¢ d  Vocˆ na Minha Vida - JoÆo Paulo e Daniel\\00 - S¢ da voce na minha vida - sodavocenaminhavida.mp3.mp3
C:\\Users\\Na‡ao digital\\Music\\Te Amo Demais - Leonardo\\00 - Te amo demais - lv_0_20260403151031.mp3
C:\\Users\\Na‡ao digital\\Music\\Telefone Mudo - Trio Parada Dura\\00 - Telefone Mudo - Trio Parada Dura.mp3
C:\\Users\\Na‡ao digital\\Music\\Tempo ao Tempo - Di Paullo e Paulino\\00 - Tempo ao tempo - lv_0_20260403132709.mp3
C:\\Users\\Na‡ao digital\\Music\\Temporal de Amor - Leandro e Leonardo\\00 - Temporal de Amor - lv_0_20260403170337.mp3
C:\\Users\\Na‡ao digital\\Music\\TiÆo Carreiro & Pardinho - Modas Sertanejas\\00 - TiÆo Carreiro & Pardinho - Pousada de boiadeiro.mp3
C:\\Users\\Na‡ao digital\\Music\\Toalha Branca - Gino e Geno\\00 - Toalha branca - toalhabranca.mp3
C:\\Users\\Na‡ao digital\\Music\\Tocando em Frente - Paula Fernandes Part. Leonardo\\00 - Tocando em frente - ocandoemfeerente.mp3.mp3
C:\\Users\\Na‡ao digital\\Music\\Trˆs Cuiabanas - TiÆo Carreiro e Pardinho\\00 - Trˆs Cuiabanas - TiÆo Carreiro e Pardinho.mp3
C:\\Users\\Na‡ao digital\\Music\\T“ Ficando - Gino e Geno\\00 - T“ ficando - lv_0_20260403132257.mp3
C:\\Users\\Na‡ao digital\\Music\\Um Degrau Na Escada - Chico Rey e Paran \\00 - Um degrau na escada - Chico Rey e Paran  .mp3
C:\\Users\\Na‡ao digital\\Music\\Um sonhador - NÆo olhe assim - ChitÆozinho e Xoror¢ Part. Leonardo\\00 - Um sonhador   NÆo olhe assim - umsonhadornaoolheassim.mp3.mp3
C:\\Users\\Na‡ao digital\\Music\\Us Mininus da Precu ria\\00 - Us Mininus da Precu ria - Narra‡Æo de Rodeio e sele‡Æo de m£sica ??(M4A_128K).mp3
C:\\Users\\Na‡ao digital\\Music\\Viva a Vida - Milion rio e Jos‚ Rico\\00 - Viva a Vida - Milion rio e Jos‚ Rico.mp3
C:\\Users\\Na‡ao digital\\Music\\Voando Sem Asas - Zez‚ di Camargo e Luciano\\00 - Voando sem asas - lv_0_20260403155248.mp3
C:\\Users\\Na‡ao digital\\Music\\Voce ‚ tudo que pedi pra Deus - Cezar e Paulinho\\00 - Voce ‚ tudo que pedi pra Deus - nafazendadaesperancamorameuamor.mp3
C:\\Users\\Na‡ao digital\\Music\\Vontade Dividida - Milion rio e Jos‚ Rico\\00 - Vontade dividida - vontadedividida.mp3
C:\\Users\\Na‡ao digital\\Music\\Vou Beber de Novo - Renan e Ray\\00 - Vou beber de novo - voubeberdenovo.mp3
C:\\Users\\Na‡ao digital\\Music\\ o Amor - Zez‚ di Camargo e Luciano\\00 -  o amor - eoamor.mp3
C:\\Users\\Na‡ao digital\\Music\\?DJ Ledie\\00 - ?DJ Ledie - ?Chrystian & Ralf - Amor de Canavial - COM GRAVE - MODÇO BRUTO - MODAO 2026 - EDITADO.mp3
C:\\Users\\Na‡ao digital\\Music\\?NOSSO BUTECO - XandyDJ Produ‡äes\\00 - ?NOSSO BUTECO - xandyDj Produ‡äes - ?Pousada de Boiadeiro - TiÆo Carreiro & Pardinho - Maur¡cio e Eduardo -  S¢ Dizer o Pre‡o (FAIXA 30).mp3`;

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

const lines = raw.split('\n').map(l => l.trim()).filter(l => l.endsWith('.mp3'));
console.log('Total file lines found:', lines.length);

const parsed = [];
for (const line of lines) {
  // Split on double or single backslash
  const parts = line.split('\\');
  const rawFolder = parts[4];
  const rawFile = parts[5];
  const folder = fixCp850(rawFolder).trim();
  const file = fixCp850(rawFile).trim();

  parsed.push({
    rawFolder,
    rawFile,
    folder,
    file,
    fullLine: line
  });
}

fs.writeFileSync('scripts/parsed_list.json', JSON.stringify(parsed, null, 2));
console.log('Saved parsed_list.json, count:', parsed.length);
