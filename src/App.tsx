import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SmokeTest from "./debug/SmokeTest";
import Configurar from "./pages/Configurar";
import { Analytics } from "@vercel/analytics/react"; // 👈 importa o componente da Vercel

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/debug" element={<SmokeTest />} />
        <Route path="/configurar" element={<Configurar />} />
      </Routes>

      {/* 👇 Componente do Vercel Analytics — rastreia todas as rotas */}
      <Analytics />
    </>
  );
}
