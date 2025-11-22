import prisma from '../config/database.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import jwt from 'jsonwebtoken';

// Helper para validar token en exportaciones (acepta token del query o header)
const validarTokenExport = (req) => {
  try {
    // Intentar obtener token del header primero
    let token = req.headers.authorization?.split(' ')[1];
    
    // Si no está en header, intentar desde query param
    if (!token) {
      token = req.query.token;
    }

    if (!token) {
      return { valido: false, error: 'Token no proporcionado' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-muy-segura-2024');
    return { valido: true, userId: decoded.id };
  } catch (error) {
    return { valido: false, error: 'Token inválido o expirado' };
  }
};

// ==========================================
// REPORTE: CLIENTES MÁS FRECUENTES
// ==========================================
export const reporteClientesFrecuentes = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    if (!mes || !anio) {
      return res.status(400).json({ 
        error: 'Debe proporcionar mes y año' 
      });
    }

    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    // Obtener proformas del mes con sus clientes
    const proformas = await prisma.proforma.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        }
      },
      include: {
        cliente: {
          select: {
            ci: true,
            nombre: true,
            apellidos: true,
            telefono: true
          }
        }
      }
    });

    // Agrupar por cliente
    const clientesMap = {};
    proformas.forEach(proforma => {
      const ci = proforma.cliente.ci;
      if (!clientesMap[ci]) {
        clientesMap[ci] = {
          cliente: `${proforma.cliente.nombre} ${proforma.cliente.apellidos}`,
          telefono: proforma.cliente.telefono,
          ci: ci,
          totalVisitas: 0,
          totalGastado: 0
        };
      }
      clientesMap[ci].totalVisitas++;
      clientesMap[ci].totalGastado += parseFloat(proforma.total || 0);
    });

    // Convertir a array y ordenar por visitas
    const clientesFrecuentes = Object.values(clientesMap)
      .sort((a, b) => b.totalVisitas - a.totalVisitas)
      .slice(0, 10); // Top 10

    res.json({
      mes: parseInt(mes),
      anio: parseInt(anio),
      mesNombre: new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' }),
      totalClientes: clientesFrecuentes.length,
      clientes: clientesFrecuentes
    });
  } catch (error) {
    console.error('Error en reporte clientes frecuentes:', error);
    res.status(500).json({ error: 'Error al generar reporte de clientes' });
  }
};

// ==========================================
// REPORTE: SERVICIOS MÁS SOLICITADOS
// ==========================================
export const reporteServiciosSolicitados = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    if (!mes || !anio) {
      return res.status(400).json({ 
        error: 'Debe proporcionar mes y año' 
      });
    }

    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    // Obtener detalles de proformas del mes
    const detalles = await prisma.detalleProforma.findMany({
      where: {
        proforma: {
          fecha: {
            gte: fechaInicio,
            lte: fechaFin
          }
        },
        servicioId: {
          not: null
        }
      },
      include: {
        servicio: {
          include: {
            categoria: true
          }
        }
      }
    });

    // Agrupar por servicio
    const serviciosMap = {};
    detalles.forEach(detalle => {
      const id = detalle.servicioId;
      if (!serviciosMap[id]) {
        serviciosMap[id] = {
          servicio: detalle.servicio.descripcion,
          categoria: detalle.servicio.categoria.nombre,
          vecessolicitado: 0,
          cantidadTotal: 0,
          ingresoTotal: 0
        };
      }
      serviciosMap[id].vecessolicitado++;
      serviciosMap[id].cantidadTotal += parseFloat(detalle.cantidad);
      serviciosMap[id].ingresoTotal += parseFloat(detalle.cantidad) * parseFloat(detalle.precioUnit);
    });

    const serviciosSolicitados = Object.values(serviciosMap)
      .sort((a, b) => b.vecessolicitado - a.vecessolicitado);

    res.json({
      mes: parseInt(mes),
      anio: parseInt(anio),
      mesNombre: new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' }),
      totalServicios: serviciosSolicitados.length,
      servicios: serviciosSolicitados
    });
  } catch (error) {
    console.error('Error en reporte servicios:', error);
    res.status(500).json({ error: 'Error al generar reporte de servicios' });
  }
};

