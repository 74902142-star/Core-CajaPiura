import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="text-center py-5">
        <h1 style={{ fontSize: '5rem', fontWeight: 700, color: '#005B96' }}>404</h1>
        <h4 style={{ color: '#003366', marginBottom: '16px' }}>Página no encontrada</h4>
        <p className="text-muted mb-4">La página que busca no existe o fue movida.</p>
        <a href="/dashboard" className="btn btn-caja">
          <i className="bi bi-house me-2"></i>Volver al Dashboard
        </a>
      </div>
    </Layout>
  );
}
