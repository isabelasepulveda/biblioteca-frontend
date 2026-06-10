import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function GestionarLibros() {
  const [libros, setLibros] = useState([]);
  
  // ✅ CATEGORÍAS FIJAS DESDE EL CÓDIGO (edita aquí las que necesites)
  const categorias = [
    { id: 1, nombre: 'Ficción' },
    { id: 2, nombre: 'Ciencia y Tecnología' },
    { id: 3, nombre: 'Historia' },
    { id: 4, nombre: 'Literatura' },
    { id: 5, nombre: 'Infantil' },
    { id: 6, nombre: 'Biografía' },
    { id: 7, nombre: 'Arte y Cultura' },
    { id: 8, nombre: 'Educación' }
  ];

  const [form, setForm] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    id_categoria: '',
    editorial: '',
    anio_publicacion: '',
    cantidad_total: '',
    cantidad_disponible: ''
  });
  const [modo, setModo] = useState('lista');
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(false); // ✅ Quitamos carga automática que daba error
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // 🔍 BUSCADOR DE CATEGORÍAS
  const [buscarCategoria, setBuscarCategoria] = useState('');
  const [mostrarListaCategorias, setMostrarListaCategorias] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ✅ FUNCIÓN PARA CARGAR LIBROS (CON MANEJO DE ERROR 404)
  const cargarLibros = async () => {
    try {
      setCargando(true);
      const res = await api.get('/libros'); // ⚠️ Si tu ruta se llama distinto, cámbiala aquí
      setLibros(res.data || []);
    } catch (err) {
      console.warn('No se pudieron cargar los libros:', err.message);
      setLibros([]); // Si da error, dejamos lista vacía y no rompe nada
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    cargarLibros(); // Solo cargamos si hay token
  }, [token, navigate]);

  // 🔍 FILTRAR CATEGORÍAS
  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(buscarCategoria.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ✅ GUARDAR / ACTUALIZAR (CON CONTROL DE ERRORES)
  const registrarOActualizar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });
    try {
      if (editandoId) {
        await api.put(`/libros/${editandoId}`, form);
        setMensaje({ texto: '✅ Libro actualizado correctamente', tipo: 'exito' });
      } else {
        await api.post('/libros', form);
        setMensaje({ texto: '✅ Libro registrado correctamente', tipo: 'exito' });
      }
      // Limpiar formulario
      setModo('lista');
      setEditandoId(null);
      setForm({ titulo: '', autor: '', isbn: '', id_categoria: '', editorial: '', anio_publicacion: '', cantidad_total: '', cantidad_disponible: '' });
      setBuscarCategoria('');
      cargarLibros(); // Recargar lista
    } catch (err) {
      console.error('ERROR:', err);
      setMensaje({ 
        texto: `❌ ${err.response?.data?.mensaje || 'No se pudo guardar: Verifica la ruta o conexión'}`, 
        tipo: 'error' 
      });
    } finally {
      setCargando(false);
    }
  };

  const editarLibro = (libro) => {
    setForm({
      titulo: libro.titulo,
      autor: libro.autor,
      isbn: libro.isbn,
      id_categoria: libro.id_categoria,
      editorial: libro.editorial || '',
      anio_publicacion: libro.anio_publicacion || '',
      cantidad_total: libro.cantidad_total,
      cantidad_disponible: libro.cantidad_disponible
    });
    // Mostrar nombre de categoría
    const catNombre = categorias.find(c => c.id === parseInt(libro.id_categoria))?.nombre || '';
    setBuscarCategoria(catNombre);
    setEditandoId(libro.id_libro);
    setModo('nuevo');
    setMensaje({ texto: '', tipo: '' });
  };

  const eliminarLibro = async (id) => {
    if (!window.confirm('¿Eliminar este libro?')) return;
    setCargando(true);
    try {
      await api.delete(`/libros/${id}`);
      setMensaje({ texto: '✅ Libro eliminado', tipo: 'exito' });
      cargarLibros();
    } catch (err) {
      setMensaje({ texto: `❌ ${err.response?.data?.mensaje || 'No se pudo eliminar'}`, tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-xl font-bold text-white">Cargando...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-sm text-white p-6 shadow-lg border-b border-white/20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-2xl font-bold">📚</div>
            <div>
              <h1 className="text-3xl font-bold tracking-wider">Gestión de Libros</h1>
              <p className="text-blue-200">Panel de administración</p>
            </div>
          </div>
          <Link to="/dashboard" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md backdrop-blur-sm">
            ← Volver al Panel
          </Link>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[28px] font-bold text-white">Biblioteca</h2>
          <button 
            onClick={() => {
              setModo(modo === 'lista' ? 'nuevo' : 'lista');
              setEditandoId(null);
              setForm({ titulo: '', autor: '', isbn: '', id_categoria: '', editorial: '', anio_publicacion: '', cantidad_total: '', cantidad_disponible: '' });
              setBuscarCategoria('');
              setMensaje({ texto: '', tipo: '' });
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            {modo === 'lista' ? '+ Registrar Nuevo Libro' : '← Ver Lista'}
          </button>
        </div>

        {mensaje.texto && (
          <div className={`p-4 mb-6 rounded-xl font-bold shadow-lg backdrop-blur-sm ${mensaje.tipo === 'exito' ? 'bg-green-500/20 text-green-200 border border-green-400/30' : 'bg-red-500/20 text-red-200 border border-red-400/30'}`}>
            {mensaje.texto}
          </div>
        )}

        {modo === 'nuevo' ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              📝 {editandoId ? 'Editar Libro' : 'Registrar Nuevo Libro'}
            </h3>

            <form onSubmit={registrarOActualizar} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div>
                <label className="block text-white font-bold mb-2">Título *</label>
                <input
                  type="text"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                  placeholder="Título del libro..."
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Autor */}
              <div>
                <label className="block text-white font-bold mb-2">Autor *</label>
                <input
                  type="text"
                  name="autor"
                  value={form.autor}
                  onChange={handleChange}
                  required
                  placeholder="Nombre del autor..."
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-white font-bold mb-2">ISBN *</label>
                <input
                  type="text"
                  name="isbn"
                  value={form.isbn}
                  onChange={handleChange}
                  required
                  placeholder="Código ISBN..."
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* 🔽 CATEGORÍA CON BUSCADOR (FIJA DESDE CÓDIGO) */}
              <div className="relative">
                <label className="block text-white font-bold mb-2">Categoría *</label>
                <input
                  type="text"
                  placeholder="🔍 Seleccione una categoría..."
                  value={buscarCategoria}
                  onChange={(e) => {
                    setBuscarCategoria(e.target.value);
                    setMostrarListaCategorias(true);
                    if (form.id_categoria) setForm({...form, id_categoria: ''});
                  }}
                  onFocus={() => setMostrarListaCategorias(true)}
                  required
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />

                {mostrarListaCategorias && (
                  <div 
                    className="absolute z-20 w-full mt-1 bg-indigo-900/95 backdrop-blur-md border border-white/30 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                    onMouseLeave={() => setMostrarListaCategorias(false)}
                  >
                    <div
                      onClick={() => {
                        setForm({...form, id_categoria: ''});
                        setBuscarCategoria('');
                        setMostrarListaCategorias(false);
                      }}
                      className="p-2 text-blue-200 hover:bg-orange-500/30 cursor-pointer"
                    >
                      Seleccione una categoría
                    </div>

                    {categoriasFiltradas.length === 0 ? (
                      <div className="p-2 text-blue-200">No hay coincidencias</div>
                    ) : (
                      categoriasFiltradas.map(cat => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setForm({...form, id_categoria: cat.id});
                            setBuscarCategoria(cat.nombre);
                            setMostrarListaCategorias(false);
                          }}
                          className={`p-2 cursor-pointer ${form.id_categoria === cat.id ? 'bg-orange-500 text-white' : 'hover:bg-orange-500/30 text-white'}`}
                        >
                          {cat.nombre}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Editorial */}
              <div>
                <label className="block text-white font-bold mb-2">Editorial</label>
                <input
                  type="text"
                  name="editorial"
                  value={form.editorial}
                  onChange={handleChange}
                  placeholder="Nombre de la editorial..."
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Año */}
              <div>
                <label className="block text-white font-bold mb-2">Año</label>
                <input
                  type="number"
                  name="anio_publicacion"
                  value={form.anio_publicacion}
                  onChange={handleChange}
                  placeholder="Año de publicación..."
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Cantidad Total */}
              <div>
                <label className="block text-white font-bold mb-2">Cantidad Total *</label>
                <input
                  type="number"
                  name="cantidad_total"
                  value={form.cantidad_total}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 10"
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Disponibles */}
              <div>
                <label className="block text-white font-bold mb-2">Disponibles *</label>
                <input
                  type="number"
                  name="cantidad_disponible"
                  value={form.cantidad_disponible}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 8"
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Botón */}
              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg text-lg"
                >
                  {editandoId ? 'Actualizar Libro' : 'Guardar Libro'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/20 text-white">
                  <th className="p-4 text-left font-bold rounded-tl-lg">Título</th>
                  <th className="p-4 text-left font-bold">Autor</th>
                  <th className="p-4 text-left font-bold">Categoría</th>
                  <th className="p-4 text-left font-bold">ISBN</th>
                  <th className="p-4 text-left font-bold">Total</th>
                  <th className="p-4 text-left font-bold rounded-tr-lg">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {libros.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-blue-200 font-medium">
                      No hay libros registrados
                    </td>
                  </tr>
                ) : (
                  libros.map(libro => {
                    const nombreCat = categorias.find(c => c.id === parseInt(libro.id_categoria))?.nombre || 'Desconocida';
                    return (
                      <tr key={libro.id_libro} className="border-b border-white/10 text-white hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium">{libro.titulo}</td>
                        <td className="p-4">{libro.autor}</td>
                        <td className="p-4">{nombreCat}</td>
                        <td className="p-4 text-blue-200">{libro.isbn}</td>
                        <td className="p-4">{libro.cantidad_total}</td>
                        <td className="p-4">
                          <button
                            onClick={() => editarLibro(libro)}
                            className="bg-blue-500/80 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold mr-2 transition-all"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarLibro(libro.id_libro)}
                            className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold transition-all"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}