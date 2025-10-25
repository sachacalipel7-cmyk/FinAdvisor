import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinancialData } from '../../contexts/FinancialDataContext';

const COLORS = ['#0073e6', '#00a551', '#4da6ff', '#1ab568', '#80c0ff', '#80d6ab'];

export default function Dashboard() {
  const { accounts, expenses, metrics, isHydrated, isFetching } = useFinancialData();

  const accountsData = useMemo(
    () =>
      accounts.map((acc) => ({
        name: acc.account_name,
        value: parseFloat(acc.balance || 0),
      })),
    [accounts]
  );

  const expensesData = useMemo(() => {
    const monthlyExpenses = expenses.filter((e) => e.frequency === 'monthly');
    const aggregation = monthlyExpenses.reduce((acc, expense) => {
      const key = expense.category;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += Number(expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(aggregation).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  if (!isHydrated && isFetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-600 mt-1">Vue d'ensemble de vos finances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-3 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patrimoine total</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalBalance.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-success-100 p-3 rounded-lg">
              <span className="text-2xl">💵</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenus mensuels</p>
              <p className="text-2xl font-bold text-success-700">{metrics.monthlyIncome.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <span className="text-2xl">💳</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dépenses mensuelles</p>
              <p className="text-2xl font-bold text-red-700">{metrics.monthlyExpenses.toFixed(2)} €</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Répartition des comptes</h3>
          {accountsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={accountsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {accountsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Aucun compte ajouté
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Dépenses mensuelles par catégorie</h3>
          {expensesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Aucune dépense ajoutée
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Épargne mensuelle</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Capacité d'épargne</p>
            <p className={`text-3xl font-bold ${metrics.monthlySavings >= 0 ? 'text-success-700' : 'text-red-700'}`}>
              {metrics.monthlySavings.toFixed(2)} €
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Taux d'épargne</p>
            <p className={`text-3xl font-bold ${metrics.monthlyIncome > 0 ? 'text-primary-700' : 'text-gray-700'}`}>
              {metrics.monthlyIncome > 0 ? ((metrics.monthlySavings / metrics.monthlyIncome) * 100).toFixed(1) : '0'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
