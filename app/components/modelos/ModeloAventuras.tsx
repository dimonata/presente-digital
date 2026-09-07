"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import SpotifyPlayer from '../SpotifyPlayer';
import type { ModeloProps } from './ModeloPolaroid';

type FotoAventura = { url: string; legenda: string | null };

const fotoFallback = 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=900&auto=format&fit=crop';

const baloes = [
  { cor: '#e94b4b', esquerda: '7%', tamanho: 32, duracao: 15, atraso: -3, deriva: '35px' },
  { cor: '#f4c542', esquerda: '20%', tamanho: 24, duracao: 19, atraso: -12, deriva: '-24px' },
  { cor: '#4b9ed6', esquerda: '34%', tamanho: 28, duracao: 17, atraso: -7, deriva: '42px' },
  { cor: '#ee7b35', esquerda: '50%', tamanho: 22, duracao: 21, atraso: -15, deriva: '-32px' },
  { cor: '#7caf55', esquerda: '65%', tamanho: 30, duracao: 18, atraso: -5, deriva: '28px' },
  { cor: '#9a67ad', esquerda: '78%', tamanho: 25, duracao: 20, atraso: -16, deriva: '-38px' },
  { cor: '#e94b4b', esquerda: '90%', tamanho: 34, duracao: 16, atraso: -10, deriva: '30px' },
  { cor: '#f4c542', esquerda: '96%', tamanho: 20, duracao: 22, atraso: -2, deriva: '-20px' },
] as const;

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

function CasaComBaloes() {
  return (
    <div className="aventura-balloon-cluster relative aspect-[2/3] w-full">
      <Image
        src="/images/casa-aventura-baloes.png"
        alt="Casa vitoriana colorida flutuando sob centenas de balões"
        fill
        priority
        sizes="(max-width: 767px) 390px, 460px"
        className="object-contain drop-shadow-[0_18px_18px_rgba(41,78,91,0.18)]"
      />
    </div>
  );
}

