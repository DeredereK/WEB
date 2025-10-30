import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../services/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import "../App.css";

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
  status: "Rascunho" | "Enviado" | "Aprovado" | "Rejeitado";
  observacao?: string;
}

const cotacaoSchema = z.object({
  cliente: z.string().min(3, "O nome do cliente é obrigatório"),
  status: z.enum(["Rascunho", "Enviado", "Aprovado", "Rejeitado"]),
  descontoPct: z.number().min(0, "Desconto mínimo é 0").max(100, "Desconto máximo é 100"),
  observacao: z.string().optional(),
});

const itemSchema = z.object({
  produto: z.string().min(3, "O nome do produto é obrigatório (mínimo 3 caracteres)"),
  quantidade: z.number().min(1, "A quantidade deve ser no mínimo 1"),
  precoUnit: z.number().positive("O preço unitário deve ser positivo"),
});

type CotacaoFormData = z.infer<typeof cotacaoSchema>;
type ItemFormData = z.infer<typeof itemSchema>;

export default function EditarCotacao() {
  const { id: cotacaoId } = useParams<{ id: string }>();
  const id = cotacaoId;
  const navigate = useNavigate();
  const [cotacao, setCotacao] = useState<Cotacao | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [mensagemItem, setMensagemItem] = useState("");

  const {
    register: registerCotacao,
    handleSubmit: handleSubmitCotacao,
    formState: { errors: errorsCotacao, isSubmitting: isSubmittingCotacao },
    reset: resetCotacao,
  } = useForm<CotacaoFormData>({
    resolver: zodResolver(cotacaoSchema),
  });

  const {
    register: registerItem,
    handleSubmit: handleSubmitItem,
    formState: { errors: errorsItem, isSubmitting: isSubmittingItem },
    reset: resetItem,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  const recalculateTotal = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.patch(`/cotacoes/${id}/recalculate`);
      setCotacao((prev) => (prev ? { ...prev, total: response.data.total } : response.data));
    } catch (err) {
      console.error("Erro ao recalcular total:", err);
    }
  }, [id]);

  const fetchCotacaoAndItens = useCallback(async () => {
    if (!id) return;
    setLoadingItems(true);
    setError(null);
    try {
      const cotacaoResponse = await api.get(`/cotacoes/${id}`);
      setCotacao(cotacaoResponse.data);
      resetCotacao(cotacaoResponse.data);

      const itensResponse = await api.get(`/cotacoes/${id}/items`);
      setItens(itensResponse.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar os dados da cotação e/ou lista de itens.");
    } finally {
      setLoading(false);
      setLoadingItems(false);
    }
  }, [id, resetCotacao]);

  useEffect(() => {
    fetchCotacaoAndItens();
  }, [fetchCotacaoAndItens]);

  const onSaveCotacao = async (data: CotacaoFormData) => {
    try {
      await api.put(`/cotacoes/${id}`, data);
      setMensagem("Cotação atualizada com sucesso!");
      setCotacao((prev) => (prev ? { ...prev, ...data } : null));
      await recalculateTotal();
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao atualizar cotação");
    }
  };

  async function handleDeleteCotacao() {
    if (!confirm("Deseja realmente excluir esta cotação? Isso removerá TODOS os itens vinculados.")) {
      return;
    }
    try {
      await api.delete(`/cotacoes/${id}`);
      alert("Cotação removida com sucesso!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Erro ao remover cotação");
    }
  }

  const onAddItem = async (data: ItemFormData) => {
    if (!id) return;
    setMensagemItem("");
    try {
      const response = await api.post(`/cotacoes/${id}/items`, data);

      setItens((prevItens) => [...prevItens, response.data]);

      await recalculateTotal();
      
      setMensagemItem("Item adicionado com sucesso!");
      resetItem({ produto: "", quantidade: 1, precoUnit: 0 });
    } catch (err: any) {
      console.error("Erro ao adicionar item:", err);
      setMensagemItem("Erro ao adicionar item: " + (err.response?.data?.message || err.message));
    }
  };

  const onDeleteItem = async (itemId: string) => {

    console.log("ID da Cotação (id):", id);
    console.log("ID do Item (itemId):", itemId);

    if (!id || !confirm("Deseja realmente excluir este item?")) return;
    setMensagemItem("");
    try {
      await api.delete(`/cotacoes/${id}/items/${itemId}`);
      
      // Remove o item da lista localmente
      setItens((prevItens) => prevItens.filter((item) => item.id !== itemId));
      
      // Recalcula o total da cotação
      await recalculateTotal();
      
      setMensagemItem("Item removido com sucesso!");
    } catch (err) {
      console.error("Erro ao deletar item:", err);
      setMensagemItem("Erro ao deletar item.");
    }
  };

  if (loading) return <p>Carregando dados da cotação...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!cotacao) return <p>Cotação não encontrada.</p>;

  return (
    <div className="card" style={{ maxWidth: 800, margin: "2rem auto" }}>
      <Link to="/" style={{ display: "block", marginBottom: "1rem" }}>← Voltar para a Lista</Link>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="card-title">Editar Cotação: {cotacao.cliente}</h2>
        <button className="btn-danger" onClick={handleDeleteCotacao} style={{ marginLeft: "1rem" }}>
          Excluir Cotação
        </button>
      </div>

      <p>
        **Total da Cotação:** {formatCurrency(cotacao.total)} (Desconto: {cotacao.descontoPct}%)
      </p>

      {/* --- Formulário de Edição da Cotação --- */}
      <form onSubmit={handleSubmitCotacao(onSaveCotacao)} style={{ marginBottom: "2rem" }}>
        <div>
          <label>Cliente:</label>
          <input type="text" {...registerCotacao("cliente")} placeholder="Informe o nome do cliente..." />
          {errorsCotacao.cliente && <p style={{ color: "red" }}>{errorsCotacao.cliente.message}</p>}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label>Status:</label>
            <select {...registerCotacao("status")}>
              <option value="Rascunho">Rascunho</option>
              <option value="Enviado">Enviado</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Rejeitado">Rejeitado</option>
            </select>
            {errorsCotacao.status && <p style={{ color: "red" }}>{errorsCotacao.status.message}</p>}
          </div>

          <div style={{ flex: 1 }}>
            <label>Desconto (%):</label>
            <input
              type="number"
              step="0.01"
              {...registerCotacao("descontoPct", { valueAsNumber: true })}
              placeholder="Desconto (%)"
            />
            {errorsCotacao.descontoPct && <p style={{ color: "red" }}>{errorsCotacao.descontoPct.message}</p>}
          </div>
        </div>

        <div>
          <label>Observação:</label>
          <textarea {...registerCotacao("observacao")} placeholder="Digite sua observação..." />
        </div>

        <button type="submit" disabled={isSubmittingCotacao} className="btn-success">
          {isSubmittingCotacao ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
      {mensagem && <p style={{ marginTop: "1rem", color: mensagem.includes("Erro") ? "red" : "green" }}>{mensagem}</p>}
      
      {/* --- Formulário de Adição de Item --- */}
      <div className="form-section" style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
        <h3>Adicionar Novo Item</h3>
        <form onSubmit={handleSubmitItem(onAddItem)}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ flex: 3 }}>
              <label>Produto:</label>
              <input type="text" {...registerItem("produto")} placeholder="Nome do Produto/Serviço" />
              {errorsItem.produto && <p className="error-message">{errorsItem.produto.message}</p>}
            </div>

            <div style={{ flex: 1 }}>
              <label>Qtd:</label>
              <input
                type="number"
                step="1"
                {...registerItem("quantidade", { valueAsNumber: true })}
                placeholder="1"
              />
              {errorsItem.quantidade && <p className="error-message">{errorsItem.quantidade.message}</p>}
            </div>

            <div style={{ flex: 2 }}>
              <label>Preço Unitário:</label>
              <input
                type="number"
                step="0.01"
                {...registerItem("precoUnit", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errorsItem.precoUnit && <p className="error-message">{errorsItem.precoUnit.message}</p>}
            </div>

            <button type="submit" disabled={isSubmittingItem} className="btn-primary" style={{ marginTop: "1.5rem", flex: 1 }}>
              {isSubmittingItem ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
        </form>
        {mensagemItem && <p style={{ marginTop: "1rem", color: mensagemItem.includes("Erro") ? "red" : "green" }}>{mensagemItem}</p>}
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
