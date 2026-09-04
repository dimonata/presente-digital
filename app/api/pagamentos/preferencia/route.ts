import { NextResponse } from 'next/server';

const PRECO_PRESENTE = 29.9;

type PreferenciaMercadoPago = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  message?: string;
};

export async function POST() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');

  if (!accessToken) {
    return NextResponse.json(
      { error: 'MERCADO_PAGO_ACCESS_TOKEN não foi configurado.' },
      { status: 503 },
    );
  }

  if (!appUrl || !appUrl.startsWith('https://')) {
    return NextResponse.json(
      { error: 'Configure APP_URL com o endereço HTTPS público do site.' },
      { status: 503 },
    );
  }

  const referencia = crypto.randomUUID();
  const retorno = `${appUrl}/pagamento/retorno`;

  try {
    const resposta = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': referencia,
      },
      body: JSON.stringify({
        items: [
          {
            id: 'presente-digital',
            title: 'Publicação de Presente Digital',
            description: 'Página personalizada com fotos, música e mensagem',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: PRECO_PRESENTE,
          },
        ],
        external_reference: referencia,
        back_urls: {
          success: retorno,
          pending: retorno,
          failure: retorno,
        },
        auto_return: 'approved',
        binary_mode: true,
      }),
      cache: 'no-store',
    });

    const dados = (await resposta.json()) as PreferenciaMercadoPago;
    const initPoint = dados.init_point ?? dados.sandbox_init_point;

    if (!resposta.ok || !dados.id || !initPoint) {
      console.error('Erro ao criar preferência no Mercado Pago:', dados);
      return NextResponse.json(
        { error: dados.message || 'Não foi possível iniciar o pagamento.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ referencia, initPoint });
  } catch (error) {
    console.error('Erro de conexão com o Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Não foi possível conectar ao Mercado Pago.' },
      { status: 502 },
    );
  }
}
