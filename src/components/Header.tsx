// src/components/Header.tsx
import React from "react";

type HeaderProps = {
  onHomeClick?: () => void;
  onDashboardClick?: () => void;
};

const Header: React.FC<HeaderProps> = ({ onHomeClick, onDashboardClick }) => {
  return (
    <header className="bg-primary text-primary-foreground shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Visitas AA - CTO DS 1</h1>

        <nav className="space-x-4">
          <button
            type="button"
            className="hover:underline"
            onClick={(e) => {
              e.preventDefault();
              onHomeClick?.();           // troca a view para "agenda"
            }}
          >
            Início
          </button>

          <button
            type="button"
            className="hover:underline"
            onClick={(e) => {
              e.preventDefault();
              onDashboardClick?.();      // troca a view para "analitico"
            }}
          >
            Dashboard
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
