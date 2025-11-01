
class Validaciones {
  static empleado_ci(empleado_ci) {
    // Validaciones de username ( opcional usar zod)
    const numero = Number(empleado_ci);
    if (!Number.isInteger(numero))         
      throw new Error(
        "empleado_ci debe ser un número entero"
      );
  }
  static nombre(nombre) {
    // Validaciones de nombre ( opcional usar zod)
    if (typeof nombre !== "string" || nombre.trim().length < 3)
      throw new Error("Nombre debe ser una cadena con al menos 3 caracteres");
  }
  static usuario(usuario) {
    // Validaciones de username ( opcional usar zod)
    if (typeof usuario !== "string" || usuario.trim().length < 3)
      throw new Error("Username debe ser una cadena con al menos 3 caracteres");
  }
  static contrasena(contrasena) {
    // Validaciones de password ( opcional usar zod)
    if (typeof contrasena !== "string" || contrasena.length < 6)
      throw new Error("contrasena debe ser una cadena con al menos 6 caracteres");
  }
  static email(email) {
    // Validaciones de email ( opcional usar zod)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email))
      throw new Error("Email debe ser un email valido");
  }
  static ci(CI) {
    const numero = Number(CI);
    if (!Number.isInteger(numero))
      throw new Error(`CI debe ser un entero, received: ${CI} (${typeof CI})`);
  }
  static telefono(telefono) {
    const numero = Number(telefono);
    if (!Number.isInteger(numero))
      throw new Error(
        `Telefono debe ser un entero, received: ${telefono} (${typeof telefono})`
      );
  }
  static direccion(direccion) {
    if (typeof direccion !== "string" || direccion.trim().length < 3)
      throw new Error("Direccion debe ser una cadena con al menos 3 caracteres");
  }

  static placa(placa) {
    if (typeof placa !== "string") {
      throw new Error("Placa debe ser una cadena de texto");
    }

    const placaClean = placa.trim().toUpperCase();
    if (placaClean.length < 5 || placaClean.length > 10) {
      throw new Error("Placa debe tener entre 5 y 10 caracteres");
    }

    if (!/^[A-Z0-9-]+$/.test(placaClean)) {
      throw new Error("Placa solo puede contener letras, números y guiones");
    }
  }

  static modeloMoto(modelo) {
    if (typeof modelo !== "string") {
      throw new Error("Modelo debe ser una cadena de texto");
    }

    const modeloClean = modelo.trim();
    if (modeloClean.length < 2 || modeloClean.length > 80) {
      throw new Error("Modelo debe tener entre 2 y 80 caracteres");
    }
  }

  static anioMoto(year) {
    const yearNumber = Number(year);

    if (!Number.isInteger(yearNumber)) {
      throw new Error("Año debe ser un número entero");
    }

    const currentYear = new Date().getFullYear() + 1;
    if (yearNumber < 1950 || yearNumber > currentYear) {
      throw new Error(`Año debe estar entre 1950 y ${currentYear}`);
    }
  }

  static chasisMoto(chasis) {
    if (chasis === undefined || chasis === null || chasis === "") {
      return;
    }

    if (typeof chasis !== "string") {
      throw new Error("Chasis debe ser una cadena de texto");
    }

    const chasisClean = chasis.trim().toUpperCase();
    if (chasisClean.length < 5 || chasisClean.length > 30) {
      throw new Error("Chasis debe tener entre 5 y 30 caracteres");
    }

    if (!/^[A-Z0-9-]+$/.test(chasisClean)) {
      throw new Error("Chasis solo puede contener letras, números y guiones");
    }
  }

  static marcaId(marcaId) {
    const id = Number(marcaId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Marca debe ser un identificador numérico válido");
    }
  }

