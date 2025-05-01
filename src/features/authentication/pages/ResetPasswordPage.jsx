import { AuthFormCard } from '../../../ui/components/AuthFormCard';
import { ResetPasswordForm } from '../layouts/ResetPasswordForm';
import { useResetPasswordForm } from '../hooks/useResetPasswordForm';

/**
 * Página de reinicio de contraseña
 * 
 * @returns {JSX.Element} Página completa
 */
export const ResetPasswordPage = () => {
  // Solo necesitamos el estado de error del hook
  const { error } = useResetPasswordForm();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <AuthFormCard 
        title="Restablecer Contraseña" 
        error={error}
        className="max-w-md w-full"
      >
        <ResetPasswordForm />
      </AuthFormCard>
    </div>
  );
};