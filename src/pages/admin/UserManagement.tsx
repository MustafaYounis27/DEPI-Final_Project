import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  Mail, 
  Edit3, 
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  X,
  SortAsc
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Role } from '../../types';
import { api } from '../../lib/api';

// Map enum integer from C# to string role
const mapRoleFromBackend = (roleInt: number): Role => {
  if (roleInt === 0) return 'ADMIN';
  if (roleInt === 1) return 'DOCTOR';
  return 'STAFF';
};

const mapRoleToBackend = (roleStr: Role): number => {
  if (roleStr === 'ADMIN') return 0;
  if (roleStr === 'DOCTOR') return 1;
  return 2;
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'newest'>('name-asc');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STAFF' as Role,
    password: '',
    specialty: '',
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users');
      // Map backend integer roles to frontend string roles
      const mappedUsers = response.data.map((u: any) => ({
        ...u,
        role: typeof u.role === 'number' ? mapRoleFromBackend(u.role) : u.role
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleStyles = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'DOCTOR': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'STAFF': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const filteredAndSortedUsers = users
    .filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'newest') {
        const idA = parseInt(a.id);
        const idB = parseInt(b.id);
        return (isNaN(idB) ? 0 : idB) - (isNaN(idA) ? 0 : idA);
      }
      return 0;
    });

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', email: '', role: 'STAFF', password: '', specialty: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '', specialty: user.specialty || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("Failed to delete user. Check console for details.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Email Regex Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      alert("Invalid email format. Please enter a valid email address.");
      return;
    }

    // Password Regex Validation (only for Create mode)
    if (modalMode === 'create') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        alert("Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
        return;
      }
    }

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: mapRoleToBackend(formData.role),
        specialty: formData.role === 'DOCTOR' ? formData.specialty : null,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
      };

      if (modalMode === 'create') {
        payload.password = formData.password;
      }

      if (modalMode === 'create') {
        const response = await api.post('/users', payload);
        const newUser = {
          ...response.data,
          role: mapRoleFromBackend(response.data.role)
        };
        setUsers([newUser, ...users]);
      } else if (modalMode === 'edit' && editingUser) {
        await api.put(`/users/${editingUser.id}`, { 
          ...editingUser, 
          ...payload,
          id: parseInt(editingUser.id)
        });
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData, avatar: payload.avatar } : u));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save user", error);
      alert("Failed to save user. Check console for details.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Access control and role administration for hospital staff.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-200"
        >
          <UserPlus size={20} />
          Create New User
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full appearance-none flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-100 text-sm font-bold pr-8 outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="STAFF">Staff</option>
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative flex-1 sm:flex-none">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-100 text-sm font-bold pr-8 outline-none"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="newest">Newest First</option>
              </select>
              <SortAsc size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-center">Security Role</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                 <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                     <div className="flex justify-center items-center gap-2">
                       <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                       Loading users...
                     </div>
                   </td>
                 </tr>
              ) : filteredAndSortedUsers.length > 0 ? (
                filteredAndSortedUsers.map((user, index) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} className="w-10 h-10 rounded-xl border border-gray-100" alt="" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400 group-hover:text-indigo-600 transition-colors uppercase tracking-wider font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getRoleStyles(user.role)}`}>
                        <Shield size={12} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 py-1 rounded-full font-bold text-green-600">
                        <CheckCircle size={14} />
                        <span className="text-[10px] uppercase tracking-widest">Active</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                          title="Edit User"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Create New User' : 'Edit User'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. john@hospital.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Security Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="STAFF">Staff</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                {formData.role === 'DOCTOR' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Specialty</label>
                    <input
                      required
                      type="text"
                      value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Cardiology, Pediatrics"
                    />
                  </div>
                )}
                {modalMode === 'create' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Password123!"
                    />
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                  >
                    {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
