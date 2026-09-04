"use client";

import { useState } from 'react';
import ModeloPolaroid from '../components/modelos/ModeloPolaroid';
import { salvarRascunhoPagamento } from '@/lib/rascunhoPagamento';

type MusicaSpotify = {
  id: string;
  name: string;
  artist: string;
  albumCover: string;
};

type FotoFormulario = {
  arquivo: File | null;
  preview: string;
  legenda: string;
};

const criarFotosVazias = (): FotoFormulario[] =>
  Array.from({ length: 6 }, () => ({ arquivo: null, preview: '', legenda: '' }));

const TAMANHO_MAXIMO_FOTO = 10 * 1024 * 1024;
const TAMANHO_OTIMIZADO_FOTO = 450 * 1024;
const TIPOS_DE_FOTO_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function otimizarFoto(arquivo: File) {
  const url = URL.createObjectURL(arquivo);

  try {
    const imagem = await new Promise<HTMLImageElement>((resolve, reject) => {
      const elemento = new Image();
      elemento.onload = () => resolve(elemento);
      elemento.onerror = () => reject(new Error('Não foi possível ler esta imagem.'));
      elemento.src = url;
    });

    const escala = Math.min(1, 900 / Math.max(imagem.naturalWidth, imagem.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(imagem.naturalWidth * escala));
    canvas.height = Math.max(1, Math.round(imagem.naturalHeight * escala));

    const contexto = canvas.getContext('2d');
    if (!contexto) throw new Error('Seu navegador não conseguiu preparar a foto.');

    contexto.fillStyle = '#ffffff';
    contexto.fillRect(0, 0, canvas.width, canvas.height);
    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);

    let blob: Blob | null = null;
    for (const qualidade of [0.82, 0.72, 0.62, 0.52, 0.42]) {
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', qualidade));
      if (blob && blob.size <= TAMANHO_OTIMIZADO_FOTO) break;
    }

    if (!blob || blob.size > TAMANHO_OTIMIZADO_FOTO) {
      throw new Error('Não foi possível reduzir esta foto. Escolha uma imagem menor.');
    }

    return new File([blob], `${arquivo.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function CriarPresentePage() {
  // Estados básicos
  const [nomeComprador, setNomeComprador] = useState('');
  const [nomePresenteado, setNomePresenteado] = useState('');
  const [emailEntrega, setEmailEntrega] = useState('');
  const [dataInicioNamoro, setDataInicioNamoro] = useState('');
  const [textoPoema, setTextoPoema] = useState('');
  
  // Estados do Spotify
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosSpotify, setResultadosSpotify] = useState<MusicaSpotify[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [musicaSelecionada, setMusicaSelecionada] = useState<MusicaSpotify | null>(null);
  const [visualizandoPrevia, setVisualizandoPrevia] = useState(false);
  const [iniciandoPagamento, setIniciandoPagamento] = useState(false);
  const [erroPagamento, setErroPagamento] = useState('');
  
  // Estado das 6 Fotos (agora suportando arquivo de Upload e Preview)
  const [fotos, setFotos] = useState<FotoFormulario[]>(criarFotosVazias);

  // Função para lidar com o Upload da Imagem
  const handleUploadFoto = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!TIPOS_DE_FOTO_ACEITOS.includes(file.type)) {
        alert('Envie uma imagem JPG, PNG, WEBP ou GIF.');
        e.target.value = '';
        return;
      }

      if (file.size > TAMANHO_MAXIMO_FOTO) {
        alert('Cada foto original pode ter no máximo 10 MB.');
        e.target.value = '';
        return;
      }

      try {
        const fotoOtimizada = await otimizarFoto(file);
        const previewUrl = URL.createObjectURL(fotoOtimizada);

        setFotos((fotosAtuais) => {
          const novasFotos = [...fotosAtuais];
          if (novasFotos[index].preview) URL.revokeObjectURL(novasFotos[index].preview);
          novasFotos[index] = { ...novasFotos[index], arquivo: fotoOtimizada, preview: previewUrl };
          return novasFotos;
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Não foi possível preparar a foto.');
        e.target.value = '';
      }
    }
  };

  const atualizarLegenda = (index: number, valor: string) => {
    const novasFotos = [...fotos];
    novasFotos[index] = { ...novasFotos[index], legenda: valor };
    setFotos(novasFotos);
  };

  // Função para buscar música na nossa API do Spotify
  const buscarMusica = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!termoBusca) return;

    setBuscando(true);
    try {
      const res = await fetch(`/api/spotify?q=${encodeURIComponent(termoBusca)}`);
      const data = await res.json();
      setResultadosSpotify(data.tracks || []);
    } catch (err) {
      console.error("Erro ao buscar música:", err);
      alert("Erro ao buscar a música. Verifique o console.");
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicaSelecionada) {
      alert("Por favor, busque e selecione uma música do Spotify!");
      return;
    }

    // A prévia usa apenas os dados que já estão no navegador. Nenhuma chamada à
    // API de presentes é feita antes da confirmação do pagamento.
    setVisualizandoPrevia(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const iniciarPagamento = async () => {
    if (!musicaSelecionada || fotos.some((foto) => !foto.arquivo)) return;

    setIniciandoPagamento(true);
    setErroPagamento('');

    try {
      const resposta = await fetch('/api/pagamentos/preferencia', { method: 'POST' });
      const resultado = (await resposta.json()) as {
        referencia?: string;
        initPoint?: string;
        error?: string;
      };

      if (!resposta.ok || !resultado.referencia || !resultado.initPoint) {
        throw new Error(resultado.error || 'Não foi possível iniciar o pagamento.');
      }

      await salvarRascunhoPagamento(resultado.referencia, {
        nomeComprador,
        nomePresenteado,
        emailEntrega,
        dataInicioNamoro,
        textoPoema,
        idMusicaSpotify: musicaSelecionada.id,
        fotos: fotos.map((foto) => ({
          arquivo: foto.arquivo as File,
          legenda: foto.legenda,
        })),
      });

      window.location.assign(resultado.initPoint);
    } catch (error) {
      setErroPagamento(error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.');
      setIniciandoPagamento(false);
    }
  };

  if (visualizandoPrevia && musicaSelecionada) {
    const dadosPrevia = {
      nomeComprador,
      nomePresenteado,
      dataInicioNamoro,
      textoPoema,
      idMusicaSpotify: musicaSelecionada.id,
      fotos: fotos.map((foto) => ({
        url: foto.preview,
        legenda: foto.legenda,
      })),
    };

    return (
      <main className="min-h-screen bg-zinc-950">
        <aside className="sticky top-0 z-[10000] border-b border-amber-400/30 bg-zinc-950/95 px-4 py-4 text-white shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="font-bold text-amber-300">Prévia do seu presente</p>
              <p className="text-sm text-zinc-300">As fotos serão liberadas e a página será criada após o pagamento.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => setVisualizandoPrevia(false)}
                className="rounded-full border border-zinc-600 px-5 py-3 font-bold transition hover:bg-zinc-800"
              >
                Editar informações
              </button>
              <button
                type="button"
                onClick={iniciarPagamento}
                disabled={iniciandoPagamento}
                className="rounded-full bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {iniciandoPagamento ? 'Abrindo Mercado Pago…' : 'Pagar e publicar • R$ 29,90'}
              </button>
            </div>
          </div>
          {erroPagamento && (
            <p role="alert" className="mx-auto mt-3 max-w-5xl text-center text-sm font-semibold text-red-300 sm:text-right">
              {erroPagamento}
            </p>
          )}
        </aside>

        <ModeloPolaroid dados={dadosPrevia} isPreview />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F2EB] text-zinc-800 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-zinc-200">
        
        <div className="text-center mb-10">
          <span className="text-red-500 text-4xl">❤️</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 mt-2">
            Crie sua Página de Presente
          </h1>
          <p className="text-zinc-500 mt-1">Personalize cada detalhe da sua surpresa.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Seção 1: Informações Básicas */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-800 border-b pb-2">1. O Casal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Seu Nome</label>
                <input type="text" required value={nomeComprador} onChange={(e) => setNomeComprador(e.target.value)} className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Nome de quem vai receber</label>
                <input type="text" required value={nomePresenteado} onChange={(e) => setNomePresenteado(e.target.value)} className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Data de Início do Relacionamento</label>
              <input type="date" required value={dataInicioNamoro} onChange={(e) => setDataInicioNamoro(e.target.value)} className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">E-mail para receber o presente</label>
              <input
                type="email"
                required
                value={emailEntrega}
                onChange={(e) => setEmailEntrega(e.target.value)}
                placeholder="voce@exemplo.com"
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <p className="mt-1 text-xs text-zinc-500">Enviaremos o link e o QR Code após a confirmação do pagamento.</p>
            </div>
          </section>

          {/* Seção 2: Busca no Spotify */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-800 border-b pb-2">2. Trilha Sonora</h2>
            
            {!musicaSelecionada ? (
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Buscar música no Spotify</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    placeholder="Ex: Stand By Me - Ben E. King" 
                    className="flex-grow border border-zinc-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button onClick={buscarMusica} type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition">
                    {buscando ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                {/* Lista de Resultados */}
                {resultadosSpotify.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {resultadosSpotify.map((track) => (
                      <div key={track.id} onClick={() => setMusicaSelecionada(track)} className="flex items-center gap-3 p-2 hover:bg-zinc-200 rounded-lg cursor-pointer transition">
                        <img src={track.albumCover} alt="Capa" className="w-10 h-10 rounded-md" />
                        <div>
                          <p className="font-bold text-sm text-zinc-900">{track.name}</p>
                          <p className="text-xs text-zinc-500">{track.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <div className="flex items-center gap-4">
                  <img src={musicaSelecionada.albumCover} alt="Capa" className="w-14 h-14 rounded-lg shadow-sm" />
                  <div>
                    <p className="text-xs text-emerald-700 font-bold uppercase">Música Escolhida</p>
                    <p className="font-bold text-zinc-900">{musicaSelecionada.name}</p>
                    <p className="text-xs text-zinc-600">{musicaSelecionada.artist}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setMusicaSelecionada(null)} className="text-red-600 font-bold text-sm hover:underline">
                  Trocar
                </button>
              </div>
            )}
          </section>

          {/* Seção 3: Upload de Fotos */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-800 border-b pb-2">3. Suas 6 Fotos (Upload)</h2>
            <p className="text-xs text-zinc-500">Envie arquivos JPG, PNG, WEBP ou GIF de até 10 MB. As fotos serão otimizadas automaticamente.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fotos.map((foto, index) => (
                <div key={index} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex flex-col items-center">
                  <h3 className="font-bold text-sm text-zinc-700 w-full mb-2">Foto #{index + 1}</h3>
                  
                  {/* Caixa de Upload / Preview */}
                  <div className="w-full h-40 bg-zinc-200 rounded-xl mb-3 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-300 relative group cursor-pointer">
                    {foto.preview ? (
                      <img src={foto.preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-zinc-400 text-sm font-medium flex flex-col items-center">
                        <span className="text-2xl mb-1">📸</span>
                        Clique para enviar
                      </span>
                    )}
                    {/* Input de arquivo invisível sobrepondo a caixa */}
                    <input 
                      type="file" 
                      accept="image/*" 
                      required={!foto.preview} // Exige se não tiver foto
                      onChange={(e) => handleUploadFoto(index, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                  </div>

                  <input 
                    type="text" 
                    required
                    value={foto.legenda}
                    onChange={(e) => atualizarLegenda(index, e.target.value)}
                    placeholder="Escreva uma legenda..." 
                    className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none bg-white font-caveat text-lg"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Seção 4: História */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-800 border-b pb-2">4. Nossa História</h2>
            <textarea rows={5} required value={textoPoema} onChange={(e) => setTextoPoema(e.target.value)} placeholder="Escreva aqui tudo o que você sente..." className="w-full border border-zinc-300 rounded-xl p-4 focus:ring-2 focus:ring-red-500 outline-none" />
          </section>

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform active:scale-95 text-lg">
            Ver como ficou ❤️
          </button>

        </form>
      </div>
    </main>
  );
}
