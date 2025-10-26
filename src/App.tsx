import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./services/api";
import NovaCotacao from "./pages/NovaCotacao";

function ListaCotacoes() {
  const [cotacoes, setCotacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <ul>
          {cotacoes.map((c) => (
            <li key={c.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{c.cliente}</strong> — Status: {c.status} — Total: R${" "}
              {c.total.toFixed(2)}
            </li>
          ))}
        </ul>
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
      </Routes>
    </BrowserRouter>
  );
}
