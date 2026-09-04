"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TemaPolaroide from './components/modelos/ModeloPolaroid';

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
    }
  ],
  textoPoema: "Cada momento ao seu lado é como uma fotografia perfeita que eu quero guardar para sempre. Construir essa história com você é a melhor aventura da minha vida. Te amo!",
  idMusicaSpotify: "3SdTKo2uVsxFblQjpScoHy"
};

export default function LandingPage() {
  const [demoAberta, setDemoAberta] = useState<string | null>(null);

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
      {demoAberta === 'retro' && (
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
            {/* Passando a prop como 'presente' e ativando a flag isDemo */}
            <TemaPolaroide presente={dadosMockPolaroide} isDemo={true} />
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

      {/* 2. Carrossel de Modelos */}
      <section className="py-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-8 text-zinc-200">
          Veja como a página fica incrível
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
          
          <div className="min-w-[85vw] md:min-w-[300px] bg-zinc-900 p-4 rounded-3xl shadow-lg snap-center flex flex-col items-center border border-red-950/50">
            <div className="w-full h-56 bg-zinc-950 rounded-2xl mb-4 flex items-center justify-center border border-red-900/20">
              <span className="text-red-500/70 font-medium">✨ Visual Romance Intenso</span>
            </div>
            <h3 className="font-bold text-xl mb-1 text-zinc-100">Estilo Clássico</h3>
            <button className="mt-3 text-zinc-500 font-semibold cursor-not-allowed">
              Em breve
            </button>
          </div>

          {/* Card Estilo Retrô */}
          <div 
            onClick={() => setDemoAberta('retro')}
            className="min-w-[85vw] md:min-w-[300px] bg-zinc-900 p-4 rounded-3xl shadow-lg snap-center flex flex-col items-center border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.15)] relative cursor-pointer group"
          >
            <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Popular</div>
            
            <div className="w-full h-56 bg-[#F5F2EB] rounded-2xl mb-4 flex items-center justify-center border border-zinc-300/50 shadow-inner overflow-hidden transition-transform transform group-hover:scale-[1.02]">
               <div className="flex gap-2 rotate-3">
                 <div className="w-16 h-20 bg-white p-1 shadow-md -rotate-6"><div className="w-full h-14 bg-zinc-300"></div></div>
                 <div className="w-16 h-20 bg-white p-1 shadow-md rotate-3 translate-y-2"><div className="w-full h-14 bg-zinc-400"></div></div>
               </div>
            </div>
            
            <h3 className="font-bold text-xl mb-1 text-zinc-100">Estilo Retrô (Polaroid)</h3>
            <span className="mt-3 text-red-500 font-semibold group-hover:text-red-400 transition-colors">
              Ver demonstração real ➔
            </span>
          </div>

        </div>
      </section>

      {/* 3. Como Entregar */}
      <section className="py-16 px-6 bg-zinc-950 flex flex-col items-center text-center border-t border-b border-red-950/30">
        <h2 className="text-2xl font-bold mb-10 text-zinc-200">Como entregar o presente?</h2>
        <div className="flex flex-col gap-8 max-w-sm w-full">
          <div className="flex items-center gap-5 text-left">
            <div className="w-14 h-14 flex-shrink-0 bg-red-950/50 border border-red-900/40 text-red-500 rounded-full flex items-center justify-center font-black text-2xl shadow-inner">1</div>
            <p className="text-zinc-300 font-medium">Você cria e personaliza a página exclusiva do casal.</p>
          </div>
          <div className="flex items-center gap-5 text-left">
            <div className="w-14 h-14 flex-shrink-0 bg-red-950/50 border border-red-900/40 text-red-500 rounded-full flex items-center justify-center font-black text-2xl shadow-inner">2</div>
            <p className="text-zinc-300 font-medium">Nós geramos um QR Code e um link único para você.</p>
          </div>
          <div className="flex items-center gap-5 text-left">
            <div className="w-14 h-14 flex-shrink-0 bg-red-950/50 border border-red-900/40 text-red-500 rounded-full flex items-center justify-center font-black text-2xl shadow-inner">3</div>
            <p className="text-zinc-300 font-medium">Imprima, coloque em um cartão físico e veja a reação!</p>
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
