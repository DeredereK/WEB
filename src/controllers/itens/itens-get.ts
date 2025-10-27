import path from "path";
import fs from "fs/promises";

const filePath = path.resolve("./src/data/itens.json");

async function carregarItens() {
  try{
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) || [];
  } catch {
    return[]
  }
}

export async function listarItens(request: any, reply: any) {
  const { id } = request.params; // Usando 'id' da cotação
  const itens = await carregarItens();
  const itensCotacao = itens.filter((i: any) => i.cotacaoId === id); // Filtrando pelo 'cotacaoId'
  reply.code(200).send(itensCotacao);
}
