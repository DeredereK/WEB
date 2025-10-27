import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import "../App.css"; // Importar o CSS

interface Cotacao {
  id: string;
  cliente: string;
  status: "Rascunho" | "Enviado" | "Aprovado" | "Rejeitado";
  descontoPct: number;
  total: number;
  observacao?: string;
  createdAt: string;
}

export default function CotacaoDetalhe() {
  const { id } = useParams<{ id: string }>(); // Corrigido: usando 'id'
  const [cotacao, setCotacao] = useState<Cotacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCotacao() {
      if (!id) return;
      try {
        const response = await api.get(`/cotacoes/${id}`);
        setCotacao(response.data);
      } catch (err) {
        console.error("Erro ao carregar cotação:", err);
        setError("Erro ao carregar os dados da cotação.");
      } finally {
        setLoading(false);
      }
    }
    loadCotacao();
  }, [id]);

  if (loading) return <p>Carregando detalhes da cotação...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!cotacao) return <p>Cotação não encontrada.</p>;

  return (
    <div className="container">
      <Link to="/" style={{ display: "block", marginBottom: "1rem" }}>← Voltar para a Lista</Link>
      
      <h1 className="card-title">Detalhe da Cotação: {cotacao.cliente}</h1>

      {/* Card do Pai */}
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto 1rem auto" }}>
        <h2>{cotacao.cliente}</h2>
        <p>Status: <strong>{cotacao.status}</strong></p>
        <p>Desconto: {cotacao.descontoPct}%</p>
        <p>Total: <strong>{formatCurrency(cotacao.total)}</strong></p>
        {cotacao.observacao && <p>Observação: {cotacao.observacao}</p>}
        <p>Criada em: {new Date(cotacao.createdAt).toLocaleString()}</p>
        
        <Link to={`/editar-cotacao/${cotacao.id}`}>
          <button className="btn-secondary" style={{ marginTop: 10 }}>Editar Cotação</button>
        </Link>
      </div>

      {/* Tabela de Itens (Link para a tela de itens) */}
      <h2>Itens da Cotação</h2>
      <Link to={`/cotacoes/${cotacao.id}/itens`}>
        <button className="btn-primary">Gerenciar Itens</button>
      </Link>
    </div>
  );
}
