import { api } from "../../services/api.ts";

export async function atualizarCotacao(id: string, cotacaoData: any) {
  const response = await api.put(`/cotacoes/${id}`, cotacaoData);
  return response.data;
}
