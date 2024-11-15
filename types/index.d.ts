declare const storageType: ['localStorage', 'sessionStorage'];
type Persist = {
    key: string;
    storage?: typeof storageType[number];
};

type State<T> = Omit<T, 'actions' | 'getters'>;
interface createStoreOption<T> {
    state: () => State<T>;
    actions?: Record<string, (this: State<T>, ...args: unknown[]) => unknown>;
    getters?: Record<string, (state: State<T>) => unknown>;
    persist?: Persist;
    deep?: boolean;
}
/**
 * defineStore<T>
 * @param options createStoreOption<T>
 * @returns Record<string, unknown>
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
declare const defineStore: <T>(options: createStoreOption<T>) => (storeKey?: string | Array<string>) => State<T> & (T extends {
    getters: infer G;
} ? G : {}) & (T extends {
    actions: infer G_1;
} ? G_1 : {});

declare const version = "2.6.0";

interface ProviderProps {
    store: ReturnType<typeof createStore>;
    children: React.ReactNode;
}
/**
 * Provider
 * @param ProviderProps
 * @returns JSX.Element
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
declare const Provider: ({ store, children }: ProviderProps) => JSX.Element;
/**
 * defineModel
 * @param createStoreOption
 * @returns createStoreOption
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
declare const defineModel: <T extends Record<string, any>>(options: createStoreOption<T>) => createStoreOption<T>;
/**
 * createStore<T extends {[K in keyof T]: T[K]}>
 * @param options {
    [K in keyof T]: createStoreOption<T[K]>
  }
 * @returns {
      [K in keyof T]: T[K] extends { getters: infer G, actions: infer A } ? Omit<T[K], 'getters' | 'actions'> & G & A : Omit<T[K], 'getters' | 'actions'>
    }
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
declare const createStore: <T extends { [K in keyof T]: T[K]; }>(options: { [K_1 in keyof T]: createStoreOption<T[K_1]>; }) => { [K_2 in keyof T]: T[K_2] extends {
    getters: infer G;
    actions: infer A;
} ? State<T[K_2]> & G & A : State<T[K_2]>; };
/**
 * useStore<T extends {[K in keyof T]: T[K]}, K extends keyof T>
 * @param globalKey: K
 * @param storeKey?: string | Array<string>
 * @returns T[K] extends { getters: infer G, actions: infer A } ? Omit<T[K], 'getters' | 'actions'> & G & A : Omit<T[K], 'getters' | 'actions'>
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
declare const useStore: <T extends { [K in keyof T]: T[K]; }, K_1 extends keyof T>(globalKey: K_1, storeKey?: string | Array<string>) => (T[K_1] extends {
    getters: infer G;
    actions: infer A;
} ? State<T[K_1]> & G & A : State<T[K_1]>) | null;

export { Provider, ProviderProps, State, createStore, createStoreOption, defineModel, defineStore, useStore, version };
