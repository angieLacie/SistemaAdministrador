import { useState, useEffect, useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  FaArrowsRotate, FaCircleInfo, FaCartShopping, FaFileLines,
  FaTruck, FaBoxesStacked, FaArrowRotateLeft, FaSliders,
  FaHandHoldingDollar, FaLink, FaServer, FaCircleQuestion,
  FaTag, FaCalculator, FaListCheck, FaHandHoldingHeart,
  FaChartColumn, FaBell,
} from 'react-icons/fa6';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import { dashboardService } from '@/services/monitor.service';

const REFRESH_INTERVAL = 30000;
const SLIDE_INTERVAL   = 10000;

// Mapa código KPI → icono
const KPI_ICONS = {
  IVENTAS:      FaCartShopping,
  IGSAP:        FaFileLines,
  IGTRASLADO:   FaTruck,
  IGRECIBIDO:   FaBoxesStacked,
  IGDEV:        FaArrowRotateLeft,
  IMOVIMIENTOS: FaSliders,
  SPROMOCIONES: FaTag,
  SCOSTO:       FaCalculator,
  SPRECIO:      FaHandHoldingDollar,
  STCONECT:     FaLink,
  SBRETAIL:     FaServer,
  SBRMS:        FaServer,
  NRPRECIOC:    FaTag,
  NRCOSTOC:     FaCalculator,
  NRCONTEO:     FaListCheck,
  NRDON:        FaHandHoldingHeart,
  NRPOLLING:    FaChartColumn,
  NRVENTASDESC: FaBell,
};

const ESTADO_STYLES = {
  VERDE:    { bg: '#FFFFFF', border: '#C8E0CB', text: '#2E7D32', iconBg: '#E8F5EA', iconColor: '#4CAF50', subText: '#6c757d' },
  AMARILLO: { bg: '#EF9F27', border: '#D98A2A', text: '#FFFFFF', iconBg: 'rgba(255,255,255,0.25)', iconColor: '#FFFFFF', subText: 'rgba(255,255,255,0.95)' },
  ROJO:     { bg: '#E24B4A', border: '#A32D2D', text: '#FFFFFF', iconBg: 'rgba(255,255,255,0.25)', iconColor: '#FFFFFF', subText: 'rgba(255,255,255,0.9)' },
  SINDATA:  { bg: '#FFFFFF', border: '#E5E4DD', text: '#6B6A65', iconBg: '#F5F5F4', iconColor: '#9E9C92', subText: '#9E9C92' },
};

const SISTEMA_COLORS = {
  RMS:  { bg: '#E6F1FB', color: '#0C447C', border: '#185FA5' },
  SERV: { bg: '#EEEDFE', color: '#26215C', border: '#534AB7' },
  NOT:  { bg: '#E1F5EE', color: '#04342C', border: '#0F6E56' },
};

const KpiCard = ({ kpi }) => {
  const style = ESTADO_STYLES[kpi.estado] || ESTADO_STYLES.SINDATA;
  const isCritical = kpi.estado === 'ROJO';
  const Icon = KPI_ICONS[kpi.kpiCodigo?.toUpperCase()] || FaCircleQuestion;

  return (
    <div
      className={isCritical ? 'kpi-critical' : ''}
      style={{
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: 12,
        padding: '18px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        minHeight: 90,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          background: style.iconBg,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={style.iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 30, fontWeight: 600, color: style.text, lineHeight: 1 }}>
          {kpi.valor}
        </div>
        <div
          style={{
            fontSize: 12,
            color: style.subText,
            marginTop: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={kpi.kpiNombre}
        >
          {kpi.kpiNombre}
        </div>
      </div>
    </div>
  );
};

const SistemaSlide = ({ sistema }) => {
  const colors = SISTEMA_COLORS[sistema.sistemaId] || {
    bg: '#F1EFE8', color: '#2C2C2A', border: '#888780'
  };

  return (
    <div className="px-2 pb-4">
      <div
        style={{
          background: colors.bg,
          color: colors.color,
          borderLeft: `4px solid ${colors.border}`,
          borderRadius: 8,
          padding: '14px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 18 }}>{sistema.sistemaNombre}</span>
        {sistema.ultimaActualizacion && (
          <span style={{ fontSize: 12, opacity: 0.85 }}>
            Última actualización: {new Date(sistema.ultimaActualizacion).toLocaleString('es-PE')}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}
      >
        {sistema.kpis.map(k => (
          <KpiCard key={k.kpiCodigo} kpi={k} />
        ))}
      </div>
    </div>
  );
};

const DashboardSincronizacion = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const cargar = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const result = await dashboardService.sincronizacion();
      setData(result);
    } catch (err) {
      toast.error('Error al cargar dashboard: ' + (err.message || err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargar();
    intervalRef.current = setInterval(() => cargar(true), REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Sincronización Retail"
        subTitle1="Dashboards"
        subTitle2="Sincronización"
        subText="Monitoreo en tiempo real de indicadores."
      />

      <style>{`
        @keyframes blink-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .kpi-critical { animation: blink-red 1.4s ease-in-out infinite; }
        .swiper-pagination-bullet-active { background: #185FA5 !important; }
        .swiper-button-next, .swiper-button-prev { color: #185FA5 !important; }
      `}</style>

      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex gap-3 align-items-center small">
            <span><span style={dotStyle('#639922')}></span> OK</span>
            <span><span style={dotStyle('#EF9F27')}></span> Atención</span>
            <span><span style={dotStyle('#E24B4A')}></span> Crítico</span>
            <span><span style={dotStyle('#888780')}></span> Sin datos</span>
          </div>
          <div className="d-flex align-items-center gap-2 small text-muted">
            <FaArrowsRotate
              size={12}
              style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
            />
            Auto-refresh {REFRESH_INTERVAL / 1000}s · Slider {SLIDE_INTERVAL / 1000}s
            {data?.fechaActualizacion && (
              <span style={{ fontSize: 11 }}>
                · {new Date(data.fechaActualizacion).toLocaleTimeString('es-PE')}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : !data || data.sistemas.length === 0 ? (
          <div className="text-center py-5">
            <FaCircleInfo size={32} className="text-muted mb-2" />
            <p className="text-muted">No hay indicadores configurados.</p>
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            loop={data.sistemas.length > 1}
            autoplay={{
              delay: SLIDE_INTERVAL,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            navigation
            style={{ paddingBottom: 40 }}
          >
            {data.sistemas.map(s => (
              <SwiperSlide key={s.sistemaId}>
                <SistemaSlide sistema={s} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

const dotStyle = (color) => ({
  display: 'inline-block',
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: color,
  marginRight: 6,
  verticalAlign: 'middle',
});

export default DashboardSincronizacion;