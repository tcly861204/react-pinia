interface Pinia {
    install(app: any): void;
    use(plugin: PiniaPlugin): Pinia;
    _s: Map<string, any>;
}
interface PluginContext {
    store: any;
    options: StateOption<any>;
    pinia: Pinia;
}
type PiniaPlugin = ((context: PluginContext) => void) | {
    install: (context: PluginContext) => void;
};

/**
 * Middleware context provided to each middleware
 * Contains store instance and state accessor
 */
interface MiddlewareContext<T> {
    /** The store instance */
    store: any;
    /** Function to get current state */
    getState: () => State<T>;
    /** Store options */
    options: StateOption<T>;
}
/**
 * Action information passed through middleware
 */
interface ActionCall {
    /** Name of the action being called */
    name: string;
    /** Arguments passed to the action */
    args: any[];
}
/**
 * Middleware function type
 * Follows Redux-style middleware pattern: context => next => action
 */
type Middleware<T> = (context: MiddlewareContext<T>) => (next: (action: ActionCall) => any) => (action: ActionCall) => any;
/**
 * Compose multiple middleware into a single middleware function
 * Middleware are executed in order: first to last
 * @param middlewares - Array of middleware to compose
 * @returns Composed middleware function
 */
declare function composeMiddleware<T>(middlewares: Middleware<T>[]): Middleware<T>;

/**
 * 序列化器接口
 */
interface Serializer {
    serialize: (value: any) => string;
    deserialize: (value: string) => any;
}
/**
 * 加密器接口
 */
interface Encryption {
    encrypt: (value: string) => string;
    decrypt: (value: string) => string;
}
/**
 * 持久化配置选项
 */
interface PersistOptions {
    /** 存储的键名 */
    key: string;
    /** 存储类型，默认为 'localStorage' */
    storage?: 'localStorage' | 'sessionStorage';
    /** 只持久化特定路径的状态 */
    paths?: string[];
    /** 自定义序列化器 */
    serializer?: Serializer;
    /** 恢复状态前的钩子，可用于转换数据 */
    beforeRestore?: (savedState: any) => any;
    /** 恢复状态后的钩子 */
    afterRestore?: (restoredState: any) => void;
    /** 加密配置 */
    encryption?: Encryption;
    /** 是否开启调试日志 */
    debug?: boolean;
}
/**
 * 兼容旧版本的类型别名
 */
type Persist = PersistOptions;
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
 * 嵌套模块配置类型
 * 用于定义模块的子模块结构
 */
type NestedModules = {
    [K: string]: StateOption<any>;
};
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
    devtools?: boolean | DevToolsOptions;
    plugins?: PiniaPlugin[];
    middleware?: Middleware<T>[];
    modules?: NestedModules;
    namespaced?: boolean;
}

/**
 * DevTools 配置选项
 */
interface DevToolsOptions {
    name?: string;
    enabled?: boolean;
    trace?: boolean;
}

/**
 * 状态变化信息
 * 记录状态变化的详细信息
 */
interface Mutation<T> {
    /** 变化类型，固定为 'mutation' */
    type: 'mutation';
    /** 变化的状态键 */
    key: keyof State<T>;
    /** 旧值 */
    oldValue: any;
    /** 新值 */
    newValue: any;
    /** 可选的载荷数据 */
    payload?: any;
}
/**
 * Action 调用信息
 * 记录 action 调用的详细信息
 */
interface ActionInfo {
    /** Action 名称 */
    name: string;
    /** Action 参数 */
    args: any[];
    /** Action 调用时间戳 */
    timestamp?: number;
}
/**
 * 状态订阅函数类型
 * @template T - 状态类型
 * @param mutation - 状态变化信息
 * @param state - 变化后的状态
 */
type StateSubscription<T> = (mutation: Mutation<T>, state: State<T>) => void;
/**
 * Action 订阅函数类型
 * @param action - Action 调用信息
 * @param state - 当前状态
 */
type ActionSubscription = (action: ActionInfo, state: any) => void;
/**
 * 取消订阅函数类型
 */
type Unsubscribe = () => void;

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
    /**
     * 订阅状态变化
     * @param fn - 订阅回调函数
     * @returns 取消订阅函数
     */
    subscribe(fn: StateSubscription<T>): Unsubscribe;
    /**
     * 订阅 action 调用
     * @param fn - 订阅回调函数
     * @returns 取消订阅函数
     */
    subscribeAction(fn: ActionSubscription): Unsubscribe;
    _store: any;
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
 * 将多个独立的 store 模块组合成一个全局 store，支持嵌套模块
 * @template T - 全局状态类型，包含所有模块的类型定义
 * @param options - 各个模块的配置对象，键为模块名，值为模块的状态选项
 * @param globalOptions - 全局配置选项，如插件和中间件
 * @returns 返回包含所有模块的 store 对象
 */
