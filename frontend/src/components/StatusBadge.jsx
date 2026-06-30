const statusConfig = {
  enviado: { label: 'Enviado', className: 'badge-enviado' },
  recibido_comite: { label: 'Comité', className: 'badge-recibido_comite' },
  en_evaluacion: { label: 'Evaluación', className: 'badge-en_evaluacion' },
  aprobado: { label: 'Aprobado', className: 'badge-aprobado' },
  condicionado: { label: 'Condicionado', className: 'badge-condicionado' },
  rechazado: { label: 'Rechazado', className: 'badge-rechazado' },
  desembolsado: { label: 'Desembolsado', className: 'badge-desembolsado' },
};

export default function StatusBadge({ estado }) {
  const config = statusConfig[estado] || { label: estado, className: 'badge-enviado' };
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}
