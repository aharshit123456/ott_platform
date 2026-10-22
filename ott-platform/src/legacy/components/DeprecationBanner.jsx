import React from 'react';
import { Link } from 'react-router-dom';

const DeprecationBanner = () => (
    <div role="status" style={{
        backgroundColor: '#14110f',
        color: '#fff',
        padding: '8px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px 12px',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
        fontWeight: 'bold',
        fontSize: '0.95rem',
        textAlign: 'center'
    }}>
        <span>WHAM! OTT Classic is deprecated and will be removed.</span>
        <Link to="/" style={{
            color: '#14110f',
            backgroundColor: '#ffd23f',
            border: '2px solid #fff',
            borderRadius: '99px',
            padding: '2px 12px',
            textDecoration: 'none'
        }}>
            Go to the new WHAM! →
        </Link>
    </div>
);

export default DeprecationBanner;
