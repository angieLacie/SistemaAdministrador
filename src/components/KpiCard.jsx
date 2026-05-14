import { Badge } from 'react-bootstrap';

/**
 * KpiCard — tarjeta de indicador estándar.
 *
 * Props:
 *   label       string   — Etiqueta superior (texto pequeño uppercase)
 *   value       any      — Valor principal (número grande)
 *   color       string   — Color del número (default azul)
 *   badge       string   — Texto del badge (opcional)
 *   badgeBg     string   — Background del badge
 *   badgeColor  string   — Color texto del badge
 *   subtitle    string   — Texto pequeño junto al badge
 */
const KpiCard = ({
  label,
  value,
  color = '#185FA5',
  badge,
  badgeBg = '#dbeafe',
  badgeColor = '#1e40af',
  subtitle,
}) => (
  <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
    <div className="card-body py-3 px-4">
      <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
        {label}
      </p>
      <h2 className="mb-1 fw-bold" style={{ color, fontSize: 32 }}>
        {value ?? '—'}
      </h2>
      {(badge || subtitle) && (
        <div className="d-flex align-items-center gap-2 mt-1">
          {badge && (
            <Badge bg="" style={{ backgroundColor: badgeBg, color: badgeColor, fontSize: 10, fontWeight: 600 }}>
              {badge}
            </Badge>
          )}
          {subtitle && (
            <span className="text-muted" style={{ fontSize: 11 }}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  </div>
);

export default KpiCard;
