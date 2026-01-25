import React, { useEffect, useRef } from 'react';

const GiscusComments = ({ theme = 'light' }) => {
    const commentsRef = useRef(null);

    useEffect(() => {
        // Clear existing comments if any
        if (commentsRef.current) {
            commentsRef.current.innerHTML = '';
        }

        const script = document.createElement('script');
        script.src = "https://giscus.app/client.js";
        script.setAttribute('data-repo', "cosq-in/wham-comments");
        script.setAttribute('data-repo-id', "R_kgDORAnpJw");
        script.setAttribute('data-category', "Comments");
        script.setAttribute('data-category-id', "DIC_kwDORAnpJ84C1Ym_");
        script.setAttribute('data-mapping', "pathname");
        script.setAttribute('data-strict', "0");
        script.setAttribute('data-reactions-enabled', "1");
        script.setAttribute('data-emit-metadata', "0");
        script.setAttribute('data-input-position', "bottom");
        script.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
        script.setAttribute('data-lang', "en");
        script.setAttribute('crossorigin', "anonymous");
        script.async = true;

        commentsRef.current.appendChild(script);
    }, [theme]);

    return (
        <div className="giscus-container" style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: 'var(--comic-surface)',
            border: 'var(--comic-border)',
            boxShadow: 'var(--comic-shadow)'
        }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '2px solid var(--comic-text)', display: 'inline-block' }}>
                COMIC COMMENTS & REPLIES
            </h3>
            <div ref={commentsRef} id="comments" />
        </div>
    );
};

export default GiscusComments;
