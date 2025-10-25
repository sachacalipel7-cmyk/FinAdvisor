import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const FinancialDataContext = createContext(null);

export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error('useFinancialData must be used within FinancialDataProvider');
  }
  return context;
};

export const FinancialDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [savedRecommendations, setSavedRecommendations] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const resetState = useCallback(() => {
    setAccounts([]);
    setIncome([]);
    setExpenses([]);
    setProfile(null);
    setSavedRecommendations([]);
    setIsHydrated(false);
  }, []);

  const fetchFinancialSnapshot = useCallback(async () => {
    if (!user) {
      resetState();
      return;
    }

    setIsFetching(true);
    try {
      const [accountsRes, incomeRes, expensesRes, profileRes, savedRecsRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('income').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase
          .from('recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setAccounts(accountsRes.data || []);
      setIncome(incomeRes.data || []);
      setExpenses(expensesRes.data || []);
      setProfile(profileRes.data || null);
      setSavedRecommendations(savedRecsRes.data || []);
    } catch (error) {
      console.error('Error fetching financial snapshot:', error);
    } finally {
      setIsFetching(false);
      setIsHydrated(true);
    }
  }, [resetState, user]);

  useEffect(() => {
    fetchFinancialSnapshot();
  }, [fetchFinancialSnapshot]);

  const metrics = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
    const monthlyIncome = income
      .filter((item) => item.frequency === 'monthly')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const monthlyExpenses = expenses
      .filter((item) => item.frequency === 'monthly')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings: monthlyIncome - monthlyExpenses,
    };
  }, [accounts, income, expenses]);

  const createAccount = useCallback(
    async ({ account_type, account_name, balance }) => {
      if (!user) throw new Error('User not authenticated');

      const payload = {
        user_id: user.id,
        account_type,
        account_name,
        balance: Number(balance) || 0,
      };

      const { data, error } = await supabase
        .from('accounts')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      setAccounts((prev) => [data, ...prev]);
      return data;
    },
    [user]
  );

  const deleteAccount = useCallback(async (id) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
    setAccounts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const createIncome = useCallback(
    async ({ source, amount, frequency }) => {
      if (!user) throw new Error('User not authenticated');

      const payload = {
        user_id: user.id,
        source,
        amount: Number(amount) || 0,
        frequency,
      };

      const { data, error } = await supabase
        .from('income')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      setIncome((prev) => [data, ...prev]);
      return data;
    },
    [user]
  );

  const deleteIncome = useCallback(async (id) => {
    const { error } = await supabase.from('income').delete().eq('id', id);
    if (error) throw error;
    setIncome((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const createExpense = useCallback(
    async ({ category, description, amount, frequency }) => {
      if (!user) throw new Error('User not authenticated');

      const payload = {
        user_id: user.id,
        category,
        description,
        amount: Number(amount) || 0,
        frequency,
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      setExpenses((prev) => [data, ...prev]);
      return data;
    },
    [user]
  );

  const deleteExpense = useCallback(async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateProfile = useCallback(
    async (changes) => {
      if (!user) throw new Error('User not authenticated');

      const payload = {
        id: user.id,
        ...changes,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      setProfile(data || payload);
    },
    [user]
  );

  const refreshSavedRecommendations = useCallback(
    async (newEntry) => {
      if (!user) throw new Error('User not authenticated');
      if (newEntry) {
        setSavedRecommendations((prev) => [newEntry, ...prev]);
        return;
      }

      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedRecommendations(data || []);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      accounts,
      income,
      expenses,
      profile,
      savedRecommendations,
      metrics,
      isFetching,
      isHydrated,
      refreshFinancialSnapshot: fetchFinancialSnapshot,
      createAccount,
      deleteAccount,
      createIncome,
      deleteIncome,
      createExpense,
      deleteExpense,
      updateProfile,
      refreshSavedRecommendations,
    }),
    [
      accounts,
      income,
      expenses,
      profile,
      savedRecommendations,
      metrics,
      isFetching,
      isHydrated,
      fetchFinancialSnapshot,
      createAccount,
      deleteAccount,
      createIncome,
      deleteIncome,
      createExpense,
      deleteExpense,
      updateProfile,
      refreshSavedRecommendations,
    ]
  );

  return <FinancialDataContext.Provider value={value}>{children}</FinancialDataContext.Provider>;
};

