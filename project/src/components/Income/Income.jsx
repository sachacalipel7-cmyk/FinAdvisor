import { useMemo, useState } from 'react';
import { useFinancialData } from '../../contexts/FinancialDataContext';

const PAGE_SIZE = 20;

const frequencies = [
  { value: 'monthly', label: 'Mensuel' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'annual', label: 'Annuel' },
  { value: 'one_time', label: 'Ponctuel' },
];

export default function Income() {
  const {
    income,
    metrics,
    isFetching,
    isHydrated,
    createIncome,
    deleteIncome,
  } = useFinancialData();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    frequency: 'monthly',
  });

  const hasData = income.length > 0;
  const totalPages = Math.max(1, Math.ceil(income.length / PAGE_SIZE));

  const paginatedIncome = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return income.slice(start, start + PAGE_SIZE);
  }, [income, currentPage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createIncome({
        source: formData.source,
        amount: formData.amount,
        frequency: formData.frequency,
      });
      setFormData({ source: '', amount: '', frequency: 'monthly' });
      setShowForm(false);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error creating income:', error);
      alert('Erreur lors de l\'ajout du revenu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce revenu ?')) return;

    try {
      setDeletingId(id);
      await deleteIncome(id);
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Erreur lors de la suppression du revenu');
    } finally {
      setDeletingId(null);
    }
  };

  const monthlyTotal = metrics.monthlyIncome;

  if (!isHydrated && isFetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => {
      if (direction === 'prev') {
        return Math.max(1, prev - 1);
      }
      return Math.min(totalPages, prev + 1);
    });
  };

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Source de revenu</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
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
              disabled={isSubmitting}
              className="w-full bg-success-600 text-white py-2 rounded hover:bg-success-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Ajout...' : 'Ajouter le revenu'}
            </button>
          </form>
        </div>
      )}

      {isFetching && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          Actualisation des données en cours...
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600">
            {income.length} revenu{income.length > 1 ? 's' : ''} au total
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange('next')}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
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
            {paginatedIncome.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{item.source}</td>
                <td className="px-6 py-4 text-sm font-medium text-success-700">
                  {parseFloat(item.amount).toFixed(2)} €
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{frequencies.find((f) => f.value === item.frequency)?.label}</td>
                <td className="px-6 py-4 text-sm text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingId === item.id ? 'Suppression...' : 'Supprimer'}
                  </button>
                </td>
              </tr>
            ))}

            {!hasData && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Aucun revenu enregistré pour le moment
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