// ==========================================
// REPORTE: INGRESOS MENSUALES (POR ÓRDENES DE TRABAJO)
// ==========================================
export const reporteIngresosMensuales = async (req, res) => {
  try {
    const { anio } = req.query;
    
    if (!anio) {
      return res.status(400).json({ 
        error: 'Debe proporcionar el año' 
      });
    }

    const ingresosPorMes = [];

    for (let mes = 1; mes <= 12; mes++) {
      const fechaInicio = new Date(anio, mes - 1, 1);
      const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

      // Obtener órdenes de trabajo finalizadas del mes
      const ordenes = await prisma.ordenTrabajo.findMany({
        where: {
          fechaFin: {
            gte: fechaInicio,
            lte: fechaFin
          },
          estado: 'FINALIZADA'
        },
        include: {
          detalle: {
            include: {
              proforma: {
                select: {
                  total: true,
                  estado: true
                }
              }
            }
          }
        }
      });

      // Calcular total del mes sumando el total de cada proforma
      const totalMes = ordenes.reduce((sum, orden) => {
        if (orden.detalle && orden.detalle.proforma) {
          // Solo contar proformas APROBADAS o COMPLETADAS
          const estadosValidos = ['APROBADA', 'COMPLETADA'];
          if (estadosValidos.includes(orden.detalle.proforma.estado)) {
            return sum + parseFloat(orden.detalle.proforma.total || 0);
          }
        }
        return sum;
      }, 0);

      ingresosPorMes.push({
        mes: new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' }),
        mesNumero: mes,
        totalOrdenes: ordenes.length,
        ingresoTotal: totalMes.toFixed(2)
      });
    }

    const totalAnual = ingresosPorMes.reduce((sum, mes) => sum + parseFloat(mes.ingresoTotal), 0);

    res.json({
      anio: parseInt(anio),
      totalAnual: totalAnual.toFixed(2),
      ingresos: ingresosPorMes
    });
  } catch (error) {
    console.error('Error en reporte ingresos:', error);
    res.status(500).json({ error: 'Error al generar reporte de ingresos' });
  }
};

// ==========================================
// REPORTE: EMPLEADOS PRODUCTIVIDAD
// ==========================================
export const reporteEmpleadosProductividad = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    if (!mes || !anio) {
      return res.status(400).json({ 
        error: 'Debe proporcionar mes y año' 
      });
    }

    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const empleados = await prisma.empleado.findMany({
      include: {
        ordenesTrabajo: {
          where: {
            fechaInicio: {
              gte: fechaInicio,
              lte: fechaFin
            }
          }
        },
        diagnosticos: {
          where: {
            fecha: {
              gte: fechaInicio,
              lte: fechaFin
            }
          }
        }
      }
    });

    const productividad = empleados.map(emp => {
      const finalizadas = emp.ordenesTrabajo.filter(o => o.estado === 'FINALIZADA').length;
      const enProceso = emp.ordenesTrabajo.filter(o => o.estado === 'EN_PROCESO').length;
      const abiertas = emp.ordenesTrabajo.filter(o => o.estado === 'ABIERTA').length;
      const totalOrdenes = emp.ordenesTrabajo.length;
      const totalDiagnosticos = emp.diagnosticos.length;

      return {
        empleado: `${emp.nombre} ${emp.apellidos}`,
        ci: emp.ci,
        telefono: emp.telefono,
        totalOrdenes,
        totalDiagnosticos,
        finalizadas,
        enProceso,
        abiertas,
        porcentajeCompletado: totalOrdenes > 0 
          ? ((finalizadas / totalOrdenes) * 100).toFixed(2)
          : 0
      };
    }).sort((a, b) => b.totalOrdenes - a.totalOrdenes);

    res.json({
      mes: parseInt(mes),
      anio: parseInt(anio),
      mesNombre: new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' }),
      totalEmpleados: productividad.length,
      empleados: productividad
    });
  } catch (error) {
    console.error('Error en reporte empleados:', error);
    res.status(500).json({ error: 'Error al generar reporte de empleados' });
  }
};

