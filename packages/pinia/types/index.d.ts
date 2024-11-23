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
    (): State<T> & Getters<T> & Actions<T>;
    get(): State<T>;
};

interface ProviderProps {
    store: ReturnType<typeof createStore>;
    children: React.ReactNode;
}
declare const Provider: ({ store, children }: ProviderProps) => JSX.Element;
declare const createStore: <T extends { [K in keyof T]: T[K]; }>(options: { [K_1 in keyof T]: StateOption<T[K_1]>; }) => {
    [key: string]: {
        (): State<unknown>;
        get(): State<unknown>;
    };
};
declare const useStore: <T extends { [K in keyof T]: T[K]; }, K_1 extends keyof T>(globalKey: K_1) => (State<T[K_1]> & Getters<T[K_1]> & Actions<T[K_1]>) | null;

declare const version = "2.7.2";

export { Provider, createStore, defineStore, useStore, version };
