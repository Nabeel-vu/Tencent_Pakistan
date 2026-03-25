// Google Tag Manager (GTM)
(function(w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-NSBWFZC3');

var gtagScript = document.createElement('script');
gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-DLLQ8DGECC';
gtagScript.defer = true;
document.head.appendChild(gtagScript);

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-DLLQ8DGECC');

var trustpilotScript = document.createElement('script');
trustpilotScript.src = "//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
trustpilotScript.defer = true;
trustpilotScript.async = true;
document.head.appendChild(trustpilotScript);

const structuredDataWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tencent PK",
    "url": "https://tencent.pk/",
    "description": "Buy PUBG UC in Pakistan with EasyPaisa, JazzCash, Raast, and bank transfer. View prices, payment options, and PUBG Mobile updates on Tencent.pk.",
    "publisher": {
      "@type": "Organization",
      "name": "Tencent PK",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tencent.pk/static/images/Tencent-logo.webp"
      }
    }
  };
  
  const structuredDataOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tencent PK",
    "url": "https://tencent.pk/",
    "image": "https://tencent.pk/static/images/Tencent-logo.webp",
    "logo": "https://tencent.pk/static/images/Tencent-logo.webp",
    "description": "Buy PUBG UC in Pakistan with instant delivery and secure payments via EasyPaisa, JazzCash, Raast, and bank transfer.",
    "telephone": "+923023336555",
    "email": "support@tencent.pk",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+923023336555",
        "email": "support@tencent.pk",
        "contactType": "customer support",
        "areaServed": "PK",
        "availableLanguage": [
          "English",
          "Urdu"
        ]
      }
    ]
  };

  const structuredDataCollectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Buy PUBG UC in Pakistan",
    "url": "https://tencent.pk/",
    "description": "PUBG UC package pricing, local payment methods, and PUBG Mobile update coverage for Pakistan.",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Tencent PK",
      "url": "https://tencent.pk/"
    },
    "about": [
      {
        "@type": "Thing",
        "name": "PUBG UC"
      },
      {
        "@type": "Thing",
        "name": "PUBG Mobile"
      }
    ]
  };

  function insertStructuredData(data) {
    const script = document.createElement('script');
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
  
  document.addEventListener("DOMContentLoaded", function() {
    insertStructuredData(structuredDataWebsite);
    insertStructuredData(structuredDataOrganization);
    insertStructuredData(structuredDataCollectionPage);
  });
