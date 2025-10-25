import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const frequencies = [
  { value: 'monthly', label: 'Mensuel' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'annual', label: 'Annuel' },
  { value: 'one_time', label: 'Ponctuel' },
];

export default function Income() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    frequency: 'monthly',
  });

  useEffect(() => {
    fetchIncomes();
  }, [user]);

  const fetchIncomes = async () => {
    try {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncomes(data || []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('income').insert([
        {
          user_id: user.id,
          source: formData.source,
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
        },
      ]);

      if (error) throw error;

      setFormData({ source: '', amount: '', frequency: 'monthly' });
      setShowForm(false);
      fetchIncomes();
    } catch (error) {
      console.error('Error creating income:', error);
      alert('Erreur lors de l\'ajout du revenu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce revenu ?')) return;

    try {
      const { error } = await supabase.from('income').delete().eq('id', id);

      if (error) throw error;
      fetchIncomes();
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Erreur lors de la suppression du revenu');
    }
  };

  const monthlyTotal = incomes
    .filter((i) => i.frequency === 'monthly')
    .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

  if (loading && incomes.length === 0) {
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
          <h2 className="text-3xl font-bold text-gray-900">Mes revenus</h2>
          <p className="text-gray-600 mt-1">Suivez vos différentes sources de revenus</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 transition"
        >
          {showForm ? 'Annuler' : '+ Ajouter un revenu'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-success-100 p-3 rounded-lg">
            <span className="text-2xl">💵</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Revenus mensuels totaux</p>
            <p className="text-3xl font-bold text-success-700">{monthlyTotal.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Nouveau revenu</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source de revenu
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-success-500 focus:border-transparent"
                placeholder="Ex: Salaire, Prime, Freelance..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-success-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fréquence
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-success-500 focus:border-transparent"
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-success-600 text-white py-2 rounded hover:bg-success-700 transition disabled:opacity-50"
            >
              {loading ? 'Ajout...' : 'Ajouter le revenu'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Source</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Montant</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Fréquence</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incomes.map((income) => (
              <tr key={income.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{income.source}</td>
                <td className="px-6 py-4 text-sm font-medium text-success-700">
                  {parseFloat(income.amount).toFixed(2)} €
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {frequencies.find((f) => f.value === income.frequency)?.label}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {incomes.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun revenu ajouté pour le moment</p>
            <p className="text-gray-400 text-sm mt-1">Cliquez sur "Ajouter un revenu" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
