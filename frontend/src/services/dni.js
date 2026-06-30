import api from './api';

export const consultarDNI = async (dni) => {
  const response = await api.get(`/api/dni/${dni}`);
  return response.data;
};
