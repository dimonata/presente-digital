import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { isModeloDisponivel, modelosDisponiveis } from '../../components/modelos';

export default async function PresentePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const presente = await prisma.presente.findUnique({
    where: { id: id },
    include: { fotos: true }
  });

  if (!presente) {
    notFound();
  }

  const modeloId = isModeloDisponivel(presente.modelo) ? presente.modelo : 'polaroid';
  const ModeloSelecionado = modelosDisponiveis[modeloId].componente;

  return (
    <main className="min-h-screen bg-zinc-950 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-20">
        
        {/* Renderiza o Modelo Polaroide com os dados do banco */}
        <section>
          <ModeloSelecionado presente={presente} />
        </section>

      </div>
    </main>
  );
}
