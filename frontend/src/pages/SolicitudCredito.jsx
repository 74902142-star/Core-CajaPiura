import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function SolicitudCredito() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    dni: '', nombre: '', apellido: '', telefono: '', email: '', direccion: '',
    nombre_negocio: '', antiguedad: '', ingreso: '', gasto: '',
    monto: '', plazo: '12', tea: '18', garantia: '', destino: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchingDNI, setSearchingDNI] = useState(false);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buscarDNI = async () => {
    const dniClean = form.dni.replace(/\D/g, '');
    if (dniClean.length !== 8) {
      Swal.fire('DNI inválido', 'Ingrese un DNI de 8 dígitos', 'warning');
      return;
    }
    setSearchingDNI(true);
    try {
      const res = await api.get(`/api/dni/${dniClean}`);
      if (res.data.error) {
        Swal.fire('Error', res.data.error, 'error');
        return;
      }
      setForm((prev) => ({
        ...prev,
        id: res.data.id || '',
        nombre: res.data.nombre || prev.nombre,
        apellido: res.data.apellido || prev.apellido,
        direccion: res.data.direccion || prev.direccion,
        telefono: res.data.telefono || prev.telefono,
        email: res.data.email || prev.email,
        nombre_negocio: res.data.nombre_negocio || prev.nombre_negocio,
        antiguedad: res.data.antiguedad_negocio || prev.antiguedad,
        ingreso: res.data.ingreso_mensual || prev.ingreso,
        gasto: res.data.gasto_mensual || prev.gasto,
      }));
      Swal.fire('Datos encontrados', `Cliente: ${res.data.nombre} ${res.data.apellido}`, 'success');
    } catch {
      Swal.fire('Error', 'No se pudo consultar el DNI', 'error');
    } finally {
      setSearchingDNI(false);
    }
  };

  const calcularCuota = () => {
    const monto = parseFloat(form.monto) || 0;
    const tea = (parseFloat(form.tea) || 18) / 100;
    const plazo = parseInt(form.plazo) || 12;
    const tasa = tea / 12;
    if (tasa === 0) return monto / plazo;
    return monto * (tasa * (1 + tasa) ** plazo) / ((1 + tasa) ** plazo - 1);
  };

  const generarCronograma = () => {
    const monto = parseFloat(form.monto) || 0;
    const tea = (parseFloat(form.tea) || 18) / 100;
    const plazo = parseInt(form.plazo) || 12;
    const tasa = tea / 12;
    const cuota = calcularCuota();
    let saldo = monto;
    const cronograma = [];

    for (let i = 1; i <= plazo; i++) {
      const interes = saldo * tasa;
      const capital = cuota - interes;
      saldo -= capital;
      if (saldo < 0) saldo = 0;
      cronograma.push({
        cuota: i,
        capital: capital.toFixed(2),
        interes: interes.toFixed(2),
        total: cuota.toFixed(2),
        saldo: saldo.toFixed(2),
      });
    }
    return cronograma;
  };

  const enviarSolicitud = async () => {
    setLoading(true);
    try {
      // 1. Registrar o actualizar datos del cliente en la base de datos
      const clienteRes = await api.post('/api/clientes', {
        dni: form.dni,
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono || null,
        email: form.email || null,
        direccion: form.direccion || null,
        ingreso_mensual: parseFloat(form.ingreso) || 0,
        gasto_mensual: parseFloat(form.gasto) || 0,
        nombre_negocio: form.nombre_negocio || null,
        antiguedad_negocio: form.antiguedad || null,
      });

      const clienteId = clienteRes.data.cliente?.id;
      if (!clienteId) {
        throw new Error("No se pudo obtener el ID del cliente registrado");
      }

      // 2. Registrar la solicitud con el clienteId real
      const res = await api.post('/api/solicitudes', {
        cliente_id: clienteId,
        monto: parseFloat(form.monto),
        plazo: parseInt(form.plazo),
        tea: parseFloat(form.tea),
        garantia: form.garantia,
        destino: form.destino,
      });

      Swal.fire({
        title: 'Solicitud Enviada',
        html: `
          <p>Número de expediente:</p>
          <h4 style="color: #005B96">${res.data.solicitud?.numero_expediente}</h4>
          <p>Cuota estimada: <strong>S/ ${res.data.solicitud?.cuota_estimada?.toLocaleString()}</strong></p>
        `,
        icon: 'success',
        confirmButtonColor: '#005B96',
      });
      setStep(1);
      setForm({
        dni: '', nombre: '', apellido: '', telefono: '', email: '', direccion: '',
        nombre_negocio: '', antiguedad: '', ingreso: '', gasto: '',
        monto: '', plazo: '12', tea: '18', garantia: '', destino: '',
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.detail || err.message || 'No se pudo enviar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Datos Cliente', 'Negocio', 'Crédito', 'Resumen'];

  return (
    <Layout>
      <h4 className="mb-4" style={{ color: '#003366', fontWeight: 600 }}>Solicitud de Crédito</h4>

      <div className="table-container mb-4">
        <div className="stepper">
          {steps.map((label, i) => (
            <div key={i} className={`step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}>
              <div className="step-circle">
                {step > i + 1 ? <i className="bi bi-check"></i> : i + 1}
              </div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="table-container">
          <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '16px' }}>Paso 1: Datos del Cliente</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">DNI</label>
              <div className="input-group">
                <input className="form-control" value={form.dni} onChange={(e) => updateForm('dni', e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="8 dígitos" maxLength={8} />
                <button className="btn btn-caja" type="button" onClick={buscarDNI} disabled={searchingDNI}>
                  {searchingDNI ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-search"></i>}
                </button>
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Nombres</label>
              <input className="form-control" value={form.nombre} onChange={(e) => updateForm('nombre', e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Apellidos</label>
              <input className="form-control" value={form.apellido || ''} onChange={(e) => updateForm('apellido', e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Teléfono</label>
              <input className="form-control" value={form.telefono} onChange={(e) => updateForm('telefono', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Correo</label>
              <input className="form-control" type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Dirección</label>
              <input className="form-control" value={form.direccion} onChange={(e) => updateForm('direccion', e.target.value)} />
            </div>
          </div>
          <div className="d-flex justify-content-end mt-4">
            <button className="btn btn-caja" onClick={() => setStep(2)}>
              Siguiente <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="table-container">
          <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '16px' }}>Paso 2: Datos del Negocio</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre del negocio</label>
              <input className="form-control" value={form.nombre_negocio} onChange={(e) => updateForm('nombre_negocio', e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Antigüedad</label>
              <input className="form-control" value={form.antiguedad} onChange={(e) => updateForm('antiguedad', e.target.value)} placeholder="Ej: 3 años" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Ingreso mensual (S/)</label>
              <input className="form-control" type="number" value={form.ingreso} onChange={(e) => updateForm('ingreso', e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Gasto mensual (S/)</label>
              <input className="form-control" type="number" value={form.gasto} onChange={(e) => updateForm('gasto', e.target.value)} />
            </div>
          </div>
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-caja-outline" onClick={() => setStep(1)}>
              <i className="bi bi-arrow-left me-2"></i>Anterior
            </button>
            <button className="btn btn-caja" onClick={() => setStep(3)}>
              Siguiente <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="table-container">
          <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '16px' }}>Paso 3: Datos del Crédito</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Monto solicitado (S/)</label>
              <input className="form-control" type="number" value={form.monto} onChange={(e) => updateForm('monto', e.target.value)} placeholder="Ej: 10000" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Plazo (meses)</label>
              <select className="form-select" value={form.plazo} onChange={(e) => updateForm('plazo', e.target.value)}>
                {[6, 12, 18, 24, 36, 48].map((p) => (
                  <option key={p} value={p}>{p} meses</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">TEA (%)</label>
              <input className="form-control" type="number" value={form.tea} onChange={(e) => updateForm('tea', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Garantía</label>
              <input className="form-control" value={form.garantia} onChange={(e) => updateForm('garantia', e.target.value)} placeholder="Ej: Hipotecario" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Destino</label>
              <input className="form-control" value={form.destino} onChange={(e) => updateForm('destino', e.target.value)} placeholder="Ej: Capital de trabajo" />
            </div>
          </div>
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-caja-outline" onClick={() => setStep(2)}>
              <i className="bi bi-arrow-left me-2"></i>Anterior
            </button>
            <button className="btn btn-caja" onClick={() => setStep(4)}>
              Ver Resumen <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="table-container">
          <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '16px' }}>Paso 4: Resumen y Simulador</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="p-3" style={{ background: '#F5F7FA', borderRadius: '8px' }}>
                <h6 style={{ fontSize: '0.85rem', color: '#6C757D' }}>Cliente</h6>
                <p style={{ fontWeight: 600 }}>{form.nombre || 'Sin nombre'} {form.apellido || ''}</p>
                <p style={{ fontSize: '0.85rem' }}>DNI: {form.dni || '-'}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3" style={{ background: '#F5F7FA', borderRadius: '8px' }}>
                <h6 style={{ fontSize: '0.85rem', color: '#6C757D' }}>Crédito</h6>
                <p style={{ fontWeight: 600 }}>S/ {parseFloat(form.monto || 0).toLocaleString()}</p>
                <p style={{ fontSize: '0.85rem' }}>{form.plazo} meses · TEA {form.tea}%</p>
                <p style={{ fontSize: '0.85rem', color: '#005B96', fontWeight: 600 }}>
                  Cuota: S/ {calcularCuota().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <h6 style={{ color: '#003366', fontWeight: 600, marginBottom: '12px' }}>Cronograma de Pagos</h6>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Capital</th>
                  <th>Interés</th>
                  <th>Cuota</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {generarCronograma().map((row) => (
                  <tr key={row.cuota}>
                    <td>{row.cuota}</td>
                    <td>S/ {row.capital}</td>
                    <td>S/ {row.interes}</td>
                    <td style={{ fontWeight: 600 }}>S/ {row.total}</td>
                    <td>S/ {row.saldo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-caja-outline" onClick={() => setStep(3)}>
              <i className="bi bi-arrow-left me-2"></i>Anterior
            </button>
            <button className="btn btn-caja" onClick={enviarSolicitud} disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Enviando...</>
              ) : (
                <><i className="bi bi-send me-2"></i>Enviar Solicitud</>
              )}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
