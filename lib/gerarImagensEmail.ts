import path from 'node:path';
import sharp from 'sharp';

export type ModeloEmail = 'polaroid' | 'aventuras';

export type FotoEmail = {
  url: string;
  legenda: string | null;
};

const LARGURA_STORY = 1080;
const ALTURA_STORY = 1920;

function escaparXml(valor: string) {
  return valor.replace(/[&<>'"]/g, (caractere) => {
    const entidades: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&apos;',
      '"': '&quot;',
    };
    return entidades[caractere];
  });
}

function limitarTexto(valor: string, tamanho: number) {
  const texto = valor.trim();
  return texto.length <= tamanho ? texto : `${texto.slice(0, tamanho - 1).trim()}…`;
}

function quebrarTexto(valor: string, limite = 54, maximoLinhas = 2) {
  const palavras = valor.trim().split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  let linha = '';

  for (const palavra of palavras) {
    const candidata = linha ? `${linha} ${palavra}` : palavra;
    if (candidata.length <= limite) {
      linha = candidata;
      continue;
    }
    if (linha) linhas.push(linha);
    linha = palavra;
    if (linhas.length === maximoLinhas) break;
  }

  if (linhas.length < maximoLinhas && linha) linhas.push(linha);
  if (linhas.length === maximoLinhas && palavras.join(' ').length > linhas.join(' ').length) {
    linhas[maximoLinhas - 1] = limitarTexto(linhas[maximoLinhas - 1], limite);
  }
  return linhas;
}

function bufferDaFoto(url: string) {
  const resultado = /^data:image\/[a-z0-9.+-]+;base64,([a-z0-9+/=\s]+)$/i.exec(url);
  if (!resultado) throw new Error('Formato de foto inválido para a prévia do e-mail.');
  return Buffer.from(resultado[1], 'base64');
}

function caminhoImagem(nome: string) {
  return path.join(process.cwd(), 'public', 'images', nome);
}

function svgCapaPolaroid() {
  return Buffer.from(`
    <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="675" fill="#f5f0e7"/>
      <circle cx="105" cy="110" r="150" fill="#efc5c2" opacity=".45"/>
      <circle cx="1090" cy="590" r="190" fill="#ecd59a" opacity=".45"/>
      <g transform="translate(125 160) rotate(-7 170 210)">
        <rect width="340" height="420" rx="4" fill="#fff"/>
        <rect x="24" y="24" width="292" height="300" fill="#deb5ad"/>
        <path d="M40 284 128 190l54 59 51-74 67 109Z" fill="#a44d46" opacity=".72"/>
        <circle cx="238" cy="102" r="38" fill="#f5dfab"/>
      </g>
      <g transform="translate(735 145) rotate(6 170 210)">
        <rect width="340" height="420" rx="4" fill="#fff"/>
        <rect x="24" y="24" width="292" height="300" fill="#c9d8d1"/>
        <path d="M40 284 116 205l64 51 53-87 67 115Z" fill="#6e887d" opacity=".78"/>
        <circle cx="235" cy="101" r="38" fill="#f5dfab"/>
      </g>
      <rect x="385" y="226" width="430" height="224" rx="26" fill="#fffdf8" opacity=".96"/>
      <text x="600" y="310" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="700" fill="#9f302d" letter-spacing="5">LETTER LOVE</text>
      <text x="600" y="385" text-anchor="middle" font-family="Georgia,serif" font-size="64" font-weight="700" fill="#292524">Modelo Polaroid</text>
    </svg>
  `);
}

function svgTituloCapaAventuras() {
  return Buffer.from(`
    <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="675" fill="#2f2418" opacity=".25"/>
      <rect x="318" y="220" width="564" height="235" rx="18" fill="#fff7db" opacity=".94"/>
      <text x="600" y="305" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#a4493e" letter-spacing="5">LETTER LOVE</text>
      <text x="600" y="380" text-anchor="middle" font-family="Georgia,serif" font-size="62" font-weight="700" fill="#3f3529">Álbum de Aventuras</text>
    </svg>
  `);
}

