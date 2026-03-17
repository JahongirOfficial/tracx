import useAuthStore from '../stores/authStore';

const usePermission = () => {
  const { role, user } = useAuthStore();
  const isOwner = role === 'business';
  const isEmployee = role === 'employee';
  const permissions = user?.permissions || [];

  /**
   * Returns true if the current user can perform any of the listed actions.
   * Business owner always returns true.
   * Employees must have at least one of the listed permissions.
   */
  const can = (...perms) => {
    if (isOwner || role === 'super_admin') return true;
    if (!isEmployee) return false;
    return perms.some((p) => permissions.includes(p));
  };

  return { can, isOwner, isEmployee, permissions };
};

export default usePermission;
