import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./services/api";
import NovaCotacao from "./pages/NovaCotacao";
import ItensCotacao from "./pages/ItensCotacao"; // ✅ nova importação

interface Cotacao {
  id: string;
  cliente: string;
  status: "Rascunho" | "Enviado" | "Aprovado" | "Rejeitado";
  total: number;
  createdAt: string;
  itens?: any[];
}

function ListaCotacoes() {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    carregarCotacoes();
  }, []);

  async function carregarCotacoes() {
    try {
      const response = await api.get("/cotacoes");
      setCotacoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar cotações:", error);
      setMensagem("Erro ao carregar cotações");
    } finally {
      setLoading(false);
    }
  }

  async function deletarCotacao(id: string) {
    if (!confirm("Deseja realmente excluir esta cotação? Todos os itens serão removidos.")) return;

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
                <button onClick={() => deletarCotacao(c.id)}>Excluir</button>
                <button onClick={() => navigate(`/cotacoes/${c.id}/itens`)}>Ver Itens</button> {/* ✅ novo botão */}
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
        <Route path="/cotacoes/:idcotacao/itens" element={<ItensCotacao />} /> {/* ✅ nova rota */}
        {/* Futuramente adicionar rota /editar-cotacao/:id */}
      </Routes>
    </BrowserRouter>
  );
}
