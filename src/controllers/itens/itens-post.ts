import { carregarCotacoes, salvarCotacoes, criarErroNaoEncontrado, criarErroInterno } from "../../utils/cotacoesUtils.js";
import { v4 as uuidv4 } from "uuid";

export async function criarItem(request: any, reply: any) {
  try {
    const { idcotacao } = request.params;
    const { produto, quantidade, precoUnit, subtotal } = request.body;

    const cotacoes = await carregarCotacoes();
    const cotacao = cotacoes.find((c: any) => String(c.id) === idcotacao);

    if (!cotacao) {
      const erro = criarErroNaoEncontrado("Cotação não encontrada");
      return reply.status(erro.statusCode).send(erro.body);
    }

    const novoItem = {
      id: uuidv4(),
      produto,
      quantidade,
      precoUnit,
      subtotal,
    };

    cotacao.itens = cotacao.itens || [];
    cotacao.itens.push(novoItem);

    // Atualiza total da cotação
    cotacao.total = cotacao.itens.reduce((acc: number, i: any) => acc + i.subtotal, 0);

    await salvarCotacoes(cotacoes);

    return reply.status(201).send({ message: "Item criado com sucesso", item: novoItem });
  } catch (err: any) {
    const erro = criarErroInterno("Erro ao criar item", err.message);
    return reply.status(erro.statusCode).send(erro.body);
  }
}
