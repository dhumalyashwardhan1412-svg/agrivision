import React from 'react';
import { Users, Shield, CheckCircle, Search, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const UserManagement: React.FC = () => {
  const users = [
    { id: 1, name: 'Rajesh Kumar', email: 'farmer@agrivision.com', role: 'FARMER', state: 'Punjab', status: 'ACTIVE' },
    { id: 2, name: 'Pooja Sharma', email: 'customer@agrivision.com', role: 'CUSTOMER', state: 'Chandigarh', status: 'ACTIVE' },
    { id: 3, name: 'Gurpreet Singh', email: 'shopkeeper@agrivision.com', role: 'SHOPKEEPER', state: 'Punjab', status: 'ACTIVE' },
    { id: 4, name: 'Dr. Arvind Patel', email: 'admin@agrivision.com', role: 'ADMIN', state: 'Delhi', status: 'ACTIVE' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage registered accounts, roles, and verified statuses across the network.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{u.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={u.role === 'FARMER' ? 'green' : u.role === 'ADMIN' ? 'purple' : 'blue'} size="sm">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">{u.state}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
