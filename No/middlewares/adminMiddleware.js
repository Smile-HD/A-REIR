// Middleware para verificar si el usuario es administrador
const adminMiddleware = (req, res, next) => {
  try {
    // Verificar si el usuario está autenticado (esto ya se hace en authMiddleware)
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado' 
      });
    }

    // Verificar si el usuario es administrador
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Acceso denegado. Se requieren privilegios de administrador.' 
      });
    }

    // Si es administrador, continuar
    next();
  } catch (error) {
    console.error('Error en middleware de administrador:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = adminMiddleware;