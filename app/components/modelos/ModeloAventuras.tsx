"use client";

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import SpotifyPlayer from '../SpotifyPlayer';
import type { ModeloProps } from './ModeloPolaroid';

const fotoFallback = 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=900&auto=format&fit=crop';

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
          {foto.legenda || `Aventura número ${index + 1}`}
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
    textoPoema: 'A vida ao seu lado é a maior de todas as aventuras. E o melhor capítulo ainda está por vir.',
    idMusicaSpotify: '4uLUJ41p8tC6f0V1d9o0v4',
    fotos: Array.from({ length: 6 }, (_, index) => ({ url: fotoFallback, legenda: `Nossa aventura ${index + 1}` })),
  };

  const tempo = calcularTempo(info.dataInicioNamoro);
  const fotos = info.fotos.slice(0, 6);
  const paginas = Array.from({ length: 3 }, (_, pagina) => fotos.slice(pagina * 2, pagina * 2 + 2));
  const coresBaloes = ['#d84a3a', '#e3b23c', '#4a8f9d', '#739c58', '#e47a45', '#8d5a9f'];

  return (
    <main className="aventura-table relative min-h-screen overflow-x-hidden pb-32 text-[#3f2d1e] selection:bg-amber-200">
      {/* O player conserva exatamente o mesmo comportamento dos outros modelos. */}
      <div className="fixed bottom-4 left-1/2 z-[9999] h-[80px] w-[90%] max-w-[360px] -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-300/60 bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform hover:scale-105">
        <SpotifyPlayer trackId={info.idMusicaSpotify} />
      </div>

      <header className="relative flex min-h-screen items-center justify-center px-4 py-16 sm:px-8">
        <div className="aventura-cover aventura-cover-enter relative w-full max-w-3xl overflow-hidden rounded-r-[2.5rem] border-[10px] border-[#3b291c] px-7 py-16 shadow-[18px_24px_55px_rgba(42,25,13,0.45)] sm:px-16 sm:py-20">
          <div className="absolute inset-y-0 left-0 w-8 border-r-2 border-black/30 bg-[#35251a] shadow-[inset_-5px_0_10px_rgba(0,0,0,0.3)] sm:w-12" />
          <div className="absolute left-1 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-16 sm:left-3" aria-hidden="true">
            {[0, 1, 2].map((argola) => (
              <span key={argola} className="block h-8 w-8 rounded-full border-[7px] border-[#d1a55d] bg-[#23170f] shadow-[inset_0_2px_3px_#000,0_2px_4px_#0008]" />
            ))}
          </div>

          <div className="absolute right-5 top-4 h-44 w-36 sm:right-10 sm:top-8" aria-hidden="true">
            {coresBaloes.map((cor, index) => (
              <span
                key={cor}
                className="aventura-balloon absolute h-12 w-10 rounded-[50%_50%_46%_46%] border-2 border-black/10 shadow-sm"
                style={{
                  backgroundColor: cor,
                  left: `${(index % 3) * 34 + (index > 2 ? 12 : 0)}px`,
                  top: `${Math.floor(index / 3) * 42 + (index % 2) * 8}px`,
                  animationDelay: `${index * 180}ms`,
                }}
              />
            ))}
            <span className="absolute left-16 top-20 h-24 w-px rotate-6 bg-amber-100/60" />
            <span className="absolute left-10 top-20 h-24 w-px -rotate-12 bg-amber-100/60" />
          </div>

          <div className="relative mx-auto mt-16 max-w-xl -rotate-1 border-4 border-[#ded0ad] bg-[#f4e8c9] px-5 py-10 text-center shadow-[0_8px_0_#2c1d13,0_15px_30px_rgba(0,0,0,0.3)] sm:mt-10 sm:px-10">
            <span className="absolute inset-2 border-2 border-dashed border-[#8a7657]/60" aria-hidden="true" />
            <p className="relative text-xs font-black uppercase tracking-[0.32em] text-[#9c4936]">Nosso álbum de</p>
            <h1 className="relative mt-3 font-serif text-4xl font-black leading-none text-[#3b2b1f] sm:text-6xl">Aventuras</h1>
            <div className="relative mx-auto my-7 flex items-center justify-center gap-3 text-[#9c4936]" aria-hidden="true">
              <span className="h-px w-12 bg-current" /><span>✦</span><span className="h-px w-12 bg-current" />
            </div>
            <p className="relative font-serif text-2xl font-black text-[#503724] sm:text-4xl">{info.nomeComprador}</p>
            <p className="relative my-1 font-serif text-xl italic text-[#b45235]">&</p>
            <p className="relative font-serif text-2xl font-black text-[#503724] sm:text-4xl">{info.nomePresenteado}</p>
          </div>

          <div className="relative mx-auto mt-12 grid max-w-lg grid-cols-3 gap-2 sm:gap-4">
            {tempo.map(({ valor, rotulo }, index) => (
              <div key={rotulo} className={`${index === 1 ? 'rotate-2' : '-rotate-1'} border-2 border-[#3d2a1d]/20 bg-[#d9b977] px-2 py-3 text-center shadow-md`}>
                <strong className="block font-serif text-2xl text-[#3d2a1d] sm:text-3xl">{valor}</strong>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#6c4930] sm:text-[10px]">{rotulo}</span>
              </div>
            ))}
          </div>
          <p className="relative mt-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#e5ce9d]/75">Nossa maior viagem começou quando nos encontramos</p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl space-y-20 px-4 py-20 sm:px-8">
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
              <p className="relative mt-14 text-center font-serif text-sm font-bold italic text-[#79583b]/70">
                {paginaIndex === 0 && 'O começo de tudo — onde a nossa rota se encontrou.'}
                {paginaIndex === 1 && 'Entre risadas e descobertas, fizemos do mundo o nosso lugar.'}
                {paginaIndex === 2 && 'Ainda temos tantos destinos e capítulos para viver.'}
              </p>
            </div>
          </PaginaRevelada>
        ))}

        <PaginaRevelada index={3}>
          <div className="aventura-paper relative overflow-hidden px-7 py-20 text-center shadow-[12px_18px_45px_rgba(51,32,17,0.3)] sm:px-16 sm:py-24">
            <span className="absolute -right-5 -top-5 rotate-12 text-8xl text-[#d7a83d]/35" aria-hidden="true">★</span>
            <span className="absolute bottom-5 left-7 -rotate-12 border-4 border-double border-[#527b74]/40 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#527b74]/60" aria-hidden="true">Próxima parada: para sempre</span>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#a34f38]">Uma mensagem para você</p>
            <h2 className="mt-5 font-serif text-4xl font-black text-[#3c2b1e] sm:text-5xl">A melhor aventura é ao seu lado</h2>
            <div className="mx-auto my-8 h-px w-24 bg-[#8e6543]/35" />
            <p className="mx-auto max-w-2xl whitespace-pre-wrap font-serif text-lg italic leading-[1.9] text-[#5f4733] sm:text-xl">{info.textoPoema}</p>
            <p className="mt-10 font-serif text-xl font-black text-[#9c4936]">Com amor, {info.nomeComprador} ♥</p>
          </div>
        </PaginaRevelada>
      </section>

      {isDemo && (
        <section className="flex justify-center px-6 pb-24 pt-8">
          <Link
            href="/criar?modelo=aventuras"
            className="rounded-full bg-[#a64632] px-8 py-4 text-center text-lg font-black text-[#fff8e7] shadow-xl shadow-[#3a2518]/30 transition hover:scale-105 hover:bg-[#8f3929] active:scale-95 sm:px-10"
          >
            Quero viver esta aventura ♥
          </Link>
        </section>
      )}
    </main>
  );
}
