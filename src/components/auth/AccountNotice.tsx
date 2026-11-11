import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export function AccountNotice({ description }: { description: string }) {
  const user = useAuthStore((state) => state.user);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const resendVerification = useAuthStore((state) => state.resendVerification);
  const [sending, setSending] = useState(false);

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-surface-soft p-5">
        <p className="text-sm text-muted">{description}</p>
        <Button className="mt-4" size="sm" onClick={() => openAuthDialog('login')}>Ingresar o crear cuenta</Button>
      </div>
    );
  }

  if (user.emailVerifiedAt) return null;
  const email = user.email;

  async function resend() {
    setSending(true);
    try {
      await resendVerification(email);
      toast.success('Si tu cuenta necesita confirmar el correo, te enviamos un enlace.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos enviar el correo.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-5">
      <p className="text-sm text-muted">Confirmá tu correo para continuar. Revisá tu bandeja de entrada y correo no deseado.</p>
      <Button className="mt-4" size="sm" variant="outline" disabled={sending} onClick={() => void resend()}>
        {sending ? 'Enviando…' : 'Reenviar correo de confirmación'}
      </Button>
    </div>
  );
}
