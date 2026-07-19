import api from "../axios";
//talks or communicate to the network

export const usersApi = {
  getAll: (params) => api.get("/users", { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (payload) => api.post("/users", payload),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  updateAccountStatus: (id, cAccountStatus) =>
    api.patch(`/users/${id}/status`, { cAccountStatus }),
  delete: (id) => api.delete(`/users/${id}`),
};