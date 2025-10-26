import { z } from "zod";

export const cotacaoSchema = z.object({
  cliente: z.string().min(3, "O nome do cliente deve ter pelo menos 3 caracteres."),
  status: z.enum(["Rascunho", "Enviado", "Aprovado", "Rejeitado"]).default("Rascunho"),
  descontoPct: z.number().min(0).max(100),
  observacao: z.string().optional(),
});

export type CotacaoInput = z.infer<typeof cotacaoSchema>;
