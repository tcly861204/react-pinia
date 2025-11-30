declare const storageType: string[];
/**
 * 持久化配置类型
 * @property {string} key - 存储的键名
 * @property {string} [storage] - 存储类型，可选 'localStorage' 或 'sessionStorage'，默认为 'localStorage'
 */
type Persist = {
    key: string;
    storage?: (typeof storageType)[number];
};
/**
 * 状态类型，从 T 中排除 actions 和 getters 属性
 * @template T - 原始类型
 */
type State<T> = Omit<T, 'actions' | 'getters'>;
/**
 * Getters 类型提取器
 * 如果 T 包含 getters 属性，则提取其类型；否则返回空对象类型
 * @template T - 原始类型
 */
type Getters<T> = T extends {
    getters: infer G;
} ? G : {};
/**
 * Actions 类型提取器
 * 如果 T 包含 actions 属性，则提取其类型；否则返回空对象类型
 * @template T - 原始类型
 */
type Actions<T> = T extends {
    actions: infer G;
} ? G : {};
/**
 * Action 函数类型定义
 * @template S - 状态类型
 */
type ActionFunction<S> = (this: S, ...args: any[]) => any | Promise<any>;
/**
 * 状态选项接口
 * 定义创建 store 时的配置选项
 * @template T - 状态类型
 */
interface StateOption<T> {
    state: () => State<T>;
    actions?: {
        [key: string]: ActionFunction<State<T>>;
    };
    getters?: {
        [key: string]: (state: State<T>) => unknown;
    };
    persist?: Persist;
    deep?: boolean;
}

/**
 * 定义一个状态管理 store
 * 创建一个响应式的状态管理器，支持状态、操作、计算属性和持久化
 * @template T - 状态类型
 * @param options - 状态选项配置
 * @returns 返回一个 Hook 函数，用于在组件中访问和订阅状态
 */
declare function defineStore<T>(options: StateOption<T>): {
    (selector?: ((state: State<T> & Getters<T> & Actions<T>) => any) | undefined): State<T> & Getters<T> & Actions<T>;
    /**
     * 获取原始状态对象的方法
     * 用于直接访问状态，不触发 React 的重新渲染
     */
    get(): State<T>;
};

/**
 * Provider 组件的 props 类型
 */
interface ProviderProps {
    store: ReturnType<typeof createStore>;
    children: React.ReactNode;
}
/**
 * Provider 组件
 * 用于在 React 组件树中提供 store，使子组件可以通过 useStore 访问状态
 * @param store - 通过 createStore 创建的 store 对象
 * @param children - 子组件
 * @returns 返回包裹了 Context.Provider 的 JSX 元素
 */
declare const Provider: ({ store, children }: ProviderProps) => JSX.Element;
/**
 * 创建多模块状态管理 store
 * 将多个独立的 store 模块组合成一个全局 store
 * @template T - 全局状态类型，包含所有模块的类型定义
 * @param options - 各个模块的配置对象，键为模块名，值为模块的状态选项
 * @returns 返回包含所有模块的 store 对象
 */
declare const createStore: <T extends { [K in keyof T]: T[K]; }>(options: { [K_1 in keyof T]: StateOption<T[K_1]>; }) => {
    [key: string]: {
        (selector?: ((state: State<unknown>) => any) | undefined): State<unknown>;
        get(): State<unknown>;
    };
};
/**
 * 在组件中使用 store 的 Hook（不使用 selector）
 * @template T - 全局状态类型
 * @template K - 模块键名
 * @param globalKey - 要访问的模块名
 * @returns 返回该模块的完整状态（包括 state、getters 和 actions）
 */
declare function useStore<T extends {
    [K in keyof T]: T[K];
}, K extends keyof T>(globalKey: K): State<T[K]> & Getters<T[K]> & Actions<T[K]>;
/**
 * 在组件中使用 store 的 Hook（使用 selector）
 * @template T - 全局状态类型
 * @template K - 模块键名
 * @template S - 选择器返回值类型
 * @param globalKey - 要访问的模块名
 * @param selector - 选择器函数，用于选择部分状态
 * @returns 返回选择器函数的返回值
 */
declare function useStore<T extends {
    [K in keyof T]: T[K];
}, K extends keyof T, S>(globalKey: K, selector: (store: State<T[K]> & Getters<T[K]> & Actions<T[K]>) => S): S;

declare const version = "2.7.3";

export { Provider, createStore, defineStore, useStore, version };
