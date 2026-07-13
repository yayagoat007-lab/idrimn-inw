import { useState, useEffect } from 'react';
import { SubscriptionTier } from '../types';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  tier: SubscriptionTier;
  createdAt: string;
  lastActive: string;
  status: 'active' | 'suspended' | 'banned';
}

const INITIAL_USERS: AdminUser[] = [
  { id: 'usr-1', fullName: 'Ahmed El Alami', email: 'ahmed.alami@gmail.com', phone: '+212661890123', city: 'Casablanca', tier: 'elite', createdAt: '2025-01-15', lastActive: '2026-07-13', status: 'active' },
  { id: 'usr-2', fullName: 'Fatima-Zahra Bennani', email: 'bennani.fatima@yahoo.fr', phone: '+212675123456', city: 'Rabat', tier: 'family', createdAt: '2025-02-10', lastActive: '2026-07-12', status: 'active' },
  { id: 'usr-3', fullName: 'Yassine Chraibi', email: 'yassine.chraibi@outlook.com', phone: '+212662987654', city: 'Fès', tier: 'premium', createdAt: '2025-04-20', lastActive: '2026-07-11', status: 'active' },
  { id: 'usr-4', fullName: 'Sanaa Mourad', email: 'mourad.sanaa@gmail.com', phone: '+212654319201', city: 'Marrakech', tier: 'free', createdAt: '2025-05-01', lastActive: '2026-07-13', status: 'active' },
  { id: 'usr-5', fullName: 'Hamid Mansouri', email: 'h.mansouri@gmail.com', phone: '+212671992211', city: 'Tanger', tier: 'analyse', createdAt: '2025-06-18', lastActive: '2026-07-09', status: 'suspended' },
  { id: 'usr-6', fullName: 'Othman Tazi', email: 'othman.tazi@gmail.com', phone: '+212660112233', city: 'Oujda', tier: 'free', createdAt: '2025-09-05', lastActive: '2026-07-13', status: 'active' },
  { id: 'usr-7', fullName: 'Karima Bouzidi', email: 'karima.b@live.fr', phone: '+212669443322', city: 'Agadir', tier: 'premium', createdAt: '2025-11-12', lastActive: '2026-07-10', status: 'active' },
  { id: 'usr-8', fullName: 'Reda Lamrani', email: 'reda.lamrani@gmail.com', phone: '+212658112299', city: 'Meknès', tier: 'free', createdAt: '2025-12-25', lastActive: '2026-05-14', status: 'banned' }
];

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  useEffect(() => {
    const saved = localStorage.getItem('floussi_admin_users');
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      setUsers(INITIAL_USERS);
      localStorage.setItem('floussi_admin_users', JSON.stringify(INITIAL_USERS));
    }
    setLoading(false);
  }, []);

  const saveUsers = (updated: AdminUser[]) => {
    setUsers(updated);
    localStorage.setItem('floussi_admin_users', JSON.stringify(updated));
  };

  const updateUserTier = (userId: string, tier: SubscriptionTier) => {
    const updated = users.map(u => u.id === userId ? { ...u, tier } : u);
    saveUsers(updated);
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended' | 'banned') => {
    const updated = users.map(u => u.id === userId ? { ...u, status } : u);
    saveUsers(updated);
  };

  const deleteUser = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    saveUsers(updated);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter;
    const matchesCity = cityFilter === 'all' || user.city === cityFilter;

    return matchesSearch && matchesTier && matchesCity;
  });

  return {
    users: filteredUsers,
    allUsersRaw: users,
    loading,
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    cityFilter,
    setCityFilter,
    updateUserTier,
    updateUserStatus,
    deleteUser
  };
}
