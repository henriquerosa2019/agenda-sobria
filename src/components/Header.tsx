import React from "react";
import logo from "@/assets/aa-logo.png";

const Header = () => {
  return (
    <header className="bg-[#0B1E38] text-[#F4F4F4] py-5 shadow-lg">
      <div className="flex items-center justify-center gap-4">
        <img
          src={logo}
          alt="Logo AA CTO"
          className="h-14 w-auto drop-shadow-lg"
        />
        <h1 className="text-2xl md:text-3xl font-serif tracking-wide text-center">
          GESTÃO DE VISITAS - CTO DS 17 - ÁREA RJ
        </h1>
      </div>
    </header>
  );
};

export default Header;
