import { useEffect } from 'react';

const SEO = ({ title, description, image, url }) => {
    useEffect(() => {
        // Update Title
        if (title) {
            document.title = `${title} | Wham! OTT`;
        }

        // Update Meta Description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && description) {
            metaDescription.setAttribute('content', description);
        }

        // Update OG Title
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && title) {
            ogTitle.setAttribute('content', title);
        }

        // Update OG Description
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription && description) {
            ogDescription.setAttribute('content', description);
        }

        // Update OG Image
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage && image) {
            ogImage.setAttribute('content', image);
        }

        // Update Twitter tags
        const twitterTitle = document.querySelector('meta[property="twitter:title"]');
        if (twitterTitle && title) {
            twitterTitle.setAttribute('content', title);
        }

        const twitterDesc = document.querySelector('meta[property="twitter:description"]');
        if (twitterDesc && description) {
            twitterDesc.setAttribute('content', description);
        }
    }, [title, description, image, url]);

    return null; // This component doesn't render anything
};

export default SEO;
