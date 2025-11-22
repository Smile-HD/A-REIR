import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Token no proporcionado' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar información del usuario al request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Token inválido' 
    });
  }
};
