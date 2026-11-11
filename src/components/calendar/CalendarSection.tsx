import { Bell, CalendarDays, Clock3, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_NEIGHBORHOOD, NEIGHBORHOOD_NAMES } from '@/data/neighborhoods';
import { getNextCollection } from '@/lib/collection';
import { formatLongDate, joinDays, shortDayName } from '@/lib/format';
import { useCalendarStore } from '@/store/calendarStore';
import { getSchedulesFor } from '@/store/calendarStore';

/** Agenda semanal de recolección según el barrio elegido. */
export default function CalendarSection() {
  const neighborhood = useCalendarStore((state) => state.neighborhood);
  const reminder = useCalendarStore((state) => state.reminder);
  const setNeighborhood = useCalendarStore((state) => state.setNeighborhood);
  const setReminder = useCalendarStore((state) => state.setReminder);
  const schedules = getSchedulesFor(neighborhood || DEFAULT_NEIGHBORHOOD);
  const next = getNextCollection(schedules);

  function toggleReminder() {
    setReminder(!reminder.enabled);
    toast.success(reminder.enabled ? 'Recordatorio desactivado.' : 'Preferencia de recordatorio guardada.');
  }

  return (
    <div className="container-page space-y-8 pb-16 pt-28">
      <header className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider text-primary">Organizá tu semana</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Calendario de recolección</h1><p className="mt-3 text-muted">Consultá los días y horarios de referencia para separar y sacar tus residuos.</p></header>
      <Card><CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6"><div className="space-y-2"><Label htmlFor="calendar-neighborhood">Tu barrio</Label><Select value={neighborhood} onValueChange={setNeighborhood}><SelectTrigger id="calendar-neighborhood"><SelectValue placeholder="Elegí tu barrio" /></SelectTrigger><SelectContent>{NEIGHBORHOOD_NAMES.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select></div><div className="flex items-center gap-2 text-sm text-muted"><MapPin size={17} /> Córdoba Capital</div></CardContent></Card>

      {next && <section className="rounded-hero bg-primary p-6 text-primary-foreground sm:p-8"><p className="text-sm font-semibold text-primary-foreground/75">PRÓXIMA RECOLECCIÓN</p><div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-display text-3xl font-bold">{next.schedule.name}</h2><p className="mt-2 text-primary-foreground/85">{formatLongDate(next.date)}</p><p className="mt-1 flex items-center gap-2 text-sm text-primary-foreground/85"><Clock3 size={15} /> {next.schedule.time}</p></div><span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">{next.offset === 0 ? 'Hoy' : next.offset === 1 ? 'Mañana' : `En ${next.offset} días`}</span></div></section>}

      <section className="space-y-4"><div><h2 className="font-display text-2xl font-bold">Días por tipo de residuo</h2><p className="mt-1 text-sm text-muted">Los horarios pueden variar según el servicio de cada zona.</p></div><div className="grid gap-4 md:grid-cols-3">{schedules.map((schedule) => <Card key={schedule.key}><CardHeader><div className="flex items-center justify-between"><CardTitle>{schedule.name}</CardTitle><span className="size-3 rounded-full" style={{ backgroundColor: schedule.color }} /></div><CardDescription>{schedule.description}</CardDescription></CardHeader><CardContent><div className="flex flex-wrap gap-2">{schedule.days.map((day) => <span key={day} className="grid size-10 place-items-center rounded-xl bg-primary-soft text-xs font-semibold text-primary">{shortDayName(day)}</span>)}</div><p className="mt-4 flex items-center gap-2 text-sm font-semibold"><Clock3 size={16} className="text-muted" /> {schedule.time}</p><p className="mt-1 text-xs text-muted">{joinDays(schedule.days)}</p></CardContent></Card>)}</div></section>

      <Card><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-foreground"><Bell size={20} /></span><div><h2 className="font-display text-lg font-bold">Recordatorio de recolección</h2><p className="mt-1 text-sm text-muted">{reminder.enabled ? `Preferencia activa para ${reminder.neighborhood ?? neighborhood}.` : 'Guardá tu preferencia para tener presente el calendario.'}</p></div></div><Button variant={reminder.enabled ? 'outline' : 'primary'} onClick={toggleReminder}>{reminder.enabled ? 'Desactivar' : 'Activar recordatorio'}</Button></CardContent></Card>
      <p className="text-xs text-muted">Los días y horarios son demostrativos y no constituyen información oficial del servicio municipal.</p>
    </div>
  );
}
