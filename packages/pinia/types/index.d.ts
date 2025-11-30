declare const storageType: string[];
type Persist = {
    key: string;
    storage?: (typeof storageType)[number];
};
type State<T> = Omit<T, 'actions' | 'getters'>;
type Getters<T> = T extends {
    getters: infer G;
} ? G : {};
type Actions<T> = T extends {
    actions: infer G;
} ? G : {};
interface StateOption<T> {
    state: () => State<T>;
    actions?: {
        [key: string]: (this: State<T>, ...args: any[]) => unknown;
    };
    getters?: {
        [key: string]: (state: State<T>) => unknown;
    };
    persist?: Persist;
    deep?: boolean;
}

declare function defineStore<T>(options: StateOption<T>): {
    (selector?: ((state: State<T> & Getters<T> & Actions<T>) => any) | undefined): State<T> & Getters<T> & Actions<T>;
    get(): State<T>;
};

interface ProviderProps {
    store: ReturnType<typeof createStore>;
    children: React.ReactNode;
}
declare const Provider: ({ store, children }: ProviderProps) => JSX.Element;
declare const createStore: <T extends { [K in keyof T]: T[K]; }>(options: { [K_1 in keyof T]: StateOption<T[K_1]>; }) => {
    [key: string]: {
        (selector?: ((state: State<unknown>) => any) | undefined): State<unknown>;
        get(): State<unknown>;
    };
};
declare function useStore<T extends {
    [K in keyof T]: T[K];
}, K extends keyof T>(globalKey: K): State<T[K]> & Getters<T[K]> & Actions<T[K]>;
declare function useStore<T extends {
    [K in keyof T]: T[K];
}, K extends keyof T, S>(globalKey: K, selector: (store: State<T[K]> & Getters<T[K]> & Actions<T[K]>) => S): S;

declare const version = "2.7.4";

export { Provider, createStore, defineStore, useStore, version };
