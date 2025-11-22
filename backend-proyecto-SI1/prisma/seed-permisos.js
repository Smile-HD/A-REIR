import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando sistema de permisos granular...');

  // Definir módulos del sistema
  const modulos = [
    'usuarios',
    'roles', 
    'permisos',
    'empleados',
    'motos',
    'diagnosticos',
    'clientes',
    'servicios',
    'categorias',
    'proformas',
    'horarios',
    'ordenes_trabajo',
    'comisiones',
    'marcas_herramienta',
    'herramientas',
    'movimientos_herramienta',
    'bitacora'
  ];

  // Definir acciones
  const acciones = ['crear', 'ver', 'editar', 'eliminar'];

  // Crear permisos granulares
  console.log('📝 Creando permisos granulares...');
  const permisosCreados = [];
  
  for (const modulo of modulos) {
    for (const accion of acciones) {
      const nombrePermiso = `${modulo}:${accion}`;
      
      try {
        const permiso = await prisma.permiso.upsert({
          where: { nombre: nombrePermiso },
          update: {},
          create: { nombre: nombrePermiso }
        });
        permisosCreados.push(permiso);
        console.log(`  ✅ ${nombrePermiso}`);
      } catch (error) {
        console.log(`  ⚠️  ${nombrePermiso} (ya existe)`);
      }
    }
  }

  console.log(`\n✅ ${permisosCreados.length} permisos granulares creados`);

  // Crear/actualizar roles
  console.log('\n👥 Configurando roles...');

  // Buscar o crear roles
  let rolAdmin = await prisma.rol.findFirst({ where: { nombre: 'Administrador' } });
  if (!rolAdmin) {
    rolAdmin = await prisma.rol.create({ data: { nombre: 'Administrador' } });
  }

  let rolEmpleado = await prisma.rol.findFirst({ where: { nombre: 'Empleado' } });
  if (!rolEmpleado) {
    rolEmpleado = await prisma.rol.create({ data: { nombre: 'Empleado' } });
  }

  let rolRecepcionista = await prisma.rol.findFirst({ where: { nombre: 'Recepcionista' } });
  if (!rolRecepcionista) {
    rolRecepcionista = await prisma.rol.create({ data: { nombre: 'Recepcionista' } });
  }

  console.log('✅ Roles configurados');

  // Asignar permisos a Administrador (TODOS)
  console.log('\n🔐 Asignando permisos a Administrador...');
  const todosLosPermisos = await prisma.permiso.findMany();
  
  for (const permiso of todosLosPermisos) {
    await prisma.rolPermiso.upsert({
      where: {
        idPermiso_idRol: {
          idRol: rolAdmin.id,
          idPermiso: permiso.id
        }
      },
      update: {},
      create: {
        idRol: rolAdmin.id,
        idPermiso: permiso.id
      }
    });
  }
  console.log(`✅ ${todosLosPermisos.length} permisos asignados a Administrador`);

  // Asignar permisos a Empleado
  console.log('\n🔐 Asignando permisos a Empleado...');
  const permisosEmpleado = [
    // Diagnósticos
    'diagnosticos:crear',   // Puede crear diagnósticos (solo de sí mismo)
    'diagnosticos:ver',
    'diagnosticos:editar',  // Solo los propios
    
    // Motos
    'motos:ver',
    'motos:crear',
    
    // Clientes
    'clientes:ver',
    'clientes:crear',
    'clientes:editar',
    
    // Servicios
    'servicios:ver',
    
    // Proformas
    'proformas:ver',
    'proformas:crear',
    'proformas:editar',
    
    // Órdenes de trabajo
    'ordenes_trabajo:ver',
    'ordenes_trabajo:crear',  // Solo asignándose a sí mismo
    'ordenes_trabajo:editar', // Solo las propias
    
    // Comisiones
    'comisiones:ver',  // Solo las propias
    
    // Herramientas
    'herramientas:ver',
    'marcas_herramienta:ver',
    
    // Movimientos de herramientas
    'movimientos_herramienta:ver',
    'movimientos_herramienta:crear',
    'movimientos_herramienta:editar',
    
    // Horarios
    'horarios:ver'  // Solo su propio horario
  ];

  for (const nombrePermiso of permisosEmpleado) {
    const permiso = await prisma.permiso.findFirst({
      where: { nombre: nombrePermiso }
    });
    
    if (permiso) {
      await prisma.rolPermiso.upsert({
        where: {
          idPermiso_idRol: {
            idRol: rolEmpleado.id,
            idPermiso: permiso.id
          }
        },
        update: {},
        create: {
          idRol: rolEmpleado.id,
          idPermiso: permiso.id
        }
      });
    }
  }
  console.log(`✅ ${permisosEmpleado.length} permisos asignados a Empleado`);

  // Asignar permisos a Recepcionista
  console.log('\n🔐 Asignando permisos a Recepcionista...');
  const permisosRecepcionista = [
    // Clientes - Gestión completa
    'clientes:crear',
    'clientes:ver',
    'clientes:editar',
    'clientes:eliminar',
    
    // Diagnósticos - Solo ver y crear
    'diagnosticos:ver',
    'diagnosticos:crear',
    
    // Motos - Gestión completa
    'motos:crear',
    'motos:ver',
    'motos:editar',
    'motos:eliminar',
    
    // Servicios
    'servicios:ver',
    
    // Proformas - Gestión completa
    'proformas:crear',
    'proformas:ver',
    'proformas:editar',
    'proformas:eliminar',
    
    // Órdenes de trabajo
    'ordenes_trabajo:ver',
    'ordenes_trabajo:crear',
    'ordenes_trabajo:editar',
    
    // Comisiones
    'comisiones:ver',
    
    // Horarios
    'horarios:ver',
    
    // Empleados - Solo ver
    'empleados:ver'
  ];

  for (const nombrePermiso of permisosRecepcionista) {
    const permiso = await prisma.permiso.findFirst({
      where: { nombre: nombrePermiso }
    });
    
    if (permiso) {
      await prisma.rolPermiso.upsert({
        where: {
          idPermiso_idRol: {
            idRol: rolRecepcionista.id,
            idPermiso: permiso.id
          }
        },
        update: {},
        create: {
          idRol: rolRecepcionista.id,
          idPermiso: permiso.id
        }
      });
    }
  }
  console.log(`✅ ${permisosRecepcionista.length} permisos asignados a Recepcionista`);

  console.log('\n📊 Resumen de permisos por rol:');
  
  const adminPermisos = await prisma.rolPermiso.count({
    where: { idRol: rolAdmin.id }
  });
  
  const empleadoPermisos = await prisma.rolPermiso.count({
    where: { idRol: rolEmpleado.id }
  });
  
  const recepcionistaPermisos = await prisma.rolPermiso.count({
    where: { idRol: rolRecepcionista.id }
  });
  
  console.log(`   Administrador: ${adminPermisos} permisos`);
  console.log(`   Empleado: ${empleadoPermisos} permisos`);
  console.log(`   Recepcionista: ${recepcionistaPermisos} permisos`);
  
  console.log('\n✨ Sistema de permisos granular configurado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
