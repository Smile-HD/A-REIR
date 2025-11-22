import { usePermissions } from '../contexts/PermissionContext';
import { Button, IconButton } from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';

/**
 * Ejemplo de cómo usar permisos en un componente
 */
function EjemploUsoPermisos() {
  const { hasPermission, canAccessModule, isAdmin } = usePermissions();

  return (
    <div>
      {/* Mostrar botón solo si tiene permiso para crear */}
      {hasPermission('clientes:crear') && (
        <Button leftIcon={<AddIcon />} colorScheme="teal">
          Nuevo Cliente
        </Button>
      )}

      {/* Mostrar botón de editar solo si tiene permiso */}
      {hasPermission('clientes:editar') && (
        <IconButton icon={<EditIcon />} aria-label="Editar" />
      )}

      {/* Mostrar botón de eliminar solo si tiene permiso */}
      {hasPermission('clientes:eliminar') && (
        <IconButton icon={<DeleteIcon />} colorScheme="red" aria-label="Eliminar" />
      )}

      {/* Mostrar sección solo si puede acceder al módulo */}
      {canAccessModule('bitacora') && (
        <div>Sección de bitácora visible</div>
      )}

      {/* Mostrar solo para administradores */}
      {isAdmin() && (
        <div>Solo visible para administradores</div>
      )}
    </div>
  );
}

export default EjemploUsoPermisos;
