import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    telefono: ''
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const registrarCuenta = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      // Enviamos el objeto con las propiedades esperadas por el backend corregido
      const datosParaBackend = {
        nombre: formulario.nombre,
        email: formulario.correo,
        password: formulario.contraseña,
        telefono: formulario.telefono
      };

      // Petición al backend en producción
      const res = await axios.post('https://biblioteca-backend-yz1f.onrender.com/api/usuarios/registro', datosParaBackend);
      
      setMensaje({ 
        texto: res.data.mensaje || `✅ Cuenta creada con éxito.`, 
        tipo: 'exito' 
      });

      setTimeout(() => navigate('/login'), 2000);

    } catch (e) {
      console.error("Error en Registro Frontend:", e.response?.data);
      setMensaje({ 
        texto: e.response?.data?.mensaje || '❌ Error al registrar usuario en el sistema', 
        tipo: 'error' 
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>

          <div className="text-center mb-7 pt-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg mx-auto mb-3">
              <span className="text-white text-xl font-bold">📝</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Crear Cuenta Nueva</h1>
            <p className="text-slate-500 text-sm mt-1">Llena tus datos para registrarte</p>
          </div>

          {mensaje.texto && (
            <div className={`mb-5 p-3 rounded-lg font-bold text-center shadow-md border-l-4 ${
              mensaje.tipo === 'exito' ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-rose-50 border-rose-400 text-rose-700'
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={registrarCuenta} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-sm">Nombre Completo <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                name="nombre" 
                value={formulario.nombre} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                placeholder="Tu nombre..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-sm">Correo Electrónico <span className="text-rose-500">*</span></label>
              <input 
                type="email" 
                name="correo" 
                value={formulario.correo} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-sm">Contraseña <span className="text-rose-500">*</span></label>
              <input 
                type="password" 
                name="contraseña" 
                value={formulario.contraseña} 
                onChange={handleChange} 
                required
                minLength="6"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                placeholder="Mínimo 6 caracteres..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold text-sm">Teléfono (Opcional)</label>
              <input 
                type="tel" 
                name="telefono" 
                value={formulario.telefono} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                placeholder="Ej: 3001234567"
              />
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-60 mt-1"
            >
              {cargando ? '⌘ Registrando...' : '📝 REGISTRARME'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-slate-600 text-sm">
              ¿Ya tienes cuenta? <Link to="/login" className="text-amber-600 font-bold hover:underline">Inicia sesión aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}