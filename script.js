var selectedPackage = null;

async function fetchGeneratedAnnouncements() {
    var response = await fetch('/news/news-data.json', {
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
    }

    return response.json();
}

function selectPackage(packageElem) {
    if (selectedPackage) {
        selectedPackage.classList.remove('selected-package');
    }

    selectedPackage = packageElem;
    selectedPackage.classList.add('selected-package');

    var packageContainer = document.querySelector('body > div.package-container');
    if (packageContainer) {
        packageContainer.style.border = '';
    }

    var whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.disabled = false;
    }
}

function openWhatsApp() {
    var characterIdInput = document.getElementById('character-id');
    if (!selectedPackage) {
        alert('Please select the package you wish to purchase.');
        document.querySelector('body > div.package-container').style.border = '2px solid red';
        return;
    }

    var sanitizedPlayerId = (characterIdInput.value || '').replace(/\D/g, '');
    if (!sanitizedPlayerId || sanitizedPlayerId.length < 10) {
        alert('Please enter a valid PUBG Character ID.');
        characterIdInput.style.border = '2px solid red';
        characterIdInput.focus();
        return;
    }

    characterIdInput.value = sanitizedPlayerId;
    characterIdInput.style.border = '';

    var packageName = selectedPackage.querySelector('.package-title').textContent.trim();
    var packagePrice = selectedPackage.querySelector('.package-price').textContent.trim();
    var message = 'I am interested in purchasing ' + packageName + ' UC, Price: ' + packagePrice + '. My PUBG Player ID is: ' + sanitizedPlayerId;
    var whatsappUrl = 'https://api.whatsapp.com/send/?phone=923023336555&text=' + encodeURIComponent(message);

    window.location.href = whatsappUrl;
}

function renderHomepageAnnouncements(items) {
    var container = document.getElementById('blog-posts-container');
    if (!container) {
        return;
    }

    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = '<p>No announcements found at this time.</p>';
        return;
    }

    container.innerHTML = '';
    items.slice(0, 6).forEach(function (item) {
        var card = document.createElement('article');
        card.className = 'announcement-card';

        var link = document.createElement('a');
        link.href = '/news/' + item.slug + '/';

        if (item.image) {
            var media = document.createElement('div');
            media.className = 'announcement-card-media';
            var image = document.createElement('img');
            image.src = item.image;
            image.alt = item.title;
            image.loading = 'lazy';
            image.width = 1600;
            image.height = 900;
            media.appendChild(image);
            link.appendChild(media);
        }

        var date = document.createElement('p');
        date.textContent = item.date;
        date.style.fontSize = '12px';
        date.style.color = '#aaa';
        date.style.marginBottom = '10px';
        link.appendChild(date);

        var title = document.createElement('h3');
        title.textContent = item.title;
        link.appendChild(title);

        var summary = document.createElement('p');
        summary.textContent = item.summary;
        link.appendChild(summary);

        card.appendChild(link);
        container.appendChild(card);
    });
}

async function loadHomepageAnnouncements() {
    try {
        var items = await fetchGeneratedAnnouncements();
        renderHomepageAnnouncements(items);
    } catch (error) {
        var container = document.getElementById('blog-posts-container');
        if (container) {
            container.innerHTML = '<p>Failed to load announcements. Please try again later.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadHomepageAnnouncements);
