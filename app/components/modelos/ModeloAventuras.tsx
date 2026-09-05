"use client";

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import SpotifyPlayer from '../SpotifyPlayer';
import type { ModeloProps } from './ModeloPolaroid';

const fotoFallback = 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=900&auto=format&fit=crop';

const baloesDecorativos = [
  { cor: '#b43f3a', esquerda: '4%', topo: '4%', duracao: '6.8s', atraso: '0s' },
  { cor: '#d5a62f', esquerda: '88%', topo: '11%', duracao: '7.4s', atraso: '-2s' },
  { cor: '#3f7780', esquerda: '7%', topo: '29%', duracao: '8.2s', atraso: '-4s' },
  { cor: '#658650', esquerda: '91%', topo: '42%', duracao: '7.1s', atraso: '-1s' },
  { cor: '#b35d35', esquerda: '3%', topo: '63%', duracao: '8.6s', atraso: '-5s' },
  { cor: '#76517e', esquerda: '89%', topo: '79%', duracao: '7.8s', atraso: '-3s' },
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
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={`aventura-page-reveal ${visivel ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      {children}
    </article>
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
  const rotacao = index % 2 === 0 ? '-rotate-2' : 'rotate-2';

  return (
    <figure className={`group relative mx-auto w-full max-w-sm ${rotacao} transition duration-500 hover:z-20 hover:rotate-0 hover:scale-[1.025]`}>
      <span className="absolute -top-3 left-1/2 z-10 h-7 w-24 -translate-x-1/2 rotate-1 bg-amber-100/75 shadow-sm" aria-hidden="true" />
      <div className="bg-[#f7f0dc] p-3 pb-6 shadow-[0_14px_30px_rgba(57,40,25,0.25)] sm:p-4 sm:pb-8">
        <div className="relative aspect-[4/3] overflow-hidden bg-amber-100">
          {/* URLs locais da prévia e imagens em data URL precisam ser aceitas aqui. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto.url || fotoFallback}
            alt={foto.legenda ? `Memória da aventura: ${foto.legenda}` : `Memória ${index + 1}`}
            className={`h-full w-full object-cover sepia-[0.12] transition duration-700 group-hover:scale-105 ${borrada ? 'scale-110 blur-2xl' : ''}`}
            loading={index < 2 ? 'eager' : 'lazy'}
          />
          {borrada && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#513b28]/20 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff9e9]/95 text-xl shadow-lg" aria-hidden="true">🔒</span>
              <span className="rounded bg-[#fff9e9]/95 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#513b28] shadow">Foto após o pagamento</span>
            </div>
          )}
        </div>
        <figcaption className="px-2 pt-5 text-center font-serif text-lg font-bold italic leading-snug text-[#493522] sm:text-xl">
          {foto.legenda}
        </figcaption>
      </div>
      <span className="absolute -right-3 -top-5 rotate-12 rounded-full border-2 border-dashed border-[#b45235] bg-[#e6c264] px-3 py-2 text-xs font-black text-[#56351f] shadow" aria-hidden="true">
        #{String(index + 1).padStart(2, '0')}
      </span>
    </figure>
  );
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
  const coresLetras = ['#d65446', '#e3b846', '#efe1ba', '#d65446', '#e3b846', '#efe1ba', '#d65446', '#e3b846', '#efe1ba'];

  return (
    <main className="aventura-table relative min-h-screen overflow-x-hidden pb-32 text-[#3f2d1e] selection:bg-amber-200">
      {/* O player conserva exatamente o mesmo comportamento dos outros modelos. */}
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

      <header className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-8">
        <div className="aventura-cover aventura-cover-enter relative w-full max-w-3xl overflow-visible border-[8px] border-[#191716] px-8 py-14 shadow-[18px_24px_55px_rgba(42,25,13,0.5)] sm:px-20 sm:py-20">
          <div className="pointer-events-none absolute inset-3 border border-[#a83f4c]/80" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-5 border border-[#a83f4c]/40" aria-hidden="true" />
          <div className="absolute inset-y-[-8px] left-0 w-11 border-x border-black/40 bg-[#7d2131] shadow-[inset_-7px_0_12px_rgba(0,0,0,0.35)] sm:w-16" />
          <div className="absolute -left-7 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-8 sm:-left-9 sm:gap-11" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((argola) => (
              <span key={argola} className="relative block h-4 w-12 rounded-full border-[3px] border-[#171514] shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:w-16">
                <span className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#b8aca0] bg-[#2a2521]" />
              </span>
            ))}
          </div>

          <div className="relative mx-auto max-w-xl px-5 py-8 text-center sm:px-10">
            <p className="aventura-title text-2xl font-black uppercase tracking-[0.16em] text-[#cf4e45] sm:text-4xl">Nosso livro de</p>
            <h1 className="aventura-title mt-1 flex flex-wrap justify-center text-4xl font-black leading-none sm:text-7xl" aria-label="Aventuras">
              {letrasAventuras.map((letra, index) => (
                <span key={`${letra}-${index}`} className={index % 2 === 0 ? '-rotate-2' : 'rotate-2'} style={{ color: coresLetras[index] }}>
                  {letra}
                </span>
              ))}
            </h1>
            <div className="mx-auto my-7 flex items-center justify-center gap-3 text-[#b34648]" aria-hidden="true">
              <span className="h-px w-16 bg-current" /><span className="text-2xl text-[#d7b345]">◉</span><span className="h-px w-16 bg-current" />
            </div>
            <div className="mx-auto max-w-md -rotate-1 border border-[#d6c79f]/50 bg-[#e9dab4] px-4 py-5 shadow-lg">
              <p className="font-serif text-2xl font-black text-[#322820] sm:text-4xl">{info.nomeComprador}</p>
              <p className="relative my-1 font-serif text-xl italic text-[#9b3440]">&</p>
              <p className="font-serif text-2xl font-black text-[#322820] sm:text-4xl">{info.nomePresenteado}</p>
            </div>
          </div>

          <div className="relative mx-auto mt-12 grid max-w-lg grid-cols-3 gap-2 sm:gap-4">
            {tempo.map(({ valor, rotulo }, index) => (
              <div key={rotulo} className={`${index === 1 ? 'rotate-2' : '-rotate-1'} border-2 border-[#3d2a1d]/20 bg-[#d9b977] px-2 py-3 text-center shadow-md`}>
                <strong className="block font-serif text-2xl text-[#3d2a1d] sm:text-3xl">{valor}</strong>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#6c4930] sm:text-[10px]">{rotulo}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl space-y-20 px-4 py-20 sm:px-8">
        {paginas.map((fotosDaPagina, paginaIndex) => (
          <PaginaRevelada key={paginaIndex} index={paginaIndex}>
            <div className="aventura-paper relative overflow-hidden rounded-sm px-6 pb-16 pt-20 shadow-[12px_18px_45px_rgba(51,32,17,0.3)] sm:px-14 sm:pb-20">
              <div className="absolute inset-y-0 left-3 flex flex-col justify-around py-10" aria-hidden="true">
                {[0, 1, 2, 3].map((furo) => (
                  <span key={furo} className="h-4 w-4 rounded-full bg-[#72563b]/25 shadow-[inset_1px_2px_3px_rgba(45,28,15,0.35)]" />
                ))}
              </div>
              <div className="absolute right-6 top-6 rotate-6 border-2 border-[#b45235]/55 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#9c4936]/75" aria-hidden="true">
                Página {paginaIndex + 1}
              </div>
              <div className="absolute left-10 top-8 -rotate-6 text-4xl text-[#4f7c73]/55" aria-hidden="true">
                {paginaIndex === 0 ? '⌖' : paginaIndex === 1 ? '✈' : '★'}
              </div>
              <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20" viewBox="0 0 800 600" preserveAspectRatio="none" aria-hidden="true">
                <path d="M70 500 C 180 390, 170 180, 330 240 S 560 470, 735 115" fill="none" stroke="#7b4e31" strokeWidth="4" strokeDasharray="10 13" />
              </svg>

              <div className="relative grid gap-16 md:grid-cols-2 md:gap-12">
                {fotosDaPagina.map((foto, fotoIndex) => {
                  const indexReal = paginaIndex * 2 + fotoIndex;
                  return <FotoAlbum key={`${foto.url}-${indexReal}`} foto={foto} index={indexReal} borrada={isPreview} />;
                })}
              </div>
            </div>
          </PaginaRevelada>
        ))}

        <PaginaRevelada index={3}>
          <div className="aventura-paper relative overflow-hidden px-7 py-20 text-center shadow-[12px_18px_45px_rgba(51,32,17,0.3)] sm:px-16 sm:py-24">
            <span className="absolute -right-5 -top-5 rotate-12 text-8xl text-[#d7a83d]/35" aria-hidden="true">★</span>
            <p className="mx-auto max-w-2xl whitespace-pre-wrap font-serif text-lg italic leading-[1.9] text-[#5f4733] sm:text-xl">{info.textoPoema}</p>
          </div>
        </PaginaRevelada>
      </section>

      {isDemo && (
        <section className="relative z-10 flex justify-center px-6 pb-24 pt-8">
          <Link
            href="/criar?modelo=aventuras"
            className="rounded-full bg-[#a64632] px-8 py-4 text-center text-lg font-black text-[#fff8e7] shadow-xl shadow-[#3a2518]/30 transition hover:scale-105 hover:bg-[#8f3929] active:scale-95 sm:px-10"
          >
            Quero usar este modelo
          </Link>
        </section>
      )}
    </main>
  );
}
