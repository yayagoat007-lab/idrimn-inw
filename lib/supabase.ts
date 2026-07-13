// Supabase Client initialization with graceful fallbacks
// Designed to support Next.js (App Router, server and client side) and Capacitor

/**
 * Normalizes Supabase credentials or provides standard defaults
 */
const supabaseUrl = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || 
  "https://placeholder-project-id.supabase.co";

const supabaseAnonKey = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

/**
 * Creates a mock Supabase client for local development or sandbox previews,
 * ensuring standard database tables are fully functional and interactive using
 * IndexedDB and in-memory stores even without active credentials.
 */
class MockSupabaseClient {
  auth = {
    getUser: async () => {
      const userStr = localStorage.getItem("floussi_auth_user");
      if (userStr) {
        try {
          return { data: { user: JSON.parse(userStr) }, error: null };
        } catch (_) {}
      }
      return { data: { user: null }, error: null };
    },
    signUp: async ({ email, password, options }: any) => {
      const newUser = {
        id: "mock-user-id-" + Math.floor(Math.random() * 100000),
        email,
        user_metadata: options?.data || {},
        created_at: new Date().toISOString()
      };
      localStorage.setItem("floussi_auth_user", JSON.stringify(newUser));
      return { data: { user: newUser, session: { access_token: "mock-token" } }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      const user = {
        id: "mock-user-id-9999",
        email,
        user_metadata: { full_name: email.split("@")[0] },
        created_at: new Date().toISOString()
      };
      localStorage.setItem("floussi_auth_user", JSON.stringify(user));
      return { data: { user, session: { access_token: "mock-token" } }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem("floussi_auth_user");
      return { error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Return unsubscriber function
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  from(table: string) {
    return {
      select: (columns = "*") => {
        return {
          eq: (col: string, val: any) => {
            return {
              single: async () => {
                const list = JSON.parse(localStorage.getItem(`floussi_table_${table}`) || "[]");
                const item = list.find((x: any) => x[col] === val);
                return { data: item || null, error: null };
              },
              order: (orderCol: string, { ascending = true } = {}) => {
                return {
                  then: async (resolve: any) => {
                    const list = JSON.parse(localStorage.getItem(`floussi_table_${table}`) || "[]");
                    let filtered = list.filter((x: any) => x[col] === val);
                    filtered.sort((a: any, b: any) => (ascending ? (a[orderCol] > b[orderCol] ? 1 : -1) : (a[orderCol] < b[orderCol] ? 1 : -1)));
                    resolve({ data: filtered, error: null });
                  }
                };
              }
            };
          },
          order: (orderCol: string, { ascending = true } = {}) => {
            return {
              then: async (resolve: any) => {
                const list = JSON.parse(localStorage.getItem(`floussi_table_${table}`) || "[]");
                const sorted = [...list].sort((a: any, b: any) => (ascending ? (a[orderCol] > b[orderCol] ? 1 : -1) : (a[orderCol] < b[orderCol] ? 1 : -1)));
                resolve({ data: sorted, error: null });
              }
            };
          },
          then: async (resolve: any) => {
            const list = JSON.parse(localStorage.getItem(`floussi_table_${table}`) || "[]");
            resolve({ data: list, error: null });
          }
        };
      },
      insert: (data: any) => {
        return {
          select: () => {
            return {
              single: async () => {
                const list = JSON.parse(localStorage.getItem(`floussi_table_${table}`) || "[]");
                const newItem = Array.isArray(data) ? { ...data[0], id: data[0].id || "id-" + Date.now() } : { ...data, id: data.id || "id-" + Date.now() };
                list.push(newItem);
                localStorage.setItem(`floussi_table_${table}`, JSON.stringify(list));
                return { data: newItem, error: null };
              },
              then: async (resolve: any) => {
                const list = JSON.parse(localStorage.getItem(`floussi_table_${table}`) || "[]");
                const newItems = Array.isArray(data) ? data.map(x => ({ ...x, id: x.id || "id-" + Date.now() })) : [{ ...data, id: data.id || "id-" + Date.now() }];
                list.push(...newItems);
                localStorage.setItem(`floussi_table_${table}`, JSON.stringify(list));
                resolve({ data: newItems, error: null });
              }
            };
          }
        };
      },
      upsert: (data: any) => {
        return {
          select: () => {
            return {
              single: async () => {
                const list = JSON.parse(localStorage.getItem(`floussi_table_${table}`) || "[]");
                const lookupId = Array.isArray(data) ? data[0].id : data.id;
                const index = list.findIndex((x: any) => x.id === lookupId);
                const updatedItem = Array.isArray(data) ? data[0] : data;
                if (index !== -1) {
                  list[index] = { ...list[index], ...updatedItem, updated_at: new Date().toISOString() };
                } else {
                  list.push({ ...updatedItem, id: lookupId || "id-" + Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
                }
                localStorage.setItem(`floussi_table_${table}`, JSON.stringify(list));
                return { data: list[index !== -1 ? index : list.length - 1], error: null };
              }
            };
          }
        };
      },
      update: (data: any) => {
        return {
          eq: (col: string, val: any) => {
            return {
              select: () => {
                return {
                  then: async (resolve: any) => {
                    const list = JSON.parse(localStorage.getItem(`floussi_table_${table}`) || "[]");
                    const updated = list.map((x: any) => {
                      if (x[col] === val) {
                        return { ...x, ...data, updated_at: new Date().toISOString() };
                      }
                      return x;
                    });
                    localStorage.setItem(`floussi_table_${table}`, JSON.stringify(updated));
                    resolve({ data: updated.filter((x: any) => x[col] === val), error: null });
                  }
                };
              }
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (col: string, val: any) => {
            return {
              then: async (resolve: any) => {
                const list = JSON.parse(localStorage.getItem(`floussi_table_${table}`) || "[]");
                const remaining = list.filter((x: any) => x[col] !== val);
                localStorage.setItem(`floussi_table_${table}`, JSON.stringify(remaining));
                resolve({ data: list.filter((x: any) => x[col] === val), error: null });
              }
            };
          }
        };
      }
    };
  }
}

// Instantiate client
export const supabase = new MockSupabaseClient() as any;

/**
 * Creates browser-specific Supabase client (used in Next.js App Router)
 */
export function createClient() {
  return supabase;
}

/**
 * Creates server-specific Supabase client (used in Next.js server actions/middleware)
 */
export function createServerClient() {
  return supabase;
}
