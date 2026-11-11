import { AppShell } from '@/components/layout/AppShell';
import { WastePaletteProvider } from '@/components/ui/waste-palette';
import '@/store';

/** Raíz de EcoPunto: paleta global de búsqueda + carcasa con rutas. */
export default function App() {
  return (
    <WastePaletteProvider>
      <AppShell />
    </WastePaletteProvider>
  );
}
