"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import SpotifyPlayer from '../SpotifyPlayer';

type FotoPresente = {
  url: string;
  legenda: string | null;
};

type DadosPresente = {
  nomeComprador: string;
  nomePresenteado: string;
  dataInicioNamoro: string;
  textoPoema: string;
  idMusicaSpotify: string;
  fotos: FotoPresente[];
};

export interface ModeloProps {
  presente?: DadosPresente;
  dados?: DadosPresente;
  isDemo?: boolean;
  isPreview?: boolean;
}

const fotoFallback = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=900&auto=format&fit=crop';

function FotoAnimada({
  foto,
  index,
  borrada = false,
}: {
  foto: FotoPresente;
  index: number;
  borrada?: boolean;
}) {
  const rotacoes = ['-rotate-2', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-3', 'rotate-1'];
  const rotacao = rotacoes[index % rotacoes.length];
  const elementoRef = useRef<HTMLElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = elementoRef.current;
    if (!elemento || !('IntersectionObserver' in window)) {
      setVisivel(true);
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setVisivel(true);
        observador.disconnect();
      },
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <article
      ref={elementoRef}
      className={`polaroid-reveal group relative mx-auto w-full max-w-[390px] ${visivel ? 'is-visible' : ''} ${index % 2 !== 0 ? 'md:mt-20' : ''}`}
      style={{ transitionDelay: `${index % 2 === 0 ? 60 : 160}ms` }}
    >
      <span
        className="absolute -top-3 left-1/2 z-20 h-7 w-24 -translate-x-1/2 -rotate-2 border border-white/60 bg-white/55 shadow-sm backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className={`relative bg-white p-3 pb-7 shadow-[0_24px_60px_rgba(78,39,25,0.18)] transition duration-500 ease-out group-hover:z-10 group-hover:rotate-0 group-hover:scale-[1.025] sm:p-4 sm:pb-9 ${rotacao}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-rose-100">
          {/* Blob URLs da prévia e imagens salvas no banco precisam funcionar no mesmo componente. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto.url || fotoFallback}
            alt={foto.legenda ? `Memória do casal: ${foto.legenda}` : `Memória ${index + 1} do casal`}
            className={`h-full w-full object-cover transition-[filter,transform] duration-700 group-hover:scale-105 ${borrada ? 'scale-110 blur-2xl' : ''}`}
            loading={index < 2 ? 'eager' : 'lazy'}
          />
          <span className="absolute left-3 top-3 flex h-9 min-w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 px-2 font-serif text-sm font-black text-red-800 shadow-md">
            {String(index + 1).padStart(2, '0')}
          </span>
          {borrada && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900/15 text-center" aria-label="Foto bloqueada até o pagamento">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-2xl shadow-xl" aria-hidden="true">🔒</span>
              <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-black uppercase tracking-wider text-zinc-800 shadow-lg">Liberada após o pagamento</span>
            </div>
          )}
        </div>
        <div className="px-2 pt-5 text-center">
          <p className="font-serif text-xl italic leading-snug text-zinc-700 sm:text-2xl">
            {foto.legenda || `Nosso momento ${index + 1}`}
          </p>
          <span className="mx-auto mt-4 block h-px w-12 bg-red-800/30" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

function criarDataLocal(valor: string) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  if (partes) return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  return new Date(valor);
}

function calcularTempoJuntos(dataInicioNamoro: string) {
  const inicio = criarDataLocal(dataInicioNamoro);
  const hoje = new Date();

  if (Number.isNaN(inicio.getTime()) || inicio > hoje) {
    return [
      { valor: 0, singular: 'ano', plural: 'anos' },
      { valor: 0, singular: 'mês', plural: 'meses' },
      { valor: 0, singular: 'dia', plural: 'dias' },
    ];
  }

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

  return [
    { valor: anos, singular: 'ano', plural: 'anos' },
    { valor: meses, singular: 'mês', plural: 'meses' },
    { valor: dias, singular: 'dia', plural: 'dias' },
  ];
}

export default function ModeloPolaroid({ presente, dados: dadosProp, isDemo = false, isPreview = false }: ModeloProps) {
  const info = presente || dadosProp || {
    nomeComprador: 'João',
    nomePresenteado: 'Maria',
    dataInicioNamoro: '2024-01-01',
    textoPoema: 'Esta é uma prévia de como o seu presente vai ficar...\n\nCheio de amor e memórias para sempre.',
    idMusicaSpotify: '4uLUJ41p8tC6f0V1d9o0v4',
    fotos: Array.from({ length: 6 }, (_, index) => ({
      url: fotoFallback,
      legenda: `Nosso momento ${index + 1}`,
    })),
  };

  const tempoJuntos = calcularTempoJuntos(info.dataInicioNamoro);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f5f0e7] pb-32 text-zinc-800 selection:bg-rose-200">
      {/* O player permanece com o mesmo tamanho, posição e comportamento. */}
      <div className="fixed bottom-4 left-1/2 z-[9999] h-[80px] w-[90%] max-w-[360px] -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-300/60 bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform hover:scale-105">
        <SpotifyPlayer trackId={info.idMusicaSpotify} />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl" />
        <div className="absolute -right-28 top-[34rem] h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
        <span className="heart-float absolute left-[8%] top-36 text-2xl text-red-800/20">♥</span>
        <span className="heart-float-delayed absolute right-[10%] top-64 text-4xl text-red-800/15">♥</span>
      </div>

      <header className="relative flex min-h-[78vh] flex-col items-center justify-center px-5 pb-20 pt-16 text-center">
        <div className="hero-reveal">
          <p className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-red-800/70 sm:text-sm">Uma história escrita a dois</p>
          <h1 className="mx-auto max-w-5xl font-serif text-5xl font-black leading-[0.9] tracking-tight text-zinc-900 sm:text-7xl md:text-8xl">
            <span className="block">{info.nomeComprador}</span>
            <span className="my-3 block font-normal italic text-red-800 sm:my-5">&</span>
            <span className="block">{info.nomePresenteado}</span>
          </h1>
          <div className="mx-auto my-8 flex items-center justify-center gap-3 text-red-800/50" aria-hidden="true">
            <span className="h-px w-14 bg-current" />
            <span className="text-xl">♥</span>
            <span className="h-px w-14 bg-current" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Juntos há</p>
          <div className="mx-auto mt-5 grid max-w-lg grid-cols-3 gap-2 sm:gap-4">
            {tempoJuntos.map(({ valor, singular, plural }) => (
              <div key={singular} className="rounded-2xl border border-white/70 bg-white/65 px-2 py-4 shadow-[0_12px_30px_rgba(78,39,25,0.08)] backdrop-blur-sm sm:px-6 sm:py-5">
                <strong className="block font-serif text-3xl text-red-900 sm:text-4xl">{valor}</strong>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500 sm:text-xs">{valor === 1 ? singular : plural}</span>
              </div>
            ))}
          </div>
        </div>
        <a href="#nossas-memorias" className="absolute bottom-7 flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition hover:text-red-800">
          Nossas memórias
          <span className="scroll-hint text-xl" aria-hidden="true">↓</span>
        </a>
      </header>

      <section id="nossas-memorias" className="relative mx-auto max-w-6xl scroll-mt-8 px-5 py-16 sm:px-8">
        <div className="mb-16 text-center">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-red-800/60">Capítulos favoritos</p>
          <h2 className="mt-3 font-serif text-4xl font-black text-zinc-900 sm:text-5xl">Seis momentos, uma história</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">Cada fotografia guarda um pedaço do caminho que trouxe vocês até aqui.</p>
        </div>

        <div className="grid items-start gap-x-16 gap-y-14 md:grid-cols-2 md:gap-y-4">
          {info.fotos.slice(0, 6).map((foto, index) => (
            <FotoAnimada key={`${foto.url}-${index}`} foto={foto} index={index} borrada={isPreview} />
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-3xl px-5 pb-24 pt-32 text-center sm:px-8 md:pt-44">
        <div className="letter-reveal relative rotate-1 border border-amber-900/10 bg-[#fffdf8] px-6 py-14 shadow-[0_30px_80px_rgba(78,39,25,0.14)] sm:px-14 sm:py-20">
          <span className="absolute -top-4 left-1/2 h-8 w-32 -translate-x-1/2 -rotate-2 border border-white/60 bg-white/55 shadow-sm backdrop-blur-sm" aria-hidden="true" />
          <span className="font-serif text-4xl text-red-800/30" aria-hidden="true">“</span>
          <p className="mb-5 mt-2 text-xs font-black uppercase tracking-[0.35em] text-red-800/60">Para sempre lembrar</p>
          <h2 className="font-serif text-3xl font-black text-zinc-900 sm:text-4xl">Nossa história</h2>
          <div className="mx-auto my-7 h-px w-16 bg-red-800/25" />
          <p className="whitespace-pre-wrap font-serif text-lg italic leading-[1.9] text-zinc-600 sm:text-xl">{info.textoPoema}</p>
          <p className="mt-10 font-serif text-lg font-black text-red-900">Com amor, {info.nomeComprador} ♥</p>
        </div>
      </section>

      {isDemo && (
        <section className="relative flex justify-center border-t border-red-900/10 px-6 pb-20 pt-12">
          <Link
            href="/criar"
            className="flex items-center gap-3 rounded-full bg-red-700 px-8 py-4 text-center text-lg font-black text-white shadow-xl shadow-red-900/30 transition hover:scale-105 hover:bg-red-800 active:scale-95 sm:px-10"
          >
            Quero usar este modelo ❤️
          </Link>
        </section>
      )}
    </main>
  );
}
