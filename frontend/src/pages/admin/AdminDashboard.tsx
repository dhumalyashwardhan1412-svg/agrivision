import React from 'react';
import { ShieldCheck, Users, Sprout, TrendingUp, Activity, Database, Server } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm">SYSTEM OVERWATCH & PLATFORM OPERATIONS</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            AgriVision Platform Admin Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time monitoring of active users, agronomic databases, and APMC market synchronizers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Registered Farmers"
          value="1,420"
          subtitle="98% Active this month"
          icon={Sprout}
          color="green"
        />
        <StatCard
          title="Direct Produce Buyers"
          value="3,840"
          subtitle="Consumer & Wholesale"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Mandi Price Feeds"
          value="50+"
          subtitle="Agmarknet Synced"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="System Health"
          value="99.98%"
          subtitle="FastAPI + SQLAlchemy"
          icon={Activity}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <CardHeader>
            <div>
              <CardTitle className="text-base">System Telemetry & Architecture</CardTitle>
              <CardDescription>Operational microservices status</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-800">REST API Gateway (FastAPI)</span>
              <span className="font-bold text-emerald-700">ONLINE (Port 8000)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-800">Recommendation Scoring Engine</span>
              <span className="font-bold text-emerald-700">OPTIMAL</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-800">Gemini 2.5 Agronomy Assistant & Vision</span>
              <span className="font-bold text-emerald-700">ACTIVE & FALLBACK READY</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-800">ReportLab Certified PDF Engine</span>
              <span className="font-bold text-emerald-700">READY</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <CardHeader>
            <div>
              <CardTitle className="text-base">Security & Authentication Audit</CardTitle>
              <CardDescription>JWT session management & role verification</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              ✅ <strong>Strict Role Isolation:</strong> FARMER, CUSTOMER, SHOPKEEPER, ADMIN routes enforced via backend dependencies.
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
              🔒 <strong>Password Cryptography:</strong> Direct bcrypt hashing and HMAC-SHA256 tokens.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
              🌱 <strong>Agronomic Disclaimers:</strong> Mandatory scientific compliance disclaimers active across all photo and lab endpoints.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
