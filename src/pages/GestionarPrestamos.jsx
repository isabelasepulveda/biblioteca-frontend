import { useState, useEffect } from 'react';
import api from '../api'; // 🚀 CORREGIDO: Usamos tu instancia centralizada de Axios con la URL de Render
import { useNavigate, Link } from 'react-router-dom';

export default function GestionarPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [libros, setLibros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  // 📅 Estado del formulario acoplado al calendario mediante "fecha_devolucion"
  const [form, setForm] = useState({ id_libro: '', id_usuario: '', fecha_devolucion: '' });
  const [modo, setModo] = useState('lista');
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // 🔍 ESTADOS NUEVOS PARA EL BUSCADOR
  const [buscarLibro, setBuscarLibro] = useState('');
  const [mostrarListaLibros, setMostrarListaLibros] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const cargarDatos = async () => {
    try {
      // 🚀 CORREGIDO: Quitamos el localhost y la llave de cierre fantasma que rompía la función
      const resP = await api.get('/prestamos');
      setPrestamos(resP.data || []);
      
      if (modo === 'nuevo') {
        const resL = await api.get('/libros');
        setLibros(resL.data.filter(l => l.cantidad_disponible > 0) || []);
        
        const resU = await api.get('/usuarios');
        // Filtramos usuarios activos o dejamos todos los disponibles si no mapean 'estado'
        setUsuarios(resU.data || []);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
      setPrestamos([]);
    }
  };

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

    cargarDatos();
    setCargando(false);
  }, [token, navigate, modo]);

  const registrarPrestamo = async (e) => {
    e.preventDefault();
    try {
      // 🚀 CORREGIDO: Conexión directa al backend en producción a través de la instancia api
      await api.post('/prestamos', form);
      alert('✅ Préstamo registrado correctamente');
      setModo('lista');
      setForm({ id_libro: '', id_usuario: '', fecha_devolucion: '' });
      setBuscarLibro(''); // Limpiamos el buscador también
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert('❌ ' + (err.response?.data?.mensaje || 'Error al registrar'));
    }
  };

  const devolverLibro = async (id) => {
    if (!window.confirm('¿Marcar este libro como DEVUELTO?')) return;
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });
    try {
      // 🚀 CORREGIDO: Petición de devolución apuntando al endpoint real en la nube sin localhost
      const res = await api.put(`/prestamos/devolver/${id}`, {});
      setMensaje({ texto: res.data.mensaje, tipo: 'exito' });
      cargarDatos(); 
    } catch (e) {
      console.error("ERROR DEVOLVER:", e.response?.data);
      setMensaje({ 
        texto: `❌ ${e.response?.data?.mensaje || 'No se pudo devolver'}`, 
        tipo: 'error' 
      });
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  // ✨ CORREGIDO: Evita por completo los textos "Invalid Date" convirtiendo strings YYYY-MM-DD directamente
  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return 'S/F';
    
    if (typeof fechaRaw === 'string' && fechaRaw.includes('-')) {
      const partes = fechaRaw.split('T')[0].split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`; 
      }
    }

    const date = new Date(fechaRaw);
    if (isNaN(date.getTime())) return 'S/F';
    
    const dia = String(date.getUTCDate()).padStart(2, '0');
    const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
    const anio = date.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  // 🔍 FUNCIÓN PARA FILTRAR LIBROS
  const librosFiltrados = libros.filter(libro =>
    libro.titulo.toLowerCase().includes(buscarLibro.toLowerCase())
  );

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-bold text-blue-600">Cargando...</div>
      </div>
    );
  }

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
            <button onClick={cerrarSesion} className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-md">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex flex-col md:flex-row flex-1 p-6 gap-6">
        <aside className="w-full md:w-64 bg-white rounded-2xl shadow-lg p-5 h-fit border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Menú</h2>
          <nav className="flex flex-col gap-2">
            <Link to="/dashboard" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">📊 Inicio</Link>
            <Link to="/catalogo" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">📚 Catálogo de libros</Link>
            
            {usuario?.id_rol !== 1 && (
              <>
                <Link to="/mis-prestamos" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">📖 Mis Préstamos</Link>
              </>
            )}

            {(usuario?.id_rol === 1 || usuario?.id_rol === 2) && (
              <>
                <Link to="/gestionar-prestamos" className="bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm">📝 Gestionar Préstamos</Link>
                <Link to="/gestionar-libros" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">📖 Gestionar Libros</Link>
                {usuario?.id_rol === 1 && (
                  <Link to="/gestionar-usuarios" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">👥 Gestionar Usuarios</Link>
                )}
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[28px] font-bold text-gray-800">📝 Gestión de Préstamos</h2>
            <button 
              onClick={() => setModo(modo === 'lista' ? 'nuevo' : 'lista')}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
            >
              {modo === 'lista' ? '+ Nuevo Préstamo' : '← Volver a lista'}
            </button>
          </div>

          {mensaje.texto && (
            <div className={`p-4 mb-4 rounded-xl font-bold shadow-sm ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {mensaje.texto}
            </div>
          )}

          {modo === 'nuevo' ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <form onSubmit={registrarPrestamo} className="max-w-lg">
                
                {/* 🔽 CAMPO DE LIBRO CON BUSCADOR INTELIGENTE */}
                <div className="mb-4 relative">
                  <label className="block text-gray-700 font-bold mb-2">Libro:</label>
                  
                  {/* Input de búsqueda */}
                  <input
                    type="text"
                    placeholder="🔍 Escribe para buscar..."
                    value={buscarLibro}
                    onChange={(e) => {
                      setBuscarLibro(e.target.value);
                      setMostrarListaLibros(true);
                      // Si escribimos, limpiamos la selección anterior
                      if (form.id_libro) setForm({...form, id_libro: ''});
                    }}
                    onFocus={() => setMostrarListaLibros(true)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />

                  {/* Lista desplegable con resultados filtrados */}
                  {mostrarListaLibros && (
                    <div 
                      className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      onMouseLeave={() => setMostrarListaLibros(false)}
                    >
                      {/* Opción por defecto */}
                      <div
                        onClick={() => {
                          setForm({...form, id_libro: ''});
                          setBuscarLibro('');
                          setMostrarListaLibros(false);
                        }}
                        className="p-2 text-gray-500 hover:bg-blue-50 cursor-pointer"
                      >
                        Seleccione libro
                      </div>

                      {/* Resultados filtrados */}
                      {librosFiltrados.length === 0 ? (
                        <div className="p-2 text-gray-500">No se encontraron libros</div>
                      ) : (
                        librosFiltrados.map(libro => (
                          <div
                            key={libro.id_libro}
                            onClick={() => {
                              setForm({...form, id_libro: libro.id_libro});
                              setBuscarLibro(libro.titulo); // Pone el nombre en el input
                              setMostrarListaLibros(false);
                            }}
                            className={`p-2 cursor-pointer ${
                              form.id_libro === libro.id_libro 
                                ? 'bg-blue-500 text-white' 
                                : 'hover:bg-blue-50'
                            }`}
                          >
                            {libro.titulo}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Usuario:</label>
                  <select 
                    value={form.id_usuario} 
                    onChange={(e) => setForm({...form, id_usuario: e.target.value})} 
                    required 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">Seleccione usuario</option>
                    {usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} ({u.rol || 'Usuario'})</option>)}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-bold mb-2">Fecha Límite de Devolución:</label>
                  <input 
                    type="date" 
                    value={form.fecha_devolucion} 
                    min={new Date().toISOString().split('T')[0]} 
                    onChange={(e) => setForm({...form, fecha_devolucion: e.target.value})} 
                    required
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700" 
                  />
                </div>

                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md">
                  Guardar Préstamo
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left p-4 font-bold text-gray-700">Libro</th>
                    <th className="text-left p-4 font-bold text-gray-700">Usuario</th>
                    <th className="text-left p-4 font-bold text-gray-700">Fecha Préstamo</th>
                    <th className="text-left p-4 font-bold text-gray-700">Límite</th>
                    <th className="text-left p-4 font-bold text-gray-700">Estado</th>
                    <th className="text-left p-4 font-bold text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamos.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-gray-500 font-medium">
                        No hay préstamos registrados
                      </td>
                    </tr>
                  ) : prestamos.map(p => (
                    <tr key={p.id_prestamo} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium">{p.titulo}</td>
                      <td className="p-4 font-medium">{p.nombre}</td>
                      <td className="p-4 font-medium">{formatearFecha(p.fecha_prestamo)}</td>
                      {/* 🚀 CORREGIDO: Soportamos tanto fecha_devolucion como fecha_limite mapeados desde el backend */}
                      <td className="p-4 font-medium text-amber-700 font-bold">{formatearFecha(p.fecha_devolucion || p.fecha_limite)}</td>
                      <td className="p-4">
                        <span className={`font-bold px-3 py-1 rounded-full text-sm ${p.estado === 'Activo' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        {p.estado === 'Activo' && (
                          <button 
                            onClick={() => devolverLibro(p.id_prestamo)} 
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-700 transition-all text-sm"
                          >
                            Devolver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}