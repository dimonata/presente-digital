import FinalizarPagamento from './FinalizarPagamento';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function primeiroValor(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function RetornoPagamentoPage({ searchParams }: { searchParams: SearchParams }) {
  const parametros = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F2EB] px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl md:p-12">
        <FinalizarPagamento
          pagamentoId={primeiroValor(parametros.payment_id ?? parametros.collection_id)}
          referencia={primeiroValor(parametros.external_reference)}
        />
      </section>
    </main>
  );
}
