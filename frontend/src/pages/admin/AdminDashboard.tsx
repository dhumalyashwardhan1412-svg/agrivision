import React from 'react';
import { ShieldCheck, Users, Sprout, TrendingUp, Activity, Database, Server } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MotionPage, MotionGrid, MotionCard, MotionItem } from '../../components/common/MotionWrapper';

export const AdminDashboard: React.FC = () => {
  return (
    <MotionPage className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 dashboard-card-hover">
        <div>
          <Badge variant="purple" size="sm" className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 status-dot-pulse-purple" />
            <span>SYSTEM OVERWATCH & PLATFORM OPERATIONS</span>
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            AgriVision Platform Admin Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time monitoring of active users, agronomic databases, and APMC market synchronizers.
          </p>
        </div>
      </div>

      {/* KPI Cards with Staggered Entrance */}
      <MotionGrid className="grid grid-cols-1 sm:grid-cols-4 gap-4" staggerDelay={0.07}>
        <MotionCard hoverEffect={false}>
          <StatCard
            title="Registered Farmers"
            value="1,420"
            subtitle="98% Active this month"
            icon={Sprout}
            color="green"
          />
        </MotionCard>
        <MotionCard hoverEffect={false}>
          <StatCard
            title="Direct Produce Buyers"
            value="3,840"
            subtitle="Consumer & Wholesale"
            icon={Users}
            color="blue"
          />
        </MotionCard>
        <MotionCard hoverEffect={false}>
          <StatCard
            title="Mandi Price Feeds"
            value="50+"
            subtitle="Agmarknet Synced"
            icon={TrendingUp}
            color="amber"
          />
        </MotionCard>
        <MotionCard hoverEffect={false}>
          <StatCard
            title="System Health"
            value="99.98%"
            subtitle="FastAPI + SQLAlchemy"
            icon={Activity}
            color="purple"
          />
        </MotionCard>
      </MotionGrid>

      {/* Two Main Cards: Telemetry and Security */}
      <MotionGrid className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.09}>
        <MotionCard hoverEffect={false}>
          <Card className="p-6 space-y-4 dashboard-card-hover h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-600" />
                    <span>System Telemetry & Architecture</span>
                  </CardTitle>
                  <CardDescription>Operational microservices status</CardDescription>
                </div>
              </CardHeader>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors">
                  <span className="font-semibold text-slate-800">REST API Gateway (FastAPI)</span>
                  <span className="font-bold text-emerald-700 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot-pulse" />
                    ONLINE (Port 8000)
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors">
                  <span className="font-semibold text-slate-800">Recommendation Scoring Engine</span>
                  <span className="font-bold text-emerald-700 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot-pulse" />
                    OPTIMAL
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors">
                  <span className="font-semibold text-slate-800">Gemini 2.5 Agronomy Assistant & Vision</span>
                  <span className="font-bold text-emerald-700 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot-pulse" />
                    ACTIVE & FALLBACK READY
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors">
                  <span className="font-semibold text-slate-800">ReportLab Certified PDF Engine</span>
                  <span className="font-bold text-emerald-700 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot-pulse" />
                    READY
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </MotionCard>

        <MotionCard hoverEffect={false}>
          <Card className="p-6 space-y-4 dashboard-card-hover h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Security & Authentication Audit</span>
                  </CardTitle>
                  <CardDescription>JWT session management & role verification</CardDescription>
                </div>
              </CardHeader>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 transition-colors hover:bg-emerald-100/70">
                  ✅ <strong>Strict Role Isolation:</strong> FARMER, CUSTOMER, SHOPKEEPER, ADMIN routes enforced via backend dependencies.
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 transition-colors hover:bg-blue-100/70">
                  🔒 <strong>Password Cryptography:</strong> Direct bcrypt hashing and HMAC-SHA256 tokens.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 transition-colors hover:bg-slate-100/80">
                  🌱 <strong>Agronomic Disclaimers:</strong> Mandatory scientific compliance disclaimers active across all photo and lab endpoints.
                </div>
              </div>
            </div>
          </Card>
        </MotionCard>
      </MotionGrid>
    </MotionPage>
  );
};
