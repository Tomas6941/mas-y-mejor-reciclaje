import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function AdminConfirmDialog({
  open, onOpenChange, title, description, confirmLabel, busy = false, onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
}) {
  return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent className="border-white/10 bg-[#111b2b] text-slate-100"><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription className="text-slate-400">{description}</AlertDialogDescription><div className="mt-6 flex justify-end gap-2"><AlertDialogCancel disabled={busy} className="border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.08]">Cancelar</AlertDialogCancel><AlertDialogAction asChild><Button variant="danger" disabled={busy} onClick={onConfirm}>{confirmLabel}</Button></AlertDialogAction></div></AlertDialogContent></AlertDialog>;
}
