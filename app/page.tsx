"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { modelosDisponiveis, type ConfiguracaoModelo, type ModeloId } from './components/modelos';
import imagemQrCodeEmail from '../public/qr-code-email.png';
import imagemQrCodeBuque from '../public/qr-code-buque.png';

const dadosMockPolaroide = {
  nomeComprador: "João",
  nomePresenteado: "Ana",
  dataInicioNamoro: "2023-06-12",
  fotos: [
    { 
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop", 
      legenda: "Nosso primeiro pôr do sol juntos 🌅" 
    },
    { 
      url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop", 
      legenda: "Aquela viagem inesquecível para a praia... o melhor final de semana!" 
    },
    { 
      url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop", 
      legenda: "Dizendo sim para o nosso futuro ❤️" 
    },
    {
      url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600&auto=format&fit=crop",
      legenda: "Um abraço que sempre parece casa"
    },
    {
      url: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=600&auto=format&fit=crop",
      legenda: "Colecionando sorrisos ao seu lado"
    },
    {
      url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop",
      legenda: "Que venham muitos outros capítulos"
    }
  ],
  textoPoema: "Cada momento ao seu lado é como uma fotografia perfeita que eu quero guardar para sempre. Construir essa história com você é a melhor aventura da minha vida. Te amo!",
  idMusicaSpotify: "3SdTKo2uVsxFblQjpScoHy"
};

const modelosDoCarrossel = Object.entries(modelosDisponiveis) as Array<
  [ModeloId, ConfiguracaoModelo]
>;

