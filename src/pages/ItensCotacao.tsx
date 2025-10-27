import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../services/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import "../App.css"; // Importar o CSS

// 1. Definição da Interface e Schema
interface Item {
  id: string;
  produto: string;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
}

const itemSchema = z.object({
  id: z.string().optional(),
  produto: z.string().min(3, "O nome do produto é obrigatório"),
  quantidade: z.number().min(1, "A quantidade mínima é 1"),
  precoUnit: z.number().min(0.01, "O preço unitário deve ser positivo"),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function ItensCotacao() {
  const { id } = useParams<{ id: string }>(); // Usando 'id'
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [editingItem, setEditingItem] = useState<ItemFormData | null>(null);
  const [cotacaoCliente, setCotacaoCliente] = useState(""); // Novo estado para o nome do cliente

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  // 2. Funções de Carregamento e Atualização
  const carregarItens = async () => {
    try {
      // 1. Carregar dados da cotação principal para obter o nome do cliente
      const cotacaoResponse = await api.get(`/cotacoes/${id}`); 
      setCotacaoCliente(cotacaoResponse.data.cliente);

      // 2. Carregar itens
      const response = await api.get(`/cotacoes/${id}/items`); 
      setItens(response.data);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      setMensagem("Erro ao carregar itens da cotação.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Função para Atualizar o Total da Cotação Pai
  const updateCotacaoTotal = async () => {
    try {
      await api.patch(`/cotacoes/${id}/recalculate`);
    } catch (error) {
      console.error("Erro ao atualizar total da cotação:", error);
      // Não exibe mensagem de erro para o usuário, pois é uma ação secundária
    }
  };

  useEffect(() => {
    carregarItens();
  }, [id]);

  // 4. Lógica de Submissão do Formulário (Adicionar/Editar)
  const onSubmit = async (data: ItemFormData) => {
    try {
      // Calcula o subtotal antes de enviar
      const subtotal = data.quantidade * data.precoUnit;
      const itemData = { ...data, subtotal };

      if (data.id) {
        // EDIÇÃO (PUT)
        await api.put(`/cotacoes/${id}/items/${data.id}`, itemData);
        setMensagem("Item atualizado com sucesso!");
      } else {
        // CRIAÇÃO (POST)
        await api.post(`/cotacoes/${id}/items`, itemData);
        setMensagem("Item adicionado com sucesso!");
      }
      
      reset({ produto: "", quantidade: 1, precoUnit: 0 });
      setEditingItem(null);
      await carregarItens();
      await updateCotacaoTotal(); // Atualiza o total da cotação pai
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      setMensagem("Erro ao salvar item.");
    }
  };

  // 5. Lógica de Exclusão
  const handleDelete = async (itemId: string) => {
    if (!confirm("Deseja realmente excluir este item?")) return;

    try {
      await api.delete(`/cotacoes/${id}/items/${itemId}`);
      setMensagem("Item removido com sucesso!");
      await carregarItens();
      await updateCotacaoTotal(); // Atualiza o total da cotação pai
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      setMensagem("Erro ao deletar item.");
    }
  };

  // 6. Lógica de Edição
  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setValue("id", item.id);
    setValue("produto", item.produto);
    setValue("quantidade", item.quantidade);
    setValue("precoUnit", item.precoUnit);
  };

  const handleCancelEdit = () => {
    reset({ produto: "", quantidade: 1, precoUnit: 0 });
    setEditingItem(null);
  };

  if (loading) return <p>Carregando itens...</p>;

  return (
    <div className="container" style={{ maxWidth: 800, margin: "0 auto" }}>
      <Link to={`/cotacoes/${id}`} style={{ display: "block", marginBottom: "1rem" }}>← Voltar para a Cotação</Link>
      
      <h2 className="card-title">Gerenciamento de Itens da Cotação: {cotacaoCliente}</h2>
      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}

      {/* Formulário de Adição/Edição de Item */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3>{editingItem ? "Editar Item" : "Adicionar Novo Item"}</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 2 }}>
              <label>Produto:</label>
              <input type="text" {...register("produto")} placeholder="Descrição do produto" />
              {errors.produto && <p style={{ color: "red" }}>{errors.produto.message}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label>Quantidade:</label>
              <input type="number" step="1" {...register("quantidade", { valueAsNumber: true })} />
              {errors.quantidade && <p style={{ color: "red" }}>{errors.quantidade.message}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label>Preço Unitário:</label>
              <input 
                type="number" 
                step="0.01" 
                {...register("precoUnit", { valueAsNumber: true })} // CORREÇÃO APLICADA AQUI
              />
              {errors.precoUnit && <p style={{ color: "red" }}>{errors.precoUnit.message}</p>}
            </div>
          </div>
          
          <button type="submit" disabled={isSubmitting} className="btn-success" style={{ marginTop: 10 }}>
            {isSubmitting ? "Salvando..." : editingItem ? "Salvar Alterações" : "Adicionar Item"}
          </button>
          {editingItem && (
            <button type="button" onClick={handleCancelEdit} className="btn-secondary" style={{ marginTop: 10, marginLeft: 10 }}>
              Cancelar Edição
            </button>
          )}
        </form>
      </div>

      {/* Lista de Itens */}
      {itens.length === 0 ? (
        <p>Nenhum item encontrado.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {itens.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                background: "#fafafa"
              }}
            >
              <div style={{ flexGrow: 1 }}>
                <h4>{item.produto}</h4>
                <p>
                  {item.quantidade} x {formatCurrency(item.precoUnit)} = 
                  <strong style={{ marginLeft: 5 }}>{formatCurrency(item.subtotal)}</strong>
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleEdit(item)} className="btn-secondary">
                  Editar
                </button>
                <button onClick={() => handleDelete(item.id)} className="btn-danger">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
