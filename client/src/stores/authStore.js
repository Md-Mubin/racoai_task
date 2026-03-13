import { create } from "zustand";

const load = () => {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    return {
      token: localStorage.getItem("token"),
      user: JSON.parse(localStorage.getItem("user") || "null"),
    };
  } catch { return { token: null, user: null }; }
};

export const useAuthStore = create((set) => ({
  ...load(),
  user: null,
  token: null,
  isLoading: true, // ✅ must be true by default

  setAuth: ({ token, user }) => {
    localStorage.setItem("token", token);                  // ✅
    localStorage.setItem("user", JSON.stringify(user));    // ✅
    set({ token, user, isLoading: false });
  },
  setLoading: (val) => set({ isLoading: val }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isLoading: false });
  }
}));

// export const useAuthStore = create((set, get) => ({
//   ...load(),
//   isLoading: true,

//   setAuth: ({ token, user }) => {
//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(user));
//     set({ token, user, isLoading: false });
//   },

//   setUser: (user) => {
//     localStorage.setItem("user", JSON.stringify(user));
//     set({ user });
//   },

//   logout: () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     set({ token: null, user: null, isLoading: false });
//   },

//   setLoading: (isLoading) => set({ isLoading }),
//   isAuthenticated: () => !!get().token,
// }));
