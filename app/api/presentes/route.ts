import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { enviarPresentePorEmail } from '@/lib/enviarPresentePorEmail';

const PRECO_PRESENTE = 29.9;
const TAMANHO_MAXIMO_FOTO = 500 * 1024;
const TIPOS_DE_FOTO_ACEITOS = ['image/jpeg'];

type PagamentoMercadoPago = {
  id?: number;
  status?: string;
  external_reference?: string;
  transaction_amount?: number;
  currency_id?: string;
};

async function tentarEnviarPresentePorEmail(parametros: Parameters<typeof enviarPresentePorEmail>[0]) {
  try {
    return await enviarPresentePorEmail(parametros);
  } catch (error) {
    console.error('Erro inesperado ao preparar o e-mail do presente:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Pagamento não configurado.' }, { status: 503 });
    }

    const formData = await request.formData();

    const nomeComprador = formData.get('nomeComprador') as string;
    const nomePresenteado = formData.get('nomePresenteado') as string;
    const emailEntrega = formData.get('emailEntrega');
    const dataInicioNamoro = formData.get('dataInicioNamoro') as string;
    const textoPoema = formData.get('textoPoema') as string;
    const idMusicaSpotify = formData.get('idMusicaSpotify') as string;
    const pagamentoId = formData.get('pagamentoId');
    const referenciaPagamento = formData.get('referenciaPagamento');

    if (
      !nomeComprador ||
      !nomePresenteado ||
      typeof emailEntrega !== 'string' ||
      !/^\S+@\S+\.\S+$/.test(emailEntrega) ||
      !dataInicioNamoro ||
      !textoPoema ||
      !idMusicaSpotify ||
      typeof pagamentoId !== 'string' ||
      typeof referenciaPagamento !== 'string'
    ) {
      return NextResponse.json({ success: false, error: 'Dados obrigatórios ausentes.' }, { status: 400 });
    }

    const respostaPagamento = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(pagamentoId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );

    if (!respostaPagamento.ok) {
      return NextResponse.json({ success: false, error: 'Pagamento não encontrado.' }, { status: 402 });
    }

    const pagamento = (await respostaPagamento.json()) as PagamentoMercadoPago;
    const valorCorreto = Math.abs((pagamento.transaction_amount ?? 0) - PRECO_PRESENTE) < 0.001;

    if (
      pagamento.status !== 'approved' ||
      pagamento.external_reference !== referenciaPagamento ||
      pagamento.currency_id !== 'BRL' ||
      !valorCorreto
    ) {
      return NextResponse.json(
        { success: false, error: 'O pagamento ainda não foi aprovado ou não corresponde a este pedido.' },
        { status: 402 },
      );
    }

    const presenteExistente = await prisma.presente.findUnique({
      where: { pagamentoId },
      select: { id: true },
    });

    if (presenteExistente) {
      const emailEnviado = await tentarEnviarPresentePorEmail({
        email: emailEntrega,
        nomePresenteado,
        presenteId: presenteExistente.id,
        pagamentoId,
      });
      return NextResponse.json({ success: true, id: presenteExistente.id, emailEnviado });
    }

    const fotosParaSalvar = [];

    for (let i = 0; i < 6; i++) {
      const arquivo = formData.get(`foto_${i}`) as File | null;
      const legenda = formData.get(`legenda_${i}`) as string;

      if (
        !arquivo ||
        arquivo.size === 0 ||
        arquivo.size > TAMANHO_MAXIMO_FOTO ||
        !TIPOS_DE_FOTO_ACEITOS.includes(arquivo.type)
      ) {
        return NextResponse.json({ success: false, error: `A foto ${i + 1} é inválida.` }, { status: 400 });
      }

      const bytes = await arquivo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const urlFinal = `data:${arquivo.type};base64,${buffer.toString('base64')}`;

      fotosParaSalvar.push({
        url: urlFinal,
        legenda: legenda || ""
      });
    }

    const novoPresente = await prisma.presente.create({
      data: {
        nomeComprador,
        nomePresenteado,
        dataInicioNamoro,
        textoPoema,
        idMusicaSpotify,
        pagamentoId,
        fotos: {
          create: fotosParaSalvar
        }
      }
    });

    const emailEnviado = await tentarEnviarPresentePorEmail({
      email: emailEntrega,
      nomePresenteado,
      presenteId: novoPresente.id,
      pagamentoId,
    });

    return NextResponse.json({ success: true, id: novoPresente.id, emailEnviado });

  } catch (error) {
    console.error("Erro ao salvar presente:", error);
    return NextResponse.json({ success: false, error: 'Erro no servidor' }, { status: 500 });
  }
}
