import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    type?: string;
    name?: string;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    type = 'website',
    name = 'OrderEazy'
}) => {
    const siteTitle = 'OrderEazy Analytics';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = 'OrderEazy - Complete order, delivery, and analytics management system. Advanced tracking, exports, and real-time business insights.';
    const defaultKeywords = 'order, delivery, export, analytics, management system, inventory, tracking, real-time insights, business metrics';

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": name,
        "operatingSystem": "Web",
        "applicationCategory": "BusinessApplication",
        "description": description || defaultDescription,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "120"
        },
        "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
        }
    };

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name='description' content={description || defaultDescription} />
            <meta name='keywords' content={keywords || defaultKeywords} />
            <link rel="canonical" href="https://order-easy-blond.vercel.app/" />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:site_name" content={name} />
            <meta property="og:image" content="https://order-easy-blond.vercel.app/bg-analytics.png" />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content="https://order-easy-blond.vercel.app/bg-analytics.png" />
        </Helmet>
    );
};
