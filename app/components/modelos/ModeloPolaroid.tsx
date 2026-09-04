"use client";

import Link from 'next/link';
import SpotifyPlayer from '../SpotifyPlayer';

export interface ModeloProps {
  presente?: {
    nomeComprador: string;
    nomePresenteado: string;
    dataInicioNamoro: string;
    textoPoema: string;
    idMusicaSpotify: string;
    fotos: { url: string; legenda: string | null }[];
  };
  dados?: {
    nomeComprador: string;
    nomePresenteado: string;
    dataInicioNamoro: string;
    textoPoema: string;
    idMusicaSpotify: string;
    fotos: { url: string; legenda: string | null }[];
  };
  isDemo?: boolean;
  isPreview?: boolean;
}

function FotoAnimada({
  foto,
  index,
  borrada = false,
}: {
  foto: { url: string; legenda: string | null };
  index: number;
  borrada?: boolean;
}) {
  const isPar = index % 2 === 0;
  const rotacao = isPar ? '-rotate-2' : 'rotate-2';

  return (
    <div 
      className={`bg-white p-4 pb-14 shadow-[0_15px_35px_rgba(0,0,0,0.15)] w-72 sm:w-80 transition-all duration-300 ease-out hover:scale-105 hover:rotate-0 hover:z-10 ${rotacao}`}
    >
      <div className="w-full h-72 bg-zinc-100 overflow-hidden relative">
        <img 
          src={foto.url || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop"} 
          alt={`Momento ${index + 1}`} 
          className={`w-full h-full object-cover transition-[filter,transform] duration-300 ${borrada ? 'blur-xl scale-110' : ''}`}
          loading="eager"
        />
        {borrada && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10" aria-label="Foto bloqueada até o pagamento">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-2xl shadow-lg" aria-hidden="true">
              🔒
            </span>
          </div>
        )}
      </div>
      {foto.legenda && (
        <div className="mt-4 text-center px-2">
          <p className="text-xl text-zinc-700 leading-tight font-serif italic">
            {foto.legenda}
          </p>
        </div>
      )}
    </div>
  );
}

function calcularTempoJuntos(dataInicioNamoro: string) {
  if (!dataInicioNamoro) return '';

  const inicio = new Date(dataInicioNamoro);
  const hoje = new Date();

  let anos = hoje.getFullYear() - inicio.getFullYear();
  let meses = hoje.getMonth() - inicio.getMonth();
  let dias = hoje.getDate() - inicio.getDate();

  if (dias < 0) {
    meses--;
    dias += new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
  }
  if (meses < 0) {
    anos--;
    meses += 12;
  }

  const partes = [];
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
  if (dias > 0) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);

  return partes.join(', ');
}

export default function ModeloPolaroid({ presente, dados: dadosProp, isDemo = false, isPreview = false }: ModeloProps) {
  // Aceita 'presente' (do banco), 'dados' (da landing page) ou gera fallback padrão
  const info = presente || dadosProp || {
    nomeComprador: "João",
    nomePresenteado: "Maria",
    dataInicioNamoro: "2024-01-01T00:00:00.000Z",
    textoPoema: "Esta é uma prévia de como o seu presente vai ficar...\n\nCheio de amor e memórias para sempre.",
    idMusicaSpotify: "4uLUJ41p8tC6f0V1d9o0v4",
    fotos: [
      { url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop", legenda: "Nosso primeiro encontro" },
      { url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop", legenda: "Viagem inesquecível" }
    ]
  };

  const tempoJuntos = calcularTempoJuntos(info.dataInicioNamoro);

  return (
    <main className="min-h-screen bg-[#F5F2EB] text-zinc-800 overflow-x-hidden relative selection:bg-rose-200 pb-32">
      
      {/* Spotify Player */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-[360px] h-[80px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden border border-zinc-300/60 bg-white/90 backdrop-blur-md transition-transform hover:scale-105">
        <SpotifyPlayer trackId={info.idMusicaSpotify} />
      </div>

      <header className="pt-20 pb-12 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-zinc-900 mb-4 tracking-tight drop-shadow-sm">
          {info.nomeComprador} & {info.nomePresenteado}
        </h1>
        <div className="inline-block border-y-2 border-zinc-300 py-2 px-6 mt-4">
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Juntos há</p>
          <p className="text-xl font-medium text-red-800 tracking-wide">
            {tempoJuntos || 'Calculando...'}
          </p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-12 flex flex-col md:flex-row flex-wrap items-center justify-center gap-12 md:gap-16">
        {info.fotos.map((foto, index) => (
          <FotoAnimada key={index} foto={foto} index={index} borrada={isPreview} />
        ))}
      </section>

      <section className="max-w-2xl mx-auto px-6 py-20 pb-24 text-center">
        <div className="relative bg-white p-10 md:p-16 shadow-lg rotate-1">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-white/50 backdrop-blur-sm border border-zinc-100 shadow-sm -rotate-2"></div>
          <h2 className="text-2xl font-bold mb-6 text-zinc-800 uppercase tracking-widest">Nossa História</h2>
          <p className="text-lg md:text-xl leading-relaxed text-zinc-600 whitespace-pre-wrap font-medium">
            {info.textoPoema}
          </p>
        </div>
      </section>

      {isDemo && (
        <section className="pb-20 pt-8 flex justify-center border-t border-zinc-300/50 mt-10">
          <Link 
            href="/criar" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full shadow-xl shadow-red-900/40 transition-transform transform hover:scale-105 active:scale-95 text-xl flex items-center gap-3"
          >
            Quero usar este modelo ❤️
          </Link>
        </section>
      )}

    </main>
  );
}
