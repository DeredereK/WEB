import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface Cotacao {
  id: string;
  cliente: string;
  status: "Rascunho" | "Enviado" | "Aprovado" | "Rejeitado";
  total: number;
  createdAt: string;
  itens?: any[];
}

export default function ListaCotacoes() {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregar() {
      try {
        const response = await api.get("/cotacoes");
        setCotacoes(response.data);
      } catch (error) {
        console.error("Erro ao buscar cotações:", error);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir esta cotação? Todos os itens serão removidos.")) {
      return;
    }
    try {
      await api.delete(`/cotacoes/${id}`);
      setCotacoes(cotacoes.filter(c => c.id !== id));
      alert("Cotação removida com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao remover cotação");
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Lista de Cotações</h1>
      <Link to="/nova-cotacao">
        <button style={{ marginBottom: "1rem" }}>Nova Cotação</button>
      </Link>

      {cotacoes.length === 0 ? (
        <p>Nenhuma cotação encontrada.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {cotacoes.map((c) => (
            <div
              key={c.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: 16,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <h3>{c.cliente}</h3>
              <p>Status: <strong>{c.status}</strong></p>
              <p>Total: R$ {c.total.toFixed(2)}</p>
              <p>Itens: {c.itens?.length ?? 0}</p>
              <p>Criado em: {new Date(c.createdAt).toLocaleString()}</p>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button onClick={() => navigate(`/editar-cotacao/${c.id}`)}>Editar</button>
                <button onClick={() => handleDelete(c.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
