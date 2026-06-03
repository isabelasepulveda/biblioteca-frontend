import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Catalogo() {
  const [libros, setLibros] = useState([]);
  const [categorias, setCategorias] = useState([]); // 📁 ESTADO AGREGADO PARA LAS CATEGORÍAS DE LA BD
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  
  // 🌟 ESTADOS DE FILTRADO
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(''); // 🎯 ESTADO AGREGADO PARA EL SELECT

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login', {replace:true}); return; }
    const datosGuardados = localStorage.getItem('usuario');
    if (datosGuardados) setUsuario(JSON.parse(datosGuardados));

    const cargarDatosIniciales = async () => {
      try {
        // 1. Obtener los libros vinculados
        const resLibros = await api.get('/libros'); 
        setLibros(resLibros.data || []);

        // 2. Obtener las 15 categorías reales de la Base de Datos
        try {
          const resCategorias = await api.get('/categorias');
          setCategorias(resCategorias.data || []);
        } catch (catErr) {
          console.log("No se pudo mapear /categorias. Usando fallback seguro.");
        }

      } catch (error) {
        console.error('🔴 ERROR:', error.response);
        setMensaje(`❌ Error: ${error.response?.status || 'No se pudo conectar con el servidor'}`);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosIniciales();
  }, [token, navigate]);

  // ✅ FUNCIÓN DE PRÉSTAMO
  const solicitarPrestamo = async (idLibro, tituloLibro) => {
    try {
      setMensaje('');
      const idUsuario = usuario?.id_usuario;
      if (!idUsuario) { setMensaje('❌ No hay sesión activa'); return; }

      setCargando(true);
      await api.post('/prestamos', { id_libro: idLibro, id_usuario: idUsuario, dias: 7 });
      
      setMensaje(`✅ ¡Éxito! Solicitaste: "${tituloLibro}".`);
      
      // ✅ RECARGA AUTOMÁTICA PARA VER CANTIDAD ACTUALIZADA
      const resActualizado = await api.get('/libros');
      setLibros(resActualizado.data);

    } catch (error) {
      const errorMsg = error.response?.data?.detalle || error.response?.data?.mensaje || 'Error desconocido';
      setMensaje(`❌ Error: ${errorMsg}`);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => { 
    localStorage.clear(); 
    navigate('/login', { replace: true });
  };

  // 🌟 LÓGICA DE FILTRADO MULTI-CRITERIO EN TIEMPO REAL (Buscador + Categoría)
  const librosFiltrados = libros.filter((libro) => {
    const termino = busqueda.toLowerCase().trim();
    const coincideTitulo = libro.titulo?.toLowerCase().includes(termino) || false;
    const coincideAutor = libro.autor?.toLowerCase().includes(termino) || false;
    const coincideTexto = coincideTitulo || coincideAutor;

    // Filtro estricto por ID numérico de categoría
    const coincideCategoria = categoriaSeleccionada === '' || 
                              String(libro.id_categoria) === categoriaSeleccionada ||
                              libro.nombre_categoria === categoriaSeleccionada;

    return coincideTexto && coincideCategoria;
  });

  // Generador de respaldo de categorías en caso de que el endpoint falle
  const listadoCategoriasFiltro = categorias.length > 0 
    ? categorias 
    : [...new Set(libros.map(l => l.nombre_categoria || l.categoria).filter(Boolean))].map(c => ({ id_categoria: c, nombre: c }));

  if (cargando && libros.length === 0) return <div className="p-10 text-center text-xl font-bold text-blue-600">⌛ Cargando recursos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white p-5 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📚 Biblioteca</h1>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="font-bold">{usuario?.nombre || 'Usuario'}</p>
              <p className="text-sm">{usuario?.rol || ''}</p>
            </div>
            <button onClick={cerrarSesion} className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium">Cerrar sesión</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex flex-col md:flex-row p-6 gap-6">
        <aside className="w-full md:w-64 bg-white rounded-xl shadow p-5 h-fit">
          <h2 className="text-lg font-bold mb-4">Menú</h2>
          <nav className="flex flex-col gap-2">
            <Link to="/dashboard" className="p-3 rounded-xl hover:bg-blue-50 transition">📊 Inicio</Link>
            <Link to="/catalogo" className="p-3 rounded-xl bg-blue-600 text-white font-bold">📚 Catálogo</Link>
            {usuario?.id_rol === 3 && (<Link to="/mis-prestamos" className="p-3 rounded-xl hover:bg-blue-50 transition">📖 Mis Préstamos</Link>)}
            {(usuario?.id_rol === 1 || usuario?.id_rol === 2) && (<>
              <Link to="/gestionar-prestamos" className="p-3 rounded-xl hover:bg-blue-50 transition">📝 Gestionar Préstamos</Link>
              <Link to="/gestionar-libros" translate="no" className="p-3 rounded-xl hover:bg-blue-50 transition">📖 Gestionar Libros</Link>
              {usuario?.id_rol === 1 && (<Link to="/gestionar-usuarios" className="p-3 rounded-xl hover:bg-blue-50 transition">👥 Usuarios</Link>)}
            </>)}
          </nav>
        </aside>

        <main className="flex-1">
          <h2 className="text-2xl font-bold mb-4">Catálogo de Libros</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
            <p><strong>Estudiante:</strong> Ver y solicitar préstamos.</p>
            <p><strong>Personal:</strong> Administrar.</p>
          </div>

          {/* 🌟 CONTENEDOR FLEX: BARRA DE BÚSQUEDA + MENÚ DESPLEGABLE AL LADO */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 max-w-2xl">
            {/* Buscador */}
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por título o autor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              {busqueda && (
                <button 
                  onClick={() => setBusqueda('')} 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 📁 Selector de Categorías Dinámico */}
            <div className="relative min-w-[200px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                📁
              </span>
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none font-medium text-gray-700 cursor-pointer text-sm"
              >
                <option value="">Todas las categorías</option>
                {listadoCategoriasFiltro.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                ▼
              </div>
            </div>
          </div>

          {mensaje && <div className={`p-3 mb-4 rounded ${mensaje.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{mensaje}</div>}

          {/* Grid de Libros */}
          {librosFiltrados.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
              {libros.length === 0 ? 'No hay libros disponibles.' : '❌ No se encontraron resultados que coincidan con los filtros seleccionados.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {librosFiltrados.map((libro) => (
                <div key={libro.id_libro} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition flex flex-col justify-between border border-gray-100">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        📂 {libro.nombre_categoria || 'General'}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 text-slate-800 leading-snug">{libro.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-1"><strong>Autor:</strong> {libro.autor}</p>
                    <p className={`text-sm font-bold mb-3 ${libro.cantidad_disponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {libro.cantidad_disponible > 0 ? `Disponible: ${libro.cantidad_disponible}` : 'No disponible'}
                    </p>
                  </div>
                  {usuario?.id_rol === 3 && (
                    <button 
                      onClick={() => solicitarPrestamo(libro.id_libro, libro.titulo)}
                      disabled={libro.cantidad_disponible <= 0 || cargando}
                      className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400 hover:bg-blue-700 transition mt-auto font-bold text-sm shadow-sm"
                    >
                      {libro.cantidad_disponible > 0 ? 'Solicitar Préstamo' : 'Sin existencias'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}