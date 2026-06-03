import { useState, useEffect } from 'react';
import api from '../api'; // 🚀 Importamos tu instancia centralizada de Axios (Configurada con Render)
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [datos, setDatos] = useState({
    totalLibros: 0,
    disponibles: 0,
    prestados: 0,
    usuariosRegistrados: 0,
    multasPendientes: 0
  });
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const datosGuardados = localStorage.getItem('usuario');
    if (datosGuardados) {
      try {
        const usuarioParseado = JSON.parse(datosGuardados);
        setUsuario(usuarioParseado);
      } catch (e) {
        localStorage.clear();
        navigate('/');
        return;
      }
    }

    const cargarDatos = async () => {
      try {
        const res = await api.get('/dashboard');
        
        setDatos({
          totalLibros: res.data.total_libros || 0,
          disponibles: Math.max(0, res.data.disponibles || 0),
          prestados: Math.max(0, res.data.prestados || 0),
          usuariosRegistrados: res.data.usuarios_registrados || 0,
          multasPendientes: res.data.multas_pendientes || 0
        });

      } catch (error) {
        console.error('Error al cargar datos:', error);
        setDatos({
          totalLibros: 0,
          disponibles: 0,
          prestados: 0,
          usuariosRegistrados: 0,
          multasPendientes: 0
        });
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [token, navigate]);

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-bold text-blue-600">Cargando...</div>
      </div>
    );
  }

  // 🧠 Normalizamos el rol a texto limpio para evitar fallas
  const esAdmin = usuario?.rol?.toLowerCase() === 'admin' || usuario?.rol?.toLowerCase() === 'administrador';
  const esBibliotecario = usuario?.rol?.toLowerCase() === 'bibliotecario';
  const esEstudiante = usuario?.rol?.toLowerCase() === 'usuario' || usuario?.rol?.toLowerCase() === 'estudiante';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider">📚 Biblioteca</h1>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="font-bold text-lg">{usuario?.nombre}</p>
              <p className="text-sm opacity-90">{usuario?.rol}</p>
            </div>
            <button 
              onClick={cerrarSesion}
              className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-md"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex flex-col md:flex-row flex-1 p-6 gap-6">
        <aside className="w-full md:w-64 bg-white rounded-2xl shadow-lg p-5 h-fit border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Menú</h2>
          <nav className="flex flex-col gap-2">
            <Link to="/dashboard" className="bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm">
              📊 Inicio
            </Link>

            <Link to="/catalogo" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">
              📚 Catálogo de libros
            </Link>

            {esEstudiante && (
              <Link to="/mis-prestamos" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">
                📖 Mis Préstamos
              </Link>
            )}

            {(esAdmin || esBibliotecario) && (
              <>
                <Link to="/gestionar-prestamos" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">
                  📝 Gestionar Préstamos
                </Link>
                <Link to="/gestionar-libros" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">
                  📖 Cultivar/Gestionar Libros
                </Link>
                {esAdmin && (
                  <Link to="/gestionar-usuarios" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">
                    👥 Gestionar Usuarios
                  </Link>
                )}
                {/* 🚀 BORRADO: 'Ver Reportes' ha sido eliminado correctamente de aquí */}
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1">
          <h2 className="text-[28px] font-bold text-gray-800 mb-6">Panel de Control</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:scale-105 transition-transform">
              <h3 className="text-gray-600 font-bold mb-2">Total de libros</h3>
              <p className="text-4xl font-bold text-blue-600">{datos.totalLibros}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:scale-105 transition-transform">
              <h3 className="text-gray-600 font-bold mb-2">Disponibles</h3>
              <p className="text-4xl font-bold text-green-600">{datos.disponibles}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:scale-105 transition-transform">
              <h3 className="text-gray-600 font-bold mb-2">Prestados</h3>
              <p className="text-4xl font-bold text-yellow-600">{datos.prestados}</p>
            </div>

            {(esAdmin || esBibliotecario) && (
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:scale-105 transition-transform">
                <h3 className="text-gray-600 font-bold mb-2">Usuarios registrados</h3>
                <p className="text-4xl font-bold text-purple-600">{datos.usuariosRegistrados}</p>
              </div>
            )}
          </div>

          {(esAdmin || esBibliotecario) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Panel de Personal</h3>
              <p className="text-gray-600 font-medium">
                Tienes acceso para administrar los recursos físicos de la biblioteca y controlar los flujos de préstamos.
              </p>
            </div>
          )}

          {esEstudiante && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bienvenido al sistema</h3>
              <p className="text-gray-600 font-medium">
                Aquí puedes consultar el catálogo y ver tus préstamos activos.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}