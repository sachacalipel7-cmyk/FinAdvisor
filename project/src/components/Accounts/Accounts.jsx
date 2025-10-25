import { useMemo, useState } from 'react';
import { useFinancialData } from '../../contexts/FinancialDataContext';

const accountTypes = [
  { value: 'current', label: 'Compte courant', icon: '🏦' },
  { value: 'savings', label: 'Livret A', icon: '💰' },
  { value: 'pea', label: 'PEA', icon: '📈' },
  { value: 'life_insurance', label: 'Assurance vie', icon: '🛡️' },
  { value: 'crypto', label: 'Crypto', icon: '₿' },
  { value: 'other', label: 'Autre', icon: '📊' },
];

export default function Accounts() {
  const {
    accounts,
    metrics,
    isFetching,
    isHydrated,
    createAccount,
    deleteAccount,
  } = useFinancialData();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    account_type: 'current',
    account_name: '',
    balance: '',
  });

  const hasData = accounts.length > 0;

  const totalBalance = useMemo(() => metrics.totalBalance, [metrics.totalBalance]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createAccount({
        account_type: formData.account_type,
        account_name: formData.account_name,
        balance: formData.balance,
      });
      setFormData({ account_type: 'current', account_name: '', balance: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Erreur lors de la création du compte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce compte ?')) return;

    try {
      setDeletingId(id);
      await deleteAccount(id);
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Erreur lors de la suppression du compte');
    } finally {
      setDeletingId(null);
    }
  };

  const getAccountIcon = (type) => accountTypes.find((t) => t.value === type)?.icon || '📊';

  if (!isHydrated && isFetching) {
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de compte</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du compte</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Solde actuel (€)</label>
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
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Ajout...' : 'Ajouter le compte'}
            </button>
          </form>
        </div>
      )}

      {isFetching && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          Actualisation des données en cours...
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
                disabled={deletingId === account.id}
                className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
              >
                {deletingId === account.id ? '...' : '✕'}
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-600">Solde</p>
              <p className="text-2xl font-bold text-gray-900">{parseFloat(account.balance).toFixed(2)} €</p>
            </div>
          </div>
        ))}
      </div>

      {!hasData && !showForm && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Aucun compte ajouté pour le moment</p>
          <p className="text-gray-400 text-sm mt-1">Cliquez sur "Ajouter un compte" pour commencer</p>
        </div>
      )}
    </div>
  );
}
