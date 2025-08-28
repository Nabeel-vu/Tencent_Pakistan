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

    // Function to fetch and display PUBG Mobile announcements
async function fetchPubgAnnouncements() {
    const url = "https://publicfaas.vasdgame.com/hw/backendapi/?namespace=Faas&fn=getPubgmSection&useSign=1&service=pubgmobile&pdr_appid=3157&env=prod&cluster=sg&sign=7e57749ac7b9605796d5d33b471f756c";
    const body = {
        "userId": "1",
        "sectionType": "3",
        "contentPlat": "h5",
        "type": ["4", "5", "6"],
        "lang": ["en"],
        "sortBy": "timeDesc",
        "offset": 0,
        "limit": 10,
        "sectionId": ["91088"],
        "use_default_lang": false
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("Raw API Response:", data);
				// make sure we only keep 6 items (even if API sends more)
        // const announcements = (data?.data?.data?.list || []).slice(0, 6);
        const announcements = (
            (data && data.data && data.data.data && data.data.data.list) 
            ? data.data.data.list 
            : []
        ).slice(0, 6);
        
        const container = document.getElementById('blog-posts-container');
        // const announcements = data?.data?.data?.list || [];
        // const container = document.getElementById('blog-posts-container');

        if (announcements.length > 0) {
            container.innerHTML = ''; 
            announcements.forEach(announcement => {
                const card = document.createElement('div');
                card.classList.add('announcement-card');
                card.style.cursor = "pointer";  // show it's clickable

                let linkUrl = announcement.jumpUrl;
                if (!linkUrl && announcement.groupId && announcement._id) {
                    linkUrl = `https://www.pubgmobile.com/en-US/news-detail.shtml?gid=${announcement.groupId}&pid=${announcement._id}&from=news`;
                }

                // Card click event
                // if (linkUrl) {
                //     card.addEventListener('click', () => {
                //         const iframeContainer = document.getElementById('iframe-container');
                //         const iframe = document.getElementById('announcement-iframe');
                //         iframe.src = linkUrl;
                //         iframeContainer.style.display = "block";
                //         iframe.scrollIntoView({ behavior: "smooth" });
                //     });
                // }
// Card click event
if (linkUrl) {
    card.addEventListener('click', () => {
        window.location.href = `/news/?url=${encodeURIComponent(linkUrl)}&title=${encodeURIComponent(announcement.title)}&date=${encodeURIComponent(announcement.createTime)}`;
    });
}


                // Title
                const titleElement = document.createElement('h3');
                titleElement.textContent = announcement.title;
                card.appendChild(titleElement);

                // Date
                if (announcement.createTime) {
                    const date = new Date(announcement.createTime);
                    const formattedDate = date.toISOString().split('T')[0];
                    const dateElement = document.createElement('p');
                    dateElement.textContent = formattedDate;
                    dateElement.style.fontSize = '12px';
                    dateElement.style.color = '#aaa';
                    dateElement.style.marginTop = '-10px';
                    dateElement.style.marginBottom = '10px';
                    card.appendChild(dateElement);
                }

                // Image
                // if (announcement.contentImages?.length > 0) {
                //     const imageElement = document.createElement('img');
                //     imageElement.src = announcement.contentImages[0];
                //     imageElement.alt = announcement.title;
                //     imageElement.style.maxWidth = '90%';
                //     imageElement.style.height = 'auto';
                //     imageElement.style.borderRadius = '5px';
                //     imageElement.style.marginTop = '10px';
                //     card.appendChild(imageElement);
                // }
                if (announcement.contentImages && announcement.contentImages.length > 0) {
                    const imageElement = document.createElement('img');
                    imageElement.src = announcement.contentImages[0];
                    imageElement.alt = announcement.title;
                    imageElement.style.maxWidth = '90%';
                    imageElement.style.height = 'auto';
                    imageElement.style.borderRadius = '5px';
                    imageElement.style.marginTop = '10px';
                    card.appendChild(imageElement);
                }
                

                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p>No announcements found at this time.</p>';
        }

    } catch (error) {
        console.error('Error fetching PUBG Mobile announcements:', error);
        document.getElementById('blog-posts-container').innerHTML = '<p>Failed to load announcements. Please try again later.</p>';
    }
}

function closeIframe() {
    const iframeContainer = document.getElementById('iframe-container');
    const iframe = document.getElementById('announcement-iframe');
    iframe.src = "";
    iframeContainer.style.display = "none";
}

document.addEventListener('DOMContentLoaded', fetchPubgAnnouncements);

