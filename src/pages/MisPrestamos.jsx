import { useState, useEffect } from 'react';
import api from '../api'; // 🚀 CORREGIDO: Usamos tu instancia centralizada de Axios en la nube
import { useNavigate } from 'react-router-dom';

export default function MisPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // 🛠️ FUNCIÓN CORREGIDA: Evita el desfase de zona horaria aislando el texto de la fecha
  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return 'No registrada';
    
    // Si la fecha viene como texto de la base de datos (Ej: "2026-06-03T00:00:00.000Z")
    if (typeof fechaRaw === 'string') {
      const partes = fechaRaw.split('T')[0].split('-');
      if (partes.length === 3) {
        // Retorna en formato puro DD/MM/AAAA sin conversiones de zona horaria
        return `${parseInt(partes[2])}/${parseInt(partes[1])}/${partes[0]}`;
      }
    }

    // Respaldo seguro usando métodos UTC por si es un objeto Date
    const date = new Date(fechaRaw);
    if (isNaN(date.getTime())) return 'S/F';
    
    const dia = date.getUTCDate();
    const mes = date.getUTCMonth() + 1;
    const anio = date.getUTCFullYear();
    
    return `${dia}/${mes}/${anio}`;
  };

  useEffect(() => {
    if (!token) { 
      navigate('/login'); 
      return; 
    }

    const cargar = async () => {
      try {
        // 🚀 CORREGIDO: Eliminamos el localhost manual y dejamos la ruta relativa pura
        const res = await api.get('/prestamos/mis-prestamos');
        
        setPrestamos(res.data);
        console.log("✅ Préstamos personales cargados:", res.data);

      } catch (e) {
        console.error("🔴 ERROR DETALLADO:", e.response || e.message);
        setError('❌ No se pudieron cargar tus préstamos');
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [token, navigate]);

  if (cargando) return <div className="p-6 text-center text-lg font-bold">⌛ Cargando tus préstamos...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[clamp(1.8rem,3vw,2.4rem)] font-black text-slate-800">Mis Préstamos</h1>
        <button 
          onClick={() => navigate('/catalogo')} 
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 font-bold transition-all"
        >
          Volver al Catálogo
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg font-bold">
          {error}
        </div>
      )}

      {prestamos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-slate-500 font-semibold">
          📭 No tienes ningún préstamo activo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prestamos.map(p => (
            <div key={p.id_prestamo} className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all">
              <h3 className="font-bold text-lg mb-2 text-slate-800">{p.titulo || 'Título desconocido'}</h3>
              
              {/* 📅 Corregido usando la nueva función de formateo */}
              <p className="text-sm text-slate-600 mb-1">
                📅 Fecha préstamo: {formatearFecha(p.fecha_prestamo)}
              </p>
              
              {/* ⏳ Corregido usando la nueva función de formateo */}
              <p className="text-sm text-slate-600 mb-3">
                ⏳ Devolución: {formatearFecha(p.fecha_devolucion || p.fecha_limite)}
              </p>
              
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.estado === 'Devuelto' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {p.estado === 'Devuelto' ? '✅ Devuelto' : '⏳ Pendiente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}