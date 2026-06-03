import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function MisPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { 
      navigate('/login'); 
      return; 
    }

    const cargar = async () => {
      try {
        const ruta = 'http://localhost:3000/api/prestamos/mis-prestamos';
        
        const res = await axios.get(ruta, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setPrestamos(res.data);
        console.log("✅ Préstamos cargados:", res.data);

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
              
              {/* 📅 Validación defensiva para la fecha de préstamo */}
              <p className="text-sm text-slate-600 mb-1">
                📅 Fecha préstamo: {p.fecha_prestamo ? new Date(p.fecha_prestamo).toLocaleDateString() : 'No registrada'}
              </p>
              
              {/* 🛠️ SOLUCIÓN AL BUG 1969: Si es null o vacío, evita usar new Date() y muestra texto alternativo */}
              <p className="text-sm text-slate-600 mb-3">
                ⏳ Devolución: {p.fecha_devolucion ? new Date(p.fecha_devolucion).toLocaleDateString() : 'Por definir'}
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