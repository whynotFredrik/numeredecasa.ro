'use client';

import { useState, useEffect } from 'react';
import { Calendar, Copy, Check } from 'lucide-react';

interface DiscountCode {
  id: string;
  created_at: string;
  code: string;
  discount_percent: number;
  source_order_id?: string;
  source_customer_name?: string;
  source_customer_email?: string;
  is_active: boolean;
  max_uses?: number;
  times_used: number;
  email_sent_at?: string;
  expires_at?: string;
}

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingCodeId, setUpdatingCodeId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/discount-codes');
      if (!response.ok) throw new Error('Failed to fetch discount codes');
      const data = await response.json();
      setCodes(data.codes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load discount codes');
      console.error('Error fetching codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (codeId: string, isActive: boolean) => {
    try {
      setUpdatingCodeId(codeId);
      const response = await fetch('/api/admin/discount-codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeId,
          is_active: !isActive,
        }),
      });

      if (!response.ok) throw new Error('Failed to update code');

      // Update local state
      setCodes(codes.map(c => (c.id === codeId ? { ...c, is_active: !isActive } : c)));
    } catch (err) {
      console.error('Error updating code:', err);
      alert('Eroare la actualizarea codului de reducere');
    } finally {
      setUpdatingCodeId(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(code);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-foreground/60">Se încarcă...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Eroare la încărcarea codurilor</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const activeCodes = codes.filter(c => c.is_active);
  const inactiveCodes = codes.filter(c => !c.is_active);
  const totalUsages = codes.reduce((sum, c) => sum + c.times_used, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Coduri de Reducere</h1>
        <p className="text-foreground/60">Gestionează codurile de discount</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
          <p className="text-sm text-foreground/60 mb-2">Total Coduri</p>
          <p className="text-3xl font-bold">{codes.length}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
          <p className="text-sm text-foreground/60 mb-2">Active</p>
          <p className="text-3xl font-bold text-green-600">{activeCodes.length}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
          <p className="text-sm text-foreground/60 mb-2">Inactive</p>
          <p className="text-3xl font-bold text-red-600">{inactiveCodes.length}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
          <p className="text-sm text-foreground/60 mb-2">Total Utilizări</p>
          <p className="text-3xl font-bold">{totalUsages}</p>
        </div>
      </div>

      {/* Active Codes */}
      {activeCodes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Coduri Active ({activeCodes.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/2">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Cod</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm">Reducere</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Din Comanda</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm">Utilizări</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Expiră</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {activeCodes.map(code => (
                  <tr key={code.id} className="border-b border-foreground/5 hover:bg-foreground/2 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-semibold bg-foreground/5 px-2 py-1 rounded">
                          {code.code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="p-1 hover:bg-foreground/10 rounded transition-colors"
                          title="Copy code"
                        >
                          {copiedCodeId === code.code ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{code.discount_percent}%</td>
                    <td className="py-3 px-4 text-sm text-foreground/70">
                      {code.source_customer_name && (
                        <div>
                          <p className="font-medium">{code.source_customer_name}</p>
                          <p className="text-xs text-foreground/50">{code.source_customer_email}</p>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-sm">
                        {code.times_used}
                        {code.max_uses && ` / ${code.max_uses}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground/60">
                      {code.expires_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(code.expires_at).toLocaleDateString('ro-RO')}
                        </div>
                      ) : (
                        'Nu expiră'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(code.id, code.is_active)}
                        disabled={updatingCodeId === code.id}
                        className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 text-sm rounded font-medium transition-colors disabled:opacity-50"
                      >
                        Dezactiveaza
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inactive Codes */}
      {inactiveCodes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Coduri Inactive ({inactiveCodes.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full opacity-75">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/2">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Cod</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm">Reducere</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Din Comanda</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm">Utilizări</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Expiră</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {inactiveCodes.map(code => (
                  <tr key={code.id} className="border-b border-foreground/5 hover:bg-foreground/2 transition-colors">
                    <td className="py-3 px-4">
                      <code className="font-mono text-sm font-semibold bg-foreground/5 px-2 py-1 rounded">
                        {code.code}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{code.discount_percent}%</td>
                    <td className="py-3 px-4 text-sm text-foreground/70">
                      {code.source_customer_name && (
                        <div>
                          <p className="font-medium">{code.source_customer_name}</p>
                          <p className="text-xs text-foreground/50">{code.source_customer_email}</p>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-sm">
                        {code.times_used}
                        {code.max_uses && ` / ${code.max_uses}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground/60">
                      {code.expires_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(code.expires_at).toLocaleDateString('ro-RO')}
                        </div>
                      ) : (
                        'Nu expiră'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(code.id, code.is_active)}
                        disabled={updatingCodeId === code.id}
                        className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 text-sm rounded font-medium transition-colors disabled:opacity-50"
                      >
                        Activeaza
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {codes.length === 0 && (
        <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-8 text-center text-foreground/60">
          <p>Nu au fost găsite coduri de reducere.</p>
        </div>
      )}
    </div>
  );
}
