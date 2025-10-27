import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListaCotacoes from "./pages/ListaCotacoes";
import NovaCotacao from "./pages/NovaCotacao";
import EditarCotacao from "./pages/EditarCotacao";
import CotacaoDetalhe from "./pages/CotacaoDetalhe"; // Manter para a próxima etapa

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListaCotacoes />} />
        <Route path="/nova-cotacao" element={<NovaCotacao />} />
        <Route path="/editar-cotacao/:id" element={<EditarCotacao />} /> {/* Corrigido: usando :id */}
        <Route path="/cotacoes/:id" element={<CotacaoDetalhe />} /> {/* Corrigido: usando :id */}
        {/* Rota /cotacoes/:id/itens removida */}
      </Routes>
    </BrowserRouter>
  );
}
