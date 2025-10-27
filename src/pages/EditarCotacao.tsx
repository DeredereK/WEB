import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import NovaCotacao from "../pages/NovaCotacao";
import EditarCotacao from "../pages/EditarCotacao";

function ListaCotacoes() {
  const [cotacoes, setCotacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarCotacoes();
  }, []);

  async function carregarCotacoes() {
    try {
      const response = await api.get("/cotacoes");
      setCotacoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar cotações:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deletarCotacao(id: string) {
    if (!confirm("Deseja realmente excluir esta cotação?")) return;

    try {
      const response = await api.delete(`/cotacoes/${id}`);
      setMensagem(response.data.message);
      setCotacoes(cotacoes.filter(c => c.id !== id));
    } catch (error) {
      console.error("Erro ao deletar cotação:", error);
      setMensagem("Erro ao deletar cotação");
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Lista de Cotações</h1>
      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}

      <Link to="/nova-cotacao">
        <button style={{ marginBottom: "1rem" }}>Nova Cotação</button>
      </Link>

      {cotacoes.length === 0 ? (
        <p>Nenhuma cotação encontrada.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {cotacoes.map((c) => (
            <div
              key={c.id}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                borderRadius: 8,
                width: 250,
                position: "relative",
              }}
            >
              <h3>{c.cliente}</h3>
              <p>Status: {c.status}</p>
              <p>Total: R$ {c.total.toFixed(2)}</p>
              <p>Criada em: {new Date(c.createdAt).toLocaleDateString()}</p>
              <p>Itens: {c.itens?.length ?? 0}</p>

              <div style={{ marginTop: 8 }}>
                <Link to={`/editar-cotacao/${c.id}`}>
                  <button style={{ marginRight: 8 }}>Editar</button>
                </Link>
                <button onClick={() => deletarCotacao(c.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListaCotacoes />} />
        <Route path="/nova-cotacao" element={<NovaCotacao />} />
        <Route path="/editar-cotacao/:id" element={<EditarCotacao />} />
      </Routes>
    </BrowserRouter>
  );
}
