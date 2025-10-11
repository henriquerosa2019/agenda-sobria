import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // fade inicia aos 9.5s
    const timerFade = setTimeout(() => setFadeOut(true), 9500);
    // redireciona aos 10s
    const timerNav = setTimeout(() => navigate("/dashboard"), 10000);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerNav);
    };
  }, [navigate]);

  return (
    <div
      className={`flex flex-col items-center justify-center h-screen bg-white text-center transition-all duration-700 ${
        fadeOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* 🔹 Mensagem no topo */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          Bem-vindo ao grupo de CTO do Distrito 17.
        </h1>
        <p className="mt-3 text-2xl text-gray-600">
          Amor e Serviço é o nosso lema!!!
        </p>
      </div>

      {/* 🔹 Logo abaixo da mensagem */}
      <img
        src="/logo-aa.png"
        alt="Logo AA"
        className="w-[36rem] h-[36rem] object-contain animate-[pulse_2s_ease-in-out_infinite]"
        style={{
          filter: "drop-shadow(0 0 25px rgba(0,0,0,0.25))",
        }}
      />
    </div>
  );
}
