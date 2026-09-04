import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { isModeloDisponivel, modelosDisponiveis } from '../../../components/modelos';

export default async function EscolherModeloPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const presente = await prisma.presente.findUnique({
    where: { id: id },
    include: { fotos: true }
  });

  if (!presente) notFound();

  // 🔥 SERVER ACTION: Salva o modelo escolhido e manda pra página final
  async function salvarEscolha(formData: FormData) {
    "use server";
    const modeloEscolhido = formData.get('modeloId');

    if (typeof modeloEscolhido !== 'string' || !isModeloDisponivel(modeloEscolhido)) {
      throw new Error('Modelo inválido.');
    }
    
    await prisma.presente.update({
      where: { id: id },
      data: { modelo: modeloEscolhido }
    });
    
    redirect(`/presente/${id}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      
      {/* Cabeçalho Fixo */}
      <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 py-6 text-center shadow-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-red-500">Escolha o Tema do seu Presente</h1>
        <p className="text-zinc-400 mt-2">Veja as prévias abaixo e escolha o que mais combina com vocês!</p>
      </div>

      <div className="flex flex-col gap-16 mt-12 max-w-6xl mx-auto px-4">
        {Object.entries(modelosDisponiveis).map(([chave, config]) => {
          const Componente = config.componente;

          return (
            <div key={chave} className="relative bg-zinc-900 rounded-[2rem] border-2 border-zinc-700 shadow-2xl overflow-hidden flex flex-col">
              
              {/* Barra de controle de cada modelo */}
              <div className="bg-zinc-800 py-4 px-6 flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-zinc-700">
                <h2 className="text-xl font-bold text-white">{config.nome}</h2>
                <form action={salvarEscolha}>
                  <input type="hidden" name="modeloId" value={chave} />
                  <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                    Usar este Modelo ❤️
                  </button>
                </form>
              </div>

              {/* Caixa rolável com a prévia do modelo usando os dados REAIS do usuário */}
              <div className="h-[75vh] overflow-y-auto overflow-x-hidden custom-scrollbar bg-black">
                {/* isDemo={false} para não mostrar o botão "Quero usar esse modelo" dentro da prévia */}
                <Componente presente={presente} isDemo={false} />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
