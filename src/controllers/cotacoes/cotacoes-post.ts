import { api } from "../../services/api";

export async function criarCotacao(cotacaoData: any) {
  const response = await api.post("/cotacoes", cotacaoData);
  return response.data;
}
