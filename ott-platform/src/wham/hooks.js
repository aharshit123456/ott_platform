import { createContext, useContext, useEffect, useState } from 'react';

export const WhamContext = createContext();

export const useWham = () => useContext(WhamContext);

// Loads data from the source and reloads it when shared state changes. Data from
// earlier inputs is dropped (not shown as stale), but a plain refresh keeps it on screen.
export function useLoad(fn, deps) {
    const { source, version, flash } = useWham();
    const key = JSON.stringify(deps);
    const [state, setState] = useState({ key: null, data: null, error: null });
    useEffect(() => {
        let live = true;
        fn().then(data => live && setState({ key, data, error: null }))
            .catch(error => {
                if (!live) return;
                setState({ key, data: null, error });
                if (error.status !== 404) flash(error.message);
            });
        return () => { live = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, version, source]);
    const current = state.key === key;
    return { data: current ? state.data : null, error: current ? state.error : null, loading: !current };
}
