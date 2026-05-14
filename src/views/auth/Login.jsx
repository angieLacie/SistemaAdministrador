import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { authService } from '@/services/auth.service';
import { useAccesos } from '@/context/AccesosContext';

const Login = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { recargarAccesos } = useAccesos();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await authService.login(data.usuario, data.clave);
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
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f4f8',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Fondo decorativo */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: -120, left: -120,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, #185FA5 0%, transparent 70%)',
          opacity: 0.12,
        }} />
        <div style={{
          position: 'absolute', bottom: -100, right: -80,
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, #0f2744 0%, transparent 70%)',
          opacity: 0.1,
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '15%',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, #1a7fd4 0%, transparent 70%)',
          opacity: 0.08,
        }} />
      </div>

      {/* Card login */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 20px 60px rgba(15,39,68,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        width: '100%', maxWidth: 420,
        overflow: 'hidden',
      }}>

        {/* Header de la card */}
        <div style={{
          background: 'linear-gradient(135deg, #0f2744 0%, #185FA5 60%, #1a7fd4 100%)',
          padding: '2rem 2rem 1.5rem',
          textAlign: 'center',
        }}>
          {/* Icono */}
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 4, fontSize: 20 }}>
            Iniciar sesión
          </h4>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 0 }}>
            Sistema Administrativo
          </p>
        </div>

        {/* Formulario */}
        <div style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Usuario */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                Usuario
              </label>
              <input
                {...register('usuario', { required: 'Campo requerido' })}
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                style={{
                  width: '100%', padding: '12px 14px',
                  border: errors.usuario ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                  borderRadius: 12, fontSize: 14,
                  fontFamily: 'monospace', textTransform: 'uppercase',
                  background: '#f9fafb', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#185FA5'; e.target.style.boxShadow = '0 0 0 3px rgba(24,95,165,0.08)'; }}
                onBlur={e  => { e.target.style.borderColor = errors.usuario ? '#ef4444' : '#e5e7eb'; e.target.style.boxShadow = ''; }}
              />
              {errors.usuario && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.usuario.message}</p>}
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('clave', { required: 'Campo requerido' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px',
                    border: errors.clave ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                    borderRadius: 12, fontSize: 14,
                    background: '#f9fafb', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#185FA5'; e.target.style.boxShadow = '0 0 0 3px rgba(24,95,165,0.08)'; }}
                  onBlur={e  => { e.target.style.borderColor = errors.clave ? '#ef4444' : '#e5e7eb'; e.target.style.boxShadow = ''; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9ca3af', fontSize: 15, padding: 0, display: 'flex',
                }}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.clave && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.clave.message}</p>}
            </div>

            {/* Botón */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #185FA5, #1a7fd4)',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: loading ? 'none' : '0 4px 15px rgba(24,95,165,0.3)',
              transition: 'opacity 0.2s',
            }}>
              {loading ? (
                <>
                  <span style={{
                    width: 18, height: 18,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.8s linear infinite',
                  }} />
                  Verificando...
                </>
              ) : 'Ingresar'}
            </button>

          </form>

          <p style={{ fontSize: 12, color: '#d1d5db', textAlign: 'center', marginTop: 24, marginBottom: 0 }}>
            Acceso restringido — solo personal autorizado
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #d1d5db; }
      `}</style>
    </div>
  );
};

export default Login;
