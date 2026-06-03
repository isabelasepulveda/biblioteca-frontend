import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function RegistrarReservaAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [libros, setLibros] = useState([]);
  const [form, setForm] = useState({ id_usuario: '', id_libro: '' });
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    // Cargar lista de usuarios y libros para seleccionar
    const cargarDatos = async () => {
      try {
        const resUser = await axios.get('http://localhost:3000/api/usuarios', { headers: { Authorization: `Bearer ${token}` }});
        setUsuarios(resUser.data.filter(u => u.id_rol === 3)); // Solo estudiantes
        
        const resLibros = await axios.get('http://localhost:3000/api/libros', { headers: { Authorization: `Bearer ${token}` }});
        setLibros(resLibros.data);
      } catch (error) {
        console.error(error);
      }
    };
    cargarDatos();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      // ✅ USAMOS LA RUTA NUEVA /admin/registrar
      await axios.post(
        'http://localhost:3000/api/reservas/admin/registrar', 
        form, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setMensaje('✅ Reserva registrada exitosamente para el estudiante');
      setForm({ id_usuario: '', id_libro: '' });
    } catch (error) {
      setMensaje(`❌ Error: ${error.response?.data?.mensaje || 'Desconocido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">📝 Registrar Reserva (Admin)</h1>
        
        {mensaje && <p className={`p-2 mb-4 rounded ${mensaje.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{mensaje}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-1">Estudiante:</label>
            <select value={form.id_usuario} onChange={(e)=>setForm({...form, id_usuario: e.target.value})} className="w-full p-2 border rounded" required>
              <option value="">Seleccionar estudiante</option>
              {usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} (ID: {u.id_usuario})</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Libro:</label>
            <select value={form.id_libro} onChange={(e)=>setForm({...form, id_libro: e.target.value})} className="w-full p-2 border rounded" required>
              <option value="">Seleccionar libro</option>
              {libros.map(l => <option key={l.id_libro} value={l.id_libro}>{l.titulo}</option>)}
            </select>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">
            Registrar Reserva
          </button>
        </form>

        <Link to="/dashboard" className="block text-center mt-6 text-blue-600 hover:underline">← Volver</Link>
      </div>
    </div>
  );
}