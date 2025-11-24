import prisma from '../config/database.js';
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

// Obtener todas las facturas
export const getFacturas = async (req, res) => {
  try {
    const facturas = await prisma.factura.findMany({
      include: {
        cliente: {
          select: {
            ci: true,
            nombre: true,
            apellidos: true,
            telefono: true
          }
        },
        proforma: {
          select: {
            id: true,
            fecha: true,
            total: true,
            estado: true,
            diagnostico: {
              select: {
                nro: true,
                moto: {
                  select: {
                    placa: true,
                    modelo: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Convertir BigInt a string para JSON
    const facturasJSON = facturas.map(factura => ({
      ...factura,
      nro: factura.nro.toString(),
      proformaId: factura.proformaId?.toString(),
      total: factura.total.toString(),
      proforma: factura.proforma ? {
        ...factura.proforma,
        id: factura.proforma.id.toString(),
        total: factura.proforma.total.toString(),
        diagnostico: factura.proforma.diagnostico ? {
          ...factura.proforma.diagnostico,
          nro: factura.proforma.diagnostico.nro.toString()
        } : null
      } : null
    }));

    res.json({ facturas: facturasJSON });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ 
      error: 'Error al obtener las facturas',
      details: error.message 
    });
  }
};

// Obtener factura por número
export const getFacturaById = async (req, res) => {
  try {
    const { nro } = req.params;

    const factura = await prisma.factura.findUnique({
      where: { nro: BigInt(nro) },
      include: {
        cliente: true,
        proforma: {
          include: {
            detalles: {
              include: {
                servicio: true
              }
            },
            diagnostico: {
              include: {
                moto: {
                  include: {
                    marca: true
                  }
                },
                detalles: true
              }
            }
          }
        }
      }
    });

    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Convertir BigInt a string para JSON
    const facturaJSON = {
      ...factura,
      nro: factura.nro.toString(),
      proformaId: factura.proformaId?.toString(),
      total: factura.total.toString()
    };

    res.json(facturaJSON);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ 
      error: 'Error al obtener la factura',
      details: error.message 
    });
  }
};

// Crear nueva factura
export const createFactura = async (req, res) => {
  try {
    const { clienteCi, proformaId } = req.body;

    // Validar campos requeridos
    if (!clienteCi) {
      return res.status(400).json({ 
        error: 'El CI del cliente es requerido' 
      });
    }

    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { ci: parseInt(clienteCi) }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Calcular total desde proforma si existe
    let total = 0;
    if (proformaId) {
      const proforma = await prisma.proforma.findUnique({
        where: { id: BigInt(proformaId) }
      });

      if (!proforma) {
        return res.status(404).json({ error: 'Proforma no encontrada' });
      }

      total = proforma.total;
    }

    // Crear la factura
    const nuevaFactura = await prisma.factura.create({
      data: {
        total: total,
        clienteCi: parseInt(clienteCi),
        proformaId: proformaId ? BigInt(proformaId) : null,
        estado: 'EMITIDA'
      },
      include: {
        cliente: true,
        proforma: true
      }
    });

    // Convertir BigInt a string para JSON
    const facturaJSON = {
      ...nuevaFactura,
      nro: nuevaFactura.nro.toString(),
      proformaId: nuevaFactura.proformaId?.toString(),
      total: nuevaFactura.total.toString()
    };

    res.status(201).json({ 
      message: 'Factura creada exitosamente', 
      factura: facturaJSON 
    });
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({ 
      error: 'Error al crear la factura',
      details: error.message 
    });
  }
};

// Actualizar factura
export const updateFactura = async (req, res) => {
  try {
    const { nro } = req.params;
    const { estado } = req.body;

    // Verificar que la factura existe
    const facturaExistente = await prisma.factura.findUnique({
      where: { nro: BigInt(nro) }
    });

    if (!facturaExistente) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Actualizar la factura
    const facturaActualizada = await prisma.factura.update({
      where: { nro: BigInt(nro) },
      data: {
        estado: estado || facturaExistente.estado
      },
      include: {
        cliente: true,
        proforma: true
      }
    });

    // Convertir BigInt a string para JSON
    const facturaJSON = {
      ...facturaActualizada,
      nro: facturaActualizada.nro.toString(),
      proformaId: facturaActualizada.proformaId?.toString(),
      total: facturaActualizada.total.toString()
    };

    res.json({ 
      message: 'Factura actualizada exitosamente', 
      factura: facturaJSON 
    });
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    res.status(500).json({ 
      error: 'Error al actualizar la factura',
      details: error.message 
    });
  }
};

// Anular factura (cambiar estado)
export const anularFactura = async (req, res) => {
  try {
    const { nro } = req.params;

    const facturaAnulada = await prisma.factura.update({
      where: { nro: BigInt(nro) },
      data: { estado: 'ANULADA' },
      include: {
        cliente: true,
        proforma: true
      }
    });

    // Convertir BigInt a string para JSON
    const facturaJSON = {
      ...facturaAnulada,
      nro: facturaAnulada.nro.toString(),
      proformaId: facturaAnulada.proformaId?.toString(),
      total: facturaAnulada.total.toString()
    };

    res.json({ 
      message: 'Factura anulada exitosamente', 
      factura: facturaJSON 
    });
  } catch (error) {
    console.error('Error al anular factura:', error);
    res.status(500).json({ 
      error: 'Error al anular la factura',
      details: error.message 
    });
  }
};

// Exportar factura a PDF
export const exportarFacturaPDF = async (req, res) => {
  try {
    // Validar token
    const validacion = validarTokenExport(req);
    if (!validacion.valido) {
      return res.status(401).json({ error: validacion.error });
    }

    const { nro } = req.params;

    // Obtener factura con todas las relaciones
    const factura = await prisma.factura.findUnique({
      where: { nro: BigInt(nro) },
      include: {
        cliente: true,
        proforma: {
          include: {
            detalles: {
              include: {
                servicio: true
              }
            },
            diagnostico: {
              include: {
                moto: {
                  include: {
                    marca: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=factura-${nro}.pdf`
    );

    doc.pipe(res);

    // Encabezado
    doc.fontSize(24).font('Helvetica-Bold')
       .text('FACTURA', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica')
       .text(`Nro. ${factura.nro.toString()}`, { align: 'center' });
    doc.moveDown(0.5);

    // Línea separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Información de la factura
    doc.fontSize(12).font('Helvetica-Bold')
       .text('Fecha:', 50, doc.y);
    doc.font('Helvetica')
       .text(new Date(factura.fecha).toLocaleDateString('es-ES'), 150, doc.y - 12);
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold')
       .text('Estado:', 50, doc.y);
    doc.font('Helvetica')
       .text(factura.estado, 150, doc.y - 12);
    doc.moveDown(1.5);

    // Información del cliente
    doc.fontSize(14).font('Helvetica-Bold')
       .text('DATOS DEL CLIENTE', 50, doc.y);
    doc.moveDown(0.5);
    
    doc.fontSize(11).font('Helvetica-Bold')
       .text('CI:', 50, doc.y);
    doc.font('Helvetica')
       .text(factura.cliente.ci.toString(), 150, doc.y - 11);
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold')
       .text('Nombre:', 50, doc.y);
    doc.font('Helvetica')
       .text(`${factura.cliente.nombre} ${factura.cliente.apellidos}`, 150, doc.y - 11);
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold')
       .text('Teléfono:', 50, doc.y);
    doc.font('Helvetica')
       .text(factura.cliente.telefono, 150, doc.y - 11);
    doc.moveDown(1.5);

    // Información de la proforma (si existe)
    if (factura.proforma) {
      doc.fontSize(14).font('Helvetica-Bold')
         .text('DETALLE DE SERVICIOS', 50, doc.y);
      doc.moveDown(0.5);

      // Información de la moto
      if (factura.proforma.diagnostico?.moto) {
        const moto = factura.proforma.diagnostico.moto;
        doc.fontSize(11).font('Helvetica-Bold')
           .text('Moto:', 50, doc.y);
        doc.font('Helvetica')
           .text(`${moto.marca?.nombre || ''} - ${moto.modelo} (${moto.placa})`, 150, doc.y - 11);
        doc.moveDown(1);
      }

      // Tabla de servicios
      if (factura.proforma.detalles && factura.proforma.detalles.length > 0) {
        const tableTop = doc.y;
        const colWidths = { servicio: 300, cantidad: 80, precio: 120 };
        let xPos = 50;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Servicio', xPos, tableTop, { width: colWidths.servicio });
        xPos += colWidths.servicio;
        doc.text('Cantidad', xPos, tableTop, { width: colWidths.cantidad });
        xPos += colWidths.cantidad;
        doc.text('Precio', xPos, tableTop, { width: colWidths.precio });

        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Detalles de servicios
        doc.font('Helvetica').fontSize(10);
        factura.proforma.detalles.forEach(detalle => {
          if (doc.y > 700) {
            doc.addPage();
            doc.y = 50;
          }

          xPos = 50;
          const yPos = doc.y;

          doc.text(detalle.servicio?.nombre || 'Servicio', xPos, yPos, { width: colWidths.servicio });
          xPos += colWidths.servicio;
          doc.text(detalle.cantidad.toString(), xPos, yPos, { width: colWidths.cantidad });
          xPos += colWidths.cantidad;
          doc.text(`Bs ${parseFloat(detalle.precioUnitario).toFixed(2)}`, xPos, yPos, { width: colWidths.precio });

          doc.moveDown(1);
        });

        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);
      }
    }

    // Total
    doc.fontSize(16).font('Helvetica-Bold')
       .text('TOTAL:', 350, doc.y, { width: 100 });
    doc.fontSize(18).fillColor('#2d3748')
       .text(`Bs ${parseFloat(factura.total).toFixed(2)}`, 450, doc.y - 18, { width: 100 });
    
    doc.fillColor('#000000'); // Resetear color

    // Pie de página
    doc.moveDown(3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(8).font('Helvetica')
       .text(
         `Generado el ${new Date().toLocaleString('es-ES')}`,
         50,
         doc.y,
         { align: 'center' }
       );

    doc.end();
  } catch (error) {
    console.error('Error exportando factura a PDF:', error);
    res.status(500).json({ 
      error: 'Error al exportar la factura',
      details: error.message 
    });
  }
};

// Eliminar factura
export const deleteFactura = async (req, res) => {
  try {
    const { nro } = req.params;

    await prisma.factura.delete({
      where: { nro: BigInt(nro) }
    });

    res.json({ message: 'Factura eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    res.status(500).json({ 
      error: 'Error al eliminar la factura',
      details: error.message 
    });
  }
};
