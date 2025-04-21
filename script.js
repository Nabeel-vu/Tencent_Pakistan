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
(function detectDevToolsAndBreak() {
    let devtoolsOpen = false;
    const element = new Image();

    Object.defineProperty(element, 'id', {
        get: function () {
            devtoolsOpen = true;
        }
    });

    setInterval(() => {
        devtoolsOpen = false;
        console.log('%c', element);
        if (devtoolsOpen) {
            document.body.innerHTML = "<h1 style='color:red;text-align:center;margin-top:20%'>DevTools is not allowed on this page!</h1>";
            throw new Error("DevTools detected. Page terminated.");
        }
    }, 1000);
})();




