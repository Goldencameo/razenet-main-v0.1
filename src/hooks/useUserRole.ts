import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'user' | 'creator' | 'developer' | 'moderator' | 'admin';

/**
 * Returns the current user's roles. A user can have multiple roles.
 * Always assumes 'user' as a baseline.
 */
export function useUserRoles() {
  const { user } = useAuth();
  const me = user?.id;

  const query = useQuery({
    queryKey: ['user-roles', me],
    enabled: !!me,
    queryFn: async (): Promise<AppRole[]> => {
      if (!me) return ['user'];
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', me);
      const roles = (data || []).map((r: any) => r.role as AppRole);
      if (!roles.includes('user')) roles.push('user');
      return roles;
    },
  });

  const roles = query.data || ['user'];
  return {
    roles,
    isAdmin: roles.includes('admin'),
    isModerator: roles.includes('admin') || roles.includes('moderator'),
    isDeveloper: roles.includes('admin') || roles.includes('developer'),
    isCreator: roles.includes('admin') || roles.includes('creator') || roles.includes('developer'),
    isLoading: query.isLoading,
  };
}
