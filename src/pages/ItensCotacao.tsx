import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

interface Item {
  iditem: string;
  produto: string;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
}

export default function ItensCotacao() {
  const { idcotacao } = useParams();
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarItens();
  }, []);

  async function carregarItens() {
    try {
      const response = await api.get(`/cotacoes/${idcotacao}/items`);
      setItens(response.data);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      setMensagem("Erro ao carregar itens da cotação.");
    } finally {
      setLoading(false);
    }
  }

  async function deletarItem(iditem: string) {
    if (!confirm("Deseja realmente excluir este item?")) return;

    try {
      await api.delete(`/cotacoes/${idcotacao}/items/${iditem}`);
      setItens(itens.filter(i => i.iditem !== iditem));
      setMensagem("Item removido com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      setMensagem("Erro ao deletar item.");
    }
  }

  if (loading) return <p>Carregando itens...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Itens da Cotação</h2>
      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}

      <Link to="/" style={{ display: "block", marginBottom: "1rem" }}>← Voltar</Link>

      {itens.length === 0 ? (
        <p>Nenhum item encontrado.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {itens.map((item) => (
            <div
              key={item.iditem}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                background: "#fafafa"
              }}
            >
              <h4>{item.produto}</h4>
              <p>Quantidade: {item.quantidade}</p>
              <p>Preço unitário: R$ {item.precoUnit.toFixed(2)}</p>
              <p>Subtotal: R$ {item.subtotal.toFixed(2)}</p>
              <button
                onClick={() => deletarItem(item.iditem)}
                style={{
                  marginTop: 8,
                  background: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                Excluir Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
