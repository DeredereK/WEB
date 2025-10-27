import { carregarCotacoes, salvarCotacoes, criarErroNaoEncontrado, criarErroInterno } from "../../utils/cotacoesUtils.js";

export async function deletarItem(request: any, reply: any) {
  try {
    const { idcotacao, iditem } = request.params;
    const cotacoes = await carregarCotacoes();
    const cotacao = cotacoes.find((c: any) => String(c.id) === idcotacao);

    if (!cotacao) {
      const erro = criarErroNaoEncontrado("Cotação não encontrada");
      return reply.status(erro.statusCode).send(erro.body);
    }

    const index = cotacao.itens?.findIndex((i: any) => String(i.id) === iditem);
    if (index === -1 || index === undefined) {
      const erro = criarErroNaoEncontrado("Item não encontrado");
      return reply.status(erro.statusCode).send(erro.body);
    }

    const itemRemovido = cotacao.itens.splice(index, 1)[0];
    cotacao.total = cotacao.itens.reduce((acc: number, i: any) => acc + i.subtotal, 0);

    await salvarCotacoes(cotacoes);

    return reply.status(200).send({
      message: "Item removido com sucesso",
      itemRemovido,
    });
  } catch (err: any) {
    const erro = criarErroInterno("Erro ao deletar item", err.message);
    return reply.status(erro.statusCode).send(erro.body);
  }
}
