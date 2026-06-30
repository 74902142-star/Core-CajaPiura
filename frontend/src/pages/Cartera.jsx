import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function Cartera() {
  const [clientes, setClientes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ asignados: 0, visitados: 0, pendientes: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...clientes];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.cliente?.nombre?.toLowerCase().includes(q) ||
          c.cliente?.apellido?.toLowerCase().includes(q) ||
          c.cliente?.dni?.includes(q)
      );
    }
    if (filter === 'visitados') {
      result = result.filter((c) => c.visitado);
    } else if (filter === 'pendientes') {
      result = result.filter((c) => !c.visitado);
    }
    setFiltered(result);
  }, [search, filter, clientes]);

  const fetchData = async () => {
    try {
      const [resCartera, resStats] = await Promise.all([
        api.get('/api/cartera/1'),
        api.get('/api/cartera/resumen').catch(() => ({ data: { asignados: 0, visitados: 0, pendientes: 0 } })),
      ]);
      setClientes(resCartera.data?.data || []);
      setFiltered(resCartera.data?.data || []);
      setStats(resStats.data);
    } catch {
      setClientes([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const marcarVisita = async (cliente) => {
    const { value } = await Swal.fire({
      title: 'Registrar visita',
      html: `
        <div class="text-start">
          <p><strong>${cliente.cliente?.nombre} ${cliente.cliente?.apellido}</strong></p>
          <p>DNI: ${cliente.cliente?.dni}</p>
          <div class="form-group mt-3">
            <label>Observación</label>
            <textarea id="swal-obs" class="form-control" rows="3" placeholder="Describa la visita..."></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      confirmButtonColor: '#005B96',
    });

    if (value) {
      const obs = document.getElementById('swal-obs')?.value;
      try {
        await api.patch('/api/cartera/visita', {
          cliente_id: cliente.cliente_id,
          lat: -5.1945,
          lng: -80.6328,
          observacion: obs,
        });
        Swal.fire('Registrado', 'Visita registrada exitosamente', 'success');
        fetchData();
      } catch {
        Swal.fire('Error', 'No se pudo registrar la visita', 'error');
      }
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={{ color: '#003366', fontWeight: 600 }}>Mi cartera del día</h4>
        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
          {stats.asignados} clientes · {stats.visitados} visitados · {stats.pendientes} pendientes
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="filter-bar">
          {['todos', 'visitados', 'pendientes'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'todos' ? 'Todos' : f === 'visitados' ? 'Visitados' : 'Pendientes'}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre o DNI..." />
      </div>

      <div className="table-container">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-4 text-muted">No se encontraron clientes</div>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{c.cliente?.nombre} {c.cliente?.apellido}</td>
                  <td>{c.cliente?.dni}</td>
                  <td>{c.cliente?.telefono || '-'}</td>
                  <td>S/ {(c.cliente?.ingreso_mensual || 0).toLocaleString()}</td>
                  <td>
                    {c.visitado ? (
                      <span className="badge bg-success">Visitado</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Pendiente</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate(`/ficha-cliente?dni=${c.cliente?.dni}`)}
                        title="Ver ficha"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      {!c.visitado && (
                        <button
                          className="btn btn-outline-success"
                          onClick={() => marcarVisita(c)}
                          title="Marcar visita"
                        >
                          <i className="bi bi-geo-alt"></i>
                        </button>
                      )}
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
