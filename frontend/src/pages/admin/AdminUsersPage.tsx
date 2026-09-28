import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';
import { Users, GraduationCap, Shield, Search, Mail, Phone, Building } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<User[]>('/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.studentProfile?.registerNumber?.toLowerCase().includes(search.toLowerCase()) ||
      u.facultyProfile?.employeeId?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 py-6 font-sans">
      <div>
        <h1 className="text-2xl font-serif font-bold text-charcoal-900">Institutional Directory</h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Authorized students, faculty advisors, and departmental administrators.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-ivory-300 p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'STUDENT', 'FACULTY', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                roleFilter === r
                  ? 'bg-forest-800 text-white font-semibold'
                  : 'bg-ivory-100 text-charcoal-600 hover:bg-ivory-200'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ivory-300 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs text-charcoal-400 font-mono">Loading user directory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-charcoal-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory-50/80 border-b border-ivory-200 text-charcoal-600 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Name & Identity</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Registration / Employee ID</th>
                  <th className="py-3.5 px-6">Contact Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {filtered.map((u) => {
                  const dept = u.studentProfile?.department || u.facultyProfile?.department;
                  return (
                    <tr key={u.id} className="hover:bg-ivory-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-semibold text-charcoal-900 block">{u.fullName}</span>
                        {u.studentProfile && (
                          <span className="text-[11px] text-charcoal-500 font-mono">
                            Year {u.studentProfile.year} (Sec {u.studentProfile.section})
                          </span>
                        )}
                        {u.facultyProfile && (
                          <span className="text-[11px] text-charcoal-500">
                            {u.facultyProfile.designation}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            u.role === 'ADMIN'
                              ? 'bg-terracotta-100 text-terracotta-800'
                              : u.role === 'FACULTY'
                              ? 'bg-mustard-100 text-mustard-900'
                              : 'bg-forest-100 text-forest-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {dept ? (
                          <div>
                            <span className="font-medium text-charcoal-900">{dept.name}</span>
                            <span className="text-[11px] text-charcoal-500 font-mono block">
                              ({dept.code})
                            </span>
                          </div>
                        ) : (
                          <span className="text-charcoal-400">Institutional Central</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-charcoal-800">
                        {u.studentProfile?.registerNumber || u.facultyProfile?.employeeId || 'ADMIN'}
                      </td>
                      <td className="py-4 px-6 font-mono text-charcoal-600">
                        {u.email}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
