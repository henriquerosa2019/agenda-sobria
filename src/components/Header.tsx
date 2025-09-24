import aaLogo from '@/assets/aa-logo.png';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-6 px-4 shadow-medium">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <img 
          src={aaLogo} 
          alt="Alcoólicos Anônimos" 
          className="w-16 h-16 object-contain bg-white/10 rounded-full p-2" 
        />
        <div>
          <h1 className="text-3xl font-bold">Gestão de Visitas</h1>
          <p className="text-primary-foreground/80 text-lg">CTO DS 17 - Grupo de Serviço AA</p>
        </div>
      </div>
    </header>
  );
};

export default Header;