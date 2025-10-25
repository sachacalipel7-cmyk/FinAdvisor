import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const categories = [
  'Loyer',
  'Alimentation',
  'Transport',
  'Assurances',
  'Abonnements',
  'Loisirs',
  'Santé',
  'Éducation',
  'Autre',
];

const frequencies = [
  { value: 'monthly', label: 'Mensuel' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'annual', label: 'Annuel' },
  { value: 'one_time', label: 'Ponctuel' },
];

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Loyer',
    description: '',
    amount: '',
    frequency: 'monthly',
  });

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('expenses').insert([
        {
          user_id: user.id,
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
        },
      ]);

      if (error) throw error;

      setFormData({ category: 'Loyer', description: '', amount: '', frequency: 'monthly' });
      setShowForm(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Erreur lors de l\'ajout de la dépense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cette dépense ?')) return;

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) throw error;
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Erreur lors de la suppression de la dépense');
    }
  };

  const monthlyTotal = expenses
    .filter((e) => e.frequency === 'monthly')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  if (loading && expenses.length === 0) {
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
          <h2 className="text-3xl font-bold text-gray-900">Mes dépenses</h2>
          <p className="text-gray-600 mt-1">Gérez vos dépenses récurrentes et ponctuelles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          {showForm ? 'Annuler' : '+ Ajouter une dépense'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-3 rounded-lg">
            <span className="text-2xl">��</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dépenses mensuelles totales</p>
            <p className="text-3xl font-bold text-red-700">{monthlyTotal.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Nouvelle dépense</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ex: Loyer appartement Paris"
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
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Ajout...' : 'Ajouter la dépense'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Catégorie</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Montant</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Fréquence</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{expense.category}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{expense.description || '-'}</td>
                <td className="px-6 py-4 text-sm font-medium text-red-700">
                  {parseFloat(expense.amount).toFixed(2)} €
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {frequencies.find((f) => f.value === expense.frequency)?.label}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {expenses.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune dépense ajoutée pour le moment</p>
            <p className="text-gray-400 text-sm mt-1">Cliquez sur "Ajouter une dépense" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
