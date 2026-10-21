import { useEffect, useState } from 'react';

const QUERY = '(max-width: 760px)';

export default function useIsPhone() {
    const [phone, setPhone] = useState(() => window.matchMedia(QUERY).matches);
    useEffect(() => {
        const mq = window.matchMedia(QUERY);
        const on = () => setPhone(mq.matches);
        mq.addEventListener('change', on);
        return () => mq.removeEventListener('change', on);
    }, []);
    return phone;
}
