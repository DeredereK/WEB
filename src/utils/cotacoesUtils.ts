import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const filePath = path.resolve("./src/data/cotacoes.json");

export async function carregarCotacoes() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(data);
    return json || [];
  } catch (err: any) {
    if (err.code === "ENOENT") return [];
    throw criarErroInterno("Erro ao carregar cotações", err.message);
  }
}

export async function salvarCotacoes(cotacoes: any[]) {
  try {
    await fs.writeFile(filePath, JSON.stringify(cotacoes, null, 2), "utf-8");
  } catch (err: any) {
    throw criarErroInterno("Erro ao salvar cotações", err.message);
  }
}

export function gerarIdCotacao(){
    return uuidv4();
}

export function gerarIdItem(){
    return uuidv4();
}
export function horaBrasiliaISO(){
    const agora = new Date();
    const offsetMs = -3*60*60*1000;
    const brasilia = new Date(agora.getTime() + offsetMs);
    return brasilia.toISOString();
}
export function criarErroValidacao(details:{field:string; message:string}[]){
    return {
        statusCode: 400,
        body:{
            error:{
                code: "VALIDATION_ERROR",
                message: "Dados inválidos",
                details,
            },
        },
    };
}
export function criarErroNaoEncontrado(mensagem = "Recurso não encontrado"){
    return {
        statusCode: 404,
        body:{
            error:{
                code: "NOT_FOUND",
                message: mensagem,
            },
        },
    };
}
export function criarErroInterno(mensagem = "Erro inesperado", detalhe?: string){
    return {
        statusCode: 500,
        body:{
            error:{
                code: "INTERNAL_ERROR",
                message: mensagem,
                details: detalhe? [detalhe]: undefined,
            },
        },
    };
}