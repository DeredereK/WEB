import { carregarCotacoes, criarErroNaoEncontrado, criarErroInterno } from "../../utils/cotacoesUtils.js";

export async function listarItens(request: any, reply: any) {
  try {
    const { idcotacao } = request.params;
    const cotacoes = await carregarCotacoes();
    const cotacao = cotacoes.find((c: any) => String(c.id) === idcotacao);

    if (!cotacao) {
      const erro = criarErroNaoEncontrado("Cotação não encontrada");
      return reply.status(erro.statusCode).send(erro.body);
    }

    return reply.status(200).send(cotacao.itens || []);
  } catch (err: any) {
    const erro = criarErroInterno("Erro ao listar itens", err.message);
    return reply.status(erro.statusCode).send(erro.body);
  }
}
