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

// Load Google Analytics (gtag.js)
var gtagScript = document.createElement('script');
gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-DLLQ8DGECC';
gtagScript.defer = true;
document.head.appendChild(gtagScript);

// Initialize Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-DLLQ8DGECC');

// Load Trustpilot Widget Script
var trustpilotScript = document.createElement('script');
trustpilotScript.src = "//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
trustpilotScript.defer = true;
trustpilotScript.async = true;
document.head.appendChild(trustpilotScript);

const structuredDataWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tencent PK",
    "url": "https://tencent.pk",
    "description": "Your ultimate destination to buy PUBG UC in Pakistan using EasyPaisa & JazzCash securely.",
    "publisher": {
      "@type": "Organization",
      "name": "Tencent PK",
      "logo": "https://tencent.pk/logo.webp"
    }
  };
  
  const structuredDataStore = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Tencent PK",
    "url": "https://tencent.pk",
    "image": "https://tencent.pk/logo.webp",
    "description": "Buy PUBG UC in Pakistan with instant delivery and secure payments via EasyPaisa & JazzCash.",
    "telephone": "+923023336555",
    "priceRange": "PKR 250 - PKR 24000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Business Address",
      "addressLocality": "Pakistan",
      "addressRegion": "PK",
      "postalCode": "22222",
      "addressCountry": "PK"
    },
    "offers": [
      { "@type": "Offer", "name": "60 UC Package", "url": "https://tencent.pk/60-uc", "priceCurrency": "PKR", "price": "250", "availability": "https://schema.org/InStock", "image": "https://tencent.pk/Assets/60.webp" },
      { "@type": "Offer", "name": "300 UC Package +25 Bonus", "url": "https://tencent.pk/300-uc", "priceCurrency": "PKR", "price": "1200", "availability": "https://schema.org/InStock", "image": "https://tencent.pk/Assets/300.webp" },
      { "@type": "Offer", "name": "600 UC Package +60 Bonus", "url": "https://tencent.pk/600-uc", "priceCurrency": "PKR", "price": "2400", "availability": "https://schema.org/InStock", "image": "https://tencent.pk/Assets/600.webp" },
      { "@type": "Offer", "name": "1500 UC Package +300 Bonus", "url": "https://tencent.pk/1500-uc", "priceCurrency": "PKR", "price": "6000", "availability": "https://schema.org/InStock", "image": "https://tencent.pk/Assets/1500.webp" },
      { "@type": "Offer", "name": "3000 UC Package +850 Bonus", "url": "https://tencent.pk/3000-uc", "priceCurrency": "PKR", "price": "12000", "availability": "https://schema.org/InStock", "image": "https://tencent.pk/Assets/3000.webp" },
      { "@type": "Offer", "name": "6000 UC Package +2100 Bonus", "url": "https://tencent.pk/6000-uc", "priceCurrency": "PKR", "price": "24000", "availability": "https://schema.org/InStock", "image": "https://tencent.pk/Assets/6000.webp" }
    ]
  };

  // Function to insert structured data into the webpage
  function insertStructuredData(data) {
    const script = document.createElement('script');
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
  
  // Insert structured data into the HTML
  document.addEventListener("DOMContentLoaded", function() {
    insertStructuredData(structuredDataWebsite);
    insertStructuredData(structuredDataStore);
  });
  

