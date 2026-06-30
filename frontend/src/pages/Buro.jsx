import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function Buro() {
  const [searchParams] = useSearchParams();
  const initialDni = searchParams.get('dni') || '';
  const [dni, setDni] = useState(initialDni);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  useEffect(() => {
    if (initialDni) {
      setDni(initialDni);
      consultar(initialDni);
    }
  }, [initialDni]);

  const consultar = async (dniParam) => {
    const dniBuscado = dniParam || dni;
    if (!dniBuscado || dniBuscado.length !== 8) {
      Swal.fire('DNI inválido', 'Ingrese un DNI de 8 dígitos', 'warning');
      return;
    }

    setLoading(true);
    setResultado(null);
    try {
      const res = await api.get(`/api/buro/${dniBuscado}`);
      setResultado(res.data);
      fetchHistorial(dniBuscado);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.detail || 'No se pudo consultar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorial = async (dniParam) => {
    setLoadingHistorial(true);
    try {
      const res = await api.get(`/api/buro/historico/${dniParam || dni}`);
      setHistorial(res.data?.data || []);
    } catch {
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 700) return '#28A745';
    if (score >= 500) return '#FFC107';
    if (score >= 350) return '#FD7E14';
    return '#DC3545';
  };

  const getResultadoConfig = (resultado) => {
    const configs = {
      NORMAL: { clase: 'bajo', icon: 'bi-check-circle', color: '#28A745', label: 'NORMAL' },
      CPP: { clase: 'medio', icon: 'bi-exclamation-triangle', color: '#FFC107', label: 'CPP' },
      DEFICIENTE: { clase: 'alto', icon: 'bi-x-circle', color: '#FD7E14', label: 'DEFICIENTE' },
      DUDOSO: { clase: 'critico', icon: 'bi-shield-exclamation', color: '#DC3545', label: 'DUDOSO' },
    };
    return configs[resultado] || configs.NORMAL;
  };

  return (
    <Layout>
      <h4 className="mb-4" style={{ color: '#003366', fontWeight: 600 }}>Buró de Crédito</h4>

      <div className="table-container mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Número de DNI</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ingrese DNI (8 dígitos)"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              maxLength={8}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-caja w-100" onClick={() => consultar()} disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <><i className="bi bi-search me-2"></i>Consultar</>
              )}
            </button>
          </div>
        </div>
      </div>

      {resultado && (
        <>
          {resultado.inhabilitado && (
            <div className="alert alert-custom d-flex align-items-center mb-4" style={{ background: '#fee2e2', color: '#991b1b' }}>
              <i className="bi bi-shield-exclamation me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <strong>ALERTA:</strong> Cliente encontrado en lista de inhabilitados. CRÉDITO RECHAZADO.
              </div>
            </div>
          )}

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="table-container text-center">
                <small className="text-muted d-block mb-2">Score Crediticio</small>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: getScoreColor(resultado.score) }}>
                  {resultado.score}
                </div>
                <div className="score-bar" style={{ maxWidth: '200px', margin: '0 auto' }}>
                  <div
                    className="score-bar-fill"
                    style={{ width: `${(resultado.score / 1000) * 100}%`, background: getScoreColor(resultado.score) }}
                  ></div>
                </div>
                <small className="text-muted">de 1000</small>
              </div>
            </div>
            <div className="col-md-2">
              <div className="table-container text-center">
                <small className="text-muted d-block mb-2">Entidades</small>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#003366' }}>{resultado.entidades}</div>
                <small className="text-muted">con deuda</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="table-container text-center">
                <small className="text-muted d-block mb-2">Deuda Total</small>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#DC3545' }}>S/ {resultado.deuda_total?.toLocaleString()}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="table-container text-center">
                <small className="text-muted d-block mb-2">Días de Mora</small>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: resultado.dias_mora > 30 ? '#DC3545' : '#28A745' }}>
                  {resultado.dias_mora}
                </div>
                <small className="text-muted">días máximo</small>
              </div>
            </div>
          </div>

          <div className="table-container mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h6 style={{ color: '#003366', fontWeight: 600 }}>Resultado de la Consulta</h6>
              {(() => {
                const config = getResultadoConfig(resultado.resultado);
                return (
                  <span className={`semaforo semaforo-${config.clase}`}>
                    <i className={`bi ${config.icon}`}></i> {config.label}
                  </span>
                );
              })()}
            </div>
            <p className="mt-2 mb-0" style={{ fontSize: '0.9rem' }}>{resultado.mensaje}</p>
          </div>
        </>
      )}

      {!resultado && !loading && (
        <div className="table-container text-center py-5">
          <i className="bi bi-bank" style={{ fontSize: '3rem', opacity: 0.2 }}></i>
          <p className="text-muted mt-3">Ingrese un DNI y haga clic en Consultar</p>
        </div>
      )}

      {historial.length > 0 && (
        <div className="table-container">
          <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '12px' }}>Historial de Consultas</h6>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Score</th>
                <th>Entidades</th>
                <th>Deuda</th>
                <th>Mora</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id}>
                  <td>{h.created_at ? new Date(h.created_at).toLocaleString() : '-'}</td>
                  <td style={{ fontWeight: 600 }}>{h.score}</td>
                  <td>{h.entidades_deuda}</td>
                  <td>S/ {h.deuda_total?.toLocaleString()}</td>
                  <td>{h.dias_mora} días</td>
                  <td>
                    <span className={`status-badge badge-${h.resultado === 'NORMAL' ? 'aprobado' : h.resultado === 'DUDOSO' ? 'rechazado' : 'en_evaluacion'}`}>
                      {h.resultado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
