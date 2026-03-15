import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src="/logo-partner.png" alt="EV Charging Partner" className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-6 border-t border-border">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `py-3 text-sm font-medium transition ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/stations"
            className={({ isActive }) =>
              `py-3 text-sm font-medium transition ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`
            }
          >
            My Stations
          </NavLink>
          <NavLink
            to="/sessions"
            className={({ isActive }) =>
              `py-3 text-sm font-medium transition ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`
            }
          >
            Sessions
          </NavLink>
          {user?.role === 'admin' && (
            <>
              <NavLink
                to="/partners"
                className={({ isActive }) =>
                  `py-3 text-sm font-medium transition ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`
                }
              >
                Partners
              </NavLink>
              <NavLink
                to="/terms"
                className={({ isActive }) =>
                  `py-3 text-sm font-medium transition ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`
                }
              >
                Terms & Conditions
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
