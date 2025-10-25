import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinancialData } from '../../contexts/FinancialDataContext';
import { generateRecommendations } from '../../utils/recommendations';
import { supabase } from '../../lib/supabase';

const COLORS = ['#0073e6', '#00a551', '#4da6ff', '#1ab568', '#80c0ff', '#80d6ab'];

export default function Recommendations() {
  const {
    profile,
    metrics,
    savedRecommendations,
    isFetching,
    isHydrated,
    refreshSavedRecommendations,
  } = useFinancialData();
  const [isSaving, setIsSaving] = useState(false);

  const recommendations = useMemo(() => {
    if (!profile) {
      return null;
    }
    return generateRecommendations(profile, metrics);
  }, [profile, metrics]);

  const allocationData = useMemo(() => {
    if (!recommendations) {
      return [];
    }
    return Object.entries(recommendations.allocation || {}).map(([name, value]) => ({
      name,
      value,
    }));
  }, [recommendations]);

  const saveRecommendations = async () => {
    if (!recommendations) return;
    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('recommendations')
        .insert([
          {
            user_id: profile.id,
            recommendation_text: recommendations.advice.join('\n'),
            allocation_suggestion: recommendations.allocation,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      await refreshSavedRecommendations(data);
      alert('Recommandations sauvegardées avec succès !');
    } catch (error) {
      console.error('Error saving recommendations:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated && isFetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!profile || !profile.risk_tolerance || !profile.investment_horizon) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Conseils personnalisés</h2>
          <p className="text-gray-600 mt-1">Recevez des recommandations adaptées à votre profil</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <span className="text-5xl">📋</span>
          <h3 className="text-xl font-semibold text-yellow-900 mt-4">Profil incomplet</h3>
          <p className="text-yellow-800 mt-2">
            Complétez votre profil pour recevoir des recommandations d'investissement personnalisées.
          </p>
          <button
            onClick={() => (window.location.hash = '#profile')}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Compléter mon profil
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  const monthlySavings = metrics.monthlySavings;
  const monthlyIncome = metrics.monthlyIncome;
  const monthlyExpenses = metrics.monthlyExpenses;
  const totalBalance = metrics.totalBalance;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Conseils personnalisés</h2>
          <p className="text-gray-600 mt-1">Recommandations basées sur votre profil</p>
        </div>
        <button
          onClick={saveRecommendations}
          disabled={isSaving}
          className="px-6 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 transition disabled:opacity-50"
        >
          {isSaving ? 'Sauvegarde...' : '💾 Sauvegarder'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Votre profil</p>
          <p className="text-lg font-semibold text-primary-700 capitalize">{recommendations.risk_profile}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Épargne de sécurité recommandée</p>
          <p className="text-lg font-semibold text-success-700">{recommendations.emergency_fund.toFixed(0)} €</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Capacité d'épargne mensuelle</p>
          <p className={`text-lg font-semibold ${monthlySavings >= 0 ? 'text-success-700' : 'text-red-700'}`}>
            {monthlySavings.toFixed(0)} €
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Patrimoine total</p>
          <p className="text-2xl font-semibold text-gray-900">{totalBalance.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Ratio d'épargne</p>
          <p className="text-2xl font-semibold text-primary-700">
            {monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100).toFixed(1) : '0'}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Allocation recommandée</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            {allocationData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-medium text-gray-900">{entry.name}</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Placements recommandés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.investments.map((investment, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h4 className="font-semibold text-gray-900">{investment.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{investment.type}</p>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-xs text-gray-500">Rendement estimé</p>
                  <p className="text-sm font-semibold text-success-700">{investment.rate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Niveau de risque</p>
                  <p
                    className={`text-sm font-semibold ${
                      investment.risk.includes('faible')
                        ? 'text-success-600'
                        : investment.risk.includes('Modéré')
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {investment.risk}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary-900 mb-4">✨ Nos conseils pour vous</h3>
        <ul className="space-y-3">
          {recommendations.advice.map((advice, index) => (
            <li key={index} className="flex items-start space-x-3">
              <span className="text-primary-600 font-bold mt-0.5">•</span>
              <span className="text-primary-900">{advice}</span>
            </li>
          ))}
        </ul>
      </div>

      {savedRecommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📜 Historique des recommandations</h3>
          <div className="space-y-3">
            {savedRecommendations.slice(0, 5).map((rec) => (
              <div key={rec.id} className="border border-gray-200 rounded p-4">
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(rec.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-900 whitespace-pre-line text-sm">{rec.recommendation_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
