export const generateRecommendations = (profile, accounts, income, expenses) => {
  if (!profile || !profile.risk_tolerance || !profile.investment_horizon) {
    return null;
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
  const monthlyIncome = income
    .filter((i) => i.frequency === 'monthly')
    .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const monthlyExpenses = expenses
    .filter((e) => e.frequency === 'monthly')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const monthlySavings = monthlyIncome - monthlyExpenses;

  const recommendations = {
    risk_profile: profile.risk_tolerance,
    investment_horizon: profile.investment_horizon,
    emergency_fund: 0,
    investments: [],
    allocation: {},
    advice: [],
  };

  const emergencyMonths = profile.risk_tolerance === 'conservative' ? 6 : profile.risk_tolerance === 'moderate' ? 4 : 3;
  recommendations.emergency_fund = monthlyExpenses * emergencyMonths;

  if (profile.risk_tolerance === 'conservative') {
    recommendations.investments = [
      { name: 'Livret A', type: 'Épargne sécurisée', rate: '3%', risk: 'Très faible' },
      { name: 'LDDS', type: 'Épargne sécurisée', rate: '3%', risk: 'Très faible' },
      { name: 'Fonds euros (Assurance vie)', type: 'Épargne garantie', rate: '2-3%', risk: 'Très faible' },
    ];
    recommendations.allocation = {
      'Épargne de sécurité': 70,
      'Fonds euros': 25,
      'Obligations': 5,
    };
    recommendations.advice = [
      'Constituez d\'abord une épargne de sécurité équivalente à 6 mois de dépenses',
      'Maximisez vos livrets réglementés (Livret A, LDDS)',
      'Privilégiez les fonds euros en assurance vie pour la sécurité',
      'Évitez les placements volatils et risqués',
    ];
  } else if (profile.risk_tolerance === 'moderate') {
    recommendations.investments = [
      { name: 'Livret A / LDDS', type: 'Épargne sécurisée', rate: '3%', risk: 'Très faible' },
      { name: 'Assurance vie (Fonds euros + UC)', type: 'Mixte', rate: '3-5%', risk: 'Modéré' },
      { name: 'PEA avec ETF World', type: 'Actions diversifiées', rate: '6-8%', risk: 'Modéré' },
      { name: 'SCPI', type: 'Immobilier', rate: '4-6%', risk: 'Modéré' },
    ];
    recommendations.allocation = {
      'Épargne de sécurité': 40,
      'Fonds euros': 20,
      'Actions (ETF)': 30,
      'Immobilier (SCPI)': 10,
    };
    recommendations.advice = [
      'Constituez une épargne de sécurité de 4 mois de dépenses',
      'Diversifiez entre épargne sécurisée et investissements',
      'Investissez progressivement dans un ETF World via un PEA',
      'Envisagez les SCPI pour diversifier dans l\'immobilier',
    ];
  } else {
    recommendations.investments = [
      { name: 'Livret A', type: 'Épargne de secours', rate: '3%', risk: 'Très faible' },
      { name: 'PEA avec ETF World/Sectoriels', type: 'Actions', rate: '7-10%', risk: 'Élevé' },
      { name: 'Assurance vie en UC', type: 'Actions', rate: '6-9%', risk: 'Élevé' },
      { name: 'Crypto-monnaies', type: 'Actifs volatils', rate: 'Variable', risk: 'Très élevé' },
      { name: 'Actions individuelles', type: 'Bourse', rate: 'Variable', risk: 'Très élevé' },
    ];
    recommendations.allocation = {
      'Épargne de sécurité': 20,
      'Actions (ETF)': 50,
      'Actions sectorielles': 20,
      'Crypto / Alternatifs': 10,
    };
    recommendations.advice = [
      'Gardez 3 mois de dépenses en épargne de sécurité',
      'Investissez massivement dans les actions via ETF (PEA)',
      'Diversifiez avec des ETF sectoriels pour maximiser les gains',
      'Allouez une petite partie aux actifs à haut risque (crypto, actions)',
      'Investissez sur le long terme et restez patient face à la volatilité',
    ];
  }

  if (profile.investment_horizon === 'short') {
    recommendations.advice.push('Avec un horizon court terme, privilégiez la sécurité et la liquidité');
  } else if (profile.investment_horizon === 'long') {
    recommendations.advice.push('Avec un horizon long terme, vous pouvez prendre plus de risques pour de meilleurs rendements');
  }

  if (monthlySavings > 0) {
    recommendations.advice.push(`Avec ${monthlySavings.toFixed(0)}€ d'épargne mensuelle, mettez en place des virements automatiques`);
  } else {
    recommendations.advice.push('Attention : vos dépenses dépassent vos revenus. Réduisez vos dépenses avant d\'investir');
  }

  if (totalBalance < recommendations.emergency_fund) {
    recommendations.advice.unshift(`PRIORITÉ : Constituez d'abord votre épargne de sécurité (${recommendations.emergency_fund.toFixed(0)}€)`);
  }

  return recommendations;
};