export async function criarCapaModelo(modelo: ModeloEmail) {
  if (modelo === 'aventuras') {
    const fundo = await sharp(caminhoImagem('paraiso-cachoeiras-aventura.png'))
      .resize(1200, 675, { fit: 'cover' })
      .png()
      .toBuffer();

    return sharp(fundo)
      .composite([{ input: svgTituloCapaAventuras() }])
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  return sharp(svgCapaPolaroid()).png({ compressionLevel: 9 }).toBuffer();
}

async function criarMolduraFoto(foto: FotoEmail, modelo: ModeloEmail) {
  const imagem = await sharp(bufferDaFoto(foto.url))
    .rotate()
    .resize(410, 400, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 86 })
    .toBuffer();
  const legenda = escaparXml(limitarTexto(foto.legenda || 'Nossa memória', 42));
  const papel = modelo === 'aventuras' ? '#fff7dc' : '#ffffff';
  const tinta = modelo === 'aventuras' ? '#4f3c28' : '#3f3f46';

  const moldura = Buffer.from(`
    <svg width="460" height="540" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="456" height="536" rx="5" fill="${papel}" stroke="#6b4b2d" stroke-opacity=".16" stroke-width="4"/>
      <text x="230" y="464" text-anchor="middle" font-family="Georgia,serif" font-size="27" font-style="italic" fill="${tinta}">${legenda}</text>
      <circle cx="230" cy="505" r="4" fill="#b8443c" opacity=".7"/>
    </svg>
  `);

  return sharp(moldura)
    .composite([{ input: imagem, left: 25, top: 25 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function criarFundoStory(modelo: ModeloEmail) {
  if (modelo === 'aventuras') {
    const paisagem = await sharp(caminhoImagem('paraiso-cachoeiras-aventura.png'))
      .resize(LARGURA_STORY, ALTURA_STORY, { fit: 'cover', position: 'centre' })
      .modulate({ saturation: 0.55, brightness: 1.16 })
      .jpeg({ quality: 88 })
      .toBuffer();

    const veu = Buffer.from(`
      <svg width="${LARGURA_STORY}" height="${ALTURA_STORY}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f4e6bd" opacity=".68"/>
        <rect x="30" y="30" width="1020" height="1860" rx="22" fill="none" stroke="#6e4a29" stroke-opacity=".35" stroke-width="4"/>
      </svg>
    `);
    return sharp(paisagem).composite([{ input: veu }]).png().toBuffer();
  }

  return sharp({
    create: { width: LARGURA_STORY, height: ALTURA_STORY, channels: 4, background: '#f5f0e7' },
  }).png().toBuffer();
}

export async function criarArteStory({
  modelo,
  nomeComprador,
  nomePresenteado,
  textoPoema,
  fotos,
  qrCode,
}: {
  modelo: ModeloEmail;
  nomeComprador: string;
  nomePresenteado: string;
  textoPoema: string;
  fotos: FotoEmail[];
  qrCode: Buffer;
}) {
  const indices = fotos.length >= 5 ? [0, 2, 4] : [0, 1, 2];
  const fotosEscolhidas = indices.map((indice) => fotos[indice]).filter((foto): foto is FotoEmail => Boolean(foto));
  const molduras = await Promise.all(fotosEscolhidas.map((foto) => criarMolduraFoto(foto, modelo)));
  const fundo = await criarFundoStory(modelo);
  const nomes = `${limitarTexto(nomeComprador, 24)} & ${limitarTexto(nomePresenteado, 24)}`;
  const linhasPoema = quebrarTexto(textoPoema, 58, 2);
  const corPrincipal = modelo === 'aventuras' ? '#8f3d35' : '#991b1b';
  const corTexto = modelo === 'aventuras' ? '#433426' : '#27272a';
  const subtitulo = modelo === 'aventuras' ? 'Nosso livro de aventuras' : 'Nossas memórias favoritas';

  const cabecalho = Buffer.from(`
    <svg width="${LARGURA_STORY}" height="${ALTURA_STORY}" xmlns="http://www.w3.org/2000/svg">
      <text x="540" y="105" text-anchor="middle" font-family="Arial,sans-serif" font-size="21" font-weight="700" letter-spacing="7" fill="${corPrincipal}">LETTER LOVE</text>
      <text x="540" y="190" text-anchor="middle" font-family="Georgia,serif" font-size="58" font-weight="700" fill="${corTexto}">${escaparXml(nomes)}</text>
      <text x="540" y="244" text-anchor="middle" font-family="Georgia,serif" font-size="27" font-style="italic" fill="${corPrincipal}">${subtitulo}</text>
      <line x1="390" y1="285" x2="690" y2="285" stroke="${corPrincipal}" stroke-opacity=".35" stroke-width="3"/>
      ${linhasPoema.map((linha, indice) => `<text x="540" y="${1625 + indice * 38}" text-anchor="middle" font-family="Georgia,serif" font-size="25" font-style="italic" fill="${corTexto}">${escaparXml(linha)}</text>`).join('')}
      <text x="72" y="1810" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2" fill="${corPrincipal}">ESCANEIE PARA ABRIR O PRESENTE</text>
    </svg>
  `);
  const qrMenor = await sharp(qrCode).resize(150, 150).png().toBuffer();
  const posicoes = molduras.length === 3
    ? [{ left: 55, top: 350 }, { left: 565, top: 350 }, { left: 310, top: 970 }]
    : molduras.map((_, indice) => ({ left: 55 + indice * 510, top: 430 }));

  return sharp(fundo)
    .composite([
      { input: cabecalho },
      ...molduras.map((input, indice) => ({ input, ...posicoes[indice] })),
      { input: qrMenor, left: 855, top: 1715 },
    ])
    .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
    .toBuffer();
}
