import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// ✅ Importamos TODAS las páginas
import Landing from './pages/Landing';       // 🆕 Página de inicio/portada
import Login from './pages/Login';           // Inicio de sesión
import Register from './pages/Register';     // Registro
import Dashboard from './pages/Dashboard';
import GestionarLibros from './pages/GestionarLibros';
import GestionarUsuarios from './pages/GestionarUsuarios';
import Catalogo from './pages/Catalogo';
import MisPrestamos from './pages/MisPrestamos';
import GestionarPrestamos from './pages/GestionarPrestamos';

// ✅ CONFIGURACIÓN FINAL DE RUTAS
const router = createBrowserRouter([
  {
    path: '/',              // 🏠 AL ENTRAR: Página de presentación
    element: <Landing />
  },
  {
    path: '/login',         // 🔑 Inicio de sesión
    element: <Login />
  },
  {
    path: '/registro',       // 📝 Registro de cuenta
    element: <Register />
  },
  {
    path: '/dashboard',     // 📊 Panel principal
    element: <Dashboard />
  },
  {
    path: '/catalogo',       // 📚 Catálogo de libros
    element: <Catalogo />
  },
  {
    path: '/mis-prestamos',  // 📖 Mis préstamos (estudiantes)
    element: <MisPrestamos />
  },
  {
    path: '/gestionar-libros',     // 📖 Gestión de libros
    element: <GestionarLibros />
  },
  {
    path: '/gestionar-usuarios',   // 👥 Gestión de usuarios
    element: <GestionarUsuarios />
  },
  {
    path: '/gestionar-prestamos',  // 📝 Gestión de préstamos
    element: <GestionarPrestamos />
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}