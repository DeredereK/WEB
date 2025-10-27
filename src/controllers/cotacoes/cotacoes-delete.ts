import { api } from "../../services/api.js";

export async function deletarCotacao(id: string) {
  const response = await api.delete(`/cotacoes/${id}`);
  return response.data;
}
