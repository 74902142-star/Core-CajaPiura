import { useState, useEffect } from 'react';
import api from '../services/api';

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url, options);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}

export function useApiPost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postData = async (url, payload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(url, payload);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error al procesar solicitud';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { postData, loading, error };
}
