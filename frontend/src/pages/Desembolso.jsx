import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function Desembolso() {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [cronograma, setCronograma] = useState([]);
  const [form, setForm] = useState({ monto: '', fecha: '', metodo: 'transferencia' });

  useEffect(() => {
    fetchPendientes();
  }, []);

  const fetchPendientes = async () => {
    try {
      const res = await api.get('/api/desembolso/pendientes');
      setPendientes(res.data?.data || []);
    } catch {
      setPendientes([]);
    } finally {
      setLoading(false);
    }
  };

  const openDesembolso = async (sol) => {
    setSelected(sol);
    setForm({ monto: sol.monto_aprobado || sol.monto_solicitado, fecha: '', metodo: 'transferencia' });
    try {
      const res = await api.get(`/api/desembolso/cronograma/${sol.id}`);
      setCronograma(res.data?.cronograma || []);
    } catch {
      setCronograma([]);
    }
    setShowModal(true);
  };

  const confirmarDesembolso = async () => {
    if (!form.fecha || !form.monto) {
      Swal.fire('Campos requeridos', 'Complete todos los campos', 'warning');
      return;
    }

    try {
      await api.post('/api/desembolso', {
        solicitud_id: selected.id,
        monto: parseFloat(form.monto),
        fecha: form.fecha,
        metodo: form.metodo,
      });
      Swal.fire('Desembolsado', 'El desembolso fue registrado exitosamente', 'success');
      setShowModal(false);
      fetchPendientes();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.detail || 'No se pudo desembolsar', 'error');
    }
  };

  return (
    <Layout>
      <h4 className="mb-4" style={{ color: '#003366', fontWeight: 600 }}>Desembolso</h4>

      <div className="table-container">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : pendientes.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-cash-stack" style={{ fontSize: '3rem', opacity: 0.2 }}></i>
            <p className="text-muted mt-3">No hay solicitudes pendientes de desembolso</p>
          </div>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Expediente</th>
                <th>Cliente</th>
                <th>Monto Aprobado</th>
                <th>Plazo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((sol) => (
                <tr key={sol.id}>
                  <td style={{ fontWeight: 500 }}>{sol.numero_expediente}</td>
                  <td>{sol.cliente?.nombre} {sol.cliente?.apellido}</td>
                  <td style={{ fontWeight: 600 }}>S/ {(sol.monto_aprobado || sol.monto_solicitado)?.toLocaleString()}</td>
                  <td>{sol.plazo} meses</td>
                  <td>
                    <span className="status-badge badge-aprobado">Aprobado</span>
                  </td>
                  <td>
                    <button className="btn btn-caja btn-sm" onClick={() => openDesembolso(sol)}>
                      <i className="bi bi-cash me-1"></i>Desembolsar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selected && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Desembolso - {selected.numero_expediente}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label">Monto a desembolsar (S/)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.monto}
                      onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Fecha de desembolso</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.fecha}
                      onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Método</label>
                    <select
                      className="form-select"
                      value={form.metodo}
                      onChange={(e) => setForm({ ...form, metodo: e.target.value })}
                    >
                      <option value="transferencia">Transferencia bancaria</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="deposito">Depósito</option>
                    </select>
                  </div>
                </div>

                {cronograma.length > 0 && (
                  <>
                    <h6 style={{ color: '#003366', fontWeight: 600 }}>Cronograma de Pagos</h6>
                    <div style={{ maxHeight: '250px', overflow: 'auto' }}>
                      <table className="table table-sm table-hover">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Vencimiento</th>
                            <th>Capital</th>
                            <th>Interés</th>
                            <th>Cuota</th>
                            <th>Saldo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cronograma.map((row) => (
                            <tr key={row.numero_cuota}>
                              <td>{row.numero_cuota}</td>
                              <td>{row.fecha_vencimiento}</td>
                              <td>S/ {row.capital?.toFixed(2)}</td>
                              <td>S/ {row.interes?.toFixed(2)}</td>
                              <td style={{ fontWeight: 600 }}>S/ {row.cuota_total?.toFixed(2)}</td>
                              <td>S/ {row.saldo?.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-caja" onClick={confirmarDesembolso}>
                  <i className="bi bi-check-circle me-2"></i>Confirmar Desembolso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
