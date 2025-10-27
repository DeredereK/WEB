import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import "../App.css"; // Importar o CSS

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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const carregarCotacoes = useCallback(async (page: number, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        _page: page,
        _limit: 10,
        cliente_like: search, // JSON Server usa _like para busca parcial
      };
      const response = await api.get("/cotacoes", { params });
      setCotacoes(response.data);
      const totalCountHeader = response.headers["x-total-count"];
      const total = totalCountHeader ? parseInt(totalCountHeader) : response.data.length;
      setTotalCount(total);
      setTotalPages(Math.ceil(total / 10));
    } catch (err) {
      console.error("Erro ao buscar cotações:", err);
      setError("Erro ao carregar cotações.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Lógica de Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      carregarCotacoes(page, search);
    }, 500); // Debounce de 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [page, search, carregarCotacoes]);

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir esta cotação? Todos os itens serão removidos.")) {
      return;
    }
    try {
      await api.delete(`/cotacoes/${id}`);
      setCotacoes(cotacoes.filter(c => c.id !== id));
      alert("Cotação removida com sucesso!");
      // Recarrega a lista para atualizar a paginação
      carregarCotacoes(page, search);
    } catch (error) {
      console.error(error);
      alert("Erro ao remover cotação");
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Volta para a primeira página ao buscar
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container">
      <h1 className="card-title">QuoteHub - Lista de Cotações</h1>
      <Link to="/nova-cotacao">
        <button className="btn-primary" style={{ marginBottom: "1rem" }}>Nova Cotação</button>
      </Link>

      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
        <input
          type="text"
          placeholder="Buscar por cliente..."
          value={search}
          onChange={handleSearchChange}
          style={{ padding: "8px", width: "300px" }}
        />
      </div>

      {cotacoes.length === 0 && !loading && (
        <p>Nenhuma cotação encontrada.</p>
      )}

      {cotacoes.length > 0 && (
        <div style={{ display: "grid", gap: "1rem", maxWidth: "600px", margin: "0 auto" }}>
          {cotacoes.map((c) => (
            <div
              key={c.id}
              className="card"
              style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div onClick={() => navigate(`/cotacoes/${c.id}`)} style={{ cursor: 'pointer', flexGrow: 1 }}>
                <h3>{c.cliente}</h3>
                <p>Status: <strong>{c.status}</strong></p>
                <p>Total: <strong>{formatCurrency(c.total)}</strong></p>
                <p>Itens: {c.itens?.length ?? 0}</p>
                <p>Criado em: {new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="btn-secondary" onClick={() => navigate(`/editar-cotacao/${c.id}`)}>Editar</button>
                <button className="btn-danger" onClick={() => handleDelete(c.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn-secondary"
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages} ({totalCount} total)
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="btn-secondary"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
