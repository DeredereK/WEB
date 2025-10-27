ItensCotacao.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../services/api";
import { formatCurrency } from "../utils/formatters";
import "../App.css";

// --- Tipos e Schemas ---

interface Item {
  id: string;
  cotacaoId: string;
  produto: string;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
}

interface Cotacao {
  id: string;
  cliente: string;
  total: number;
  descontoPct: number;
}

const itemSchema = z.object({
  produto: z.string().min(3, "O nome do produto é obrigatório (mínimo 3 caracteres)"),
  quantidade: z.number().min(1, "A quantidade deve ser no mínimo 1"),
  precoUnit: z.number().positive("O preço unitário deve ser positivo"),
});

type ItemFormData = z.infer<typeof itemSchema>;

// --- Componente Principal ---

export default function ItensCotacao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cotacao, setCotacao] = useState<Cotacao | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  // 1. Função de Recálculo do Total da Cotação
  const recalculateTotal = useCallback(async () => {
    if (!id) return;
    try {
      // Chama o novo endpoint PATCH para recalcular o total
      const response = await api.patch(`/cotacoes/${id}/recalculate`);
      setCotacao((prev) => (prev ? { ...prev, total: response.data.total } : response.data));
    } catch (err) {
      console.error("Erro ao recalcular total:", err);
      // Não exibe erro para o usuário, apenas loga
    }
  }, [id]);

  // 2. Carregar Cotação e Itens
  const fetchCotacaoAndItens = useCallback(async () => {
    if (!id) return;
    setLoadingItems(true);
    setError(null);
    try {
      // Carrega a cotação
      const cotacaoResponse = await api.get(`/cotacoes/${id}`);
      setCotacao(cotacaoResponse.data);

      // Carrega os itens
      const itensResponse = await api.get(`/cotacoes/${id}/items`);
      setItens(itensResponse.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar a cotação ou a lista de itens.");
    } finally {
      setLoading(false);
      setLoadingItems(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCotacaoAndItens();
  }, [fetchCotacaoAndItens]);

  // 3. Adicionar Novo Item
  const onAddItem = async (data: ItemFormData) => {
    if (!id) return;
    setMensagem("");
    try {
      const response = await api.post(`/cotacoes/${id}/items`, data);
      
      // Adiciona o novo item à lista localmente
      setItens((prevItens) => [...prevItens, response.data]);
      
      // Recalcula o total da cotação
      await recalculateTotal();
      
      setMensagem("Item adicionado com sucesso!");
      reset({ produto: "", quantidade: 1, precoUnit: 0 }); // Limpa o formulário
    } catch (err: any) {
      console.error("Erro ao adicionar item:", err);
      setMensagem("Erro ao adicionar item: " + (err.response?.data?.message || err.message));
    }
  };

  // 4. Deletar Item
  const onDeleteItem = async (itemId: string) => {
    if (!id || !confirm("Deseja realmente excluir este item?")) return;
    setMensagem("");
    try {
      await api.delete(`/cotacoes/${id}/items/${itemId}`);
      
      // Remove o item da lista localmente
      setItens((prevItens) => prevItens.filter((item) => item.id !== itemId));
      
      // Recalcula o total da cotação
      await recalculateTotal();
      
      setMensagem("Item removido com sucesso!");
    } catch (err) {
      console.error("Erro ao deletar item:", err);
      setMensagem("Erro ao deletar item.");
    }
  };

  if (loading) return <p>Carregando dados da cotação...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!cotacao) return <p>Cotação não encontrada.</p>;

  return (
    <div className="card" style={{ maxWidth: 800, margin: "2rem auto" }}>
      <Link to={`/editar-cotacao/${id}`} style={{ display: "block", marginBottom: "1rem" }}>
        ← Voltar para Edição da Cotação
      </Link>
      
      <h2 className="card-title">Itens da Cotação: {cotacao.cliente}</h2>
      <p>
        **Total da Cotação:** {formatCurrency(cotacao.total)} (Desconto: {cotacao.descontoPct}%)
      </p>

      {/* --- Formulário de Adição de Item --- */}
      <div className="form-section" style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
        <h3>Adicionar Novo Item</h3>
        <form onSubmit={handleSubmit(onAddItem)}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ flex: 3 }}>
              <label>Produto:</label>
              <input type="text" {...register("produto")} placeholder="Nome do Produto/Serviço" />
              {errors.produto && <p className="error-message">{errors.produto.message}</p>}
            </div>

            <div style={{ flex: 1 }}>
              <label>Qtd:</label>
              <input
                type="number"
                step="1"
                {...register("quantidade", { valueAsNumber: true })}
                placeholder="1"
              />
              {errors.quantidade && <p className="error-message">{errors.quantidade.message}</p>}
            </div>

            <div style={{ flex: 2 }}>
              <label>Preço Unitário:</label>
              <input
                type="number"
                step="0.01"
                {...register("precoUnit", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.precoUnit && <p className="error-message">{errors.precoUnit.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-success" style={{ marginTop: "1.5rem", flex: 1 }}>
              {isSubmitting ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
        </form>
        {mensagem && <p style={{ marginTop: "1rem", color: mensagem.includes("Erro") ? "red" : "green" }}>{mensagem}</p>}
      </div>

      {/* --- Lista de Itens --- */}
      <h3>Itens Atuais ({itens.length})</h3>
      {loadingItems ? (
        <p>Carregando itens...</p>
      ) : itens.length === 0 ? (
        <p>Nenhum item adicionado a esta cotação.</p>
      ) : (
        <table className="items-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Preço Unit.</th>
              <th>Subtotal</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>{item.produto}</td>
                <td>{item.quantidade}</td>
                <td>{formatCurrency(item.precoUnit)}</td>
                <td>{formatCurrency(item.subtotal)}</td>
                <td>
                  <button className="btn-danger" onClick={() => onDeleteItem(item.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}