import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarCotacoes } from "../controllers/cotacoes/cotacoes-get";
import { deletarCotacao } from "../controllers/cotacoes/cotacoes-delete";

export default function ListaCotacoes() {
  const [cotacoes, setCotacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCotacoes();
  }, []);

  async function carregarCotacoes() {
    setLoading(true);
    try {
      const dados = await listarCotacoes();
      setCotacoes(dados);
    } catch (error) {
      console.error("Erro ao carregar cotações", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletar(id: string) {
    if (window.confirm("Deseja realmente excluir esta cotação?")) {
      try {
        await deletarCotacao(id);
        carregarCotacoes();
      } catch (error) {
        console.error("Erro ao deletar cotação", error);
      }
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
        <ul>
          {cotacoes.map((c) => (
            <li key={c.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{c.cliente}</strong> — Status: {c.status} — Total: R${" "}
              {c.total.toFixed(2)}
              <button
                style={{ marginLeft: 10 }}
                onClick={() => handleDeletar(c.id)}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
