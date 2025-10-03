import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SmokeTest from "./debug/SmokeTest";
// 🔹 importar a nova página
import Configurar from "./pages/Configurar";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/debug" element={<SmokeTest />} />

      {/* 🔹 adicionar rota nova */}
      <Route path="/configurar" element={<Configurar />} />
    </Routes>
  );
}
