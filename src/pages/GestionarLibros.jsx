import { useState, useEffect } from 'react';
import api from '../api'; 
import { useNavigate } from 'react-router-dom';

export default function GestionarLibros() {
  const [libros, setLibros] = useState([]);
  const [categorias, setCategorias] = useState([]); // 📁 Estado para cargar categorías
  const [formulario, setFormulario] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    id_categoria: '', // 🔄 Guarda el ID numérico
    editorial: '',
    anio_publicacion: '',
    cantidad_total: '',
    cantidad_disponible: ''
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const datosUsuario = localStorage.getItem('usuario');
    if (!token || !datosUsuario) { navigate('/login'); return; }
    try {
      const usuario = JSON.parse(datosUsuario);
      if (usuario.id_rol !== 1 && usuario.id_rol !== 2) {
        setMensaje({ texto: '❌ Acceso solo para Administradores o Bibliotecarios', tipo: 'error' });
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }
      cargarLibros();
      cargarCategorias(); // 📁 Carga las categorías al iniciar
    } catch (e) { navigate('/login'); }
  }, [token, navigate]);

  const cargarLibros = async () => {
    setCargando(true);
    try {
      const res = await api.get('/libros');
      setLibros(res.data);
    } catch (e) {
      setMensaje({ texto: '⚠️ No se pudieron cargar los libros', tipo: 'error' });
    } finally { 
      setCargando(false); 
      setTimeout(() => setMensaje({texto:'',tipo:''}), 3000); 
    }
  };

  // 📁 FUNCIÓN CORREGIDA AL 100% - RUTA QUE SÍ EXISTE
  const cargarCategorias = async () => {
    try {
      // ✅ RUTA CORRECTA: esta es la que está definida en tu libroRoutes.js
      const res = await api.get('/libros/categorias');
      setCategorias(res.data || []);
      console.log("✅ Categorías cargadas:", res.data);
    } catch (e) {
      console.error("❌ Error al cargar:", e);
      setMensaje({ texto: '⚠️ No se pudieron cargar las categorías', tipo: 'error' });
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormulario(prev => ({...prev, [name]: value}));
  };

  const guardarLibro = async (e) => {
    e.preventDefault(); 
    setCargando(true);

    if (!formulario.titulo || !formulario.autor || !formulario.isbn || !formulario.cantidad_total || !formulario.cantidad_disponible || !formulario.id_categoria) {
      setMensaje({ texto: '❌ Completa todos los campos obligatorios (incluyendo categoría)', tipo: 'error' });
      setCargando(false); 
      return;
    }

    if (Number(formulario.cantidad_total) < 1) {
      setMensaje({ texto: '❌ Cantidad total debe ser mayor a 0', tipo: 'error' });
      setCargando(false); return;
    }
    if (Number(formulario.cantidad_disponible) < 0) {
      setMensaje({ texto: '❌ Disponibles no puede ser negativo', tipo: 'error' });
      setCargando(false); return;
    }
    if (Number(formulario.cantidad_disponible) > Number(formulario.cantidad_total)) {
      setMensaje({ texto: '❌ Disponibles no puede ser mayor al total', tipo: 'error' });
      setCargando(false); return;
    }

    try {
      const datos = {
        titulo: formulario.titulo.trim(),
        autor: formulario.autor.trim(),
        isbn: formulario.isbn.trim(),
        id_categoria: parseInt(formulario.id_categoria), // 🔄 Convertido a número
        editorial: formulario.editorial?.trim() || null,
        anio_publicacion: formulario.anio_publicacion ? parseInt(formulario.anio_publicacion) : null,
        cantidad_total: parseInt(formulario.cantidad_total),
        cantidad_disponible: parseInt(formulario.cantidad_disponible)
      };

      let res;
      if (modoEdicion) {
        res = await api.put(`/libros/${idEdicion}`, datos);
      } else {
        res = await api.post('/libros', datos);
      }
      
      setMensaje({ texto: res.data.mensaje || '✅ Operación exitosa', tipo: 'exito' });
      reiniciarFormulario(); 
      cargarLibros();

    } catch (e) {
      setMensaje({ 
        texto: `❌ ${e.response?.data?.mensaje || 'Error en el servidor'}`, 
        tipo: 'error' 
      });
    } finally { 
      setCargando(false); 
    }
  };

  const editarLibro = (libro) => {
    setFormulario({
      titulo: libro.titulo ?? '',
      autor: libro.autor ?? '',
      isbn: libro.isbn ?? '',
      id_categoria: libro.id_categoria ?? '',
      editorial: libro.editorial ?? '',
      anio_publicacion: libro.anio_publicacion ?? '',
      cantidad_total: libro.cantidad_total ?? '',
      cantidad_disponible: libro.cantidad_disponible ?? ''
    });
    setModoEdicion(true);
    setIdEdicion(libro.id_libro);
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const eliminarLibro = async (id) => {
    if (!window.confirm('¿Eliminar este libro?')) return;
    setCargando(true);
    try {
      const res = await api.delete(`/libros/${id}`);
      setMensaje({ texto: res.data.mensaje || '✅ Libro eliminado', tipo: 'exito' });
      cargarLibros();
    } catch (e) {
      setMensaje({ 
        texto: `❌ ${e.response?.data?.mensaje || 'No se pudo eliminar'}`, 
        tipo: 'error' 
      });
    } finally { 
      setCargando(false); 
    }
  };

  const reiniciarFormulario = () => {
    setFormulario({ titulo:'', autor:'', isbn:'', id_categoria:'', editorial:'', anio_publicacion:'', cantidad_total:'', cantidad_disponible:'' });
    setModoEdicion(false); 
    setIdEdicion(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6 flex justify-center">
      <div className="w-full max-w-[900px]">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-2xl">
              <span className="text-white text-xl font-bold">📚</span>
            </div>
            <div>
              <h1 className="text-[clamp(1.8rem,3vw,2.4rem)] font-black text-white tracking-tight">Gestión de Libros</h1>
              <p className="text-blue-200 text-base">Panel de administración</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all shadow-lg font-semibold text-sm"
          >
            ← Volver al Panel
          </button>
        </div>

        {mensaje.texto && (
          <div className={`mb-6 p-3 rounded-lg font-bold text-center shadow-2xl border-l-8 ${
            mensaje.tipo === 'exito' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-rose-500/20 border-rose-400 text-rose-200'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {cargando && (
          <div className="text-center text-white py-2 mb-3 bg-white/10 rounded-lg shadow-inner text-sm">
            ⏳ Procesando...
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-[1.5rem] shadow-2xl p-6 md:p-8 mb-8 relative border-8 border-white/20 w-full">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
          
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
            {modoEdicion ? '✏️ Modo Edición' : '📝 Registrar Nuevo Libro'}
          </h2> 

          <form onSubmit={guardarLibro} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">Título <span className="text-rose-500">*</span></label>
              <input type="text" name="titulo" value={formulario.titulo} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-amber-500 outline-none transition-all shadow-inner"
                placeholder="Título del libro..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">Autor <span className="text-rose-500">*</span></label>
              <input type="text" name="autor" value={formulario.autor} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-amber-500 outline-none transition-all shadow-inner"
                placeholder="Nombre del autor..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">ISBN <span className="text-rose-500">*</span></label>
              <input type="text" name="isbn" value={formulario.isbn} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-amber-500 outline-none transition-all shadow-inner"
                placeholder="Código ISBN..."
              />
            </div>

            {/* 📁 SELECT DINÁMICO - AHORA SÍ CARGA LAS OPCIONES */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">Categoría <span className="text-rose-500">*</span></label>
              <select 
                name="id_categoria" 
                value={formulario.id_categoria} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-amber-500 outline-none transition-all shadow-inner font-semibold text-gray-700 cursor-pointer text-sm"
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">Editorial</label>
              <input type="text" name="editorial" value={formulario.editorial} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-amber-500 outline-none transition-all shadow-inner"
                placeholder="Nombre de la editorial..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">Año</label>
              <input type="number" name="anio_publicacion" value={formulario.anio_publicacion} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-amber-500 outline-none transition-all shadow-inner"
                placeholder="Año de publicación..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">Cantidad Total <span className="text-rose-500">*</span></label>
              <input type="number" name="cantidad_total" value={formulario.cantidad_total} onChange={handleChange} required min="1"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-amber-500 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">Disponibles <span className="text-rose-500">*</span></label>
              <input type="number" name="cantidad_disponible" value={formulario.cantidad_disponible} onChange={handleChange} required min="0"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-amber-500 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-3 mt-2 justify-center">
              <button type="submit" disabled={cargando}
                className="flex-1 min-w-[180px] py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all"
              >
                {modoEdicion ? '✏️ ACTUALIZAR' : '💾 GUARDAR LIBRO'}
              </button>
              {modoEdicion && (
                <button type="button" onClick={reiniciarFormulario}
                  className="py-3 px-6 bg-slate-500 text-white font-bold rounded-xl shadow-lg"
                >
                  ❌ CANCELAR
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla de Inventario */}
        <div className="bg-white rounded-[1.5rem] shadow-2xl p-6 border-8 border-white/20 w-full">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 text-center">📋 Inventario de Libros</h2>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white uppercase font-bold text-sm">
                  <th className="py-3 px-2">Título</th>
                  <th className="py-3 px-2">Autor</th>
                  <th className="py-3 px-2">ISBN</th>
                  <th className="py-3 px-2">Categoría</th>
                  <th className="py-3 px-2">Total</th>
                  <th className="py-3 px-2">Disp.</th>
                  <th className="py-3 px-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-slate-50 text-center">
                {libros.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-slate-500 italic font-semibold">📭 No hay libros registrados</td>
                  </tr>
                ) : (
                  libros.map((libro) => (
                    <tr key={libro.id_libro} className="hover:bg-indigo-50 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-800 text-sm">{libro.titulo}</td>
                      <td className="py-3 px-2 text-sm">{libro.autor}</td>
                      <td className="py-3 px-2 font-mono text-xs">{libro.isbn}</td>
                      <td className="py-3 px-2">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                          {libro.nombre_categoria || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-semibold text-sm">{libro.cantidad_total}</td>
                      <td className="py-3 px-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          {libro.cantidad_disponible}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => editarLibro(libro)} className="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs hover:bg-amber-600 transition-all">✏️ Editar</button>
                          <button onClick={() => eliminarLibro(libro.id_libro)} className="px-3 py-1.5 bg-rose-500 text-white font-bold rounded-lg text-xs hover:bg-rose-600 transition-all">🗑️ Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}