  // Diagnóstico: fecha (Date), hora (Time) y descripción
  static fechaDiagnostico(fecha) {
    if (!fecha) {
      throw new Error("La fecha del diagnóstico es requerida");
    }
    const f = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(f.getTime())) {
      throw new Error("La fecha del diagnóstico no es válida");
    }
  }

  static horaDiagnostico(hora) {
    if (typeof hora !== "string") {
      throw new Error("La hora del diagnóstico debe ser una cadena HH:MM o HH:MM:SS");
    }
    const pattern = /^\d{2}:\d{2}(:\d{2})?$/;
    if (!pattern.test(hora)) {
      throw new Error("Formato de hora inválido. Use HH:MM o HH:MM:SS");
    }
  }

  static descripcionDiagnostico(texto) {
    if (typeof texto !== "string") {
      throw new Error("La descripción debe ser un texto");
    }
    const t = texto.trim();
    if (t.length < 3) {
      throw new Error("La descripción debe tener al menos 3 caracteres");
    }
    if (t.length > 250) {
      throw new Error("La descripción no puede exceder 250 caracteres");
    }
  }

  static Fechanac(fechanac) {
    // Validación de fecha de nacimiento
    if (!fechanac) {
      throw new Error("La fecha de nacimiento es requerida");
    }

    let fecha;
    
    // Intentar convertir a fecha si es string
    if (typeof fechanac === "string") {
      fecha = new Date(fechanac);
    } else if (fechanac instanceof Date) {
      fecha = fechanac;
    } else {
      throw new Error("La fecha de nacimiento debe ser una fecha válida");
    }

    // Verificar que la fecha sea válida
    if (isNaN(fecha.getTime())) {
      throw new Error("La fecha de nacimiento no es una fecha válida");
    }

    // Verificar que no sea una fecha futura
    const hoy = new Date();
    if (fecha > hoy) {
      throw new Error("La fecha de nacimiento no puede ser una fecha futura");
    }

    // Verificar que la persona no sea demasiado vieja (más de 120 años)
    const hace120Anos = new Date();
    hace120Anos.setFullYear(hace120Anos.getFullYear() - 120);
    
    if (fecha < hace120Anos) {
      throw new Error("La fecha de nacimiento no puede ser anterior a 120 años");
    }

    // Verificar que la persona tenga al menos 16 años (edad mínima laboral)
    const hace16Anos = new Date();
    hace16Anos.setFullYear(hace16Anos.getFullYear() - 16);
    
    if (fecha > hace16Anos) {
      throw new Error("El empleado debe tener al menos 16 años");
    }
  }

  static fechaNacimiento(fechanac) {
    // Alias para mantener compatibilidad
    return this.Fechanac(fechanac);
  }

  static validarContrasena(contrasena) {
    // Validación más robusta de contraseña para el sistema de bloqueo
    if (typeof contrasena !== "string") {
      throw new Error("La contraseña debe ser una cadena de texto");
    }
    
    if (contrasena.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }
    
    // Verificar que tenga al menos una mayúscula
    if (!/[A-Z]/.test(contrasena)) {
      throw new Error("La contraseña debe contener al menos una letra mayúscula");
    }
    
    // Verificar que tenga al menos una minúscula
    if (!/[a-z]/.test(contrasena)) {
      throw new Error("La contraseña debe contener al menos una letra minúscula");
    }
    
    // Verificar que tenga al menos un número
    if (!/\d/.test(contrasena)) {
      throw new Error("La contraseña debe contener al menos un número");
    }
    
    // Verificar que tenga al menos un carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(contrasena)) {
      throw new Error("La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?\":{}|<>)");
    }
  }

  static validarEmail(email) {
    // Alias para la función email existente
    return this.email(email);
  }

  // Proforma
  static estadoProforma(estado) {
    if (typeof estado !== 'string') {
      throw new Error('El estado de la proforma debe ser una cadena');
    }
    const up = estado.trim().toUpperCase();
    const allowed = ['PENDIENTE', 'APROBADA', 'ANULADA'];
    if (!allowed.includes(up)) {
      throw new Error(`Estado de proforma inválido. Permitidos: ${allowed.join(', ')}`);
    }
  }

  static cantidadProforma(cantidad) {
    const n = Number(cantidad);
    if (!isFinite(n) || n <= 0) {
      throw new Error('La cantidad debe ser un número positivo');
    }
    // Máximo razonable y 2 decimales
    if (n > 1_000_000) {
      throw new Error('La cantidad es demasiado grande');
    }
  }

  static precioUnitario(precio) {
    const n = Number(precio);
    if (!isFinite(n) || n < 0) {
      throw new Error('El precio unitario debe ser un número mayor o igual a 0');
    }
    if (n > 100_000_000) {
      throw new Error('El precio unitario es demasiado grande');
    }
  }

  static descripcionDetalleProforma(texto) {
    if (typeof texto !== 'string') {
      throw new Error('La descripción del detalle debe ser texto');
    }
    const t = texto.trim();
    if (t.length < 3) throw new Error('La descripción del detalle debe tener al menos 3 caracteres');
    if (t.length > 250) throw new Error('La descripción del detalle no puede exceder 250 caracteres');
  }

  static fechaProforma(fecha) {
    if (!fecha) throw new Error('La fecha de la proforma es requerida');
    const f = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(f.getTime())) throw new Error('La fecha de la proforma no es válida');
  }
}

