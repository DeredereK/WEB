import { api } from "../../services/api";

export async function buscarCotacaoPorId(id: string) {
  const response = await api.get(`/cotacoes/${id}`);
  return response.data;
}
