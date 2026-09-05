"use client";

export type RascunhoPagamento = {
  modelo: string;
  nomeComprador: string;
  nomePresenteado: string;
  emailEntrega: string;
  dataInicioNamoro: string;
  textoPoema: string;
  idMusicaSpotify: string;
  fotos: Array<{
    arquivo: File;
    legenda: string;
  }>;
};

const NOME_BANCO = 'letter-love';
const NOME_STORE = 'rascunhos-pagamento';

function abrirBanco() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(NOME_BANCO, 1);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(NOME_STORE)) {
        request.result.createObjectStore(NOME_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function salvarRascunhoPagamento(referencia: string, rascunho: RascunhoPagamento) {
  const banco = await abrirBanco();

  await new Promise<void>((resolve, reject) => {
    const transacao = banco.transaction(NOME_STORE, 'readwrite');
    transacao.objectStore(NOME_STORE).put(rascunho, referencia);
    transacao.oncomplete = () => resolve();
    transacao.onerror = () => reject(transacao.error);
  });

  banco.close();
}

export async function obterRascunhoPagamento(referencia: string) {
  const banco = await abrirBanco();

  const rascunho = await new Promise<RascunhoPagamento | undefined>((resolve, reject) => {
    const transacao = banco.transaction(NOME_STORE, 'readonly');
    const request = transacao.objectStore(NOME_STORE).get(referencia);
    request.onsuccess = () => resolve(request.result as RascunhoPagamento | undefined);
    request.onerror = () => reject(request.error);
  });

  banco.close();
  return rascunho;
}

export async function excluirRascunhoPagamento(referencia: string) {
  const banco = await abrirBanco();

  await new Promise<void>((resolve, reject) => {
    const transacao = banco.transaction(NOME_STORE, 'readwrite');
    transacao.objectStore(NOME_STORE).delete(referencia);
    transacao.oncomplete = () => resolve();
    transacao.onerror = () => reject(transacao.error);
  });

  banco.close();
}
