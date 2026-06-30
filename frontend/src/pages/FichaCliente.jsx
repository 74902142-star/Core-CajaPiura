import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function FichaCliente() {
  const [searchParams] = useSearchParams();
  const dni = searchParams.get('dni') || '';
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('datos');

  useEffect(() => {
    if (dni) fetchCliente();
  }, [dni]);

  const fetchCliente = async () => {
    try {
      const res = await api.get(`/api/cartera/cliente/${dni}`);
      setCliente(res.data);
    } catch {
      Swal.fire('Error', 'Cliente no encontrado', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRiesgo = () => {
    if (!cliente) return { clase: 'bajo', label: 'Sin datos' };
    const score = cliente.ingreso_mensual / (cliente.gasto_mensual || 1);
    if (score >= 2) return { clase: 'bajo', label: 'Bajo' };
    if (score >= 1.5) return { clase: 'medio', label: 'Medio' };
    if (score >= 1.1) return { clase: 'alto', label: 'Alto' };
    return { clase: 'critico', label: 'Crítico' };
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!cliente) {
    return (
      <Layout>
        <div className="text-center py-5 text-muted">
          <i className="bi bi-person-x" style={{ fontSize: '3rem' }}></i>
          <p className="mt-3">Cliente no encontrado. Ingrese un DNI válido.</p>
        </div>
      </Layout>
    );
  }

  const riesgo = getRiesgo();

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={{ color: '#003366', fontWeight: 600 }}>Ficha del Cliente</h4>
        <span className={`semaforo semaforo-${riesgo.clase}`}>
          <i className={`bi bi-circle-fill`}></i> Riesgo: {riesgo.label}
        </span>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="table-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ color: '#003366', fontWeight: 600 }}>
                {cliente.nombre} {cliente.apellido}
              </h6>
              <span className="badge bg-primary">DNI: {cliente.dni}</span>
            </div>

            <ul className="nav tab-custom">
              <li className="nav-item">
                <button
                  className={`nav-link ${tab === 'datos' ? 'active' : ''}`}
                  onClick={() => setTab('datos')}
                >
                  Datos Generales
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${tab === 'historial' ? 'active' : ''}`}
                  onClick={() => setTab('historial')}
                >
                  Historial
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${tab === 'documentos' ? 'active' : ''}`}
                  onClick={() => setTab('documentos')}
                >
                  Documentos
                </button>
              </li>
            </ul>

            {tab === 'datos' && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <p style={{ fontWeight: 500 }}>{cliente.telefono || '-'}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Correo</label>
                  <p style={{ fontWeight: 500 }}>{cliente.email || '-'}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Dirección</label>
                  <p style={{ fontWeight: 500 }}>{cliente.direccion || '-'}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ocupación</label>
                  <p style={{ fontWeight: 500 }}>{cliente.ocupacion || '-'}</p>
                </div>
                <div className="col-12">
                  <hr />
                  <h6 style={{ color: '#003366', fontWeight: 600 }}>Datos del Negocio</h6>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Nombre del negocio</label>
                  <p style={{ fontWeight: 500 }}>{cliente.nombre_negocio || '-'}</p>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Antigüedad</label>
                  <p style={{ fontWeight: 500 }}>{cliente.antiguedad_negocio || '-'}</p>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Ingreso mensual</label>
                  <p style={{ fontWeight: 500 }}>S/ {(cliente.ingreso_mensual || 0).toLocaleString()}</p>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Gasto mensual</label>
                  <p style={{ fontWeight: 500 }}>S/ {(cliente.gasto_mensual || 0).toLocaleString()}</p>
                </div>
              </div>
            )}

            {tab === 'historial' && (
              <div>
                {cliente.solicitudes?.length > 0 ? (
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Expediente</th>
                        <th>Monto</th>
                        <th>Plazo</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cliente.solicitudes.map((s) => (
                        <tr key={s.id}>
                          <td>{s.numero_expediente}</td>
                          <td>S/ {s.monto?.toLocaleString()}</td>
                          <td>{s.plazo} meses</td>
                          <td>
                            <span className={`status-badge badge-${s.estado}`}>{s.estado}</span>
                          </td>
                          <td>{s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted">No tiene historial crediticio</p>
                )}
              </div>
            )}

            {tab === 'documentos' && (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-folder2-open" style={{ fontSize: '2rem' }}></i>
                <p className="mt-2">No hay documentos adjuntos</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-4">
          <div className="table-container mb-3">
            <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '12px' }}>Acciones</h6>
            <div className="d-grid gap-2">
              <button className="btn btn-caja" onClick={() => Swal.fire('Visita', 'Función de registro de visita', 'info')}>
                <i className="bi bi-geo-alt me-2"></i>Registrar Visita
              </button>
              <button className="btn btn-caja-outline" onClick={() => window.location.href = `/solicitud?cliente_id=${cliente.id}`}>
                <i className="bi bi-file-earmark-plus me-2"></i>Nueva Solicitud
              </button>
              <button className="btn btn-caja-outline" onClick={() => window.location.href = `/buro?dni=${cliente.dni}`}>
                <i className="bi bi-bank me-2"></i>Ver Buró
              </button>
              <button className="btn btn-caja-outline" onClick={() => window.location.href = `/pre-evaluacion?cliente_id=${cliente.id}`}>
                <i className="bi bi-calculator me-2"></i>Pre-evaluar
              </button>
            </div>
          </div>

          <div className="table-container">
            <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '12px' }}>Resumen Financiero</h6>
            <div className="mb-2">
              <small className="text-muted">Ingreso mensual</small>
              <div style={{ fontWeight: 600 }}>S/ {(cliente.ingreso_mensual || 0).toLocaleString()}</div>
            </div>
            <div className="mb-2">
              <small className="text-muted">Gasto mensual</small>
              <div style={{ fontWeight: 600 }}>S/ {(cliente.gasto_mensual || 0).toLocaleString()}</div>
            </div>
            <div>
              <small className="text-muted">Capacidad residual</small>
              <div style={{ fontWeight: 600, color: '#28A745' }}>
                S/ {((cliente.ingreso_mensual || 0) - (cliente.gasto_mensual || 0)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
