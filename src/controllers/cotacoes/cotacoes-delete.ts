import { api } from "../../services/api";

export async function deletarCotacao(id: string) {
  const response = await api.delete(`/cotacoes/${id}`);
  return response.data;
}
