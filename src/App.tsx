import { Routes, Route } from "react-router-dom";
import SplashScreen from "@/pages/SplashScreen";
import Dashboard from "@/pages/Dashboard";
import Configurar from "@/pages/Configurar";
import SmokeTest from "./debug/SmokeTest";

export default function App() {
  return (
    <Routes>
      {/* Tela de abertura */}
      <Route path="/" element={<SplashScreen />} />

      {/* Demais rotas */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/configurar" element={<Configurar />} />
      <Route path="/debug" element={<SmokeTest />} />
    </Routes>
  );
}
