import React, { useEffect } from 'react';

const ClickEffects = () => {
    useEffect(() => {
        const handleClick = (e) => {
            // Don't trigger on buttons as they might have their own handlers/effects (optional, but good for UX)
            // For now, let's trigger everywhere for maximum comic effect!

            const words = ["BAM!", "POW!", "ZAP!", "WHAM!", "BOOM!"];
            const word = words[Math.floor(Math.random() * words.length)];
            const colors = ["#ff4d4d", "#ffd700", "#33ccff", "#ff9900", "#ffffff"];
            const color = colors[Math.floor(Math.random() * colors.length)];

            const el = document.createElement('div');
            el.innerText = word;
            el.style.position = 'fixed';
            el.style.left = `${e.clientX}px`;
            el.style.top = `${e.clientY}px`;
            el.style.color = 'black';
            el.style.background = color;
            el.style.padding = '10px 15px';
            el.style.border = '3px solid black';
            el.style.fontFamily = "'Bangers', cursive";
            el.style.fontSize = '2rem';
            el.style.transform = 'translate(-50%, -50%) scale(0)';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '9999';
            el.style.animation = 'bam-pop 0.6s ease-out forwards';
            el.style.boxShadow = '5px 5px 0 black';
            // Starburst shape roughly
            el.style.clipPath = 'polygon(100% 50%, 85% 60%, 100% 75%, 75% 75%, 75% 100%, 50% 85%, 25% 100%, 25% 75%, 0% 75%, 15% 60%, 0% 50%, 15% 40%, 0% 25%, 25% 25%, 25% 0%, 50% 15%, 75% 0%, 75% 25%, 100% 25%, 85% 40%)';
            el.style.background = color; /* Reset bg after clip path if needed, though simple box is better for text readability */
            // Reverting clip path for readability, just using a jagged box by rotation
            el.style.clipPath = 'none';
            el.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 20 - 10}deg)`;


            document.body.appendChild(el);

            setTimeout(() => {
                if (document.body.contains(el)) {
                    document.body.removeChild(el);
                }
            }, 600);
        };

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, []);

    return null;
};

export default ClickEffects;