// ==========================================
// REPORTE: MARCAS DE MOTOS MÁS ATENDIDAS
// ==========================================
export const reporteMarcasMotos = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    if (!mes || !anio) {
      return res.status(400).json({ 
        error: 'Debe proporcionar mes y año' 
      });
    }

    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const diagnosticos = await prisma.diagnostico.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        }
      },
      include: {
        moto: {
          include: {
            marca: true
          }
        }
      }
    });

    // Agrupar por marca
    const marcasMap = {};
    diagnosticos.forEach(diag => {
      const marcaNombre = diag.moto.marca.nombre;
      if (!marcasMap[marcaNombre]) {
        marcasMap[marcaNombre] = {
          marca: marcaNombre,
          totalDiagnosticos: 0,
          modelos: new Set()
        };
      }
      marcasMap[marcaNombre].totalDiagnosticos++;
      marcasMap[marcaNombre].modelos.add(diag.moto.modelo);
    });

    const marcasArray = Object.values(marcasMap).map(marca => ({
      marca: marca.marca,
      totalDiagnosticos: marca.totalDiagnosticos,
      modelosAtendidos: marca.modelos.size
    })).sort((a, b) => b.totalDiagnosticos - a.totalDiagnosticos);

    res.json({
      mes: parseInt(mes),
      anio: parseInt(anio),
      mesNombre: new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' }),
      totalMarcas: marcasArray.length,
      marcas: marcasArray
    });
  } catch (error) {
    console.error('Error en reporte marcas:', error);
    res.status(500).json({ error: 'Error al generar reporte de marcas' });
  }
};