function FotoPolaroidAventura({ foto, index, borrada }: { foto: FotoAventura; index: number; borrada: boolean }) {
  const rotacoes = ['-rotate-2', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-3', 'rotate-1'];
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
      <span className="aventura-tape absolute -top-3 left-1/2 z-20 h-7 w-24 -translate-x-1/2 -rotate-2" aria-hidden="true" />
      <div className={`relative bg-[#fffdf3] p-3 pb-7 shadow-[0_24px_60px_rgba(44,74,84,0.2)] transition duration-500 ease-out group-hover:z-10 group-hover:rotate-0 group-hover:scale-[1.025] sm:p-4 sm:pb-9 ${rotacoes[index % rotacoes.length]}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-[#cfe7e9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto.url || fotoFallback}
            alt={foto.legenda ? `Memória da nossa aventura: ${foto.legenda}` : `Aventura ${index + 1} do casal`}
            className={`h-full w-full object-cover transition-[filter,transform] duration-700 group-hover:scale-105 ${borrada ? 'scale-110 blur-2xl' : ''}`}
            loading={index < 2 ? 'eager' : 'lazy'}
          />
          <span className="absolute left-3 top-3 flex h-10 min-w-10 -rotate-3 items-center justify-center rounded-sm border-2 border-[#f7e4a9] bg-[#f3c94d] px-2 font-serif text-sm font-black text-[#55422c] shadow-md">
            {String(index + 1).padStart(2, '0')}
          </span>
          {borrada && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#324f58]/20 text-center" aria-label="Foto bloqueada até o pagamento">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fffdf3]/95 text-2xl shadow-xl" aria-hidden="true">🔒</span>
              <span className="rounded-full bg-[#fffdf3]/95 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#3e4b4c] shadow-lg">Liberada após o pagamento</span>
            </div>
          )}
        </div>
        <div className="px-2 pt-5 text-center">
          <p className="font-serif text-xl italic leading-snug text-[#4b4339] sm:text-2xl">{foto.legenda || `Nossa aventura ${index + 1}`}</p>
          <div className="mx-auto mt-4 flex items-center justify-center gap-2 text-[#d45a48]" aria-hidden="true">
            <span className="h-px w-8 bg-current opacity-35" /><span className="text-xs">●</span><span className="h-px w-8 bg-current opacity-35" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ModeloAventuras({ presente, dados, isDemo = false, isPreview = false }: ModeloProps) {
  const info = presente || dados || {
    nomeComprador: 'João', nomePresenteado: 'Maria', dataInicioNamoro: '2024-01-01',
    textoPoema: 'A maior aventura da vida é poder dividir cada passo com você.',
    idMusicaSpotify: '4uLUJ41p8tC6f0V1d9o0v4',
    fotos: Array.from({ length: 6 }, (_, index) => ({ url: fotoFallback, legenda: `Nossa aventura ${index + 1}` })),
  };
  const tempoJuntos = calcularTempoJuntos(info.dataInicioNamoro);

  return (
    <main className="aventura-sky relative min-h-screen overflow-x-hidden pb-32 text-[#40392f] selection:bg-[#f6d45f]">
      <div className="fixed bottom-4 left-1/2 z-[9999] h-[80px] w-[90%] max-w-[360px] -translate-x-1/2 overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-[0_10px_30px_rgba(31,70,83,0.3)] backdrop-blur-md transition-transform hover:scale-105">
        <SpotifyPlayer trackId={info.idMusicaSpotify} />
      </div>

      <div className="aventura-paradise-bg pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <span className="aventura-cloud aventura-cloud-one" /><span className="aventura-cloud aventura-cloud-two" />
        {baloes.map((balao, index) => (
          <span key={`${balao.esquerda}-${index}`} className="aventura-balloon-rise" style={{
            '--balloon-color': balao.cor, '--balloon-size': `${balao.tamanho}px`, '--balloon-left': balao.esquerda,
            '--balloon-duration': `${balao.duracao}s`, '--balloon-delay': `${balao.atraso}s`, '--balloon-drift': balao.deriva,
          } as CSSProperties} />
        ))}
      </div>

      <header className="relative z-10 flex min-h-[88vh] flex-col items-center justify-center px-5 pb-20 pt-12 text-center">
        <div className="hero-reveal grid w-full max-w-5xl items-center gap-4 md:grid-cols-[1.05fr_.95fr] md:text-left">
          <div className="order-2 md:order-1">
            <span className="aventura-badge mb-5 inline-block -rotate-2">NOSSA MAIOR AVENTURA</span>
            <h1 className="font-serif text-5xl font-black leading-[0.92] tracking-tight text-[#3f3830] sm:text-7xl md:text-8xl">
              <span className="block">{info.nomeComprador}</span><span className="my-2 block font-normal italic text-[#d65345] sm:my-4">&</span><span className="block">{info.nomePresenteado}</span>
            </h1>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.28em] text-[#426f7a]">Juntos explorando a vida há</p>
            <div className="mt-5 grid max-w-lg grid-cols-3 gap-2 sm:gap-4">
              {tempoJuntos.map(({ valor, singular, plural }, index) => (
                <div key={singular} className={`${index === 1 ? 'rotate-1' : '-rotate-1'} border-2 border-[#5b4a38]/15 bg-[#fffdf3]/90 px-2 py-4 text-center shadow-[4px_6px_0_rgba(80,106,105,0.14)] backdrop-blur-sm sm:px-6 sm:py-5`}>
                  <strong className="block font-serif text-3xl text-[#d65345] sm:text-4xl">{valor}</strong>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-[#5b655f] sm:text-xs">{valor === 1 ? singular : plural}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 mx-auto w-full max-w-[390px] md:order-2 md:max-w-[460px]"><CasaComBaloes /></div>
        </div>
        <a href="#nossas-aventuras" className="absolute bottom-5 flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#426f7a] transition hover:text-[#d65345]">
          Nossas aventuras<span className="scroll-hint text-xl" aria-hidden="true">↓</span>
        </a>
      </header>

      <section id="nossas-aventuras" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-5 py-16 sm:px-8">
        <div className="mb-16 text-center">
          <span className="aventura-badge inline-block rotate-1">MEMÓRIAS DE VIAGEM</span>
          <h2 className="mt-5 font-serif text-4xl font-black text-[#3f3830] sm:text-5xl">Seis paradas inesquecíveis</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#52666a] sm:text-base">Cada fotografia é um pedacinho do mapa da história que vocês estão construindo juntos.</p>
        </div>
        <div className="grid items-start gap-x-16 gap-y-14 md:grid-cols-2 md:gap-y-4">
          {info.fotos.slice(0, 6).map((foto, index) => <FotoPolaroidAventura key={`${foto.url}-${index}`} foto={foto} index={index} borrada={isPreview} />)}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-32 text-center sm:px-8 md:pt-44">
        <div className="letter-reveal aventura-letter relative rotate-1 border-2 border-[#866c47]/15 bg-[#fff9df] px-6 py-14 shadow-[0_30px_80px_rgba(44,74,84,0.18)] sm:px-14 sm:py-20">
          <span className="aventura-tape absolute -top-4 left-1/2 h-8 w-32 -translate-x-1/2 -rotate-2" aria-hidden="true" />
          <span className="aventura-postmark absolute right-5 top-6 -rotate-12" aria-hidden="true">PARAÍSO<br />ETERNO</span>
          <p className="mb-5 text-xs font-black uppercase tracking-[0.32em] text-[#d65345]">A aventura continua</p>
          <h2 className="font-serif text-3xl font-black text-[#3f3830] sm:text-4xl">Nosso livro de aventuras</h2>
          <div className="mx-auto my-7 flex items-center justify-center gap-2" aria-hidden="true"><span className="h-px w-12 bg-[#426f7a]/30" /><span className="text-[#f0ba35]">◆</span><span className="h-px w-12 bg-[#426f7a]/30" /></div>
          <p className="whitespace-pre-wrap font-serif text-lg italic leading-[1.9] text-[#514b40] sm:text-xl">{info.textoPoema}</p>
          <p className="mt-10 font-serif text-lg font-black text-[#d65345]">Com amor, {info.nomeComprador}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-[#426f7a]">A melhor aventura é ao seu lado</p>
        </div>
      </section>

      {isDemo && (
        <section className="relative z-10 flex justify-center border-t border-[#426f7a]/10 px-6 pb-20 pt-12">
          <Link href="/criar?modelo=aventuras" className="flex items-center gap-3 rounded-full bg-[#d65345] px-8 py-4 text-center text-lg font-black text-white shadow-xl shadow-[#8d493e]/25 transition hover:scale-105 hover:bg-[#bd4439] active:scale-95 sm:px-10">
            Quero viver esta aventura <span aria-hidden="true">↑</span>
          </Link>
        </section>
      )}
    </main>
  );
}