// Objeto validarDatos para compatibilidad con usuarioController
const validarDatos = {
  cedula: (cedula) => {
    try {
      const numero = Number(cedula);
      if (!Number.isInteger(numero) || numero <= 0) {
        return {
          valido: false,
          mensaje: "La cédula debe ser un número entero positivo"
        };
      }
      return { valido: true };
    } catch (error) {
      return {
        valido: false,
        mensaje: "La cédula debe ser un número válido"
      };
    }
  },

  texto: (texto, minLength = 1, maxLength = 255) => {
    try {
      if (!texto || typeof texto !== "string") {
        return {
          valido: false,
          mensaje: "El campo debe ser un texto válido"
        };
      }
      
      const textoLimpio = texto.trim();
      
      if (textoLimpio.length < minLength) {
        return {
          valido: false,
          mensaje: `El texto debe tener al menos ${minLength} caracteres`
        };
      }
      
      if (textoLimpio.length > maxLength) {
        return {
          valido: false,
          mensaje: `El texto no puede tener más de ${maxLength} caracteres`
        };
      }
      
      return { valido: true };
    } catch (error) {
      return {
        valido: false,
        mensaje: "Error al validar el texto"
      };
    }
  },

  email: (email) => {
    try {
      if (!email || typeof email !== "string") {
        return {
          valido: false,
          mensaje: "El email debe ser un texto válido"
        };
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(email)) {
        return {
          valido: false,
          mensaje: "El formato del email no es válido"
        };
      }
      
      return { valido: true };
    } catch (error) {
      return {
        valido: false,
        mensaje: "Error al validar el email"
      };
    }
  },

  fechaNacimiento: (fechanac) => {
    try {
      if (!fechanac) {
        return {
          valido: false,
          mensaje: "La fecha de nacimiento es requerida"
        };
      }

      let fecha;
      
      if (typeof fechanac === "string") {
        fecha = new Date(fechanac);
      } else if (fechanac instanceof Date) {
        fecha = fechanac;
      } else {
        return {
          valido: false,
          mensaje: "La fecha de nacimiento debe ser una fecha válida"
        };
      }

      if (isNaN(fecha.getTime())) {
        return {
          valido: false,
          mensaje: "La fecha de nacimiento no es una fecha válida"
        };
      }

      const hoy = new Date();
      if (fecha > hoy) {
        return {
          valido: false,
          mensaje: "La fecha de nacimiento no puede ser una fecha futura"
        };
      }

      const hace120Anos = new Date();
      hace120Anos.setFullYear(hace120Anos.getFullYear() - 120);
      
      if (fecha < hace120Anos) {
        return {
          valido: false,
          mensaje: "La fecha de nacimiento no puede ser anterior a 120 años"
        };
      }

      const hace16Anos = new Date();
      hace16Anos.setFullYear(hace16Anos.getFullYear() - 16);
      
      if (fecha > hace16Anos) {
        return {
          valido: false,
          mensaje: "El empleado debe tener al menos 16 años"
        };
      }
      
      return { valido: true };
    } catch (error) {
      return {
        valido: false,
        mensaje: "Error al validar la fecha de nacimiento"
      };
    }
  },

  contrasena: (contrasena) => {
    try {
      if (typeof contrasena !== "string") {
        return {
          valido: false,
          mensaje: "La contraseña debe ser una cadena de texto"
        };
      }
      
      if (contrasena.length < 8) {
        return {
          valido: false,
          mensaje: "La contraseña debe tener al menos 8 caracteres"
        };
      }
      
      if (!/[A-Z]/.test(contrasena)) {
        return {
          valido: false,
          mensaje: "La contraseña debe contener al menos una letra mayúscula"
        };
      }
      
      if (!/[a-z]/.test(contrasena)) {
        return {
          valido: false,
          mensaje: "La contraseña debe contener al menos una letra minúscula"
        };
      }
      
      if (!/\d/.test(contrasena)) {
        return {
          valido: false,
          mensaje: "La contraseña debe contener al menos un número"
        };
      }
      
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(contrasena)) {
        return {
          valido: false,
          mensaje: "La contraseña debe contener al menos un carácter especial"
        };
      }
      
      return { valido: true };
    } catch (error) {
      return {
        valido: false,
        mensaje: "Error al validar la contraseña"
      };
    }
  },

  telefono: (telefono) => {
    try {
      const numero = Number(telefono);
      if (!Number.isInteger(numero) || numero <= 0) {
        return {
          valido: false,
          mensaje: "El teléfono debe ser un número entero positivo"
        };
      }

      // Validar que tenga un número razonable de dígitos (entre 7 y 15)
      const telefonoStr = numero.toString();
      if (telefonoStr.length < 7 || telefonoStr.length > 15) {
        return {
          valido: false,
          mensaje: "El teléfono debe tener entre 7 y 15 dígitos"
        };
      }
      
      return { valido: true };
    } catch (error) {
      return {
        valido: false,
        mensaje: "Error al validar el teléfono"
      };
    }
  }
};

module.exports = Validaciones;
module.exports.validarDatos = validarDatos;
