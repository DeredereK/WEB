import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../services/api";
import { useState } from "react";

const cotacaoSchema = z.object({
  cliente: z.string().min(3, "O nome do cliente é obrigatório"),
  status: z.enum(["Rascunho", "Enviado", "Aprovado", "Rejeitado"]),
  descontoPct: z.number().min(0, "Desconto mínimo é 0").max(100, "Desconto máximo é 100"),
  observacao: z.string().optional(),
});

type CotacaoFormData = z.infer<typeof cotacaoSchema>;

export default function NovaCotacao() {
  const [mensagem, setMensagem] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CotacaoFormData>({
    resolver: zodResolver(cotacaoSchema),
    defaultValues: {
      status: "Rascunho",
    },
  });

  const onSubmit = async (data: CotacaoFormData) => {
    try {
      await api.post("/cotacoes", data);
      setMensagem("Cotação criada com sucesso!");
      reset(); // limpa formulário
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao criar cotação");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Nova Cotação</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Cliente:</label>
          <input {...register("cliente")} />
          {errors.cliente && <p style={{ color: "red" }}>{errors.cliente.message}</p>}
        </div>

        <div>
          <label>Status:</label>
          <select {...register("status")}>
            <option value="Rascunho">Rascunho</option>
            <option value="Enviado">Enviado</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
          </select>
          {errors.status && <p style={{ color: "red" }}>{errors.status.message}</p>}
        </div>

        <div>
          <label>Desconto (%):</label>
          <input
            type="number"
            step="0.01"
            {...register("descontoPct", { valueAsNumber: true })}
          />
          {errors.descontoPct && <p style={{ color: "red" }}>{errors.descontoPct.message}</p>}
        </div>

        <div>
          <label>Observação:</label>
          <textarea {...register("observacao")} />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </form>

      {mensagem && <p style={{ marginTop: "1rem" }}>{mensagem}</p>}
    </div>
  );
}
