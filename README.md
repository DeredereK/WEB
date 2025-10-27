# Projeto WEB (Frontend) - Sistema de Gerenciamento de Cotações

Este é o frontend da aplicação de Gerenciamento de Cotações, desenvolvido com **Vite + React + TypeScript**.

## Funcionalidades Principais

*   **Lista de Cotações:** Exibe todas as cotações com paginação (10 por página) e busca em tempo real (debounce de 500ms).
*   **CRUD de Cotações:** Criação (`/nova-cotacao`), Edição (`/editar-cotacao/:id`) e Exclusão de cotações.
*   **Gerenciamento de Itens:** A funcionalidade de adicionar, listar e remover itens foi integrada diretamente na página de Edição da Cotação (`/editar-cotacao/:id`).
*   **Recálculo Automático:** O total da cotação é recalculado automaticamente no backend após cada operação de CRUD de item.
*   **Validação:** Uso de React Hook Form e Zod para validação de formulários no frontend.
*   **Comunicação API:** Uso exclusivo de Axios e `useEffect` (sem React Query).

## Como Iniciar (Passos de Configuração)

1.  **Certifique-se de que o backend (`projetoTeste`) está em execução.**
2.  **Instale o pnpm globalmente** (se ainda não o fez):
    ```bash
    npm install -g pnpm
    ```
3.  **Configure o pnpm** (necessário após a instalação global):
    ```bash
    pnpm setup
    # **Importante:** Feche e reabra o terminal após este comando.
    ```
4.  **Instale as dependências do projeto:**
    ```bash
    pnpm install
    ```
5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    pnpm run dev
    ```

## Endpoints de Teste

A aplicação está configurada para se comunicar com o servidor rodando em `http://localhost:3000`.

## Seed Inicial

O backend foi populado com 10 cotações e 40 itens para permitir o teste imediato da paginação e busca.
*   **Busca:** Tente buscar por "Farmácia" ou "Hospital".
*   **Paginação:** Verifique se a lista está paginada corretamente.
