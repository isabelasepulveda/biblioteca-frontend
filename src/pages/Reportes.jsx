import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Reportes() {
  const [librosMasPrestados, setLibrosMasPrestados] = useState([]);
  const [usuariosMasActivos, setUsuariosMasActivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const datosUsuario = localStorage.getItem('usuario');
    if (!token || !datosUsuario) { navigate('/login'); return; }
    try {
      const usuario = JSON.parse(datosUsuario);
      // ✅ PERMISOS: ADMIN O BIBLIOTECARIO
      if (usuario.id_rol !== 1 && usuario.id_rol !== 2) {
        setMensaje('❌ Acceso restringido: Solo personal autorizado');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }
      cargarDatos();
    } catch (e) { navigate('/login'); }
  }, [token, navigate]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // ✅ TUS RUTAS EXACTAS, NO LAS TOQUÉ
      const [res1, res2] = await Promise.all([
        axios.get('http://localhost:3000/api/reportes/libros-mas-prestados', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/api/reportes/usuarios-mas-activos', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLibrosMasPrestados(res1.data);
      setUsuariosMasActivos(res2.data);
    } catch (e) {
      setMensaje('⚠️ Error al cargar los reportes');
    } finally {
      setCargando(false);
    }
  };

  // Función para mostrar barra de progreso visual
  const BarraEstadistica = ({ valor, maximo, color }) => {
    const porcentaje = maximo > 0 ? (valor / maximo) * 100 : 0;
    return (
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-500`} 
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6 flex justify-center">
      <div className="w-full max-w-[1000px]">

        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-500 to-teal-400 flex items-center justify-center shadow-2xl">
              <span className="text-white text-xl font-bold">📊</span>
            </div>
            <div>
              <h1 className="text-[clamp(1.8rem,3vw,2.4rem)] font-black text-white tracking-tight">Reportes y Estadísticas</h1>
              <p className="text-blue-200 text-base">Información detallada de la biblioteca</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all shadow-lg font-semibold text-sm whitespace-nowrap"
          >
            ← Volver al Panel
          </button>
        </div>

        {mensaje && (
          <div className="mb-6 p-4 rounded-lg font-bold text-center bg-rose-500/20 border-l-8 border-rose-400 text-rose-200 shadow-xl">
            {mensaje}
          </div>
        )}

        {cargando ? (
          <div className="text-center text-white py-10 bg-white/5 rounded-2xl backdrop-blur-sm">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-lg">Cargando información...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* 📈 REPORTE 1: LIBROS MÁS PRESTADOS */}
            <div className="bg-white rounded-[1.5rem] shadow-2xl p-6 md:p-8 relative overflow-hidden border-8 border-white/20">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-400"></div>
              
              <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-lg">📚</span>
                Libros Más Prestados
              </h2>

              <div className="space-y-5">
                {librosMasPrestados.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-6">Sin registros aún</p>
                ) : (
                  librosMasPrestados.map((item, idx) => {
                    const maxValor = Math.max(...librosMasPrestados.map(i => i.total));
                    return (
                      <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl shadow-md border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-800 text-sm md:text-base flex-1">{item.titulo}</h3>
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                            {item.total} veces
                          </span>
                        </div>
                        <BarraEstadistica valor={item.total} maximo={maxValor} color="bg-green-500" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>


            {/* 📊 REPORTE 2: USUARIOS MÁS ACTIVOS */}
            <div className="bg-white rounded-[1.5rem] shadow-2xl p-6 md:p-8 relative overflow-hidden border-8 border-white/20">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-400"></div>
              
              <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg">👥</span>
                Usuarios Más Activos
              </h2>

              <div className="space-y-5">
                {usuariosMasActivos.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-6">Sin registros aún</p>
                ) : (
                  usuariosMasActivos.map((item, idx) => {
                    const maxValor = Math.max(...usuariosMasActivos.map(i => i.total));
                    return (
                      <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl shadow-md border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm md:text-base">{item.nombre}</h3>
                            <span className="text-xs text-slate-500">{item.rol}</span>
                          </div>
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                            {item.total} préstamos
                          </span>
                        </div>
                        <BarraEstadistica valor={item.total} maximo={maxValor} color="bg-blue-500" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}