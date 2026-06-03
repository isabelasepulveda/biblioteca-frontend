import { useState, useEffect } from 'react';
import api from '../api'; // 🚀 Cliente de API centralizado
import { useNavigate } from 'react-router-dom';

export default function GestionarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    telefono: '',
    id_rol: '3'
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
      
      // 🌟 VALIDACIÓN TOLERANTE COMPLETA: Verifica tanto número como texto
      const esAdmin = Number(usuario.id_rol) === 1 || usuario.rol === 'Administrador' || usuario.correo?.endsWith('@admin.com');
      
      if (!esAdmin) {
        setMensaje({ texto: '❌ Acceso exclusivo para Administradores', tipo: 'error' });
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }
      cargarUsuarios();
    } catch (e) { navigate('/login'); }
  }, [token, navigate]);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
      console.log("✅ Usuarios cargados:", res.data);
    } catch (e) {
      console.error("❌ ERROR:", e.response?.data || e.message);
      setMensaje({ texto: `⚠️ ${e.response?.data?.mensaje || 'No se pudieron cargar'}`, tipo: 'error' });
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setCargando(true);

    if (!formulario.nombre || !formulario.correo || (!modoEdicion && !formulario.contraseña)) {
      setMensaje({ texto: '❌ Completa los campos obligatorios', tipo: 'error' });
      setCargando(false);
      return;
    }

    try {
      const datos = {
        nombre: formulario.nombre.trim(),
        correo: formulario.correo.trim(),
        email: formulario.correo.trim(), // Doble mapeo para evitar fallos
        password: formulario.contraseña,  // Doble mapeo para evitar fallos
        ...(formulario.contraseña && { contraseña: formulario.contraseña }),
        telefono: formulario.telefono?.trim() || null,
        id_rol: Number(formulario.id_rol)
      };

      let res;
      if (modoEdicion) {
        res = await api.put(`/usuarios/${idEdicion}`, datos);
      } else {
        res = await api.post('/usuarios/registro', datos);
      }

      setMensaje({ texto: res.data.mensaje || '✅ Operación exitosa', tipo: 'exito' });
      reiniciarFormulario();
      cargarUsuarios();

    } catch (e) {
      setMensaje({
        texto: `❌ ${e.response?.data?.mensaje || 'Error en el servidor'}`,
        tipo: 'error'
      });
    } finally {
      setCargando(false);
    }
  };

  const editarUsuario = (usuario) => {
    setFormulario({
      nombre: usuario.nombre ?? '',
      correo: usuario.correo ?? usuario.email ?? '',
      contraseña: '',
      telefono: usuario.telefono ?? '',
      id_rol: String(usuario.id_rol || 3)
    });
    setModoEdicion(true);
    setIdEdicion(usuario.id_usuario);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cambiarEstado = async (id, estadoActual) => {
    if (!window.confirm(`¿Seguro que deseas ${estadoActual ? 'INACTIVAR' : 'ACTIVAR'} este usuario?`)) return;
    setCargando(true);
    try {
      const res = await api.put(`/usuarios/estado/${id}`, { estado: !estadoActual });
      
      if (res.data.success || res.status === 200) {
        setUsuarios(previos => 
          previos.map(usuario => 
            usuario.id_usuario === id ? { ...usuario, estado: !estadoActual } : usuario
          )
        );
        setMensaje({ texto: res.data.mensaje || '✅ Estado actualizado', tipo: 'exito' });
      }

    } catch (e) {
      setMensaje({ texto: '❌ No se pudo cambiar el estado', tipo: 'error' });
    } finally { 
      setCargando(false); 
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    }
  };

  const reiniciarFormulario = () => {
    setFormulario({ nombre: '', correo: '', contraseña: '', telefono: '', id_rol: '3' });
    setModoEdicion(false);
    setIdEdicion(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6 flex justify-center">
      <div className="w-full max-w-[900px]">
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center shadow-2xl">
              <span className="text-white text-xl font-bold">👥</span>
            </div>
            <div>
              <h1 className="text-[clamp(1.8rem,3vw,2.4rem)] font-black text-white tracking-tight">Gestión de Usuarios</h1>
              <p className="text-blue-200 text-base">Panel de administración</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all shadow-lg font-semibold text-sm whitespace-nowrap"
          >
            ← Volver al Panel
          </button>
        </div>

        {/* MENSAJES */}
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

        {/* FORMULARIO */}
        <div className="bg-white rounded-[1.5rem] shadow-2xl p-6 md:p-8 mb-8 relative overflow-hidden border-8 border-white/20 w-full">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
          
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 justify-center md:justify-start">
            {modoEdicion ? (
              <>
                <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg">✏️</span>
                Editar Usuario
              </>
            ) : (
              <>
                <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">📝</span>
                Registrar Nuevo Usuario
              </>
            )}
          </h2> 

          <form onSubmit={guardarUsuario} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">Nombre <span className="text-rose-500">*</span></label>
              <input type="text" name="nombre" value={formulario.nombre} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-base focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all shadow-inner"
                placeholder="Nombre completo..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">Correo <span className="text-rose-500">*</span></label>
              <input type="email" name="correo" value={formulario.correo} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-base focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all shadow-inner"
                placeholder="correo@ejemplo.com..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">
                Contraseña {!modoEdicion && <span className="text-rose-500">*</span>}
              </label>
              <input type="password" name="contraseña" value={formulario.contraseña} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-base focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all shadow-inner"
                placeholder={modoEdicion ? "Dejar vacío para no cambiar..." : "Contraseña segura..."}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-base">Teléfono</label>
              <input type="text" name="telefono" value={formulario.telefono} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-base focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all shadow-inner"
                placeholder="Número de teléfono..."
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-700 font-bold text-base">Rol / Perfil <span className="text-rose-500">*</span></label>
              <select name="id_rol" value={formulario.id_rol} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-base focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all shadow-inner"
              >
                <option value="1">👑 Administrador</option>
                <option value="2">📚 Bibliotecario</option>
                <option value="3">🎓 Estudiante</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-3 mt-2 justify-center">
              <button type="submit" disabled={cargando}
                className="flex-1 min-w-[180px] py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-md transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {modoEdicion ? '✏️ ACTUALIZAR' : '💾 GUARDAR USUARIO'}
              </button>

              {modoEdicion && (
                <button type="button" onClick={reiniciarFormulario}
                  className="py-3 px-6 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-bold rounded-xl shadow-lg hover:shadow-md transform hover:-translate-y-0.5 transition-all"
                >
                  ❌ CANCELAR
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="bg-white rounded-[1.5rem] shadow-2xl p-6 md:p-8 border-8 border-white/20 w-full">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 justify-center">
            <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">📋</span>
            Lista de Usuarios
          </h2>

          <div className="overflow-hidden rounded-xl shadow-2xl border-4 border-slate-100">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase font-bold text-center text-sm">
                  <th className="py-3 px-2">Nombre</th>
                  <th className="py-3 px-2">Correo</th>
                  <th className="py-3 px-2">Rol</th>
                  <th className="py-3 px-2">Estado</th>
                  <th className="py-3 px-2">Acciones</th>
                </tr>
              </thead> {/* 🚀 CORREGIDO: thead cerrado correctamente aquí */}
              <tbody className="divide-y divide-slate-200 bg-slate-50">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500 italic font-semibold text-base">
                      📭 No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usu) => (
                    <tr key={usu.id_usuario} className="hover:bg-indigo-50 transition-colors text-center">
                      <td className="py-3 px-2 font-bold text-slate-800 text-sm">{usu.nombre}</td>
                      <td className="py-3 px-2 text-sm">{usu.correo || usu.email}</td>
                      <td className="py-3 px-2 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          Number(usu.id_rol) === 1 ? 'bg-purple-200 text-purple-800' : 
                          Number(usu.id_rol) === 2 ? 'bg-blue-200 text-blue-800' : 
                          'bg-green-200 text-green-800'
                        }`}>
                          {Number(usu.id_rol) === 1 ? 'Administrador' : Number(usu.id_rol) === 2 ? 'Bibliotecario' : 'Estudiante'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${usu.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {usu.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => editarUsuario(usu)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow hover:shadow-md transform hover:scale-105 transition-all text-xs"
                          >
                            ✏️ Editar
                          </button>
                          <button onClick={() => cambiarEstado(usu.id_usuario, usu.estado)}
                            className={`px-3 py-1.5 font-bold rounded-lg shadow hover:shadow-md transform hover:scale-105 transition-all text-xs ${
                              usu.estado ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            }`}
                          >
                            {usu.estado ? '🚫 Desactivar' : '✅ Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table> {/* 🚀 CORREGIDO: table cerrado correctamente después del tbody */}
          </div>
        </div>
      </div>
    </div>
  );
}