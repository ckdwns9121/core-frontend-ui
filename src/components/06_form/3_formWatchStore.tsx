import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
} from 'react';

export type WatchValue = string | boolean | File | undefined;

type Listener = () => void;

type FormWatchStore = {
  get: (name: string) => WatchValue;
  set: (name: string, value: WatchValue) => void;
  subscribe: (name: string, listener: Listener) => () => void;
};

const createFormWatchStore = (): FormWatchStore => {
  // values는 React state가 아니다. 입력값의 원본은 여전히 DOM에 있고,
  // 이 Map은 useFormWatch 구독자에게 변경을 알려주기 위한 스냅샷이다.
  const values = new Map<string, WatchValue>();
  const listeners = new Map<string, Set<Listener>>();

  return {
    get: name => values.get(name),
    set(name, value) {
      if (Object.is(values.get(name), value)) return;

      values.set(name, value);
      listeners.get(name)?.forEach(listener => listener());
    },
    subscribe(name, listener) {
      const fieldListeners = listeners.get(name) ?? new Set<Listener>();
      fieldListeners.add(listener);
      listeners.set(name, fieldListeners);

      return () => {
        fieldListeners.delete(listener);
        if (fieldListeners.size === 0) listeners.delete(name);
      };
    },
  };
};

const FormWatchContext = createContext<FormWatchStore | null>(null);

export const FormWatchProvider = ({ children }: PropsWithChildren) => {
  // Provider가 다시 렌더링돼도 같은 store를 유지한다.
  const storeRef = useRef<FormWatchStore | null>(null);
  if (!storeRef.current) storeRef.current = createFormWatchStore();

  return (
    <FormWatchContext.Provider value={storeRef.current}>
      {children}
    </FormWatchContext.Provider>
  );
};

export const useFormStore = () => {
  const store = useContext(FormWatchContext);
  if (!store) {
    throw new Error('FormWatchProvider 안에서 사용해야 합니다.');
  }
  return store;
};

export const useFormWatch = <T extends WatchValue>(
  name: string,
  defaultValue: T,
) => {
  const store = useFormStore();
  const subscribe = useCallback(
    (listener: Listener) => store.subscribe(name, listener),
    [name, store],
  );
  const getSnapshot = useCallback(
    () => (store.get(name) ?? defaultValue) as T,
    [defaultValue, name, store],
  );

  // store가 해당 name의 listener만 실행하므로 이 Hook을 호출한 컴포넌트만
  // 해당 필드가 바뀔 때 다시 렌더링된다.
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