// ==========================================
// EXPORTAR A EXCEL - CLIENTES FRECUENTES
// ==========================================
export const exportarClientesExcel = async (req, res) => {
  try {
    // Validar token
    const validacion = validarTokenExport(req);
    if (!validacion.valido) {
      return res.status(401).json({ error: validacion.error });
    }

    const { mes, anio } = req.query;
    
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const proformas = await prisma.proforma.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        }
      },
      include: {
        cliente: true
      }
    });

    const clientesMap = {};
    proformas.forEach(proforma => {
      const ci = proforma.cliente.ci;
      if (!clientesMap[ci]) {
        clientesMap[ci] = {
          cliente: `${proforma.cliente.nombre} ${proforma.cliente.apellidos}`,
          telefono: proforma.cliente.telefono,
          ci: ci,
          totalVisitas: 0,
          totalGastado: 0
        };
      }
      clientesMap[ci].totalVisitas++;
      clientesMap[ci].totalGastado += parseFloat(proforma.total || 0);
    });

    const clientesFrecuentes = Object.values(clientesMap)
      .sort((a, b) => b.totalVisitas - a.totalVisitas);

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Clientes Frecuentes');

    // Configurar columnas
    worksheet.columns = [
      { header: '#', key: 'numero', width: 5 },
      { header: 'CI', key: 'ci', width: 12 },
      { header: 'Cliente', key: 'cliente', width: 35 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Total Visitas', key: 'totalVisitas', width: 15 },
      { header: 'Total Gastado (Bs)', key: 'totalGastado', width: 20 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    clientesFrecuentes.forEach((cliente, index) => {
      worksheet.addRow({
        numero: index + 1,
        ci: cliente.ci,
        cliente: cliente.cliente,
        telefono: cliente.telefono,
        totalVisitas: cliente.totalVisitas,
        totalGastado: parseFloat(cliente.totalGastado).toFixed(2)
      });
    });

    // Aplicar bordes a todas las celdas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Configurar respuesta
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=clientes-frecuentes-${mes}-${anio}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportando Excel:', error);
    res.status(500).json({ error: 'Error al exportar Excel' });
  }
};

// ==========================================
// EXPORTAR A PDF - CLIENTES FRECUENTES
// ==========================================
export const exportarClientesPDF = async (req, res) => {
  try {
    // Validar token
    const validacion = validarTokenExport(req);
    if (!validacion.valido) {
      return res.status(401).json({ error: validacion.error });
    }

    const { mes, anio } = req.query;
    
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const proformas = await prisma.proforma.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        }
      },
      include: {
        cliente: true
      }
    });

    const clientesMap = {};
    proformas.forEach(proforma => {
      const ci = proforma.cliente.ci;
      if (!clientesMap[ci]) {
        clientesMap[ci] = {
          cliente: `${proforma.cliente.nombre} ${proforma.cliente.apellidos}`,
          telefono: proforma.cliente.telefono,
          ci: ci,
          totalVisitas: 0,
          totalGastado: 0
        };
      }
      clientesMap[ci].totalVisitas++;
      clientesMap[ci].totalGastado += parseFloat(proforma.total || 0);
    });

    const clientesFrecuentes = Object.values(clientesMap)
      .sort((a, b) => b.totalVisitas - a.totalVisitas);

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=clientes-frecuentes-${mes}-${anio}.pdf`
    );

    doc.pipe(res);

    // Título
    doc.fontSize(20).font('Helvetica-Bold')
       .text('Reporte de Clientes Frecuentes', { align: 'center' });
    doc.moveDown(0.5);
    
    const mesNombre = new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' });
    doc.fontSize(12).font('Helvetica')
       .text(`Período: ${mesNombre} ${anio}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });
    doc.moveDown(1);

    // Línea separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Encabezados de tabla
    const tableTop = doc.y;
    const colWidths = { num: 30, ci: 70, cliente: 150, telefono: 80, visitas: 80, gastado: 90 };
    let xPos = 50;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('#', xPos, tableTop, { width: colWidths.num });
    xPos += colWidths.num;
    doc.text('CI', xPos, tableTop, { width: colWidths.ci });
    xPos += colWidths.ci;
    doc.text('Cliente', xPos, tableTop, { width: colWidths.cliente });
    xPos += colWidths.cliente;
    doc.text('Teléfono', xPos, tableTop, { width: colWidths.telefono });
    xPos += colWidths.telefono;
    doc.text('Visitas', xPos, tableTop, { width: colWidths.visitas });
    xPos += colWidths.visitas;
    doc.text('Total Gastado', xPos, tableTop, { width: colWidths.gastado });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Datos
    doc.font('Helvetica').fontSize(9);
    clientesFrecuentes.forEach((cliente, index) => {
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 50;
      }

      xPos = 50;
      const yPos = doc.y;

      doc.text(index + 1, xPos, yPos, { width: colWidths.num });
      xPos += colWidths.num;
      doc.text(cliente.ci, xPos, yPos, { width: colWidths.ci });
      xPos += colWidths.ci;
      doc.text(cliente.cliente, xPos, yPos, { width: colWidths.cliente });
      xPos += colWidths.cliente;
      doc.text(cliente.telefono, xPos, yPos, { width: colWidths.telefono });
      xPos += colWidths.telefono;
      doc.text(cliente.totalVisitas.toString(), xPos, yPos, { width: colWidths.visitas });
      xPos += colWidths.visitas;
      doc.text(`Bs ${parseFloat(cliente.totalGastado).toFixed(2)}`, xPos, yPos, { width: colWidths.gastado });

      doc.moveDown(0.8);
    });

    // Pie de página
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(8).text(
      `Total de clientes: ${clientesFrecuentes.length}`,
      50,
      doc.y,
      { align: 'left' }
    );

    doc.end();
  } catch (error) {
    console.error('Error exportando PDF:', error);
    res.status(500).json({ error: 'Error al exportar PDF' });
  }
};

