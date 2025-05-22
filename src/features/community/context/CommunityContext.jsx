import { createContext } from 'react';
import { PostProvider } from './PostContext';
import { GroupProvider } from './GroupContext';
import { ThreadProvider } from './ThreadContext';
import { MessageProvider } from './MessageContext';

// Contexto global de la comunidad (puedes usarlo si necesitas datos globales de la comunidad)
export const CommunityGlobalContext = createContext();

/**
 * CommunityProvider combina todos los subcontextos relacionados con la comunidad.
 * Este componente encapsula la lógica de cada entidad (posts, grupos, hilos, mensajes, reacciones)
 * en su propio subcontexto, manteniendo el código modular y limpio.
 */
export const CommunityProvider = ({ children }) => {
  return (
    <CommunityGlobalContext.Provider value={{}}>
      <PostProvider>
        <GroupProvider>
          <ThreadProvider>
            <MessageProvider>
                {children}
            </MessageProvider>
          </ThreadProvider>
        </GroupProvider>
      </PostProvider>
    </CommunityGlobalContext.Provider>
  );
};