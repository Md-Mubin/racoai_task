import api from "./api";

// for auth
export const authService = {
  register: (data)     => api.post("/auth/register", data),
  login:    (data)     => api.post("/auth/login", data),
  logout:   ()         => api.post("/auth/logout"),
  getMe:    ()         => api.get("/auth/me"),
};

// for projects
export const projectService = {
  getAll:           (params)       => api.get("/projects", { params }),
  getById:          (id)           => api.get(`/projects/${id}`),
  create:           (data)         => api.post("/projects", data),
  update:           (id, data)     => api.patch(`/projects/${id}`, data),
  delete:           (id)           => api.delete(`/projects/${id}`),
  assignSolver:     (id, requestId)=> api.patch(`/projects/${id}/assign`, { requestId }),
  transitionStatus: (id, newStatus)=> api.patch(`/projects/${id}/status`, { newStatus }),
};

// for requests
export const requestService = {
  create:       (projectId, data) => api.post(`/projects/${projectId}/requests`, data),
  getByProject: (projectId)       => api.get(`/projects/${projectId}/requests`),
  getMine:      ()                => api.get("/requests/mine"),
  withdraw:     (requestId)       => api.delete(`/requests/${requestId}/withdraw`),
};

// for tasks
export const taskService = {
  create:       (projectId, data)           => api.post(`/projects/${projectId}/tasks`, data),
  getByProject: (projectId)                 => api.get(`/projects/${projectId}/tasks`),
  update:       (projectId, taskId, data)   => api.patch(`/projects/${projectId}/tasks/${taskId}`, data),
  updateStatus: (projectId, taskId, status) => api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { newStatus: status }),
  delete:       (projectId, taskId)         => api.delete(`/projects/${projectId}/tasks/${taskId}`),
};

// for submission
export const submissionService = {
  submit:    (taskId, formData, onUploadProgress) =>
    api.post(`/submissions/tasks/${taskId}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }),
  getByTask: (taskId)        => api.get(`/submissions/tasks/${taskId}`),
  review:    (id, data)      => api.patch(`/submissions/${id}/review`, data),
};

// for user
export const userService = {
  getAll:        (params) => api.get("/users", { params }),
  getStats:      ()       => api.get("/users/stats"),
  updateRole:    (id, role) => api.patch(`/users/${id}/role`, { role }),
  updateProfile: (formData) =>
    api.patch("/users/me/profile", formData, { headers: { "Content-Type": "multipart/form-data" } }),
};
