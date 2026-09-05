"use client";

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import SpotifyPlayer from '../SpotifyPlayer';
import type { ModeloProps } from './ModeloPolaroid';

const fotoFallback = 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=900&auto=format&fit=crop';

const baloesDecorativos = [
  { cor: '#b8403b', esquerda: '4%', topo: '5%', duracao: '7.4s', atraso: '-1s' },
  { cor: '#d3a32f', esquerda: '91%', topo: '14%', duracao: '8.1s', atraso: '-4s' },
  { cor: '#477b83', esquerda: '6%', topo: '37%', duracao: '8.8s', atraso: '-6s' },
  { cor: '#698653', esquerda: '92%', topo: '56%', duracao: '7.8s', atraso: '-2s' },
  { cor: '#a75b39', esquerda: '3%', topo: '76%', duracao: '9.2s', atraso: '-5s' },
] as const;

function calcularTempo(dataInicioNamoro: string) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(dataInicioNamoro);
  const inicio = partes
    ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]))
    : new Date(dataInicioNamoro);
  const hoje = new Date();

  if (Number.isNaN(inicio.getTime()) || inicio > hoje) {
    return [
      { valor: 0, rotulo: 'anos' },
      { valor: 0, rotulo: 'meses' },
      { valor: 0, rotulo: 'dias' },
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
    { valor: anos, rotulo: anos === 1 ? 'ano' : 'anos' },
    { valor: meses, rotulo: meses === 1 ? 'mês' : 'meses' },
    { valor: dias, rotulo: dias === 1 ? 'dia' : 'dias' },
  ];
}

