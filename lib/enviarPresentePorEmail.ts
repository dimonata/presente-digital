import { createHash } from 'node:crypto';
import QRCode from 'qrcode';
import {
  criarCapaModelo,
  criarArteStory,
  type FotoEmail,
  type ModeloEmail,
} from './gerarImagensEmail';

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

function lerRemetente(valor: string) {
  const formatoCompleto = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(valor);
  if (formatoCompleto) {
    return {
      name: process.env.EMAIL_FROM_NAME?.trim() || formatoCompleto[1].trim() || 'Letter Love',
      email: formatoCompleto[2].trim(),
    };
  }
  return {
    name: process.env.EMAIL_FROM_NAME?.trim() || 'Letter Love',
    email: valor.trim(),
  };
}

function criarIdentificadorMailjet(pagamentoId: string) {
  return createHash('sha256').update(`letter-love:${pagamentoId}`).digest('hex').slice(0, 32);
}

function normalizarModelo(modelo: string): ModeloEmail {
  return modelo === 'aventuras' ? 'aventuras' : 'polaroid';
}

export async function enviarPresentePorEmail({
  email,
  nomeComprador,
  nomePresenteado,
  presenteId,
  pagamentoId,
  modelo,
  textoPoema,
  fotos,
}: {
  email: string;
  nomeComprador: string;
  nomePresenteado: string;
  presenteId: string;
  pagamentoId: string;
  modelo: string;
  textoPoema: string;
  fotos: FotoEmail[];
}) {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');

  if (!apiKey || !secretKey || !emailFrom || !appUrl) {
    console.error('E-mail não enviado: configure MAILJET_API_KEY, MAILJET_SECRET_KEY, EMAIL_FROM e APP_URL.');
    return false;
  }

  const modeloValido = normalizarModelo(modelo);
  const nomeModelo = modeloValido === 'aventuras' ? 'Álbum de Aventuras' : 'Estilo Polaroid';
  const linkPresente = `${appUrl}/presente/${presenteId}`;
  const imagemModeloUrl = `${appUrl}/api/modelos/capa?modelo=${modeloValido}`;
  const qrCode = await QRCode.toBuffer(linkPresente, {
    type: 'png',
    width: 420,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#991b1b', light: '#ffffff' },
  });
  const [capaModelo, arteStory] = await Promise.all([
    criarCapaModelo(modeloValido),
    criarArteStory({
      modelo: modeloValido,
      nomeComprador,
      nomePresenteado,
      textoPoema,
      fotos,
      qrCode,
    }),
  ]);

  const resposta = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [{
        From: {
          Email: lerRemetente(emailFrom).email,
          Name: lerRemetente(emailFrom).name,
        },
        To: [{ Email: email, Name: nomeComprador }],
        Subject: `O presente de ${nomePresenteado} está pronto ❤️`,
        HTMLPart: `
        <!doctype html>
        <html lang="pt-BR">
          <body style="margin:0;background:#f5f2eb;font-family:Arial,sans-serif;color:#27272a">
            <div style="padding:28px 14px">
              <div style="max-width:600px;margin:0 auto;overflow:hidden;border:1px solid #e7e5e4;border-radius:22px;background:#ffffff">
                <img src="${imagemModeloUrl}" alt="${nomeModelo}" width="600" style="display:block;width:100%;height:auto;border:0" />
                <div style="padding:30px;text-align:center">
                  <p style="margin:0 0 8px;color:#991b1b;font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase">${nomeModelo}</p>
                  <h1 style="margin:0;color:#27272a;font-family:Georgia,serif;font-size:32px;line-height:1.2">Seu presente digital está pronto!</h1>
                  <p style="margin:18px 0 0;color:#52525b;font-size:16px;line-height:1.7">A página de ${escaparHtml(nomePresenteado)} já foi preenchida com suas memórias e está pronta para ser compartilhada.</p>
                  <a href="${linkPresente}" style="display:inline-block;margin-top:22px;border-radius:999px;background:#dc2626;padding:15px 26px;color:#ffffff;font-size:16px;font-weight:800;text-decoration:none">Abrir presente</a>
                  <div style="margin-top:26px;padding:18px;border-radius:14px;background:#faf8f3;text-align:left;color:#52525b;font-size:14px;line-height:1.65">
                    <strong style="color:#27272a">Arquivos incluídos neste e-mail:</strong><br />
                    • QR Code em alta resolução<br />
                    • Imagem padrão do modelo escolhido<br />
                    • Arte vertical personalizada com três fotos, pronta para postar nos Stories
                  </div>
                  <p style="margin:22px 0 0;color:#a1a1aa;font-size:12px;word-break:break-all">${linkPresente}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
        TextPart: `Seu presente para ${nomePresenteado} está pronto. Abra em ${linkPresente}. Este e-mail inclui o QR Code, a imagem do modelo ${nomeModelo} e uma arte vertical personalizada pronta para postar nos Stories.`,
        Attachments: [
          {
            ContentType: 'image/png',
            Filename: 'qrcode-presente.png',
            Base64Content: qrCode.toString('base64'),
          },
          {
            ContentType: 'image/png',
            Filename: `capa-${modeloValido}.png`,
            Base64Content: capaModelo.toString('base64'),
          },
          {
            ContentType: 'image/jpeg',
            Filename: `story-letter-love-${modeloValido}.jpg`,
            Base64Content: arteStory.toString('base64'),
          },
        ],
        CustomID: criarIdentificadorMailjet(pagamentoId),
      }],
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });

  if (!resposta.ok) {
    console.error('Erro ao enviar e-mail pelo Mailjet:', resposta.status, await resposta.text());
    return false;
  }

  const resultado = (await resposta.json()) as {
    Messages?: Array<{ Status?: string; Errors?: unknown }>;
  };
  const mensagem = resultado.Messages?.[0];

  if (mensagem?.Status !== 'success') {
    console.error('O Mailjet recusou o e-mail:', mensagem?.Errors ?? resultado);
    return false;
  }

  return true;
}
