var selectedPackage = null;

function selectPackage(packageElem) {
    if (selectedPackage) {
        selectedPackage.classList.remove('selected-package');
    }

    selectedPackage = packageElem;
    selectedPackage.classList.add('selected-package');
    document.querySelector("body > div.package-container").style.border = "";
    var whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.disabled = false;
    }

    // Remove highlight if previously marked
    selectedPackage.style.border = "";
}

function openWhatsApp() {
    var characterIdInput = document.getElementById('character-id');
    if (!selectedPackage) {
        alert('Please select the package you wish to purchase.');
        // Highlight the packages section
        document.querySelector("body > div.package-container").style.border = "2px solid red";
        return;
    }
    if (!characterIdInput.value || characterIdInput.value.length < 10) {
        alert('Please enter a valid PUBG Character ID.');
        // Highlight the input field
        characterIdInput.style.border = "2px solid red";
        characterIdInput.focus();
        return;
    } else {
        characterIdInput.style.border = "";
    }

    var packageName = selectedPackage.querySelector('.package-title').textContent;
    var packagePrice = selectedPackage.querySelector('.package-price').textContent;
    var message = "I am interested in purchasing " + packageName + " UC, Price: " + packagePrice + ". My PUBG Player ID is: " + characterIdInput.value;

    var whatsappUrl = "https://api.whatsapp.com/send/?phone=923023336555&text=" + encodeURIComponent(message);

    window.location.href = whatsappUrl;
}
//added new for redirecting the page upon opening inspect element
(function detectDevTools() {
    const searchQuery = "Buy PUBG UC in Pakistan Tencent.pk";
    const encodedQuery = encodeURIComponent(searchQuery);
    const element = new Image();
    let devtoolsOpen = false;

    Object.defineProperty(element, 'id', {
        get: function () {
            devtoolsOpen = true;
            return 'devtools';
        }
    });

    setInterval(() => {
        devtoolsOpen = false;
        console.log('%c', element); // Minimal visual log but still triggers the getter
        if (devtoolsOpen) {
            console.warn("🚨 DevTools Detected!");
            alert("Warning: Developer Tools Detected!");
            window.location.href = `https://www.google.com/search?q=${encodedQuery}`;
        }
    }, 1000);
})();



