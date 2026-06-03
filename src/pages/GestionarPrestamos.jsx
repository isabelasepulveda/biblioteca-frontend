import { useState, useEffect } from 'react';
import axios from 'axios';
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
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const cargarDatos = async () => {
    try {
      const resP = await axios.get('http://localhost:3000/api/prestamos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrestamos(resP.data || []);
      
      if (modo === 'nuevo') {
        const resL = await axios.get('http://localhost:3000/api/libros', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLibros(resL.data.filter(l => l.cantidad_disponible > 0) || []);
        
        const resU = await axios.get('http://localhost:3000/api/usuarios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsuarios(resU.data.filter(u => u.estado) || []);
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
      await axios.post('http://localhost:3000/api/prestamos', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Préstamo registrado correctamente');
      setModo('lista');
      setForm({ id_libro: '', id_usuario: '', fecha_devolucion: '' });
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
      const res = await axios.put(`http://localhost:3000/api/prestamos/devolver/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
                <Link to="/mis-reservas" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">🔖 Mis Reservas</Link>
              </>
            )}

            {(usuario?.id_rol === 1 || usuario?.id_rol === 2) && (
              <>
                <Link to="/gestionar-prestamos" className="bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm">📝 Gestionar Préstamos</Link>
                <Link to="/gestionar-libros" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">📖 Gestionar Libros</Link>
                {usuario?.id_rol === 1 && (
                  <Link to="/gestionar-usuarios" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">👥 Gestionar Usuarios</Link>
                )}
                <Link to="/reportes" className="py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">📊 Ver Reportes</Link>
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
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Libro:</label>
                  <select 
                    value={form.id_libro} 
                    onChange={(e) => setForm({...form, id_libro: e.target.value})} 
                    required 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">Seleccione libro</option>
                    {libros.map(l => <option key={l.id_libro} value={l.id_libro}>{l.titulo}</option>)}
                  </select>
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
                    {usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} ({u.rol})</option>)}
                  </select>
                </div>

                {/* 📅 Calendario Nativo implementado */}
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
                      <td className="p-4 font-medium text-amber-700 font-bold">{formatearFecha(p.fecha_devolucion)}</td>
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