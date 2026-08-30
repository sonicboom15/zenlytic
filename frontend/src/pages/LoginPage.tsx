import React, { useState } from 'react';
import { useAuth, useToast } from '../hooks';
import { authApi } from '../api/authApi';
import { Button, Input, Select } from '../components/ui';
import {
  Lock,
  Mail,
  Building2,
  ArrowRight,
  Globe,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('admin@acme-global.com');
  const [password, setPassword] = useState('Password123!');
  const [tenantId, setTenantId] = useState('tenant-acme-global');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegisteringTenant, setIsRegisteringTenant] = useState(false);
  const [orgName, setOrgName] = useState('Acme Global Logistics');
  const [planTier, setPlanTier] = useState('ENTERPRISE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisteringTenant) {
        const generatedTenantId =
          tenantId.trim() ||
          orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

        const authData = await authApi.registerTenant({
          tenantId: generatedTenantId,
          name: orgName,
          adminEmail: email,
          adminPassword: password,
          tier: planTier,
        });

        login(authData, orgName);
        toastSuccess('Welcome to Zenlytic', `Organization ${orgName} registered successfully.`);
      } else {
        const authData = await authApi.login(email, password, tenantId);
        login(authData);
        toastSuccess('Signed In', `Authenticated as ${email}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify your credentials.';
      setError(msg);
      toastError('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center font-bold text-white text-xl shadow-sm mb-3.5">
            Z
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">ZENLYTIC</h1>
          <p className="text-xs text-slate-500 mt-1">B2B Commerce & Order Management</p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisteringTenant ? (
            <>
              <Input
                label="Organization Name"
                required
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  if (!tenantId || tenantId.startsWith('tenant-')) {
                    setTenantId('tenant-' + e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }
                }}
                placeholder="Acme Global Logistics"
                leftIcon={<Building2 className="w-4 h-4" />}
              />

              <Input
                label="Tenant Identifier Key"
                required
                mono
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="tenant-acme-global"
                leftIcon={<Globe className="w-4 h-4" />}
              />

              <Select
                label="Plan Tier"
                value={planTier}
                onChange={(e) => setPlanTier(e.target.value)}
                options={[
                  { value: 'STARTER', label: 'Starter Tier' },
                  { value: 'GROWTH', label: 'Growth Tier' },
                  { value: 'ENTERPRISE', label: 'Enterprise Tier' },
                ]}
              />
            </>
          ) : (
            <Input
              label="Workspace Identifier"
              required
              mono
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="default"
              leftIcon={<Building2 className="w-4 h-4" />}
            />
          )}

          <Input
            label={isRegisteringTenant ? 'Admin Email Address' : 'Email Address'}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full py-3 mt-2"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            {isRegisteringTenant ? 'Register Organization & Log In' : 'Sign In to Workspace'}
          </Button>
        </form>

        {/* Toggle between Login and Register Tenant */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisteringTenant(!isRegisteringTenant);
              setError(null);
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition cursor-pointer"
          >
            {isRegisteringTenant ? '← Back to Sign In' : '+ Register New Tenant Organization'}
          </button>
        </div>
      </div>
    </div>
  );
};
