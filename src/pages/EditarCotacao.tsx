import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../services/api.js";
import "../App.css"; // Importar o CSS

// Esquema de validação (reutilizado do NovaCotacao.tsx)
const cotacaoSchema = z.object({
  cliente: z.string().min(3, "O nome do cliente é obrigatório"),
  status: z.enum(["Rascunho", "Enviado", "Aprovado", "Rejeitado"]),
  descontoPct: z.number().min(0, "Desconto mínimo é 0").max(100, "Desconto máximo é 100"),
  observacao: z.string().optional(),
});

type CotacaoFormData = z.infer<typeof cotacaoSchema>;

export default function EditarCotacao() {
  const { id } = useParams<{ id: string }>(); // Corrigido: usando 'id'
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [nomeCliente, setNomeCliente] = useState(""); // Estado para o nome do cliente

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CotacaoFormData>({
    resolver: zodResolver(cotacaoSchema),
  });

  // 1. Carregar dados da cotação
  useEffect(() => {
    async function loadCotacao() {
      if (!id) return;
      try {
        const response = await api.get(`/cotacoes/${id}`);
        // Preenche o formulário com os dados carregados
        reset(response.data);
        // Atualiza o nome do cliente para o título
        setNomeCliente(response.data.cliente); 
      } catch (err) {
        console.error("Erro ao carregar cotação:", err);
        setError("Erro ao carregar os dados da cotação.");
      } finally {
        setLoading(false);
      }
    }
    loadCotacao();
  }, [id, reset]);

  // 2. Lógica de submissão para PUT
  const onSubmit = async (data: CotacaoFormData) => {
    try {
      await api.put(`/cotacoes/${id}`, data);
      setMensagem("Cotação atualizada com sucesso!");
      // Atualiza o nome do cliente no estado após a edição
      setNomeCliente(data.cliente);
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao atualizar cotação");
    }
  };

  // 3. Lógica de Exclusão
  async function handleDelete() {
    if (!confirm("Deseja realmente excluir esta cotação? Isso removerá TODOS os itens vinculados.")) {
      return;
    }
    try {
      await api.delete(`/cotacoes/${id}`);
      alert("Cotação removida com sucesso!");
      navigate("/"); // Volta para a lista
    } catch (error) {
      console.error(error);
      alert("Erro ao remover cotação");
    }
  }

  if (loading) return <p>Carregando dados da cotação...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="card" style={{ maxWidth: 600, margin: "2rem auto" }}>
      <Link to="/" style={{ display: "block", marginBottom: "1rem" }}>← Voltar para a Lista</Link>
      <h2 className="card-title">Editar Cotação: {nomeCliente}</h2>
      
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => navigate(`/cotacoes/${id}/itens`)} className="btn-primary">
          Gerenciar Itens
        </button>

        <button className="btn-danger" onClick={handleDelete}>
          Excluir Cotação
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Cliente:</label>
          <input type="text" {...register("cliente")} placeholder="Informe o nome do cliente..." />
          {errors.cliente && <p style={{ color: "red" }}>{errors.cliente.message}</p>}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label>Status:</label>
            <select {...register("status")}>
              <option value="Rascunho">Rascunho</option>
              <option value="Enviado">Enviado</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Rejeitado">Rejeitado</option>
            </select>
            {errors.status && <p style={{ color: "red" }}>{errors.status.message}</p>}
          </div>

          <div style={{ flex: 1 }}>
            <label>Desconto (%):</label>
            <input
              type="number"
              step="0.01"
              {...register("descontoPct", { valueAsNumber: true })}
              placeholder="Desconto (%)"
            />
            {errors.descontoPct && <p style={{ color: "red" }}>{errors.descontoPct.message}</p>}
          </div>
        </div>

        <div>
          <label>Observação:</label>
          <textarea {...register("observacao")} placeholder="Digite sua observação..." />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-success">
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>

      {mensagem && <p style={{ marginTop: "1rem" }}>{mensagem}</p>}
    </div>
  );
}
