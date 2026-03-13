"use client";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { authService, projectService, requestService, taskService, submissionService, userService } from "@/services";
import { ROLE_HOME } from "@/constants";
import { toast } from "sonner";

// Auth 
export const useAuth = () => {
  const router = useRouter();
  const { setAuth, logout: clearAuth, user, token, isLoading } = useAuthStore();

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { token, data } = res.data;
    setAuth({ token, user: data.user });
    router.push(ROLE_HOME[data.user.role] || "/");
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token, data } = res.data;
    setAuth({ token, user: data.user });
    router.push(ROLE_HOME[data.user.role] || "/");
  };

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return { login, register, logout, user, token, isLoading };
};

// Projects 
export const useProjects = (params) =>
  useQuery({ queryKey: ["projects", params], queryFn: () => projectService.getAll(params).then((r) => r.data) });

export const useProject = (id) =>
  useQuery({ queryKey: ["project", id], queryFn: () => projectService.getById(id).then((r) => r.data), enabled: !!id });

export const useCreateProject = () => {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (data) => projectService.create(data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Project created"); router.push("/buyer/projects"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

export const useUpdateProject = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectService.update(id, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["project", id] }); toast.success("Project updated"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id) => projectService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Project deleted"); router.push("/buyer/projects"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

export const useAssignSolver = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId) => projectService.assignSolver(projectId, requestId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["requests", projectId] });
      toast.success("Solver assigned!");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

// Requests 
export const useProjectRequests = (projectId) =>
  useQuery({ queryKey: ["requests", projectId], queryFn: () => requestService.getByProject(projectId).then((r) => r.data), enabled: !!projectId });

export const useMyRequests = () =>
  useQuery({ queryKey: ["my-requests"], queryFn: () => requestService.getMine().then((r) => r.data) });

export const useCreateRequest = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => requestService.create(projectId, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-requests"] }); toast.success("Request submitted!"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

export const useWithdrawRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => requestService.withdraw(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-requests"] }); toast.success("Request withdrawn"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

// Tasks 
export const useTasks = (projectId) =>
  useQuery({ queryKey: ["tasks", projectId], queryFn: () => taskService.getByProject(projectId).then((r) => r.data), enabled: !!projectId });

export const useCreateTask = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => taskService.create(projectId, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", projectId] }); toast.success("Task created"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

export const useUpdateTaskStatus = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, newStatus }) => taskService.updateStatus(projectId, taskId, newStatus).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", projectId] }); qc.invalidateQueries({ queryKey: ["project", projectId] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

export const useDeleteTask = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => taskService.delete(projectId, taskId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", projectId] }); toast.success("Task deleted"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

// Submissions 
export const useTaskSubmissions = (taskId) =>
  useQuery({ queryKey: ["submissions", taskId], queryFn: () => submissionService.getByTask(taskId).then((r) => r.data), enabled: !!taskId });

export const useSubmitTask = (taskId, projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formData, onUploadProgress }) => submissionService.submit(taskId, formData, onUploadProgress).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["submissions", taskId] });
      toast.success("Work submitted!");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

export const useReviewSubmission = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, data }) => submissionService.review(submissionId, data).then((r) => r.data),
    onSuccess: (_, { data }) => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success(data.reviewStatus === "ACCEPTED" ? "Submission accepted!" : "Submission rejected");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};

// Users 
export const useUsers = (params) =>
  useQuery({ queryKey: ["users", params], queryFn: () => userService.getAll(params).then((r) => r.data) });

export const useAdminStats = () =>
  useQuery({ queryKey: ["admin-stats"], queryFn: () => userService.getStats().then((r) => r.data) });

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }) => userService.updateRole(userId, role).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Role updated"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
};
