import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [formulario, setFormulario] = useState({ correo: '', contraseña: '' });
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const datosParaBackend = {
        email: formulario.correo,
        password: formulario.contraseña
      };

// Cambia el localhost por tu URL real de Render
const res = await axios.post('https://biblioteca-backend-yz1f.onrender.com/api/usuarios/login', datosParaBackend);

      if (res.data.token && res.data.usuario) {
        localStorage.clear();

        // ✅ MAPEADO TOTALMENTE COMPATIBLE (Incluye id_rol)
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('usuario', JSON.stringify({
          id_usuario: res.data.usuario.id_usuario,
          nombre: res.data.usuario.nombre,
          correo: res.data.usuario.email, 
          rol: res.data.usuario.rol,
          id_rol: res.data.usuario.id_rol // 🌟 FIX CRUCIAL: Ahora guardamos el ID numérico del rol
        }));

        setMensaje('✅ Inicio de sesión exitoso');
        setTimeout(() => navigate('/dashboard'), 1000);
      }

    } catch (error) {
      console.error("Error Login:", error.response?.data);
      setMensaje(`❌ ${error.response?.data?.mensaje || 'Error al conectar'}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border-8 border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">🔐</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Sistema de Biblioteca</h1>
          <p className="text-slate-500">Inicia sesión para continuar</p>
        </div>

        {mensaje && (
          <div className={`mb-6 p-3 rounded-lg font-bold text-center border-l-8 ${
            mensaje.includes('✅') ? 'bg-emerald-500/20 border-emerald-400 text-emerald-700' : 'bg-rose-500/20 border-rose-400 text-rose-700'
          }`}>{mensaje}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-700 font-bold mb-2">Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg outline-none transition-all"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-2">Contraseña</label>
            <input
              type="password"
              name="contraseña"
              value={formulario.contraseña}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50"
          >
            {cargando ? '⌛ Procesando...' : '🚀 INICIAR SESIÓN'}
          </button>
        </form>
      </div>
    </div>
  );
}