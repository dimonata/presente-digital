import { NextResponse } from 'next/server';
import { criarCapaModelo, type ModeloEmail } from '@/lib/gerarImagensEmail';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const modeloInformado = new URL(request.url).searchParams.get('modelo');
  const modelo: ModeloEmail = modeloInformado === 'aventuras' ? 'aventuras' : 'polaroid';

  try {
    const imagem = await criarCapaModelo(modelo);
    return new Response(new Uint8Array(imagem), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Content-Disposition': `inline; filename="capa-${modelo}.png"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar a capa do modelo:', error);
    return NextResponse.json({ error: 'Não foi possível gerar a capa.' }, { status: 500 });
  }
}
