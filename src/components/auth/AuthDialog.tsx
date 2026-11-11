import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, type AuthDialogMode } from '@/store/authStore';

const MODE_COPY: Record<AuthDialogMode, { title: string; description: string; submit: string }> = {
  login: { title: 'Ingresá a EcoPunto', description: 'Usá tu cuenta para guardar tu seguimiento y colaborar.', submit: 'Iniciar sesión' },
  register: { title: 'Creá tu cuenta', description: 'Confirmá tu correo para guardar tus datos personales.', submit: 'Crear cuenta' },
  forgot: { title: 'Recuperá tu acceso', description: 'Te enviamos un enlace si hay una cuenta asociada a ese correo.', submit: 'Enviar enlace' },
  reset: { title: 'Elegí una contraseña nueva', description: 'Usá al menos 12 caracteres.', submit: 'Guardar contraseña' },
};

export function AuthDialog() {
  const open = useAuthStore((state) => state.dialogOpen);
  const mode = useAuthStore((state) => state.dialogMode);
  const token = useAuthStore((state) => state.resetToken);
  const close = useAuthStore((state) => state.closeAuthDialog);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const forgot = useAuthStore((state) => state.requestPasswordReset);
  const reset = useAuthStore((state) => state.resetPassword);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
        close();
      } else if (mode === 'register') {
        await register({ email, password, ...(displayName.trim() ? { displayName: displayName.trim() } : {}) });
        setPassword('');
        setNotice('Te enviamos un correo para confirmar tu cuenta.');
        openAuthDialog('login');
      } else if (mode === 'forgot') {
        await forgot(email);
        setNotice('Si existe una cuenta con ese correo, vas a recibir un enlace para recuperar el acceso.');
      } else if (token) {
        await reset(token, password);
        setPassword('');
        setNotice('La contraseña se actualizó. Ya podés iniciar sesión.');
        openAuthDialog('login');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos completar la solicitud.');
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode: AuthDialogMode) {
    setError('');
    setNotice('');
    openAuthDialog(nextMode);
  }

  const copy = MODE_COPY[mode];
  const needsEmail = mode !== 'reset';
  const needsPassword = mode === 'login' || mode === 'register' || mode === 'reset';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : close())}>
      <DialogContent>
        <DialogTitle>{copy.title}</DialogTitle>
        <DialogDescription>{copy.description}</DialogDescription>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {needsEmail && <div className="space-y-2">
            <Label htmlFor="auth-email">Correo electrónico</Label>
            <Input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>}
          {mode === 'register' && <div className="space-y-2">
            <Label htmlFor="auth-name">Nombre (opcional)</Label>
            <Input id="auth-name" autoComplete="name" maxLength={80} value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </div>}
          {needsPassword && <div className="space-y-2">
            <Label htmlFor="auth-password">Contraseña</Label>
            <Input id="auth-password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>}
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
          <Button className="w-full" type="submit" disabled={busy || (mode === 'reset' && !token)}>
            {busy ? 'Un momento…' : copy.submit}
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          {mode === 'login' && <>
            <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => changeMode('register')}>Crear cuenta</button>
            <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => changeMode('forgot')}>Olvidé mi contraseña</button>
          </>}
          {(mode === 'register' || mode === 'forgot') && <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => changeMode('login')}>Volver a iniciar sesión</button>}
          {mode === 'reset' && <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => changeMode('login')}>Volver a iniciar sesión</button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
