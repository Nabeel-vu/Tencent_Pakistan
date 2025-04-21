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
(function () {
    let threshold = 160;
    let redirected = false;

    function detectDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if ((widthThreshold || heightThreshold) && !redirected) {
            redirected = true;

            let countdown = 3;
            const message = document.createElement('h1');
            message.style.color = 'red';
            message.style.textAlign = 'center';
            message.style.marginTop = '20%';
            message.innerHTML = `Access Denied<br>Developer Tools Detected<br>Redirecting in <span id='countdown'>${countdown}</span> seconds...`;
            document.body.innerHTML = '';
            document.body.appendChild(message);

            const countdownInterval = setInterval(() => {
                countdown--;
                document.getElementById('countdown').textContent = countdown;
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    const searchQuery = "Tencent.pk";
                    const encodedQuery = encodeURIComponent(searchQuery);
                    window.location.href = `https://www.google.com/search?q=${encodedQuery}`;
                }
            }, 1000);

            console.warn("DevTools Detected!");
        }
    }

    setInterval(detectDevTools, 500);
})();



document.oncontextmenu = () => {
    alert("Right Click disabled")
    return false
}
document.onkeydown = e => {
    if(e.key == "F12") {
        return false
    }
    if(e.ctrlKey && e.shiftKey && e.key === "I") {
        return false
    }
    if(e.ctrlKey && e.key == "u") {
        return false
    }
    if(e.ctrlKey && e.key == "S") {
        return false
    }
}




