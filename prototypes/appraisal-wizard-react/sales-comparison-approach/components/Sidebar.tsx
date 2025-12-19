import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Home, 
  Users, 
  Settings, 
  PieChart, 
  Search,
  BookOpen
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="w-16 md:w-64 bg-[#0f172a] flex-shrink-0 flex flex-col h-screen text-slate-400 border-r border-slate-800">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-800/50">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
          A
        </div>
        <span className="hidden md:block ml-3 font-bold text-slate-100 tracking-wide">AppraisePro</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-6 px-2 md:px-4 space-y-1 overflow-y-auto">
        <NavItem icon={<LayoutDashboard />} label="Dashboard" />
        <NavItem icon={<FileText />} label="Appraisals" active />
        <NavItem icon={<PieChart />} label="Evaluation" />
        <NavItem icon={<Search />} label="Comps Database" />
        
        <div className="pt-6 pb-2 px-2 hidden md:block text-xs font-bold uppercase tracking-wider text-slate-600">
           Management
        </div>
        <NavItem icon={<Users />} label="Clients" />
        <NavItem icon={<BookOpen />} label="Accounts" />
        <NavItem icon={<Settings />} label="Settings" />
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-slate-800/50 flex items-center gap-3">
        <img 
          src="https://picsum.photos/id/64/100/100" 
          alt="User" 
          className="w-8 h-8 rounded-full border border-slate-600"
        />
        <div className="hidden md:flex flex-col">
           <span className="text-sm font-medium text-slate-200">Harken Admin</span>
           <span className="text-xs text-slate-500">Senior Appraiser</span>
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
  <button className={`
    w-full flex items-center p-2.5 rounded-lg transition-all duration-200 group
    ${active 
      ? 'bg-cyan-500/10 text-cyan-400' 
      : 'hover:bg-slate-800 hover:text-slate-200'
    }
  `}>
    <span className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    </span>
    <span className="hidden md:block ml-3 text-sm font-medium">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] hidden md:block"></div>}
  </button>
);