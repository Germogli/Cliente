import { EducationProvider } from '../features/education/context/EducationContext';
import { ProfileProvider } from '../features/profile/context/ProfileContext';
import { AuthProvider } from './../features/authentication/context/AuthContext';
import { CommunityProvider } from './../features/community/context/CommunityContext';
import { MonitoringProvider } from './../features/crops/context/MonitoringContext';
import { NotificationsProvider } from '../features/notifications/context/NotificationsContext';
import { MessageProvider } from '../features/community/context/MessageContext';

/**
 * Componente que envuelve TODOS los providers de contexto de la app.
 * Así solo importas uno en tu entrypoint y mantienes todo centralizado.
 */
export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ProfileProvider>
          <CommunityProvider>
            <EducationProvider>
              <MonitoringProvider>
                <MessageProvider>
                {children}
                </MessageProvider>
              </MonitoringProvider>
            </EducationProvider>
          </CommunityProvider>
        </ProfileProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}