import { LoaderCircle, ShieldCheck, ShieldMinus, UserPlus, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchAdmins, promoteAdmin, revokeAdmin, type AdminUser } from './admin-api';
import { AdminConfirmDialog } from './AdminConfirmDialog';
import { adminGlass } from './admin-style';

export function AdminUsersPanel() {
  const currentUser = useAuthStore((state) => state.user);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try { setAdmins(await fetchAdmins()); }
    catch { setLoadError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function addAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    setSaving(true);
    try { await promoteAdmin(normalized); toast.success('Permiso de administrador asignado.'); setEmail(''); await load(); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : 'No pudimos agregar al administrador.'); }
    finally { setSaving(false); }
  }

  async function removeAdmin() {
    if (!selected) return;
    setRevoking(true);
    try { await revokeAdmin(selected.id); toast.success('Permiso de administrador revocado.'); setSelected(null); await load(); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : 'No pudimos quitar el permiso.'); }
    finally { setRevoking(false); }
  }

  return <div className="space-y-4">
    <div className={`grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] ${adminGlass} rounded-[26px] p-5 sm:p-6`}>
      <div><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border border-blue-300/15 bg-blue-300/[0.08] text-blue-100"><UsersRound size={18} /></span><div><h3 className="font-display text-lg font-semibold">Equipo administrador</h3><p className="mt-1 text-xs text-slate-500">Solo se muestran administradores activos.</p></div></div>
        {loading ? <div className="grid min-h-36 place-items-center text-sm text-slate-500"><span className="flex items-center gap-2"><LoaderCircle size={15} className="animate-spin" />Cargando equipo…</span></div>
          : loadError ? <div className="mt-5 rounded-2xl border border-amber-300/10 bg-amber-300/[0.04] p-4 text-sm text-amber-100"><p>No pudimos cargar el equipo.</p><Button variant="outline" size="sm" onClick={() => void load()} className="mt-3 border-white/10 bg-white/[0.02] text-slate-200">Reintentar</Button></div>
            : admins.length === 0 ? <div className="mt-5 rounded-2xl border border-white/[0.06] p-5 text-sm text-slate-400">No se encontraron administradores activos.</div>
              : <div className="mt-5 space-y-2">{admins.map((admin) => { const isCurrent = admin.id === currentUser?.id; const lastAdmin = admins.length === 1; return <article key={admin.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.022] p-3.5"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400/25 to-indigo-400/10 text-xs font-bold text-blue-100">{admin.email.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-200">{admin.email}{isCurrent && <span className="ml-2 text-[10px] font-normal text-blue-200/70">Vos</span>}</p><p className="mt-1 text-[10px] text-slate-500">{admin.emailVerifiedAt ? 'Correo verificado' : 'Correo sin verificar'} · Administrador</p></div></div><Button variant="outline" size="sm" disabled={isCurrent || lastAdmin} title={isCurrent ? 'No podés quitar tu propio rol desde este panel.' : lastAdmin ? 'Debe quedar al menos un administrador.' : 'Quitar permiso de administrador'} onClick={() => setSelected(admin)} className="border-white/10 bg-transparent text-slate-400 hover:border-rose-300/15 hover:bg-rose-300/[0.05] hover:text-rose-100"><ShieldMinus size={14} />Quitar rol</Button></article>; })}</div>}
      </div>
      <form onSubmit={(event) => void addAdmin(event)} className="h-fit rounded-2xl border border-blue-300/10 bg-gradient-to-br from-blue-400/[0.09] to-white/[0.015] p-4"><span className="grid size-9 place-items-center rounded-xl border border-blue-200/10 bg-blue-300/[0.08] text-blue-100"><UserPlus size={16} /></span><h4 className="mt-3 font-display font-semibold">Agregar administrador</h4><p className="mt-1 text-xs leading-5 text-slate-400">Ingresá el correo exacto de una cuenta activa con correo confirmado. No se crean cuentas desde acá.</p><div className="mt-4 space-y-2"><Label htmlFor="admin-email" className="text-xs text-slate-400">Correo de la cuenta</Label><Input id="admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="persona@correo.com" className="border-white/10 bg-black/10 text-slate-100 placeholder:text-slate-600" /></div><Button type="submit" disabled={saving || !email.trim()} className="mt-3 w-full bg-blue-500 text-white hover:bg-blue-400">{saving ? <LoaderCircle size={14} className="animate-spin" /> : <ShieldCheck size={14} />}Asignar rol admin</Button><p className="mt-3 flex gap-2 text-[10px] leading-4 text-slate-500"><ShieldCheck size={12} className="mt-0.5 shrink-0 text-emerald-200/70" />Se protege el último rol activo y cada cambio queda auditado.</p></form>
    </div>
    <AdminConfirmDialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title="Quitar rol de administrador?" description={`La cuenta ${selected?.email ?? ''} perderá acceso al panel. Su cuenta seguirá activa como usuario común.`} confirmLabel={revoking ? 'Quitando rol…' : 'Quitar rol admin'} busy={revoking} onConfirm={() => void removeAdmin()} />
  </div>;
}
