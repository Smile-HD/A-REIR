const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Debug logs - puedes comentar después de verificar que funciona
  console.log('🔐 [Auth Middleware] Verificando autenticación...');
  console.log('📨 Cookies recibidas:', req.cookies);
  console.log('🌐 Origin:', req.headers.origin);
  
  const token = req.cookies.access_token;
  
  if (!token) {
    console.log('❌ No se encontró token en cookies');
    return res.status(401).json({ error: "No hay token de autenticación" });
  }
  
  console.log('✅ Token encontrado, verificando...');
  
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Ahora req.user tiene usuario y email
    console.log('✅ Token válido para usuario:', decoded.usuario);
    next();
  } catch (error) {
    console.log('❌ Token inválido:', error.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = authMiddleware;