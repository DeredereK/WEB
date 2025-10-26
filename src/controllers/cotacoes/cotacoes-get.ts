import { api } from "../../services/api";

export async function listarCotacoes() {
  const response = await api.get("/cotacoes");
  return response.data;
}
