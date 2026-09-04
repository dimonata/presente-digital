"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { excluirRascunhoPagamento, obterRascunhoPagamento } from '@/lib/rascunhoPagamento';

type Props = {
  pagamentoId?: string;
  referencia?: string;
};

type Estado =
  | { tipo: 'processando'; mensagem: string }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'sucesso'; presenteId: string };

export default function FinalizarPagamento({ pagamentoId, referencia }: Props) {
  const [estado, setEstado] = useState<Estado>({
    tipo: 'processando',
    mensagem: 'Confirmando seu pagamento com o Mercado Pago…',
  });

  useEffect(() => {
    let cancelado = false;

    async function finalizar() {
      if (!pagamentoId || !referencia) {
        setEstado({ tipo: 'erro', mensagem: 'O retorno do pagamento está incompleto.' });
        return;
      }

      try {
        const rascunho = await obterRascunhoPagamento(referencia);
        if (!rascunho) {
          setEstado({
            tipo: 'erro',
            mensagem: 'Não encontramos o rascunho neste navegador. Volte ao dispositivo usado para criar o presente.',
          });
          return;
        }

        const formData = new FormData();
        formData.append('nomeComprador', rascunho.nomeComprador);
        formData.append('nomePresenteado', rascunho.nomePresenteado);
        formData.append('dataInicioNamoro', rascunho.dataInicioNamoro);
        formData.append('textoPoema', rascunho.textoPoema);
        formData.append('idMusicaSpotify', rascunho.idMusicaSpotify);
        formData.append('pagamentoId', pagamentoId);
        formData.append('referenciaPagamento', referencia);

        rascunho.fotos.forEach((foto, index) => {
          formData.append(`foto_${index}`, foto.arquivo);
          formData.append(`legenda_${index}`, foto.legenda);
        });

        const resposta = await fetch('/api/presentes', { method: 'POST', body: formData });
        const resultado = (await resposta.json()) as { success?: boolean; id?: string; error?: string };

        if (!resposta.ok || !resultado.success || !resultado.id) {
          throw new Error(resultado.error || 'Não foi possível publicar o presente.');
        }

        await excluirRascunhoPagamento(referencia);
        if (!cancelado) setEstado({ tipo: 'sucesso', presenteId: resultado.id });
      } catch (error) {
        if (!cancelado) {
          setEstado({
            tipo: 'erro',
            mensagem: error instanceof Error ? error.message : 'Não foi possível finalizar a publicação.',
          });
        }
      }
    }

    void finalizar();
    return () => {
      cancelado = true;
    };
  }, [pagamentoId, referencia]);

  if (estado.tipo === 'sucesso') {
    return (
      <div className="text-center">
        <div className="mb-5 text-6xl">❤️</div>
        <h1 className="text-3xl font-black text-zinc-900">Seu presente está pronto!</h1>
        <p className="mt-3 text-zinc-600">Pagamento confirmado e página publicada com sucesso.</p>
        <Link
          href={`/presente/${estado.presenteId}`}
          className="mt-8 inline-flex rounded-full bg-red-600 px-8 py-4 font-bold text-white shadow-lg transition hover:bg-red-700"
        >
          Abrir meu presente
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-5 text-5xl">{estado.tipo === 'processando' ? '⏳' : '⚠️'}</div>
      <h1 className="text-2xl font-black text-zinc-900">
        {estado.tipo === 'processando' ? 'Finalizando seu presente' : 'Não foi possível publicar'}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-zinc-600">{estado.mensagem}</p>
      {estado.tipo === 'erro' && (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Verificar novamente
          </button>
          <Link href="/criar" className="font-bold text-red-600 hover:underline">
            Voltar para a criação
          </Link>
        </div>
      )}
    </div>
  );
}
