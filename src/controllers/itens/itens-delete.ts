import path from "path";
import fs from "fs/promises"; 

const filePath = path.resolve("./src/data/itens.json");

async function carregarItens() {
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data) || [];
}

async function salvarItens(itens: any[]) {
  await fs.writeFile(filePath, JSON.stringify(itens, null, 2));
}

export async function deletarItem(request: any, reply: any) {
  const { id, itemId } = request.params; // Usando 'id' e 'itemId'
  const itens = await carregarItens();

  // O item no JSON tem 'iditem' e não 'id'. Usaremos 'id' para o ID do item.
  const index = itens.findIndex((i: any) => i.id === itemId && i.cotacaoId === id); 
  if (index === -1) {
    reply.code(404).send({ message: "Item não encontrado" });
    return;
  }

  itens.splice(index, 1);
  await salvarItens(itens);

  reply.code(200).send({ message: "Item removido com sucesso" });
}