function MiniaturaModelo({ modeloId }: { modeloId: ModeloId }) {
  if (modeloId === 'aventuras') {
    return (
      <div className="overflow-hidden rounded-[1.75rem] bg-[#c99c60] px-4 pb-5 pt-6 text-[#3e2b1e]">
        <div className="relative mx-auto mt-2 min-h-80 max-w-[220px] rounded-r-2xl border-[5px] border-[#342319] bg-[#59402d] px-5 py-8 shadow-2xl">
          <span className="absolute inset-y-0 left-0 w-5 border-r border-black/30 bg-[#332218]" />
          <div className="pointer-events-none absolute inset-2 border border-[#a83f4c]/70" />
          <div className="mt-7 px-2 py-7 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#cf4e45]">Nosso livro de</p>
            <h4 className="mt-1 font-serif text-2xl font-black text-[#e3b846]">AVENTURAS</h4>
            <div className="mx-auto my-4 h-px w-16 bg-[#a83f4c]" />
            <p className="-rotate-1 bg-[#e9dab4] px-2 py-3 font-serif text-sm font-black text-[#322820]">João & Ana</p>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-1 text-center">
            {['1 ano', '2 meses', '12 dias'].map((tempo) => (
              <span key={tempo} className="-rotate-1 bg-[#d9b977] px-1 py-2 text-[8px] font-black">{tempo}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-[#f5f2eb] px-4 pb-5 pt-6 text-center text-zinc-900">
      <p className="font-serif text-xs italic text-red-700">João & Ana</p>
      <h4 className="mt-1 font-serif text-lg font-black">Nossa história de amor</h4>
      <div className="relative mx-auto mt-5 h-56 max-w-[220px]">
        <div className="absolute left-2 top-1 w-28 -rotate-6 bg-white p-2 pb-7 shadow-xl">
          <div className="h-24 bg-gradient-to-br from-red-200 via-rose-400 to-red-900" />
        </div>
        <div className="absolute right-1 top-16 w-28 rotate-6 bg-white p-2 pb-7 shadow-xl">
          <div className="h-24 bg-gradient-to-br from-amber-100 via-red-300 to-rose-800" />
        </div>
        <span className="absolute left-1/2 top-20 -translate-x-1/2 text-3xl drop-shadow">❤️</span>
      </div>
      <div className="rounded-2xl bg-white/80 px-3 py-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-700">Juntos há</p>
        <p className="mt-1 font-serif text-sm font-black">1 ano • 2 meses • 12 dias</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [demoAberta, setDemoAberta] = useState<ModeloId | null>(null);
  const ModeloDemonstracao = demoAberta ? modelosDisponiveis[demoAberta].componente : null;

  useEffect(() => {
    if (!demoAberta) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [demoAberta]);

  return (
    <main className="flex flex-col min-h-screen bg-black text-zinc-100 font-sans overflow-x-hidden relative">
      
      {/* Modal de Demonstração do Tema */}
      {ModeloDemonstracao && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex flex-col animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-16 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-between px-6 border-b border-white/10 shadow-xl">
            <span className="text-white/70 font-medium text-sm tracking-widest uppercase">Modo Demonstração</span>
            <button 
              onClick={() => setDemoAberta(null)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-transform hover:scale-105 shadow-lg shadow-red-900/30"
            >
              Fechar Demonstração
            </button>
          </div>
          
          <div className="h-full w-full overflow-y-auto">
            <ModeloDemonstracao presente={dadosMockPolaroide} isDemo />
          </div>
        </div>
      )}

      {/* 1. Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center bg-zinc-950 rounded-b-[3rem] shadow-xl border-b border-red-950/40">
        <h1 className="text-4xl md:text-5xl font-black text-red-500 mb-4 tracking-tight leading-tight uppercase">
          Surpreenda seu amor com um presente inesquecível em 5 minutos.
        </h1>
        <p className="text-lg text-zinc-400 mb-8 max-w-md">
          Crie uma página exclusiva com as fotos de vocês, música especial e um contador do tempo de namoro.
        </p>
        <Link 
          href="/criar" 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-transform transform hover:scale-105 active:scale-95 w-full max-w-xs text-center"
        >
          Criar meu presente
        </Link>
      </section>

      {/* 2. Como funciona */}
      <section className="border-y border-red-950/30 bg-zinc-950 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-red-500">Simples e inesquecível</p>
            <h2 className="text-3xl font-black text-zinc-100 md:text-4xl">Como funciona?</h2>
          </div>

          <div className="space-y-8">
            <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 p-5 shadow-2xl sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white shadow-lg shadow-red-950/50">1</span>
                <div>
                  <h3 className="text-xl font-black text-white sm:text-2xl">Escolha o modelo perfeito</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">Deslize para conhecer todos os modelos disponíveis e veja, na vertical, como a página ficará no celular.</p>
                </div>
              </div>

              <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 hide-scrollbar">
                {modelosDoCarrossel.map(([modeloId, modelo]) => (
                  <button
                    key={modeloId}
                    type="button"
                    onClick={() => setDemoAberta(modeloId)}
                    className="group min-w-[82vw] snap-center text-left sm:min-w-[310px]"
                    aria-label={`Ver demonstração do ${modelo.nome}`}
                  >
                    <div className="mx-auto w-full max-w-[310px] rounded-[2.5rem] border-[7px] border-zinc-800 bg-[#f5f2eb] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition duration-300 group-hover:-translate-y-1 group-hover:border-red-900">
                      <div className="mb-3 flex justify-center"><span className="h-1.5 w-16 rounded-full bg-zinc-300" /></div>
                      <MiniaturaModelo modeloId={modeloId} />
                    </div>
                    <div className="mx-auto mt-5 flex max-w-[310px] items-center justify-between gap-3">
                      <span className="font-bold text-zinc-100">{modelo.nome}</span>
                      <span className="shrink-0 text-sm font-bold text-red-500 transition group-hover:text-red-400">Ver modelo →</span>
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <div className="grid gap-8 lg:grid-cols-2">
              <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl">
                <div className="flex items-start gap-4 p-5 sm:p-8">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white shadow-lg shadow-red-950/50">2</span>
                  <div>
                    <h3 className="text-xl font-black text-white sm:text-2xl">Receba tudo por e-mail</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400 sm:text-base">Após a confirmação do pagamento, enviamos o link exclusivo e o QR Code diretamente para você.</p>
                  </div>
                </div>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={imagemQrCodeEmail}
                    alt="Celular exibindo por e-mail o QR Code do presente"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                </div>
              </article>

              <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl">
                <div className="flex items-start gap-4 p-5 sm:p-8">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white shadow-lg shadow-red-950/50">3</span>
                  <div>
                    <h3 className="text-xl font-black text-white sm:text-2xl">Transforme em uma surpresa</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400 sm:text-base">Imprima o QR Code, coloque no buquê ou em outro presente e prepare-se para viver a reação.</p>
                  </div>
                </div>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={imagemQrCodeBuque}
                    alt="QR Code impresso preso a um buquê de flores vermelhas e brancas"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Chamada para Ação */}
      <section className="pt-20 pb-24 px-6 flex flex-col items-center text-center bg-gradient-to-b from-zinc-950 to-black text-white rounded-t-[3rem]">
        <h2 className="text-3xl font-extrabold mb-3 text-red-500">Pronto para emocionar?</h2>
        <p className="mb-10 text-zinc-400 font-medium">Crie totalmente de graça. Pague R$ 29,90 apenas se decidir publicar.</p>
        <Link 
          href="/criar" 
          className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-8 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-transform transform hover:scale-105 active:scale-95 w-full max-w-xs text-lg text-center"
        >
          Começar agora
        </Link>
      </section>

    </main>
  );
}