// ==========================================
// EXPORTAR A EXCEL - SERVICIOS SOLICITADOS
// ==========================================
export const exportarServiciosExcel = async (req, res) => {
  try {
    // Validar token
    const validacion = validarTokenExport(req);
    if (!validacion.valido) {
      return res.status(401).json({ error: validacion.error });
    }

    const { mes, anio } = req.query;
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const detalles = await prisma.detalleProforma.findMany({
      where: {
        proforma: {
          fecha: {
            gte: fechaInicio,
            lte: fechaFin
          }
        },
        servicioId: {
          not: null
        }
      },
      include: {
        servicio: {
          include: {
            categoria: true
          }
        }
      }
    });

    const serviciosMap = {};
    detalles.forEach(detalle => {
      const id = detalle.servicioId;
      if (!serviciosMap[id]) {
        serviciosMap[id] = {
          servicio: detalle.servicio.descripcion,
          categoria: detalle.servicio.categoria.nombre,
          vecessolicitado: 0,
          cantidadTotal: 0,
          ingresoTotal: 0
        };
      }
      serviciosMap[id].vecessolicitado++;
      serviciosMap[id].cantidadTotal += parseFloat(detalle.cantidad);
      serviciosMap[id].ingresoTotal += parseFloat(detalle.cantidad) * parseFloat(detalle.precioUnit);
    });

    const serviciosSolicitados = Object.values(serviciosMap)
      .sort((a, b) => b.vecessolicitado - a.vecessolicitado);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Servicios Solicitados');

    worksheet.columns = [
      { header: '#', key: 'numero', width: 5 },
      { header: 'Servicio', key: 'servicio', width: 40 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Veces Solicitado', key: 'vecessolicitado', width: 18 },
      { header: 'Cantidad Total', key: 'cantidadTotal', width: 15 },
      { header: 'Ingreso Total (Bs)', key: 'ingresoTotal', width: 20 }
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9933FF' }
    };

    serviciosSolicitados.forEach((servicio, index) => {
      worksheet.addRow({
        numero: index + 1,
        servicio: servicio.servicio,
        categoria: servicio.categoria,
        vecessolicitado: servicio.vecessolicitado,
        cantidadTotal: parseFloat(servicio.cantidadTotal).toFixed(2),
        ingresoTotal: parseFloat(servicio.ingresoTotal).toFixed(2)
      });
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=servicios-solicitados-${mes}-${anio}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportando Excel:', error);
    res.status(500).json({ error: 'Error al exportar Excel' });
  }
};

// ==========================================
// EXPORTAR A PDF - SERVICIOS SOLICITADOS
// ==========================================
export const exportarServiciosPDF = async (req, res) => {
  try {
    // Validar token
    const validacion = validarTokenExport(req);
    if (!validacion.valido) {
      return res.status(401).json({ error: validacion.error });
    }

    const { mes, anio } = req.query;
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const detalles = await prisma.detalleProforma.findMany({
      where: {
        proforma: {
          fecha: {
            gte: fechaInicio,
            lte: fechaFin
          }
        },
        servicioId: {
          not: null
        }
      },
      include: {
        servicio: {
          include: {
            categoria: true
          }
        }
      }
    });

    const serviciosMap = {};
    detalles.forEach(detalle => {
      const id = detalle.servicioId;
      if (!serviciosMap[id]) {
        serviciosMap[id] = {
          servicio: detalle.servicio.descripcion,
          categoria: detalle.servicio.categoria.nombre,
          vecessolicitado: 0,
          ingresoTotal: 0
        };
      }
      serviciosMap[id].vecessolicitado++;
      serviciosMap[id].ingresoTotal += parseFloat(detalle.cantidad) * parseFloat(detalle.precioUnit);
    });

    const serviciosSolicitados = Object.values(serviciosMap)
      .sort((a, b) => b.vecessolicitado - a.vecessolicitado);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=servicios-solicitados-${mes}-${anio}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold')
       .text('Reporte de Servicios Solicitados', { align: 'center' });
    doc.moveDown(0.5);
    
    const mesNombre = new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' });
    doc.fontSize(12).font('Helvetica')
       .text(`Período: ${mesNombre} ${anio}`, { align: 'center' });
    doc.moveDown(2);

    const tableTop = doc.y;
    let yPos = tableTop;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('#', 50, yPos);
    doc.text('Servicio', 80, yPos);
    doc.text('Categoría', 280, yPos);
    doc.text('Veces', 380, yPos);
    doc.text('Ingreso', 450, yPos);

    doc.moveTo(50, yPos + 15).lineTo(550, yPos + 15).stroke();

    yPos += 25;
    doc.font('Helvetica').fontSize(9);

    serviciosSolicitados.forEach((servicio, index) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      doc.text(index + 1, 50, yPos);
      doc.text(servicio.servicio, 80, yPos, { width: 190 });
      doc.text(servicio.categoria, 280, yPos);
      doc.text(servicio.vecessolicitado.toString(), 380, yPos);
      doc.text(`Bs ${parseFloat(servicio.ingresoTotal).toFixed(2)}`, 450, yPos);

      yPos += 20;
    });

    doc.end();
  } catch (error) {
    console.error('Error exportando PDF:', error);
    res.status(500).json({ error: 'Error al exportar PDF' });
  }
};

// ==========================================
// EXPORTAR A EXCEL - INGRESOS MENSUALES
// ==========================================
export const exportarIngresosExcel = async (req, res) => {
  try {
    // Validar token
    const validacion = validarTokenExport(req);
    if (!validacion.valido) {
      return res.status(401).json({ error: validacion.error });
    }

    const { anio } = req.query;
    const ingresosPorMes = [];

    for (let mes = 1; mes <= 12; mes++) {
      const fechaInicio = new Date(anio, mes - 1, 1);
      const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

      const ordenes = await prisma.ordenTrabajo.findMany({
        where: {
          fechaFin: {
            gte: fechaInicio,
            lte: fechaFin
          },
          estado: 'FINALIZADA'
        },
        include: {
          detalle: {
            include: {
              proforma: {
                select: {
                  total: true,
                  estado: true
                }
              }
            }
          }
        }
      });

      const totalMes = ordenes.reduce((sum, orden) => {
        if (orden.detalle && orden.detalle.proforma) {
          const estadosValidos = ['APROBADA', 'COMPLETADA'];
          if (estadosValidos.includes(orden.detalle.proforma.estado)) {
            return sum + parseFloat(orden.detalle.proforma.total || 0);
          }
        }
        return sum;
      }, 0);

      ingresosPorMes.push({
        mes: new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' }),
        totalOrdenes: ordenes.length,
        ingresoTotal: totalMes.toFixed(2)
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ingresos Mensuales');

    worksheet.columns = [
      { header: 'Mes', key: 'mes', width: 15 },
      { header: 'Total Órdenes', key: 'totalOrdenes', width: 15 },
      { header: 'Ingreso Total (Bs)', key: 'ingresoTotal', width: 20 }
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF22AA22' }
    };

    ingresosPorMes.forEach((mes) => {
      worksheet.addRow(mes);
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ingresos-mensuales-${anio}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportando Excel:', error);
    res.status(500).json({ error: 'Error al exportar Excel' });
  }
};

// ==========================================
// EXPORTAR A PDF - INGRESOS MENSUALES
// ==========================================
export const exportarIngresosPDF = async (req, res) => {
  try {
    // Validar token
    const validacion = validarTokenExport(req);
    if (!validacion.valido) {
      return res.status(401).json({ error: validacion.error });
    }

    const { anio } = req.query;
    const ingresosPorMes = [];

    for (let mes = 1; mes <= 12; mes++) {
      const fechaInicio = new Date(anio, mes - 1, 1);
      const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

      const ordenes = await prisma.ordenTrabajo.findMany({
        where: {
          fechaFin: {
            gte: fechaInicio,
            lte: fechaFin
          },
          estado: 'FINALIZADA'
        },
        include: {
          detalle: {
            include: {
              proforma: {
                select: {
                  total: true,
                  estado: true
                }
              }
            }
          }
        }
      });

      const totalMes = ordenes.reduce((sum, orden) => {
        if (orden.detalle && orden.detalle.proforma) {
          const estadosValidos = ['APROBADA', 'COMPLETADA'];
          if (estadosValidos.includes(orden.detalle.proforma.estado)) {
            return sum + parseFloat(orden.detalle.proforma.total || 0);
          }
        }
        return sum;
      }, 0);

      ingresosPorMes.push({
        mes: new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' }),
        totalOrdenes: ordenes.length,
        ingresoTotal: totalMes
      });
    }

    const totalAnual = ingresosPorMes.reduce((sum, mes) => sum + parseFloat(mes.ingresoTotal), 0);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ingresos-mensuales-${anio}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold')
       .text('Reporte de Ingresos Mensuales', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica')
       .text(`Año: ${anio}`, { align: 'center' });
    doc.moveDown(2);

    const tableTop = doc.y;
    let yPos = tableTop;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Mes', 100, yPos);
    doc.text('Órdenes', 250, yPos);
    doc.text('Ingreso Total', 350, yPos);

    doc.moveTo(100, yPos + 15).lineTo(500, yPos + 15).stroke();

    yPos += 25;
    doc.font('Helvetica').fontSize(10);

    ingresosPorMes.forEach((mes) => {
      doc.text(mes.mes, 100, yPos, { width: 140 });
      doc.text(mes.totalOrdenes.toString(), 250, yPos);
      doc.text(`Bs ${parseFloat(mes.ingresoTotal).toFixed(2)}`, 350, yPos);
      yPos += 20;
    });

    yPos += 10;
    doc.moveTo(100, yPos).lineTo(500, yPos).stroke();
    yPos += 10;

    doc.font('Helvetica-Bold');
    doc.text('Total Anual:', 100, yPos);
    doc.text(`Bs ${totalAnual.toFixed(2)}`, 350, yPos);

    doc.end();
  } catch (error) {
    console.error('Error exportando PDF:', error);
    res.status(500).json({ error: 'Error al exportar PDF' });
  }
};

// ==========================================
// REPORTE: ACTIVIDAD DE EMPLEADOS
// ==========================================
export const reporteActividadEmpleados = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    if (!mes || !anio) {
      return res.status(400).json({ 
        error: 'Debe proporcionar mes y año' 
      });
    }

    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const empleados = await prisma.empleado.findMany({
      include: {
        ordenesTrabajo: {
          where: {
            fechaInicio: {
              gte: fechaInicio,
              lte: fechaFin
            }
          }
        },
        diagnosticos: {
          where: {
            fecha: {
              gte: fechaInicio,
              lte: fechaFin
            }
          }
        }
      }
    });

    const actividad = empleados.map(emp => {
      const finalizadas = emp.ordenesTrabajo.filter(o => o.estado === 'FINALIZADA').length;
      const enProceso = emp.ordenesTrabajo.filter(o => o.estado === 'EN_PROCESO').length;
      const abiertas = emp.ordenesTrabajo.filter(o => o.estado === 'ABIERTA').length;
      const totalOrdenes = emp.ordenesTrabajo.length;
      const totalDiagnosticos = emp.diagnosticos.length;
      const totalActividades = totalOrdenes + totalDiagnosticos;

      return {
        empleado: `${emp.nombre} ${emp.apellidos}`,
        ci: emp.ci,
        telefono: emp.telefono,
        totalOrdenes,
        totalDiagnosticos,
        totalActividades,
        finalizadas,
        enProceso,
        abiertas,
        eficiencia: totalOrdenes > 0 
          ? ((finalizadas / totalOrdenes) * 100).toFixed(2)
          : 0
      };
    }).sort((a, b) => b.totalActividades - a.totalActividades);

    res.json({
      mes: parseInt(mes),
      anio: parseInt(anio),
      mesNombre: new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' }),
      totalEmpleados: actividad.length,
      empleados: actividad
    });
  } catch (error) {
    console.error('Error en reporte actividad empleados:', error);
    res.status(500).json({ error: 'Error al generar reporte de empleados' });
  }
};

// ==========================================
// EXPORTAR A EXCEL - ACTIVIDAD EMPLEADOS
// ==========================================
export const exportarActividadEmpleadosExcel = async (req, res) => {
  try {
    // Validar token
    const validacion = validarTokenExport(req);
    if (!validacion.valido) {
      return res.status(401).json({ error: validacion.error });
    }

    const { mes, anio } = req.query;
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const empleados = await prisma.empleado.findMany({
      include: {
        ordenesTrabajo: {
          where: {
            fechaInicio: {
              gte: fechaInicio,
              lte: fechaFin
            }
          }
        },
        diagnosticos: {
          where: {
            fecha: {
              gte: fechaInicio,
              lte: fechaFin
            }
          }
        }
      }
    });

    const actividad = empleados.map(emp => {
      const finalizadas = emp.ordenesTrabajo.filter(o => o.estado === 'FINALIZADA').length;
      const enProceso = emp.ordenesTrabajo.filter(o => o.estado === 'EN_PROCESO').length;
      const abiertas = emp.ordenesTrabajo.filter(o => o.estado === 'ABIERTA').length;
      const totalOrdenes = emp.ordenesTrabajo.length;

      return {
        empleado: `${emp.nombre} ${emp.apellidos}`,
        ci: emp.ci,
        totalOrdenes,
        totalDiagnosticos: emp.diagnosticos.length,
        finalizadas,
        enProceso,
        abiertas,
        eficiencia: totalOrdenes > 0 ? ((finalizadas / totalOrdenes) * 100).toFixed(2) : 0
      };
    }).sort((a, b) => b.totalOrdenes - a.totalOrdenes);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Actividad Empleados');

    worksheet.columns = [
      { header: '#', key: 'numero', width: 5 },
      { header: 'CI', key: 'ci', width: 12 },
      { header: 'Empleado', key: 'empleado', width: 35 },
      { header: 'Total Órdenes', key: 'totalOrdenes', width: 15 },
      { header: 'Diagnósticos', key: 'totalDiagnosticos', width: 15 },
      { header: 'Finalizadas', key: 'finalizadas', width: 15 },
      { header: 'En Proceso', key: 'enProceso', width: 15 },
      { header: 'Abiertas', key: 'abiertas', width: 15 },
      { header: 'Eficiencia %', key: 'eficiencia', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF6600' }
    };

    actividad.forEach((emp, index) => {
      worksheet.addRow({
        numero: index + 1,
        ...emp
      });
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=actividad-empleados-${mes}-${anio}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportando Excel:', error);
    res.status(500).json({ error: 'Error al exportar Excel' });
  }
};

// ==========================================
// EXPORTAR A PDF - ACTIVIDAD EMPLEADOS
// ==========================================
export const exportarActividadEmpleadosPDF = async (req, res) => {
  try {
    // Validar token
    const validacion = validarTokenExport(req);
    if (!validacion.valido) {
      return res.status(401).json({ error: validacion.error });
    }

    const { mes, anio } = req.query;
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const empleados = await prisma.empleado.findMany({
      include: {
        ordenesTrabajo: {
          where: {
            fechaInicio: {
              gte: fechaInicio,
              lte: fechaFin
            }
          }
        },
        diagnosticos: {
          where: {
            fecha: {
              gte: fechaInicio,
              lte: fechaFin
            }
          }
        }
      }
    });

    const actividad = empleados.map(emp => {
      const finalizadas = emp.ordenesTrabajo.filter(o => o.estado === 'FINALIZADA').length;
      const totalOrdenes = emp.ordenesTrabajo.length;

      return {
        empleado: `${emp.nombre} ${emp.apellidos}`,
        totalOrdenes,
        diagnosticos: emp.diagnosticos.length,
        finalizadas,
        eficiencia: totalOrdenes > 0 ? ((finalizadas / totalOrdenes) * 100).toFixed(2) : 0
      };
    }).sort((a, b) => b.totalOrdenes - a.totalOrdenes);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=actividad-empleados-${mes}-${anio}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold')
       .text('Reporte de Actividad de Empleados', { align: 'center' });
    doc.moveDown(0.5);
    
    const mesNombre = new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' });
    doc.fontSize(12).font('Helvetica')
       .text(`Período: ${mesNombre} ${anio}`, { align: 'center' });
    doc.moveDown(2);

    const tableTop = doc.y;
    let yPos = tableTop;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('#', 50, yPos);
    doc.text('Empleado', 80, yPos);
    doc.text('Órdenes', 270, yPos);
    doc.text('Diagnósticos', 340, yPos);
    doc.text('Finalizadas', 430, yPos);
    doc.text('Eficiencia', 500, yPos);

    doc.moveTo(50, yPos + 15).lineTo(550, yPos + 15).stroke();

    yPos += 25;
    doc.font('Helvetica').fontSize(8);

    actividad.forEach((emp, index) => {
      if (yPos > 720) {
        doc.addPage();
        yPos = 50;
      }

      doc.text(index + 1, 50, yPos);
      doc.text(emp.empleado, 80, yPos, { width: 180 });
      doc.text(emp.totalOrdenes.toString(), 270, yPos);
      doc.text(emp.diagnosticos.toString(), 340, yPos);
      doc.text(emp.finalizadas.toString(), 430, yPos);
      doc.text(`${emp.eficiencia}%`, 500, yPos);

      yPos += 18;
    });

    doc.end();
  } catch (error) {
    console.error('Error exportando PDF:', error);
    res.status(500).json({ error: 'Error al exportar PDF' });
  }
};

