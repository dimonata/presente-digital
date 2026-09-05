import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import prisma from '../../../lib/prisma';
import { enviarPresentePorEmail } from '@/lib/enviarPresentePorEmail';
import { isModeloDisponivel } from '@/app/components/modelos/config';

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

function cupomValido(cupomInformado: string, cupomConfigurado: string) {
  const informado = Buffer.from(cupomInformado.trim().toUpperCase());
  const configurado = Buffer.from(cupomConfigurado.trim().toUpperCase());

  return informado.length > 0 && informado.length === configurado.length && timingSafeEqual(informado, configurado);
}

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
    const formData = await request.formData();

    const modeloInformado = formData.get('modelo');
    const nomeComprador = formData.get('nomeComprador') as string;
    const nomePresenteado = formData.get('nomePresenteado') as string;
    const emailEntrega = formData.get('emailEntrega');
    const dataInicioNamoro = formData.get('dataInicioNamoro') as string;
    const textoPoema = formData.get('textoPoema') as string;
    const idMusicaSpotify = formData.get('idMusicaSpotify') as string;
    const pagamentoIdInformado = formData.get('pagamentoId');
    const referenciaPagamentoInformada = formData.get('referenciaPagamento');
    const cupomInformado = formData.get('cupom');
    const referenciaCupom = formData.get('referenciaCupom');

    if (
      !nomeComprador ||
      typeof modeloInformado !== 'string' ||
      !isModeloDisponivel(modeloInformado) ||
      !nomePresenteado ||
      typeof emailEntrega !== 'string' ||
      !/^\S+@\S+\.\S+$/.test(emailEntrega) ||
      !dataInicioNamoro ||
      !textoPoema ||
      !idMusicaSpotify
    ) {
      return NextResponse.json({ success: false, error: 'Dados obrigatórios ausentes.' }, { status: 400 });
    }

    const usandoCupom = typeof cupomInformado === 'string' && cupomInformado.trim().length > 0;
    let pagamentoId: string;

    if (usandoCupom) {
      const cupomConfigurado = process.env.CUPOM_100_DESCONTO;
      const referenciaValida =
        typeof referenciaCupom === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(referenciaCupom);

      if (!cupomConfigurado || !referenciaValida || !cupomValido(cupomInformado, cupomConfigurado)) {
        return NextResponse.json({ success: false, error: 'Cupom inválido ou expirado.' }, { status: 400 });
      }

      pagamentoId = `cupom:${referenciaCupom}`;
    } else {
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) {
        return NextResponse.json({ success: false, error: 'Pagamento não configurado.' }, { status: 503 });
      }

      if (typeof pagamentoIdInformado !== 'string' || typeof referenciaPagamentoInformada !== 'string') {
        return NextResponse.json({ success: false, error: 'Dados do pagamento ausentes.' }, { status: 400 });
      }

      const respostaPagamento = await fetch(
        `https://api.mercadopago.com/v1/payments/${encodeURIComponent(pagamentoIdInformado)}`,
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
        pagamento.external_reference !== referenciaPagamentoInformada ||
        pagamento.currency_id !== 'BRL' ||
        !valorCorreto
      ) {
        return NextResponse.json(
          { success: false, error: 'O pagamento ainda não foi aprovado ou não corresponde a este pedido.' },
          { status: 402 },
        );
      }

      pagamentoId = pagamentoIdInformado;
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
        modelo: modeloInformado,
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