declare const createStore: <T extends { [K in keyof T]: T[K]; }>(options: { [K_1 in keyof T]: StateOption<T[K_1]>; }, globalOptions?: {
    plugins?: PiniaPlugin[];
    middleware?: Middleware<any>[];
}) => {
    [key: string]: {
        (selector?: ((state: State<unknown>) => any) | undefined): State<unknown>;
        get(): State<unknown>;
        subscribe(fn: StateSubscription<unknown>): Unsubscribe;
        subscribeAction(fn: ActionSubscription): Unsubscribe;
        _store: any;
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

declare const version = "2.7.5";

/**
 * DevTools 实例接口
 * 提供与 Redux DevTools 交互的方法
 */
interface DevToolsInstance {
    /**
     * 发送 action 和状态到 DevTools
     * @param action - Action 名称或对象
     * @param state - 当前状态
     */
    send: (action: string | {
        type: string;
        payload?: any;
    }, state: any) => void;
    /**
     * 订阅 DevTools 消息（用于时间旅行调试）
     * @param callback - 消息处理回调函数
     * @returns 取消订阅的函数
     */
    subscribe: (callback: (message: any) => void) => (() => void) | void;
    /**
     * 断开 DevTools 连接
     */
    disconnect?: () => void;
}
/**
 * 设置 DevTools
 * 集成 Redux DevTools Extension，提供状态追踪、时间旅行等调试功能
 * @param store - Store 对象（响应式代理状态）
 * @param options - Store 配置选项
 * @param onStateRestore - 状态恢复回调函数（用于时间旅行）
 * @returns 返回 DevTools 实例接口，如果未启用则返回 null
 */
declare function setupDevTools(store: any, options: StateOption<any>, onStateRestore?: (state: any) => void): DevToolsInstance | null;

/**
 * 测试工具返回的接口
 */
interface TestStore<T> {
    /**
     * Store Hook，用于组件测试
     */
    useStore: ReturnType<typeof defineStore<T>>;
    /**
     * 原始 Store 对象，用于直接访问状态和 Action
     */
    store: State<T> & any;
    /**
     * 重置 Store 状态为初始值
     */
    reset: () => void;
    /**
     * 模拟 Action 实现
     * @param name Action 名称
     * @param implementation 模拟的实现函数
     * @returns 还原函数，调用后恢复原始 Action
     */
    mockAction: (name: string, implementation: Function) => () => void;
    /**
     * 获取当前状态的快照（深拷贝）
     */
    snapshot: () => any;
}
/**
 * 创建一个用于测试的 Store
 * 提供了重置状态、模拟 Action 和获取快照等辅助方法
 *
 * @param options Store 配置选项
 * @returns 测试工具对象
 */
declare function createTestStore<T>(options: StateOption<T>): TestStore<T>;

/**
 * 异步 Action 状态接口
 */
interface AsyncActionState<T = any> {
    /** 是否正在加载 */
    loading: boolean;
    /** 错误信息 */
    error: Error | null;
    /** 数据 */
    data: T | null;
}
/**
 * 异步 Action 接口
 */
interface AsyncAction<T, R> {
    /** 异步 Action 的状态 */
    state: AsyncActionState<R>;
    /** 执行异步 Action */
    execute: (payload: T) => Promise<R>;
    /** 重置状态 */
    reset: () => void;
}
/**
 * 定义一个异步 Action
 * 自动管理 loading、error 和 data 状态
 *
 * @param action 异步函数
 * @returns 异步 Action 对象
 *
 * @example
 * ```typescript
 * const useStore = defineStore({
 *   state: () => ({
 *     fetchUsers: defineAsyncAction(async () => {
 *       const response = await fetch('/api/users')
 *       return response.json()
 *     })
 *   }),
 *   actions: {
 *     async loadUsers() {
 *       return this.fetchUsers.execute()
 *     }
 *   }
 * })
 * ```
 */
declare function defineAsyncAction<T, R>(action: (payload: T) => Promise<R>): AsyncAction<T, R>;
/**
 * 定义一个无参数的异步 Action
 *
 * @param action 异步函数
 * @returns 异步 Action 对象
 */
declare function defineAsyncAction0<R>(action: () => Promise<R>): Omit<AsyncAction<void, R>, 'execute'> & {
    execute: () => Promise<R>;
};

export { ActionCall, ActionInfo, ActionSubscription, AsyncAction, AsyncActionState, DevToolsInstance, DevToolsOptions, Middleware, MiddlewareContext, Mutation, Provider, StateSubscription, TestStore, Unsubscribe, composeMiddleware, createStore, createTestStore, defineAsyncAction, defineAsyncAction0, defineStore, setupDevTools, useStore, version };
