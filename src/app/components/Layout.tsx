import { Outlet, NavLink } from 'react-router';
import { Activity, PlusCircle, History, CalendarDays } from 'lucide-react';

export function Layout() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 max-w-md mx-auto relative shadow-2xl overflow-hidden sm:border-x sm:border-slate-200">
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      
      <nav className="absolute bottom-0 w-full bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-5 py-3 flex justify-between items-center z-50 pb-safe">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-teal-500'}`}
        >
          {({ isActive }) => (
            <>
              <Activity size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Dashboard</span>
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/calendar" 
          className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-teal-500'}`}
        >
          {({ isActive }) => (
            <>
              <CalendarDays size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Log</span>
            </>
          )}
        </NavLink>

        <NavLink 
          to="/trigger" 
          className={({ isActive }) => `flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all duration-300 ${isActive ? 'text-blue-700 transform -translate-y-2' : 'text-slate-400 hover:text-blue-600'}`}
        >
          {({ isActive }) => (
            <>
              <div className={`p-3.5 rounded-full shadow-sm ${isActive ? 'bg-blue-100 shadow-blue-100/50' : 'bg-slate-50 border border-slate-100'}`}>
                <PlusCircle size={28} className={isActive ? "text-blue-700" : ""} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-0'} absolute -bottom-3`}>Record</span>
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/history" 
          className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-teal-500'}`}
        >
          {({ isActive }) => (
            <>
              <History size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">History</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
