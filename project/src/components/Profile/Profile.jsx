import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFinancialData } from '../../contexts/FinancialDataContext';

const questions = [
  {
    id: 'risk_tolerance',
    question: 'Quelle est votre tolérance au risque ?',
    options: [
      { value: 'conservative', label: 'Prudent', description: 'Je préfère la sécurité, même si les gains sont limités' },
      { value: 'moderate', label: 'Modéré', description: "J'accepte un risque modéré pour de meilleurs rendements" },
      { value: 'aggressive', label: 'Dynamique', description: 'Je suis prêt à prendre des risques pour maximiser mes gains' },
    ],
  },
  {
    id: 'investment_horizon',
    question: "Quel est votre horizon d'investissement ?",
    options: [
      { value: 'short', label: 'Court terme', description: 'Moins de 3 ans' },
      { value: 'medium', label: 'Moyen terme', description: '3 à 8 ans' },
      { value: 'long', label: 'Long terme', description: 'Plus de 8 ans' },
    ],
  },
];

export default function Profile() {
  const { user } = useAuth();
  const { profile, isFetching, isHydrated, updateProfile } = useFinancialData();
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    monthly_income: '',
    risk_tolerance: '',
    investment_horizon: '',
    life_goals: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age ? String(profile.age) : '',
        monthly_income: profile.monthly_income ? String(profile.monthly_income) : '',
        risk_tolerance: profile.risk_tolerance || '',
        investment_horizon: profile.investment_horizon || '',
        life_goals: profile.life_goals || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        full_name: formData.full_name,
        age: formData.age ? parseInt(formData.age, 10) : null,
        monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
        risk_tolerance: formData.risk_tolerance,
        investment_horizon: formData.investment_horizon,
        life_goals: formData.life_goals,
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProfileComplete = useMemo(
    () => Boolean(profile?.risk_tolerance && profile?.investment_horizon),
    [profile]
  );

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
          <h2 className="text-3xl font-bold text-gray-900">Mon profil</h2>
          <p className="text-gray-600 mt-1">Complétez votre profil pour des recommandations personnalisées</p>
        </div>
        {!editing && user && (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Modifier le profil
          </button>
        )}
      </div>

      {!isProfileComplete && !editing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900">Profil incomplet</h3>
              <p className="text-yellow-800 text-sm mt-1">
                Complétez votre profil pour recevoir des recommandations d'investissement personnalisées.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revenu mensuel net (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_income}
                  onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-6 border-t pt-6">
              {questions.map((question) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium text-gray-900 mb-3">{question.question}</label>
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                          formData[question.id] === option.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.value}
                          checked={formData[question.id] === option.value}
                          onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objectifs de vie</label>
              <textarea
                value={formData.life_goals}
                onChange={(e) => setFormData({ ...formData, life_goals: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Décrivez vos objectifs financiers et de vie"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    full_name: profile?.full_name || '',
                    age: profile?.age ? String(profile.age) : '',
                    monthly_income: profile?.monthly_income ? String(profile.monthly_income) : '',
                    risk_tolerance: profile?.risk_tolerance || '',
                    investment_horizon: profile?.investment_horizon || '',
                    life_goals: profile?.life_goals || '',
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="text-lg font-semibold text-gray-900">{profile?.full_name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Âge</p>
                <p className="text-lg font-semibold text-gray-900">{profile?.age || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenu mensuel net</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile?.monthly_income ? `${parseFloat(profile.monthly_income).toFixed(2)} €` : '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Tolérance au risque</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{profile?.risk_tolerance || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Horizon d'investissement</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{profile?.investment_horizon || '—'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Objectifs de vie</p>
              <p className="text-gray-900 whitespace-pre-line">{profile?.life_goals || '—'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