function PaginaRevelada({ children, index }: { children: ReactNode; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
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
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={`aventura-page-reveal ${visivel ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {children}
    </article>
  );
}

function Espiral({ quantidade = 7 }: { quantidade?: number }) {
  return (
    <div className="aventura-spiral" aria-hidden="true">
      {Array.from({ length: quantidade }, (_, index) => (
        <span key={index}>
          <i />
        </span>
      ))}
    </div>
  );
}

function GloboAlbum({ grande = false }: { grande?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={grande ? 'h-28 w-28 sm:h-36 sm:w-36' : 'h-14 w-14'}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="45" fill="#d8c79e" stroke="#a94a49" strokeWidth="4" />
      <path d="M7 50h86M50 6c15 13 22 28 22 44S65 82 50 94M50 6C35 19 28 34 28 50s7 31 22 44" stroke="#8d6748" strokeWidth="2" opacity=".7" />
      <path d="M24 29c9-9 19-8 27-3l-4 8-10 3-3 9-11-2-6-7 7-8ZM58 53l13-4 13 9-7 8-4 15-10 5-5-14-8-7 8-12Z" fill="#98624f" opacity=".78" />
    </svg>
  );
}

function FotoAlbum({
  foto,
  index,
  borrada,
}: {
  foto: { url: string; legenda: string | null };
  index: number;
  borrada: boolean;
}) {
  const rotacao = index % 2 === 0 ? '-rotate-1' : 'rotate-1';

  return (
    <figure className={`aventura-photo group relative mx-auto w-full max-w-sm ${rotacao}`}>
      <div className="relative border-[7px] border-[#f3ecd8] bg-[#f3ecd8] shadow-[0_12px_24px_rgba(64,43,27,0.24)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#cabd9e]">
          {/* Blob URLs da prévia e imagens salvas como data URL precisam funcionar aqui. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto.url || fotoFallback}
            alt={foto.legenda ? `Fotografia: ${foto.legenda}` : `Fotografia ${index + 1}`}
            className={`h-full w-full object-cover sepia-[0.08] transition duration-700 group-hover:scale-105 ${borrada ? 'scale-110 blur-2xl' : ''}`}
            loading={index < 2 ? 'eager' : 'lazy'}
          />
          {borrada && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#3b2c20]/20 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff9e9]/95 text-xl shadow-lg" aria-hidden="true">🔒</span>
              <span className="rounded bg-[#fff9e9]/95 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#513b28] shadow">Foto após o pagamento</span>
            </div>
          )}
        </div>
        <span className="aventura-photo-corner left-[-11px] top-[-11px] rotate-0" aria-hidden="true" />
        <span className="aventura-photo-corner right-[-11px] top-[-11px] rotate-90" aria-hidden="true" />
        <span className="aventura-photo-corner bottom-[-11px] right-[-11px] rotate-180" aria-hidden="true" />
        <span className="aventura-photo-corner bottom-[-11px] left-[-11px] -rotate-90" aria-hidden="true" />
      </div>
      {foto.legenda && (
        <figcaption className="mx-auto mt-5 max-w-[90%] -rotate-1 font-serif text-lg font-bold italic leading-snug text-[#463426] sm:text-xl">
          {foto.legenda}
        </figcaption>
      )}
    </figure>
  );
}

function EnfeitePagina({ tipo }: { tipo: number }) {
  if (tipo === 0) {
    return <span className="aventura-stamp rotate-[-8deg] border-[#a44a43] text-[#a44a43]" aria-hidden="true">✈</span>;
  }
  if (tipo === 1) {
    return <span className="aventura-stamp rotate-[7deg] border-[#426f73] text-[#426f73]" aria-hidden="true">⌖</span>;
  }
  return <span className="aventura-stamp rotate-[-5deg] border-[#b18832] text-[#8a6924]" aria-hidden="true">★</span>;
}

export default function ModeloAventuras({ presente, dados, isDemo = false, isPreview = false }: ModeloProps) {
  const info = presente || dados || {
    nomeComprador: 'João',
    nomePresenteado: 'Maria',
    dataInicioNamoro: '2024-01-01',
    textoPoema: '',
    idMusicaSpotify: '4uLUJ41p8tC6f0V1d9o0v4',
    fotos: Array.from({ length: 6 }, () => ({ url: fotoFallback, legenda: '' })),
  };

  const tempo = calcularTempo(info.dataInicioNamoro);
  const fotos = info.fotos.slice(0, 6);
  const paginas = Array.from({ length: 3 }, (_, pagina) => fotos.slice(pagina * 2, pagina * 2 + 2));
  const letrasAventuras = 'AVENTURAS'.split('');
  const coresLetras = ['#d55649', '#e2b23c', '#eadbb2', '#d55649', '#e2b23c', '#eadbb2', '#d55649', '#e2b23c', '#eadbb2'];

  return (
    <main className="aventura-table relative min-h-screen overflow-x-hidden pb-32 text-[#3f2d1e] selection:bg-amber-200">
      {/* O player mantém o mesmo tamanho, posição e funcionamento dos demais modelos. */}
      <div className="fixed bottom-4 left-1/2 z-[9999] h-[80px] w-[90%] max-w-[360px] -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-300/60 bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform hover:scale-105">
        <SpotifyPlayer trackId={info.idMusicaSpotify} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {baloesDecorativos.map((balao, index) => (
          <span
            key={`${balao.cor}-${index}`}
            className="aventura-floating-balloon"
            style={{
              backgroundColor: balao.cor,
              left: balao.esquerda,
              top: balao.topo,
              animationDuration: balao.duracao,
              animationDelay: balao.atraso,
            }}
          />
        ))}
      </div>

      <header className="relative z-10 flex min-h-[92vh] items-center justify-center px-7 py-16 sm:px-12">
        <div className="aventura-cover aventura-cover-enter relative aspect-[4/3] w-full max-w-4xl overflow-visible border-[7px] border-[#171616] shadow-[18px_25px_60px_rgba(40,24,13,0.52)] sm:aspect-[16/10]">
          <div className="absolute inset-y-[-7px] left-0 w-[15%] min-w-12 border-x border-black/50 bg-[#7b2432] shadow-[inset_-8px_0_15px_rgba(0,0,0,0.35)]" />
          <div className="pointer-events-none absolute inset-3 border border-[#a5464d]/90" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-5 border border-[#a5464d]/45" aria-hidden="true" />
          <Espiral />

          <div className="absolute inset-y-[10%] left-[18%] right-[6%] flex items-center justify-center">
            <div className="absolute h-[82%] w-[88%] rounded-[50%] border-2 border-[#a5464d]/75" aria-hidden="true" />
            <div className="relative z-10 -rotate-1 text-center">
              <p className="aventura-cover-word text-xl font-black uppercase tracking-[0.14em] text-[#cf544d] sm:text-4xl">Nosso</p>
              <p className="aventura-cover-word mt-1 text-2xl font-black uppercase tracking-[0.08em] text-[#eadbb2] sm:text-5xl">Livro de</p>
              <h1 className="aventura-cover-word mt-1 flex justify-center text-3xl font-black uppercase leading-none sm:text-6xl" aria-label="Aventuras">
                {letrasAventuras.map((letra, index) => (
                  <span key={`${letra}-${index}`} className={index % 2 === 0 ? '-rotate-2' : 'rotate-2'} style={{ color: coresLetras[index] }}>
                    {letra}
                  </span>
                ))}
              </h1>
              <div className="mx-auto mt-4 flex justify-center opacity-80 sm:mt-6">
                <GloboAlbum />
              </div>
            </div>
          </div>
        </div>
        <span className="scroll-hint absolute bottom-5 text-2xl text-[#54341f]/60" aria-hidden="true">↓</span>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl space-y-16 px-3 py-16 sm:px-8 md:space-y-24">
        <PaginaRevelada index={0}>
          <div className="aventura-spread">
            <div className="aventura-page-half flex min-h-[430px] flex-col items-center justify-center text-center sm:min-h-[520px]">
              <div className="mb-7 opacity-65"><GloboAlbum grande /></div>
              <p className="font-serif text-4xl font-black text-[#3b2b20] sm:text-6xl">{info.nomeComprador}</p>
              <span className="my-3 font-serif text-2xl italic text-[#a74743]">&</span>
              <p className="font-serif text-4xl font-black text-[#3b2b20] sm:text-6xl">{info.nomePresenteado}</p>
            </div>
            <div className="aventura-page-half flex min-h-[430px] items-center justify-center sm:min-h-[520px]">
              <div className="w-full max-w-xs space-y-4">
                {tempo.map(({ valor, rotulo }, index) => (
                  <div key={rotulo} className={`${index === 1 ? 'rotate-1' : '-rotate-1'} flex items-center justify-between border border-[#7b5a3b]/25 bg-[#d8bc7e] px-6 py-4 shadow-md`}>
                    <strong className="font-serif text-4xl text-[#3b2b20]">{valor}</strong>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#69492f]">{rotulo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PaginaRevelada>

        {paginas.map((fotosDaPagina, paginaIndex) => (
          <PaginaRevelada key={paginaIndex} index={paginaIndex + 1}>
            <div className="aventura-spread">
              {fotosDaPagina.map((foto, fotoIndex) => {
                const indexReal = paginaIndex * 2 + fotoIndex;
                return (
                  <div key={`${foto.url}-${indexReal}`} className="aventura-page-half relative flex min-h-[480px] items-center justify-center px-8 py-20 sm:min-h-[600px] sm:px-12">
                    <span className="absolute left-6 top-6 font-serif text-xs font-black text-[#74563c]/50">{String(indexReal + 1).padStart(2, '0')}</span>
                    <div className={`absolute ${fotoIndex === 0 ? 'right-7 top-7' : 'bottom-7 left-7'}`}><EnfeitePagina tipo={indexReal % 3} /></div>
                    <FotoAlbum foto={foto} index={indexReal} borrada={isPreview} />
                  </div>
                );
              })}
            </div>
          </PaginaRevelada>
        ))}

        <PaginaRevelada index={4}>
          <div className="aventura-spread">
            <div className="aventura-page-half flex min-h-[400px] items-center justify-center sm:min-h-[520px]">
              <div className="rotate-[-8deg] opacity-55"><GloboAlbum grande /></div>
            </div>
            <div className="aventura-page-half flex min-h-[400px] items-center justify-center px-9 py-16 sm:min-h-[520px] sm:px-14">
              <p className="max-w-md whitespace-pre-wrap text-center font-serif text-lg italic leading-[1.9] text-[#503b2b] sm:text-xl">{info.textoPoema}</p>
            </div>
          </div>
        </PaginaRevelada>
      </section>

      {isDemo && (
        <section className="relative z-10 flex justify-center px-6 pb-24 pt-6">
          <Link
            href="/criar?modelo=aventuras"
            className="rounded-full bg-[#8f3036] px-8 py-4 text-center text-lg font-black text-[#fff8e7] shadow-xl shadow-[#3a2518]/30 transition hover:scale-105 hover:bg-[#76252b] active:scale-95 sm:px-10"
          >
            Quero usar este modelo
          </Link>
        </section>
      )}
    </main>
  );
}
