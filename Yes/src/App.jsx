import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  useMediaQuery,
  Collapse,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Badge as BadgeIcon,
  ManageAccounts as ManageAccountsIcon,
  DirectionsBike as BikeIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";

// Importar componentes de las páginas
import Dashboard from "./pages/dashboard/dashboard";
import Clientes from "./pages/clientes/clientes";
import Empleados from "./pages/empleados/empleados";
import Usuarios from "./pages/usuarios/usuarios";
import Motos from "./pages/motos/motos";
import Configuracion from "./pages/configuracion/configuracion";
import Diagnosticos from "./pages/diagnosticos/diagnosticos";
import Bitacora from "./pages/bitacora/bitacora";
import Proformas from "./pages/proformas/proformas";
import Servicios from "./pages/servicios/servicios";

import "./App.css";
import { API_BASE } from "./utils/apiConfig";

// Tema personalizado con colores naranja y negro
const theme = createTheme({
  palette: {
    primary: {
      main: "#ff8c42",
      light: "#ff6b1a",
      dark: "#e55a00",
    },
    secondary: {
      main: "#000000",
    },
    background: {
      default: "#000000",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h3: {
      fontWeight: "bold",
      fontSize: "3rem",
    },
    h6: {
      fontWeight: 300,
      fontSize: "1.2rem",
    },
  },
});

// Componente DashboardPrincipal
function DashboardPrincipal({ onLogout, userInfo }) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState("dashboard");

  // Definir todos los elementos del menú
  const allMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
      adminOnly: false,
    },
    {
      id: "administracion",
      label: "Administración",
      adminOnly: false,
      children: [
        {
          id: "usuarios",
          label: "Usuarios",
          icon: <ManageAccountsIcon />,
          adminOnly: true,
        },
        {
          id: "empleados",
          label: "Empleados",
          icon: <BadgeIcon />,
          adminOnly: true,
        },
        {
          id: "clientes",
          label: "Clientes",
          icon: <PeopleIcon />,
          adminOnly: false,
        },
        {
          id: "bitacora",
          label: "Bitácora",
          icon: <ReceiptIcon />,
          adminOnly: true,
        },
      ],
    },
    {
      id: "pedido",
      label: "Pedido",
      adminOnly: false,
      children: [
        {
          id: "diagnosticos",
          label: "Diagnósticos",
          icon: <BuildIcon />,
          adminOnly: false,
        },
        {
          id: "servicios",
          label: "Servicios",
          icon: <BuildIcon />,
          adminOnly: true,
        },
        { id: "motos", label: "Motos", icon: <BikeIcon />, adminOnly: false },
        {
          id: "proformas",
          label: "Proformas",
          icon: <ReceiptIcon />,
          adminOnly: false,
        },
      ],
    },
    {
      id: "produccion",
      label: "Producción",
      adminOnly: false,
      children: [{
          id: "trabajo",
          label: "Orden Trabajo",
          adminOnly: false,
        },
      {
          id: "herramientas",
          label: "Herramientas",
          adminOnly: false,
        }],
    },
    {
      id: "operativo",
      label: "Operativo",
      adminOnly: false,
      children: [{
          id: "factura",
          label: "Facturas",
          adminOnly: false,
        },
        {
          id: "pagos",
          label: "Pago Empleados",
          adminOnly: false,
        }
        
      ],
    },
    {
      id: "sistema",
      label: "Sistema",
      adminOnly: false,
      children: [
       // {
       //   id: "configuracion",
       //   label: "Configuración",
       //   icon: <SettingsIcon />,
       //   adminOnly: false,
       // },
        {
          id: "logout",
          label: "Cerrar Sesión",
          icon: <LogoutIcon />,
          adminOnly: false,
        },
      ],
    },

    // { id: 'servicios', label: 'Servicios', icon: <BuildIcon />, adminOnly: false },
    // { id: 'inventario', label: 'Inventario', icon: <InventoryIcon />, adminOnly: false },
    //{ id: 'facturas', label: 'Facturas', icon: <ReceiptIcon />, adminOnly: false },
  ];

  // Filtrar elementos del menú según el rol del usuario
  const menuItems = allMenuItems.filter(
    (item) => !item.adminOnly || userInfo.isAdmin
  );
  // estado para controlar grupos abiertos
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        {/* Menú lateral */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? 250 : 0,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 250,
              boxSizing: "border-box",
              backgroundColor: "#1a1a1a",
              borderRight: "2px solid #ff8c42",
              overflowX: "hidden",
            },
          }}
        >
          <Box sx={{ p: 2, backgroundColor: "#ff8c42" }}>
            <Typography variant="h6" color="white" fontWeight="bold">
              Multiservicio Renacer
            </Typography>
          </Box>

          <List sx={{ flex: 1, overflowY: "auto" }}>
            {allMenuItems
              .filter((item) => !item.adminOnly || userInfo.isAdmin)
              .map((item) => {
                // si tiene children -> renderizar grupo con Collapse
                if (item.children && item.children.length > 0) {
                  // filtrar children según permiso
                  const visibleChildren = item.children.filter(
                    (c) => !c.adminOnly || userInfo.isAdmin
                  );
                  if (visibleChildren.length === 0) return null;
                  return (
                    <div key={item.id}>
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => toggleGroup(item.id)}
                          sx={{
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(255, 140, 66, 0.05)",
                            },
                          }}
                        >
                          <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText primary={item.label} />
                          {openGroups[item.id] ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          )}
                        </ListItemButton>
                      </ListItem>
                      <Collapse
                        in={openGroups[item.id]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding>
                          {visibleChildren.map((child) => (
                            //                          child.id === 'logout' ?  <List>
                            //         <ListItem disablePadding>
                            //          <ListItemButton
                            //        onClick={onLogout}
                            //           sx={{
                            //            color: 'white',
                            //          '&:hover': {
                            //           backgroundColor: 'rgba(255, 140, 66, 0.1)',
                            //        },
                            //     }}
                            //       >
                            //       <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                            //          <LogoutIcon />
                            //        </ListItemIcon>
                            //        <ListItemText primary="Cerrar Sesión" />
                            //     </ListItemButton>
                            //   </ListItem>
                            //  </List> : (

                            <ListItem
                              key={child.id}
                              disablePadding
                              sx={{ pl: 4 }}
                            >
                              <ListItemButton
                                selected={selectedItem === child.id}
                                onClick={() =>
                                  child.id === "logout"
                                    ? onLogout()
                                    : setSelectedItem(child.id)
                                }
                                sx={{
                                  color: "white",
                                  "&.Mui-selected": {
                                    backgroundColor: "rgba(255, 140, 66, 0.18)",
                                    borderRight: "3px solid #ff8c42",
                                  },
                                }}
                              >
                                <ListItemIcon
                                  sx={{ color: "white", minWidth: 36 }}
                                >
                                  {child.icon}
                                </ListItemIcon>
                                <ListItemText primary={child.label} />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </div>
                  );
                }

                return (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton
                      selected={selectedItem === item.id}
                      onClick={() => setSelectedItem(item.id)}
                      sx={{
                        color: "white",
                        "&.Mui-selected": {
                          backgroundColor: "rgba(255, 140, 66, 0.2)",
                          borderRight: "3px solid #ff8c42",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(255, 140, 66, 0.1)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
          </List>
        </Drawer>

        {/* Contenido principal */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <AppBar position="static" sx={{ backgroundColor: "#2a2a2a" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="white"
                onClick={() => setDrawerOpen(!drawerOpen)}
                sx={{ mr: 2 , color: 'white'}}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 , color: 'white' }}>
                {menuItems.find((item) => item.id === selectedItem)?.label }
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" color="white">
                  {userInfo.usuario}
                </Typography>
                {userInfo.isAdmin && (
                  <Box
                    sx={{
                      backgroundColor: "#ff8c42",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    ADMIN
                  </Box>
                )}
              </Box>
            </Toolbar>
          </AppBar>

          <Box sx={{ flexGrow: 1, p: 3, backgroundColor: "#f5f5f5" }}>
            <Container maxWidth="xl">
              <Typography variant="h4" gutterBottom>
                Bienvenido al Sistema de Gestión
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Panel de control para Multiservicio Renacer - Taller de Motos
              </Typography>

              {/* Contenido dinámico según la sección seleccionada */}
              <Box sx={{ mt: 4 }}>
                {selectedItem === "dashboard" && <Dashboard />}
                {selectedItem === "clientes" && <Clientes />}
                {selectedItem === "empleados" && <Empleados />}
                {selectedItem === "usuarios" && <Usuarios />}
                {selectedItem === "motos" && <Motos />}
                {selectedItem === "diagnosticos" && <Diagnosticos />}
                {selectedItem === "proformas" && <Proformas />}
                {selectedItem === "servicios" && <Servicios />}
                {selectedItem === "bitacora" && <Bitacora />}
                {selectedItem === "inventario" && <Inventario />}
                {selectedItem === "facturas" && <Facturas />}
                {selectedItem === "configuracion" && <Configuracion />}
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // para login responsive
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [bloqueado, setBloqueado] = useState(false);
  const [intentosRestantes, setIntentosRestantes] = useState(5);
  const [tiempoBloqueo, setTiempoBloqueo] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Para mostrar loading mientras verifica sesión
  const [userInfo, setUserInfo] = useState({
    usuario: "",
    email: "",
    isAdmin: false,
    empleado_ci: null,
  });

  // Efecto para actualizar el tiempo de bloqueo cada minuto
  useEffect(() => {
    if (bloqueado && tiempoBloqueo) {
      const interval = setInterval(() => {
        // Aquí podrías hacer una verificación del estado en el servidor
        // o simplemente decrementar el tiempo localmente
        console.log("Usuario bloqueado, actualizando estado...");
      }, 60000); // Cada minuto

      return () => clearInterval(interval);
    }
  }, [bloqueado, tiempoBloqueo]);

  // Verificar sesión al cargar la página
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        console.log("Iniciando verificación de sesión...");

        // Las cookies httpOnly no son accesibles desde JavaScript
        // Siempre intentar verificar con el servidor

        // Crear un timeout para la verificación (más agresivo)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // ampliar timeout para servidores remotos

        const res = await fetch(`${API_BASE}/auth/verificar`, {
          method: "GET",
          credentials: "include", // Importante para enviar cookies
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUsuario(data.usuario);
          setUserInfo({
            usuario: data.usuario,
            email: data.email,
            isAdmin: data.isAdmin,
            empleado_ci: data.empleado_ci,
          });
          console.log(
            "Sesión restaurada exitosamente:",
            data.usuario,
            "Admin:",
            data.isAdmin
          );
        } else {
          console.log("No hay sesión activa, código:", res.status);
          // Asegurar que el estado esté limpio
          setIsLoggedIn(false);
          setUsuario("");
          setUserInfo({
            usuario: "",
            email: "",
            isAdmin: false,
            empleado_ci: null,
          });
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Timeout en verificación de sesión");
        } else {
          console.error("Error al verificar sesión:", error);
        }
      } finally {
        console.log("Finalizando verificación de sesión");
        setIsLoading(false);
      }
    };

    verificarSesion();

    // Timeout de seguridad: asegurar que el loading desaparezca después de 3 segundos máximo
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Timeout de seguridad activado, ocultando loading");
        setIsLoading(false);
      }
    }, 3000);

    return () => clearTimeout(safetyTimeout);
  }, [isLoading]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include", // MUY IMPORTANTE para cookies
      });
      // Actualizar el estado local
      setIsLoggedIn(false);
      setUsuario("");
      setPassword("");
      setError("");
      setWarning("");
      setBloqueado(false);
      setIntentosRestantes(5);
      setTiempoBloqueo("");
      setUserInfo({
        usuario: "",
        email: "",
        isAdmin: false,
        empleado_ci: null,
      });
      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Aún así cerrar sesión localmente
      setIsLoggedIn(false);
      setUsuario("");
      setPassword("");
      setError("");
      setWarning("");
      setBloqueado(false);
      setIntentosRestantes(5);
      setTiempoBloqueo("");
      setUserInfo({
        usuario: "",
        email: "",
        isAdmin: false,
        empleado_ci: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar estados anteriores
    setError("");
    setWarning("");
    setBloqueado(false);
    setTiempoBloqueo("");

    if (!usuario || !password) {
      setError("Debes ingresar usuario y contraseña");
      return;
    }

    try {
      // Validación de credenciales
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // MUY IMPORTANTE para cookies
        body: JSON.stringify({ usuario, contrasena: password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Login exitoso
        setError("");
        setWarning("");
        setBloqueado(false);
        setIsLoggedIn(true);
        setUserInfo({
          usuario: data.usuario,
          email: data.email,
          isAdmin: data.isAdmin,
          empleado_ci: data.empleado_ci,
        });
        console.log("Login exitoso", "Admin:", data.isAdmin);
      } else if (res.status === 423) {
        // Usuario bloqueado
        setBloqueado(true);
        setError(
          data.message ||
            "Tu cuenta está bloqueada por múltiples intentos fallidos"
        );

        // Usar tiempo restante pre-calculado del backend
        if (
          data.tiempoRestanteHoras !== undefined &&
          data.tiempoRestanteMinutos !== undefined
        ) {
          const horas = data.tiempoRestanteHoras;
          const minutos = data.tiempoRestanteMinutos;

          if (horas > 0) {
            setTiempoBloqueo(`${horas}h ${minutos}m restantes`);
          } else if (minutos > 0) {
            setTiempoBloqueo(`${minutos}m restantes`);
          } else {
            setTiempoBloqueo("Menos de 1 minuto restante");
          }
        } else if (data.tiempoRestante) {
          // Fallback si no vienen los valores pre-calculados
          const horas = Math.floor(data.tiempoRestante / (1000 * 60 * 60));
          const minutos = Math.floor(
            (data.tiempoRestante % (1000 * 60 * 60)) / (1000 * 60)
          );

          if (horas > 0) {
            setTiempoBloqueo(`${horas}h ${minutos}m restantes`);
          } else if (minutos > 0) {
            setTiempoBloqueo(`${minutos}m restantes`);
          } else {
            setTiempoBloqueo("Menos de 1 minuto restante");
          }
        }

        console.log("Usuario bloqueado:", data.message);
      } else if (res.status === 401) {
        // Credenciales incorrectas
        setError(data.message || "Usuario o contraseña incorrectos");

        // Mostrar intentos restantes si están disponibles
        if (data.intentosRestantes !== undefined) {
          setIntentosRestantes(data.intentosRestantes);

          if (data.intentosRestantes <= 2 && data.intentosRestantes > 0) {
            setWarning(
              `⚠️ Solo te quedan ${data.intentosRestantes} intento${
                data.intentosRestantes === 1 ? "" : "s"
              } antes del bloqueo`
            );
          }
        }

        // Mostrar advertencia específica si está disponible
        if (data.warning) {
          setWarning(data.warning);
        }

        console.log(
          "Credenciales incorrectas. Intentos restantes:",
          data.intentosRestantes
        );
      } else {
        // Otros errores
        setError(data.message || data.error || "Error al iniciar sesión");
        console.error("Error en login:", data);
      }
    } catch (error) {
      console.error("Error de red en login:", error);
      setError("Error de conexión. Verifica que el servidor esté funcionando.");
    }
  };

  // Mostrar loading mientras verifica sesión
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            border: "4px solid #e0e0e0",
            borderTop: "4px solid #ff8c42",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            mb: 2,
          }}
        />
        <Typography variant="body1" color="text.secondary">
          Cargando...
        </Typography>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Box>
    );
  }

  // Si está logueado, mostrar el dashboard
  if (isLoggedIn) {
    return <DashboardPrincipal onLogout={handleLogout} userInfo={userInfo} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        className="login-container"
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          minHeight: "100vh",
        }}
      >
        {/* Lado izquierdo */}
        <Box
          className="left-side"
          sx={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            display: { xs: "none", md: "flex" }, // ocultar ilustración en móviles
            justifyContent: "center",
            alignItems: "center",
            background:
              "linear-gradient(135deg, #ff8c42 0%, #ff6b1a 50%, #e55a00 100%)",
          }}
        >
          {/* Contenedor de logo y letras en fila */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0, // espacio entre logo y letras
              zIndex: 1,
            }}
          >
            <img
              src="/logo.png"
              alt="Logo MR"
              style={{
                width: "400px",
                height: "400px",
                objectFit: "contain",
                filter: "brightness(1) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              }}
            />
            <img
              src="/letras.png"
              alt="Multiservicio Renacer"
              style={{
                width: "450px",
                height: "auto",
                objectFit: "contain",
                filter: "brightness(1) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                marginLeft: "-200px",
              }}
            />
          </Box>

          {/* Decorativos circulares */}
          <Box
            sx={{
              position: "absolute",
              top: "20%",
              left: "10%",
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "20%",
              right: "15%",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.15)",
              animation: "pulse 2s ease-in-out infinite 1s",
            }}
          />
        </Box>

        {/* Lado derecho */}
        <Box
          className="right-side"
          sx={{
            flex: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: "url(/fondo.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.4,
              zIndex: 1,
            }}
          />

          <Container
            maxWidth={isMobile ? "xs" : "sm"}
            sx={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              py: isMobile ? 3 : 4,
              px: isMobile ? 2 : undefined,
            }}
          >
            <Paper
              elevation={20}
              sx={{
                p: isMobile ? 2 : { xs: 3, sm: 4, md: 5 },
                width: "100%",
                maxWidth: isMobile ? "100%" : 450,
                backgroundColor: "rgba(30, 30, 30, 0.95)",
                backdropFilter: "blur(15px)",
                borderRadius: 4,
                textAlign: "center",
                border: "1px solid rgba(255, 140, 66, 0.2)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Typography
                variant={isMobile ? "h5" : "h3"}
                color="primary"
                sx={{
                  mb: 1,
                  fontWeight: "bold",
                  fontSize: isMobile
                    ? "1.5rem"
                    : { xs: "2rem", sm: "2.5rem", md: "3rem" },
                  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
                  background: "linear-gradient(45deg, #ff8c42, #ff6b1a)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Iniciar Sesión
              </Typography>

              <Typography
                variant="body1"
                color="rgba(255, 255, 255, 0.7)"
                sx={{ mb: 2, fontSize: isMobile ? "0.95rem" : "1rem" }}
              >
                Accede a tu cuenta
              </Typography>

              {/* Información de seguridad */}
              {!bloqueado && intentosRestantes < 5 && (
                <Box
                  sx={{
                    backgroundColor: "rgba(33, 150, 243, 0.05)",
                    border: "1px solid rgba(33, 150, 243, 0.2)",
                    borderRadius: 2,
                    p: 1.5,
                    mb: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "rgba(255, 255, 255, 0.7)",
                      textAlign: "center",
                    }}
                  >
                    🔐 Por seguridad, se bloquearán las cuentas después de 5
                    intentos fallidos
                  </Typography>
                </Box>
              )}

              {/* Mensaje de error general */}
              {error && (
                <Box
                  sx={{
                    backgroundColor: bloqueado
                      ? "rgba(244, 67, 54, 0.15)"
                      : "rgba(244, 67, 54, 0.1)",
                    border: bloqueado
                      ? "1px solid rgba(244, 67, 54, 0.5)"
                      : "1px solid rgba(244, 67, 54, 0.3)",
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <Typography
                    color="error"
                    sx={{
                      fontWeight: "bold",
                      fontSize: bloqueado ? "1rem" : "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    {bloqueado && "🔒"} {error}
                  </Typography>

                  {/* Mostrar tiempo de bloqueo si está disponible */}
                  {bloqueado && tiempoBloqueo && (
                    <Typography
                      color="error"
                      sx={{
                        fontSize: "0.8rem",
                        mt: 1,
                        opacity: 0.8,
                      }}
                    >
                      ⏰ {tiempoBloqueo}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Mensaje de advertencia (intentos restantes) */}
              {warning && !error && (
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                    border: "1px solid rgba(255, 152, 0, 0.3)",
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      color: "#ff9800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    {warning}
                  </Typography>
                </Box>
              )}

              {/* Contador de intentos (solo si no hay error ni está bloqueado) */}
              {!error && !bloqueado && intentosRestantes < 5 && (
                <Box
                  sx={{
                    backgroundColor: "rgba(33, 150, 243, 0.1)",
                    border: "1px solid rgba(33, 150, 243, 0.3)",
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#2196f3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    💡 Intentos restantes: {intentosRestantes}/5
                  </Typography>
                </Box>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label="Usuario"
                  variant="outlined"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={bloqueado}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: bloqueado
                          ? "rgba(244, 67, 54, 0.3)"
                          : "rgba(255, 140, 66, 0.5)",
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                        borderColor: bloqueado
                          ? "rgba(244, 67, 54, 0.3)"
                          : "primary.main",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: bloqueado
                          ? "rgba(244, 67, 54, 0.3)"
                          : "primary.main",
                      },
                      backgroundColor: bloqueado
                        ? "rgba(255, 255, 255, 0.02)"
                        : "rgba(255, 255, 255, 0.05)",
                      borderRadius: 3,
                      opacity: bloqueado ? 0.6 : 1,
                    },
                    "& .MuiInputLabel-root": {
                      color: bloqueado
                        ? "rgba(244, 67, 54, 0.6)"
                        : "rgba(255, 255, 255, 0.8)",
                      fontWeight: 500,
                    },
                    "& .MuiOutlinedInput-input": {
                      color: bloqueado ? "rgba(255, 255, 255, 0.4)" : "white",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={bloqueado}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    mb: 4,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: bloqueado
                          ? "rgba(244, 67, 54, 0.3)"
                          : "rgba(255, 140, 66, 0.5)",
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                        borderColor: bloqueado
                          ? "rgba(244, 67, 54, 0.3)"
                          : "primary.main",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: bloqueado
                          ? "rgba(244, 67, 54, 0.3)"
                          : "primary.main",
                      },
                      backgroundColor: bloqueado
                        ? "rgba(255, 255, 255, 0.02)"
                        : "rgba(255, 255, 255, 0.05)",
                      borderRadius: 3,
                      opacity: bloqueado ? 0.6 : 1,
                    },
                    "& .MuiInputLabel-root": {
                      color: bloqueado
                        ? "rgba(244, 67, 54, 0.6)"
                        : "rgba(255, 255, 255, 0.8)",
                      fontWeight: 500,
                    },
                    "& .MuiOutlinedInput-input": {
                      color: bloqueado ? "rgba(255, 255, 255, 0.4)" : "white",
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? "large" : "large"}
                  disabled={bloqueado}
                  sx={{
                    py: isMobile ? 1.5 : 2,
                    fontSize: isMobile ? "1rem" : "1.1rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    borderRadius: 3,
                    background: bloqueado
                      ? "linear-gradient(45deg, #666, #555)"
                      : "linear-gradient(45deg, #ff8c42, #ff6b1a)",
                    "&:hover": {
                      background: bloqueado
                        ? "linear-gradient(45deg, #666, #555)"
                        : "linear-gradient(45deg, #ff6b1a, #e55a00)",
                    },
                    "&:disabled": {
                      color: "rgba(255, 255, 255, 0.4)",
                      cursor: "not-allowed",
                    },
                  }}
                >
                  {bloqueado ? "🔒 CUENTA BLOQUEADA" : "INGRESAR"}
                </Button>
              </Box>

              {/* Botón especial para usuarios bloqueados */}
              {bloqueado && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      // Aquí podrías abrir un modal, enviar email, etc.
                      alert(
                        "Contacta al administrador del sistema para desbloquear tu cuenta.\n\nTel: +591 XXX-XXXX\nEmail: admin@empresa.com"
                      );
                    }}
                    sx={{
                      py: 1.5,
                      fontSize: "0.95rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      borderRadius: 3,
                      borderColor: "rgba(255, 140, 66, 0.5)",
                      color: "rgba(255, 140, 66, 0.8)",
                      "&:hover": {
                        borderColor: "primary.main",
                        color: "primary.main",
                        backgroundColor: "rgba(255, 140, 66, 0.05)",
                      },
                    }}
                  >
                    📞 Contactar Administrador
                  </Button>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                  flexWrap: "wrap",
                  pt: 2,
                }}
              >
                {!bloqueado && (
                  <>
        
                  </>
                )}

                {bloqueado && (
                  <Typography
                    variant="body2"
                    color="rgba(255, 255, 255, 0.6)"
                    sx={{ fontSize: "0.85rem", textAlign: "center" }}
                  >
                    Tu cuenta se desbloqueará automáticamente después del tiempo
                    indicado
                  </Typography>
                )}
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
