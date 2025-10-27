import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListaCotacoes from "./pages/ListaCotacoes";
import NovaCotacao from "./pages/NovaCotacao";
import EditarCotacao from "./pages/EditarCotacao";
import CotacaoDetalhe from "./pages/CotacaoDetalhe";
import ItensCotacao from "./pages/ItensCotacao";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListaCotacoes />} />
        <Route path="/nova-cotacao" element={<NovaCotacao />} />
        <Route path="/editar-cotacao/:id" element={<EditarCotacao />} /> {/* Corrigido: usando :id */}
        <Route path="/cotacoes/:id" element={<CotacaoDetalhe />} /> {/* Corrigido: usando :id */}
        <Route path="/cotacoes/:id/itens" element={<ItensCotacao />} /> {/* Corrigido: usando :id */}
      </Routes>
    </BrowserRouter>
  );
}
