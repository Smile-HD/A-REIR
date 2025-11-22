import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config'

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions debe usarse dentro de PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/me/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔐 Permisos cargados:', {
          rol: data.rol,
          totalPermisos: data.permisos?.length || 0,
          permisos: data.permisos
        });
        setPermissions(data.permisos || []);
        setUser({
          id: data.userId,
          username: data.username,
          email: data.email,
          rol: data.rol,
          empleadoCi: data.empleadoCi,
          empleado: data.empleado
        });
      }
    } catch (error) {
      console.error('Error al cargar permisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permiso) => {
    if (!user) return false;
    // Administrador tiene todos los permisos
    if (user.rol === 'Administrador') return true;
    return permissions.includes(permiso);
  };

  const hasAnyPermission = (permisos) => {
    if (!user) return false;
    if (user.rol === 'Administrador') return true;
    return permisos.some(p => permissions.includes(p));
  };

  const canAccessModule = (module) => {
    if (!user) {
      console.log(`❌ canAccessModule('${module}'): No hay usuario`);
      return false;
    }
    
    // Administrador siempre tiene acceso
    if (user.rol === 'Administrador') {
      console.log(`✅ canAccessModule('${module}'): Es Administrador`);
      return true;
    }
    
    // Verificar si tiene al menos un permiso del módulo (ver, crear, editar, eliminar)
    const modulePermissions = [
      `${module}:ver`,
      `${module}:crear`,
      `${module}:editar`,
      `${module}:eliminar`
    ];
    
    const hasAccess = hasAnyPermission(modulePermissions);
    console.log(`${hasAccess ? '✅' : '❌'} canAccessModule('${module}'):`, {
      permisosRequeridos: modulePermissions,
      permisosEncontrados: modulePermissions.filter(p => permissions.includes(p))
    });
    
    return hasAccess;
  };

  const isAdmin = () => user?.rol === 'Administrador';
  const isEmpleado = () => user?.rol === 'Empleado';
  const isRecepcionista = () => user?.rol === 'Recepcionista';

  const value = {
    permissions,
    user,
    loading,
    hasPermission,
    hasAnyPermission,
    canAccessModule,
    isAdmin,
    isEmpleado,
    isRecepcionista,
    refetch: fetchPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};
