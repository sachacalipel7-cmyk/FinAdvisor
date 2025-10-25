import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const accountTypes = [
  { value: 'current', label: 'Compte courant', icon: '🏦' },
  { value: 'savings', label: 'Livret A', icon: '💰' },
  { value: 'pea', label: 'PEA', icon: '📈' },
  { value: 'life_insurance', label: 'Assurance vie', icon: '🛡️' },
  { value: 'crypto', label: 'Crypto', icon: '₿' },
  { value: 'other', label: 'Autre', icon: '📊' },
];

export default function Accounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    account_type: 'current',
    account_name: '',
    balance: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('accounts').insert([
        {
          user_id: user.id,
          account_type: formData.account_type,
          account_name: formData.account_name,
          balance: parseFloat(formData.balance),
        },
      ]);

      if (error) throw error;

      setFormData({ account_type: 'current', account_name: '', balance: '' });
      setShowForm(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce compte ?')) return;

    try {
      const { error } = await supabase.from('accounts').delete().eq('id', id);

      if (error) throw error;
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Erreur lors de la suppression du compte');
    }
  };

  const getAccountIcon = (type) => {
    return accountTypes.find((t) => t.value === type)?.icon || '📊';
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

  if (loading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mes comptes</h2>
          <p className="text-gray-600 mt-1">Gérez vos différents comptes et placements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          {showForm ? 'Annuler' : '+ Ajouter un compte'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-3 rounded-lg">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Patrimoine total</p>
            <p className="text-3xl font-bold text-gray-900">{totalBalance.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Nouveau compte</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de compte
              </label>
              <select
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {accountTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du compte
              </label>
              <input
                type="text"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Livret A BNP"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solde actuel (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Ajout...' : 'Ajouter le compte'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <span className="text-2xl">{getAccountIcon(account.account_type)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{account.account_name}</h3>
                  <p className="text-sm text-gray-600">
                    {accountTypes.find((t) => t.value === account.account_type)?.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(account.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-600">Solde</p>
              <p className="text-2xl font-bold text-gray-900">{parseFloat(account.balance).toFixed(2)} €</p>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Aucun compte ajouté pour le moment</p>
          <p className="text-gray-400 text-sm mt-1">Cliquez sur "Ajouter un compte" pour commencer</p>
        </div>
      )}
    </div>
  );
}
