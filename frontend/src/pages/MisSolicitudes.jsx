import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  useEffect(() => {
    let result = [...solicitudes];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.numero_expediente?.toLowerCase().includes(q) ||
          s.cliente?.nombre?.toLowerCase().includes(q) ||
          s.cliente?.apellido?.toLowerCase().includes(q) ||
          s.cliente?.dni?.includes(q)
      );
    }
    if (filter !== 'todos') {
      result = result.filter((s) => s.estado === filter);
    }
    setFiltered(result);
  }, [search, filter, solicitudes]);

  const fetchSolicitudes = async () => {
    try {
      const res = await api.get('/api/solicitudes');
      setSolicitudes(res.data?.data || []);
      setFiltered(res.data?.data || []);
    } catch {
      setSolicitudes([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (sol) => {
    const { value } = await Swal.fire({
      title: 'Cambiar Estado',
      html: `
        <div class="text-start">
          <p><strong>${sol.numero_expediente}</strong></p>
          <p>Cliente: ${sol.cliente?.nombre} ${sol.cliente?.apellido}</p>
          <div class="form-group mt-3">
            <label>Nuevo estado</label>
            <select id="swal-estado" class="form-select">
              <option value="recibido_comite">Recibido Comité</option>
              <option value="en_evaluacion">En Evaluación</option>
              <option value="aprobado">Aprobado</option>
              <option value="condicionado">Condicionado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          <div class="form-group mt-2">
            <label>Motivo (opcional)</label>
            <textarea id="swal-motivo" class="form-control" rows="2"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Aplicar',
      confirmButtonColor: '#005B96',
    });

    if (value) {
      const estado = document.getElementById('swal-estado')?.value;
      const motivo = document.getElementById('swal-motivo')?.value;
      try {
        await api.patch(`/api/solicitudes/${sol.id}/estado`, { estado, motivo });
        Swal.fire('Actualizado', 'Estado cambiado exitosamente', 'success');
        fetchSolicitudes();
      } catch {
        Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
      }
    }
  };

  const filters = [
    { value: 'todos', label: 'Todos' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'recibido_comite', label: 'Comité' },
    { value: 'en_evaluacion', label: 'Evaluación' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
    { value: 'desembolsado', label: 'Desembolsado' },
  ];

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={{ color: '#003366', fontWeight: 600 }}>Mis Solicitudes</h4>
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>{filtered.length} solicitudes</span>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="filter-bar">
          {filters.map((f) => (
            <button
              key={f.value}
              className={`filter-btn ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar expediente, cliente..." />
      </div>

      <div className="table-container">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-4 text-muted">No se encontraron solicitudes</div>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Expediente</th>
                <th>Cliente</th>
                <th>Monto</th>
                <th>Plazo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sol) => (
                <tr key={sol.id}>
                  <td style={{ fontWeight: 500 }}>{sol.numero_expediente}</td>
                  <td>{sol.cliente?.nombre} {sol.cliente?.apellido}</td>
                  <td>S/ {sol.monto?.toLocaleString()}</td>
                  <td>{sol.plazo} meses</td>
                  <td><StatusBadge estado={sol.estado} /></td>
                  <td>{sol.created_at ? new Date(sol.created_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        title="Ver detalle"
                        onClick={() => Swal.fire({
                          title: sol.numero_expediente,
                          html: `
                            <div class="text-start">
                              <p><strong>Cliente:</strong> ${sol.cliente?.nombre} ${sol.cliente?.apellido}</p>
                              <p><strong>DNI:</strong> ${sol.cliente?.dni}</p>
                              <p><strong>Monto:</strong> S/ ${sol.monto?.toLocaleString()}</p>
                              <p><strong>Plazo:</strong> ${sol.plazo} meses</p>
                              <p><strong>Estado:</strong> ${sol.estado}</p>
                              ${sol.motivo_rechazo ? `<p><strong>Motivo:</strong> ${sol.motivo_rechazo}</p>` : ''}
                            </div>
                          `,
                          confirmButtonColor: '#005B96',
                        })}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="btn btn-outline-warning"
                        title="Cambiar estado"
                        onClick={() => cambiarEstado(sol)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
