import { api } from "../../services/api.js";

export async function atualizarCotacao(id: string, cotacaoData: any) {
  const response = await api.put(`/cotacoes/${id}`, cotacaoData);
  return response.data;
}
