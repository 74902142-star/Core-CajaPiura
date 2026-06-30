import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function PreEvaluacion() {
  const [searchParams] = useSearchParams();
  const [ingreso, setIngreso] = useState('');
  const [gasto, setGasto] = useState('');
  const [cuota, setCuota] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const calcular = async () => {
    if (!ingreso || !gasto || !cuota) {
      Swal.fire('Campos requeridos', 'Ingrese todos los valores', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/pre-evaluacion', {
        ingreso: parseFloat(ingreso),
        gasto: parseFloat(gasto),
        cuota: parseFloat(cuota),
      });
      setResultado(res.data);
    } catch {
      Swal.fire('Error', 'No se pudo calcular', 'error');
    } finally {
      setLoading(false);
    }
  };

  const guardar = async () => {
    if (!resultado) return;
    try {
      await api.post('/api/pre-evaluacion/guardar', {
        ingreso: parseFloat(ingreso),
        gasto: parseFloat(gasto),
        cuota: parseFloat(cuota),
      });
      Swal.fire('Guardado', 'Pre-evaluación guardada exitosamente', 'success');
    } catch {
      Swal.fire('Error', 'No se pudo guardar', 'error');
    }
  };

  const getPuntajeColor = (puntaje) => {
    if (puntaje >= 70) return '#28A745';
    if (puntaje >= 50) return '#FFC107';
    if (puntaje >= 30) return '#FD7E14';
    return '#DC3545';
  };

  return (
    <Layout>
      <h4 className="mb-4" style={{ color: '#003366', fontWeight: 600 }}>Pre-Evaluación Crediticia</h4>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="table-container">
            <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '16px' }}>Datos Financieros</h6>
            <div className="mb-3">
              <label className="form-label">Ingreso mensual (S/)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Ej: 5000"
                value={ingreso}
                onChange={(e) => setIngreso(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Gasto mensual (S/)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Ej: 2000"
                value={gasto}
                onChange={(e) => setGasto(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Cuota solicitada (S/)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Ej: 800"
                value={cuota}
                onChange={(e) => setCuota(e.target.value)}
              />
            </div>
            <button className="btn btn-caja w-100" onClick={calcular} disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Calculando...</>
              ) : (
                <><i className="bi bi-calculator me-2"></i>Calcular</>
              )}
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <div className="table-container">
            <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '16px' }}>Resultado</h6>
            {resultado ? (
              <>
                <div className="text-center mb-4">
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      border: `6px solid ${getPuntajeColor(resultado.puntaje)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      flexDirection: 'column',
                    }}
                  >
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: getPuntajeColor(resultado.puntaje) }}>
                      {resultado.puntaje}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#6C757D' }}>puntos</span>
                  </div>
                  <div className="mt-3">
                    {resultado.apto ? (
                      <span className="badge bg-success px-3 py-2" style={{ fontSize: '0.9rem' }}>
                        <i className="bi bi-check-circle me-1"></i>APTO
                      </span>
                    ) : (
                      <span className="badge bg-danger px-3 py-2" style={{ fontSize: '0.9rem' }}>
                        <i className="bi bi-x-circle me-1"></i>NO APTO
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <small className="text-muted">Capacidad de pago</small>
                  <div style={{ fontWeight: 600 }}>S/ {resultado.capacidad_pago?.toLocaleString()}</div>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Ratio de endeudamiento</small>
                  <div style={{ fontWeight: 600 }}>{resultado.ratio_endeudamiento}%</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Mensaje</small>
                  <div style={{ fontSize: '0.85rem' }}>{resultado.mensaje}</div>
                </div>

                <div className="score-bar">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${resultado.puntaje}%`,
                      background: getPuntajeColor(resultado.puntaje),
                    }}
                  ></div>
                </div>

                <button className="btn btn-caja-outline w-100 mt-3" onClick={guardar}>
                  <i className="bi bi-save me-2"></i>Guardar resultado
                </button>
              </>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-calculator" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <p className="mt-3">Ingrese los datos y haga clic en Calcular</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
