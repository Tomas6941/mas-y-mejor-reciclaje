import assert from 'node:assert/strict';
import test from 'node:test';

import { parseHash } from '../../src/lib/routes.ts';

const model = await import('../../src/components/admin/admin-model.ts').catch(() => null);

test('admin hash routes to admin section', () => {
  assert.equal(parseHash('#/admin').route, 'admin');
});

test('admin visibility requires an admin role', () => {
  assert.equal(model?.isAdmin({ role: 'admin' }), true);
  assert.equal(model?.isAdmin({ role: 'user' }), false);
  assert.equal(model?.isAdmin(null), false);
});

test('point types map to the backend enum', () => {
  const point = {
    id: 'plaza-central',
    name: 'Plaza Central',
    address: 'Centro, Córdoba',
    lat: -31.4,
    lng: -64.2,
    type: 'Punto verde' as const,
    materials: ['papel', 'vidrio'] as const,
    status: 'available' as const,
    hours: 'Lunes a viernes',
  };
  assert.deepEqual(model?.toAdminPointInput(point), {
    ...point,
    type: 'green_point',
    materials: ['papel', 'vidrio'],
  });
});

test('schedule editor extracts both times from the public time range', () => {
  const schedule = {
    key: 'reciclables',
    name: 'Reciclables',
    icon: 'recycle' as const,
    color: '#2478ff',
    description: 'Material reciclable',
    days: [1, 3, 5],
    time: '18:00 a 21:30',
    startTime: '18:00',
  };
  assert.deepEqual(model?.toScheduleInput(schedule), {
    key: 'reciclables',
    name: 'Reciclables',
    icon: 'recycle',
    color: '#2478ff',
    description: 'Material reciclable',
    days: [1, 3, 5],
    startTime: '18:00',
    endTime: '21:30',
  });
  assert.throws(() => model?.toScheduleInput({ ...schedule, time: 'horario desconocido' }));
});
