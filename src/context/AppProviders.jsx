import { AuthProvider } from './../features/authentication/context/AuthContext';

/**
 * Componente que envuelve TODOS los providers de contexto de la app.
 * Así solo importas uno en tu entrypoint y mantienes todo centralizado.
 */
export function AppProviders({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
