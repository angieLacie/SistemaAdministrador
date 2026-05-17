import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaShieldHalved, FaChartLine, FaBell, FaUsers } from 'react-icons/fa6';
import { authService } from '@/services/auth.service';
import { useAccesos } from '@/context/AccesosContext';

const features = [
  { icon: <FaChartLine />, label: 'Gestión de licencias y líneas corporativas' },
  { icon: <FaBell />,      label: 'Notificaciones y alertas en tiempo real' },
  { icon: <FaUsers />,     label: 'Administración de usuarios y accesos' },
  { icon: <FaShieldHalved />, label: 'Control de seguridad centralizado' },
];

const Login = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { recargarAccesos } = useAccesos();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await authService.login(data.usuario.trim().toLowerCase(), data.clave);
      await recargarAccesos();
      toast.success('Bienvenido al sistema');
      navigate('/dashboards/principal');
    } catch {
      toast.error('Usuario o clave incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* ── Panel izquierdo ── */}
      <div style={{
        flex: '0 0 52%',
        background: 'linear-gradient(145deg, #0b1f3a 0%, #133f72 45%, #1a6cbf 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '4rem 4rem 4rem 5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Círculos decorativos */}
        <div style={{
          position: 'absolute', top: -140, right: -140,
          width: 380, height: 380, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', top: '55%', right: '8%',
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(26,108,191,0.25)',
        }} />

        {/* Logo / marca */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '3rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(255,255,255,0.12)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.2rem',
            backdropFilter: 'blur(8px)',
          }}>
            <FaShieldHalved style={{ color: 'white', fontSize: 26 }} />
          </div>
          <h1 style={{
            color: 'white', fontSize: 32, fontWeight: 800,
            margin: '0 0 0.5rem', lineHeight: 1.2, letterSpacing: '-0.5px',
          }}>
            Sistema<br />Administrativo
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, margin: 0 }}>
            Plataforma de gestión centralizada
          </p>
        </div>

        {/* Features */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.85)', fontSize: 15,
              }}>
                {f.icon}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.4 }}>
                {f.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer del panel */}
        <p style={{
          position: 'absolute', bottom: 28, left: '5rem',
          color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0, zIndex: 1,
        }}>
          © {new Date().getFullYear()} · Acceso restringido
        </p>
      </div>

      {/* ── Panel derecho ── */}
      <div style={{
        flex: 1,
        background: '#f5f7fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div style={{ marginBottom: '2.2rem' }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0f1e30', margin: '0 0 6px' }}>
              Iniciar sesión
            </h2>
            <p style={{ color: '#8a97a8', fontSize: 14, margin: 0 }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Usuario */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: '#374151', marginBottom: 7, letterSpacing: 0.1,
              }}>
                Usuario
              </label>
              <input
                {...register('usuario', { required: 'Campo requerido' })}
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: errors.usuario ? '1.5px solid #ef4444' : '1.5px solid #dde1e7',
                  borderRadius: 10, fontSize: 14, color: '#1a2535',
                  background: 'white', outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.18s, box-shadow 0.18s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#185FA5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(24,95,165,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = errors.usuario ? '#ef4444' : '#dde1e7';
                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              />
              {errors.usuario && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>{errors.usuario.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: 26 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: '#374151', marginBottom: 7, letterSpacing: 0.1,
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('clave', { required: 'Campo requerido' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '11px 44px 11px 14px',
                    border: errors.clave ? '1.5px solid #ef4444' : '1.5px solid #dde1e7',
                    borderRadius: 10, fontSize: 14, color: '#1a2535',
                    background: 'white', outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'border-color 0.18s, box-shadow 0.18s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#185FA5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(24,95,165,0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = errors.clave ? '#ef4444' : '#dde1e7';
                    e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 13, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#9ca3af',
                    fontSize: 16, padding: 0, display: 'flex',
                  }}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.clave && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>{errors.clave.message}</p>
              )}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading
                  ? '#93c5fd'
                  : 'linear-gradient(135deg, #133f72 0%, #185FA5 60%, #1a7fd4 100%)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: loading ? 'none' : '0 6px 20px rgba(19,63,114,0.35)',
                transition: 'opacity 0.2s, transform 0.15s',
                letterSpacing: 0.2,
              }}
              onMouseEnter={e => { if (!loading) e.target.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.target.style.opacity = '1'; }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 18, height: 18,
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: 'white', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.75s linear infinite',
                  }} />
                  Verificando...
                </>
              ) : 'Ingresar'}
            </button>

          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #c4cad3; }

        @media (max-width: 720px) {
          /* Ocultar panel izquierdo en móvil */
          div[style*="flex: 0 0 52%"] { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
