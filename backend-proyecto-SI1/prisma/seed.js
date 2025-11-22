import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear permisos
  console.log('📝 Creando permisos...');
  const permisoCrear = await prisma.permiso.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Crear' }
  });

  const permisoLeer = await prisma.permiso.upsert({
    where: { id: 2 },
    update: {},
    create: { nombre: 'Leer' }
  });

  const permisoActualizar = await prisma.permiso.upsert({
    where: { id: 3 },
    update: {},
    create: { nombre: 'Actualizar' }
  });

  const permisoEliminar = await prisma.permiso.upsert({
    where: { id: 4 },
    update: {},
    create: { nombre: 'Eliminar' }
  });

  console.log('✅ Permisos creados');

  // Crear roles
  console.log('👥 Creando roles...');
  const rolAdmin = await prisma.rol.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Administrador' }
  });

  const rolUsuario = await prisma.rol.upsert({
    where: { id: 2 },
    update: {},
    create: { nombre: 'Usuario' }
  });

  const rolInvitado = await prisma.rol.upsert({
    where: { id: 3 },
    update: {},
    create: { nombre: 'Invitado' }
  });

  console.log('✅ Roles creados');

  // Asignar permisos a roles
  console.log('🔐 Asignando permisos a roles...');
  
  // Admin tiene todos los permisos
  await prisma.rolPermiso.createMany({
    data: [
      { idRol: rolAdmin.id, idPermiso: permisoCrear.id },
      { idRol: rolAdmin.id, idPermiso: permisoLeer.id },
      { idRol: rolAdmin.id, idPermiso: permisoActualizar.id },
      { idRol: rolAdmin.id, idPermiso: permisoEliminar.id },
    ],
    skipDuplicates: true
  });

  // Usuario tiene crear, leer y actualizar
  await prisma.rolPermiso.createMany({
    data: [
      { idRol: rolUsuario.id, idPermiso: permisoCrear.id },
      { idRol: rolUsuario.id, idPermiso: permisoLeer.id },
      { idRol: rolUsuario.id, idPermiso: permisoActualizar.id },
    ],
    skipDuplicates: true
  });

  // Invitado solo tiene permiso de leer
  await prisma.rolPermiso.create({
    data: { idRol: rolInvitado.id, idPermiso: permisoLeer.id }
  }).catch(() => {});

  console.log('✅ Permisos asignados a roles');

  // Crear usuarios de ejemplo
  console.log('👤 Creando usuarios de ejemplo...');
  
  const hashedPassword = await bcrypt.hash('123456', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@test.com',
      password: hashedPassword,
      idRol: rolAdmin.id
    }
  });

  const usuario2 = await prisma.usuario.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      username: 'usuario',
      email: 'user@test.com',
      password: hashedPassword,
      idRol: rolUsuario.id
    }
  });

  const usuario3 = await prisma.usuario.upsert({
    where: { email: 'guest@test.com' },
    update: {},
    create: {
      username: 'invitado',
      email: 'guest@test.com',
      password: hashedPassword,
      idRol: rolInvitado.id
    }
  });

  console.log('✅ Usuarios creados');

  // Actualizar usuarios con empleados
  console.log('👔 Creando empleados y vinculándolos con usuarios...');
  
  const empleado1 = await prisma.empleado.upsert({
    where: { ci: 12345678 },
    update: {},
    create: {
      ci: 12345678,
      nombre: 'Juan Carlos',
      apellidos: 'Pérez García',
      direccion: 'Av. Principal #123, Ciudad',
      telefono: '1234567890'
    }
  });

  const empleado2 = await prisma.empleado.upsert({
    where: { ci: 87654321 },
    update: {},
    create: {
      ci: 87654321,
      nombre: 'María Elena',
      apellidos: 'Rodríguez López',
      direccion: 'Calle Secundaria #456, Ciudad',
      telefono: '0987654321'
    }
  });

  const empleado3 = await prisma.empleado.upsert({
    where: { ci: 11223344 },
    update: {},
    create: {
      ci: 11223344,
      nombre: 'Pedro Antonio',
      apellidos: 'Gómez Martínez',
      direccion: 'Av. Libertad #789, Ciudad',
      telefono: '5551234567'
    }
  });

  // Vincular empleados con usuarios
  await prisma.usuario.update({
    where: { id: usuario2.id },
    data: { empleadoCi: empleado1.ci }
  });

  await prisma.usuario.update({
    where: { id: usuario3.id },
    data: { empleadoCi: empleado2.ci }
  });

  console.log('✅ Empleados creados');
  
  // Crear marcas de motos
  console.log('🏍️ Creando marcas de motos...');
  
  const marcaHonda = await prisma.marcaMoto.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Honda' }
  });

  const marcaYamaha = await prisma.marcaMoto.upsert({
    where: { id: 2 },
    update: {},
    create: { nombre: 'Yamaha' }
  });

  const marcaSuzuki = await prisma.marcaMoto.upsert({
    where: { id: 3 },
    update: {},
    create: { nombre: 'Suzuki' }
  });

  const marcaKawasaki = await prisma.marcaMoto.upsert({
    where: { id: 4 },
    update: {},
    create: { nombre: 'Kawasaki' }
  });

  console.log('✅ Marcas de motos creadas');

  // Crear motos de ejemplo
  console.log('🏍️ Creando motos de ejemplo...');
  
  await prisma.moto.upsert({
    where: { placa: 'ABC-123' },
    update: {},
    create: {
      placa: 'ABC-123',
      modelo: 'CBR 600RR',
      anio: 2020,
      chasis: 'JH2PC40001M123456',
      marcaId: marcaHonda.id
    }
  });

  await prisma.moto.upsert({
    where: { placa: 'XYZ-789' },
    update: {},
    create: {
      placa: 'XYZ-789',
      modelo: 'YZF-R6',
      anio: 2019,
      chasis: 'JYARN231000123789',
      marcaId: marcaYamaha.id
    }
  });

  await prisma.moto.upsert({
    where: { placa: 'DEF-456' },
    update: {},
    create: {
      placa: 'DEF-456',
      modelo: 'GSX-R750',
      anio: 2021,
      chasis: 'JS1GR7AA0L2100456',
      marcaId: marcaSuzuki.id
    }
  });

  await prisma.moto.upsert({
    where: { placa: 'GHI-321' },
    update: {},
    create: {
      placa: 'GHI-321',
      modelo: 'Ninja 650',
      anio: 2022,
      chasis: null, // Sin chasis registrado
      marcaId: marcaKawasaki.id
    }
  });

  console.log('✅ Motos creadas');

  // Crear diagnósticos de ejemplo
  console.log('🔧 Creando diagnósticos de ejemplo...');
  
  const diagnostico1 = await prisma.diagnostico.upsert({
    where: { nro: BigInt(1) },
    update: {},
    create: {
      fecha: new Date('2024-10-15'),
      hora: new Date('1970-01-01T09:30:00'),
      placaMoto: 'ABC-123',
      empleadoCi: 12345678
    }
  });

  const diagnostico2 = await prisma.diagnostico.upsert({
    where: { nro: BigInt(2) },
    update: {},
    create: {
      fecha: new Date('2024-10-20'),
      hora: new Date('1970-01-01T14:15:00'),
      placaMoto: 'XYZ-789',
      empleadoCi: 87654321
    }
  });

  console.log('✅ Diagnósticos creados');

  // Crear detalles de diagnósticos
  console.log('📋 Creando detalles de diagnósticos...');
  
  // Detalles para diagnóstico 1
  await prisma.detalleDiagnostico.createMany({
    data: [
      {
        diagnosticoId: diagnostico1.nro,
        descripcion: 'Revisión de frenos delanteros - Pastillas gastadas al 70%'
      },
      {
        diagnosticoId: diagnostico1.nro,
        descripcion: 'Cambio de aceite de motor - Se recomienda usar aceite sintético 10W-40'
      },
      {
        diagnosticoId: diagnostico1.nro,
        descripcion: 'Inspección de cadena - Requiere lubricación y ajuste de tensión'
      }
    ],
    skipDuplicates: true
  });

  // Detalles para diagnóstico 2
  await prisma.detalleDiagnostico.createMany({
    data: [
      {
        diagnosticoId: diagnostico2.nro,
        descripcion: 'Revisión eléctrica - Batería con bajo voltaje, se recomienda reemplazo'
      },
      {
        diagnosticoId: diagnostico2.nro,
        descripcion: 'Neumático trasero desgastado - Cambio urgente requerido'
      }
    ],
    skipDuplicates: true
  });

  console.log('✅ Detalles de diagnósticos creados');
  console.log('\n📊 Datos de prueba:');
  console.log('   Email: admin@test.com | Password: 123456 | Rol: Administrador');
  console.log('   Email: user@test.com  | Password: 123456 | Rol: Usuario');
  console.log('   Email: guest@test.com | Password: 123456 | Rol: Invitado');
  console.log('\n✨ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
