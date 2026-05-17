import { Badge } from 'react-bootstrap';

/**
 * KpiCard — tarjeta de indicador numérico
 *
 * Props:
 *   label      string  — título en mayúsculas (ej. "Total Usuarios")
 *   value      number  — número principal grande
 *   color      string  — color del número (ej. "#185FA5")
 *   badgeBg    string  — fondo del badge (ej. "#dbeafe")
 *   badgeColor string  — color texto badge (ej. "#1e40af")
 *   badgeValue string|number — contenido del badge
 *   badgeText  string  — texto pequeño junto al badge (ej. "registrados")
 */
const KpiCard = ({ label, value, color, badgeBg, badgeColor, badgeValue, badgeText }) => (
  <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
    <div className="card-body py-3 px-4">
      <p className="text-uppercase mb-2 fw-semibold"
        style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
        {label}
      </p>
      <h2 className="mb-1 fw-bold" style={{ color, fontSize: 32 }}>
        {value}
      </h2>
      <div className="d-flex align-items-center gap-2 mt-1">
        <Badge bg="" style={{ backgroundColor: badgeBg, color: badgeColor, fontSize: 10, fontWeight: 600 }}>
          {badgeValue}
        </Badge>
        <span className="text-muted" style={{ fontSize: 11 }}>{badgeText}</span>
      </div>
    </div>
  </div>
);

export default KpiCard;
