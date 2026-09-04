import QRCode from 'qrcode';

function escaparHtml(valor: string) {
  return valor.replace(/[&<>'"]/g, (caractere) => {
    const entidades: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entidades[caractere];
  });
}

export async function enviarPresentePorEmail({
  email,
  nomePresenteado,
  presenteId,
  pagamentoId,
}: {
  email: string;
  nomePresenteado: string;
  presenteId: string;
  pagamentoId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_FROM;
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');

  if (!apiKey || !remetente || !appUrl) {
    console.error('E-mail não enviado: configure RESEND_API_KEY, EMAIL_FROM e APP_URL.');
    return false;
  }

  const linkPresente = `${appUrl}/presente/${presenteId}`;
  const qrCode = await QRCode.toBuffer(linkPresente, {
    type: 'png',
    width: 420,
    margin: 2,
    errorCorrectionLevel: 'H',
  });

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `presente-${pagamentoId}`,
    },
    body: JSON.stringify({
      from: remetente,
      to: [email],
      subject: `O presente de ${nomePresenteado} está pronto ❤️`,
      html: `
        <div style="background:#f5f2eb;padding:32px;font-family:Arial,sans-serif;color:#27272a">
          <div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border-radius:20px;text-align:center">
            <div style="font-size:42px">❤️</div>
            <h1 style="margin:12px 0">Seu presente digital está pronto!</h1>
            <p>Escaneie o QR Code anexado ou use o botão abaixo para abrir a página de ${escaparHtml(nomePresenteado)}.</p>
            <a href="${linkPresente}" style="display:inline-block;margin-top:20px;background:#dc2626;color:#fff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:999px">Abrir presente</a>
            <p style="margin-top:24px;font-size:12px;color:#71717a;word-break:break-all">${linkPresente}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'qrcode-presente.png',
          content: qrCode.toString('base64'),
        },
      ],
    }),
    cache: 'no-store',
  });

  if (!resposta.ok) {
    console.error('Erro ao enviar e-mail pelo Resend:', await resposta.text());
    return false;
  }

  return true;
}
