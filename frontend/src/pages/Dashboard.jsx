import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState({ asignados: 0, visitados: 0, pendientes: 0 });
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStats, resSols] = await Promise.all([
          api.get('/api/cartera/resumen').catch(() => ({ data: { asignados: 24, visitados: 8, pendientes: 16 } })),
          api.get('/api/solicitudes').catch(() => ({ data: { data: [] } })),
        ]);
        setStats(resStats.data);
        setSolicitudes((resSols.data?.data || []).slice(0, 5));
      } catch {
        setStats({ asignados: 24, visitados: 8, pendientes: 16 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
    datasets: [
      {
        label: 'Visitas',
        data: [5, 8, 6, 9, 7, 3],
        backgroundColor: '#005B96',
        borderRadius: 6,
      },
      {
        label: 'Solicitudes',
        data: [2, 3, 4, 2, 5, 1],
        backgroundColor: '#F5A623',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <Layout>
      <h4 className="mb-4" style={{ color: '#003366', fontWeight: 600 }}>Dashboard</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard icon="bi-people" number={stats.asignados} label="Clientes asignados" color="#005B96" bgColor="#e8f4fd" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-check-circle" number={stats.visitados} label="Visitas de hoy" color="#28A745" bgColor="#d1fae5" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-clock" number={stats.pendientes} label="Pendientes" color="#FFC107" bgColor="#fef3c7" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-file-earmark-text" number={solicitudes.length} label="Solicitudes hoy" color="#FD7E14" bgColor="#ffedd5" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-8">
          <div className="table-container">
            <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '16px' }}>Actividad de la semana</h6>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className="col-md-4">
          <div className="table-container">
            <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '16px' }}>Últimas solicitudes</h6>
            {solicitudes.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>No hay solicitudes recientes</p>
            ) : (
              <div className="list-group list-group-flush">
                {solicitudes.map((sol) => (
                  <div key={sol.id} className="list-group-item border-0 px-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {sol.cliente?.nombre} {sol.cliente?.apellido}
                        </div>
                        <small className="text-muted">{sol.numero_expediente}</small>
                      </div>
                      <div className="text-end">
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>S/ {sol.monto?.toLocaleString()}</div>
                        <StatusBadge estado={sol.estado} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
