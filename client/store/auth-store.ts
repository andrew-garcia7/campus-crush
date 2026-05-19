import { create } from "zustand";

interface AuthStore {
  token: string | null;
  user: any | null;
  hydrated: boolean;

  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;

  hydrate: () => void;
  logout: () => void;
}

export const useAuthStore =
  create<AuthStore>((set, get) => ({
    token: null,
    user: null,
    hydrated: false,

    // ------------------------
    // SAVE TOKEN
    // ------------------------
    setToken: (token) => {
      if (
        typeof window !==
        "undefined"
      ) {
        if (token) {
          localStorage.setItem(
            "cc_token",
            token
          );
        } else {
          localStorage.removeItem(
            "cc_token"
          );
        }
      }

      set({ token });
    },

    // ------------------------
    // SAVE USER
    // ------------------------
    setUser: (user) => {
      if (
        typeof window !==
        "undefined"
      ) {
        if (user) {
          localStorage.setItem(
            "cc_user",
            JSON.stringify(
              user
            )
          );
        } else {
          localStorage.removeItem(
            "cc_user"
          );
        }
      }

      set({ user });
    },

    // ------------------------
    // HYDRATE STORE
    // ------------------------
    hydrate: () => {
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      const {
        hydrated
      } = get();

      // already hydrated
      if (hydrated) {
        return;
      }

      try {
        const token =
          localStorage.getItem(
            "cc_token"
          );

        const userRaw =
          localStorage.getItem(
            "cc_user"
          );

        let user = null;

        if (userRaw) {
          try {
            user =
              JSON.parse(
                userRaw
              );
          } catch {
            localStorage.removeItem(
              "cc_user"
            );
          }
        }

        set({
          token:
            token || null,
          user,
          hydrated: true
        });

        console.log(
          "✅ Auth hydrated"
        );

      } catch (
        error
      ) {
        console.error(
          "Hydration failed:",
          error
        );

        set({
          token: null,
          user: null,
          hydrated: true
        });
      }
    },

    // ------------------------
    // LOGOUT
    // ------------------------
    logout: () => {
      if (
        typeof window !==
        "undefined"
      ) {
        localStorage.removeItem(
          "cc_token"
        );

        localStorage.removeItem(
          "cc_user"
        );
      }

      set({
        token: null,
        user: null,
        hydrated: true
      });
    }
  }));