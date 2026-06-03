import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ onClose }) {
  const [tipoAuth, setTipoAuth] = useState('login');
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    telefono: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const url = tipoAuth === 'login' 
        ? 'http://localhost:3000/api/usuarios/login' 
        : 'http://localhost:3000/api/usuarios/registrar'; // 🔴 Corregí la ruta aquí

      // ✅ LÓGICA PARA ROL: Si es @admin.com = Rol 1, sino Rol 3
      let datosParaEnviar;
      if (tipoAuth === 'login') {
        datosParaEnviar = { correo: formData.correo, contraseña: formData.contraseña };
      } else {
        // 🔑 ASIGNACIÓN DE ROL AUTOMÁTICA (como dice tu texto)
        const esAdmin = formData.correo.trim().toLowerCase().endsWith('@admin.com');
        datosParaEnviar = { 
          ...formData, 
          id_rol: esAdmin ? 1 : 3 // 1=Admin, 3=Estudiante
        };
      }

      const respuesta = await axios.post(url, datosParaEnviar);

      if (tipoAuth === 'login') {
        localStorage.setItem('token', respuesta.data.token);
        localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
        
        // ✅ Corregido: Ya no usa "tipo_cuenta", usa lo que llega del backend
        setMensaje(`✅ Ingresaste como ${respuesta.data.usuario.rol}!`);
        setTimeout(() => {
          navigate('/dashboard');
          onClose();
        }, 800);
      } else {
        // ✅ Corregido mensaje de registro
        const rolUsuario = datosParaEnviar.id_rol === 1 ? 'Administrador' : 'Estudiante';
        setMensaje(`✅ Te registraste correctamente. Eres ${rolUsuario}. Ahora inicia sesión.`);
        setTipoAuth('login');
        setFormData({ nombre: '', correo: '', contraseña: '', telefono: '' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.mensaje || '❌ Ocurrió un error, intenta nuevamente';
      setMensaje(errorMsg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      minHeight: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '550px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        padding: '40px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '25px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <h2 style={{
            margin: 0,
            color: '#1e40af',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            {tipoAuth === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <button 
            onClick={onClose}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '32px',
              cursor: 'pointer',
              color: '#6b7280',
              lineHeight: 1,
              padding: '0 8px'
            }}
          >
            ×
          </button>
        </div>

        {mensaje && (
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '15px',
            backgroundColor: mensaje.includes('✅') ? '#dcfce7' : '#fecaca',
            color: mensaje.includes('✅') ? '#166534' : '#991b1b',
            border: mensaje.includes('✅') ? '1px solid #bbf7d0' : '1px solid #fecaca'
          }}>
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          width: '100%'
        }}>
          {tipoAuth === 'register' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <label style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                style={{
                  padding: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '16px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                placeholder="Escribe tu nombre completo"
              />
            </div>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
              style={{
                padding: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '16px',
                width: '100%',
                boxSizing: 'border-box'
              }}
              placeholder="correo@ejemplo.com"
            />
            {tipoAuth === 'register' && (
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Si usas <strong style={{ color: '#1e40af' }}>@admin.com</strong> serás Administrador
              </p>
            )}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              required
              minLength="6"
              style={{
                padding: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '16px',
                width: '100%',
                boxSizing: 'border-box'
              }}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              style={{
                padding: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '16px',
                width: '100%',
                boxSizing: 'border-box'
              }}
              placeholder="300 000 0000"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              padding: '16px',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: '#1e40af',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: cargando ? 0.7 : 1,
              transition: 'opacity 0.2s ease'
            }}
          >
            {cargando ? 'Cargando...' : (tipoAuth === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          color: '#555',
          fontSize: '15px',
          marginTop: '10px'
        }}>
          {tipoAuth === 'login' ? (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setTipoAuth('register')}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#1e40af',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Crea una aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setTipoAuth('login')}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#1e40af',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Inicia sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}