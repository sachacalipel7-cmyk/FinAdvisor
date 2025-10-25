import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const questions = [
  {
    id: 'risk_tolerance',
    question: 'Quelle est votre tolérance au risque ?',
    options: [
      { value: 'conservative', label: 'Prudent', description: 'Je préfère la sécurité, même si les gains sont limités' },
      { value: 'moderate', label: 'Modéré', description: 'J\'accepte un risque modéré pour de meilleurs rendements' },
      { value: 'aggressive', label: 'Dynamique', description: 'Je suis prêt à prendre des risques pour maximiser mes gains' },
    ],
  },
  {
    id: 'investment_horizon',
    question: 'Quel est votre horizon d\'investissement ?',
    options: [
      { value: 'short', label: 'Court terme', description: 'Moins de 3 ans' },
      { value: 'medium', label: 'Moyen terme', description: '3 à 8 ans' },
      { value: 'long', label: 'Long terme', description: 'Plus de 8 ans' },
    ],
  },
];

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    monthly_income: '',
    risk_tolerance: '',
    investment_horizon: '',
    life_goals: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          age: data.age || '',
          monthly_income: data.monthly_income || '',
          risk_tolerance: data.risk_tolerance || '',
          investment_horizon: data.investment_horizon || '',
          life_goals: data.life_goals || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          age: formData.age ? parseInt(formData.age) : null,
          monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : 0,
          risk_tolerance: formData.risk_tolerance,
          investment_horizon: formData.investment_horizon,
          life_goals: formData.life_goals,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  const isProfileComplete = profile && profile.risk_tolerance && profile.investment_horizon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mon profil</h2>
          <p className="text-gray-600 mt-1">Complétez votre profil pour des recommandations personnalisées</p>
        </div>
        {!editing && (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Âge
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Revenu mensuel net (€)
                </label>
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
              {questions.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    {q.question}
                  </label>
                  <div className="space-y-2">
                    {q.options.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                          formData[q.id] === option.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={option.value}
                          checked={formData[q.id] === option.value}
                          onChange={(e) => setFormData({ ...formData, [q.id]: e.target.value })}
                          className="mt-1"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objectifs de vie
              </label>
              <textarea
                value={formData.life_goals}
                onChange={(e) => setFormData({ ...formData, life_goals: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="4"
                placeholder="Ex: Acheter une maison, préparer ma retraite, constituer une épargne de sécurité..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="text-lg font-medium text-gray-900">{profile?.full_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Âge</p>
                <p className="text-lg font-medium text-gray-900">{profile?.age || '-'} ans</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenu mensuel</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile?.monthly_income ? `${parseFloat(profile.monthly_income).toFixed(2)} €` : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Profil de risque</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile?.risk_tolerance
                    ? questions[0].options.find((o) => o.value === profile.risk_tolerance)?.label
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Horizon d'investissement</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile?.investment_horizon
                    ? questions[1].options.find((o) => o.value === profile.investment_horizon)?.label
                    : '-'}
                </p>
              </div>
            </div>

            {profile?.life_goals && (
              <div className="border-t pt-6">
                <p className="text-sm text-gray-600 mb-2">Objectifs de vie</p>
                <p className="text-gray-900">{profile.life_goals}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
