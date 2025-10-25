import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Tableau de bord', href: 'dashboard', icon: '📊' },
  { name: 'Comptes', href: 'accounts', icon: '💰' },
  { name: 'Revenus', href: 'income', icon: '💵' },
  { name: 'Dépenses', href: 'expenses', icon: '💳' },
  { name: 'Mon profil', href: 'profile', icon: '👤' },
  { name: 'Conseils', href: 'recommendations', icon: '💡' },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const { signOut } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-700">FinAdvisor</h1>
        <p className="text-sm text-gray-600 mt-1">Gestion financière</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <button
            key={item.href}
            onClick={() => onNavigate(item.href)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              currentPage === item.href
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
        >
          <span className="text-xl">🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
