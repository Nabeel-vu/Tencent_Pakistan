var selectedPackage = null;

const ANNOUNCEMENTS_API_URL = "https://publicfaas.vasdgame.com/hw/backendapi/?namespace=Faas&fn=getPubgmSection&useSign=1&service=pubgmobile&pdr_appid=3157&env=prod&cluster=sg&sign=7e57749ac7b9605796d5d33b471f756c";
const ANNOUNCEMENTS_REQUEST_BODY = {
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

    selectedPackage.style.border = "";
}

function openWhatsApp() {
    var characterIdInput = document.getElementById('character-id');
    if (!selectedPackage) {
        alert('Please select the package you wish to purchase.');
        document.querySelector("body > div.package-container").style.border = "2px solid red";
        return;
    }

    var sanitizedPlayerId = (characterIdInput.value || "").replace(/\D/g, "");
    if (!sanitizedPlayerId || sanitizedPlayerId.length < 10) {
        alert('Please enter a valid PUBG Character ID.');
        characterIdInput.style.border = "2px solid red";
        characterIdInput.focus();
        return;
    }

    characterIdInput.value = sanitizedPlayerId;
    characterIdInput.style.border = "";

    var packageName = selectedPackage.querySelector('.package-title').textContent.trim();
    var packagePrice = selectedPackage.querySelector('.package-price').textContent.trim();
    var message = "I am interested in purchasing " + packageName + " UC, Price: " + packagePrice + ". My PUBG Player ID is: " + sanitizedPlayerId;

    var whatsappUrl = "https://api.whatsapp.com/send/?phone=923023336555&text=" + encodeURIComponent(message);
    window.location.href = whatsappUrl;
}

function formatAnnouncementDate(rawDate) {
    if (!rawDate) {
        return "";
    }

    var date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toISOString().split('T')[0];
}

function getAnnouncementUrl(announcement) {
    if (announcement && announcement.jumpUrl) {
        try {
            var parsed = new URL(announcement.jumpUrl);
            if (parsed.hostname.endsWith("pubgmobile.com")) {
                return parsed.toString();
            }
        } catch (error) {
            return "";
        }
    }

    if (announcement && announcement.groupId && announcement._id) {
        return "https://www.pubgmobile.com/en-US/news-detail.shtml?gid=" + encodeURIComponent(announcement.groupId) +
            "&pid=" + encodeURIComponent(announcement._id) + "&from=news";
    }

    return "";
}

function getInternalNewsUrl(announcement) {
    var params = new URLSearchParams();
    if (announcement.groupId) {
        params.set("gid", announcement.groupId);
    }
    if (announcement._id) {
        params.set("pid", announcement._id);
    }
    return "/news/?" + params.toString();
}

async function getAnnouncementFeed() {
    var response = await fetch(ANNOUNCEMENTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ANNOUNCEMENTS_REQUEST_BODY)
    });

    if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
    }

    var data = await response.json();
    return (
        data &&
        data.data &&
        data.data.data &&
        Array.isArray(data.data.data.list)
    ) ? data.data.data.list.slice(0, 6) : [];
}

async function fetchPubgAnnouncements() {
    try {
        var announcements = await getAnnouncementFeed();
        var container = document.getElementById('blog-posts-container');
        var isNewsPage = document.body && document.body.dataset.page === "news";

        if (!container) {
            return;
        }

        if (announcements.length > 0) {
            container.innerHTML = '';
            announcements.forEach(function (announcement) {
                var card = document.createElement('div');
                card.classList.add('announcement-card');
                card.style.cursor = "pointer";

                var titleElement = document.createElement('h3');
                titleElement.textContent = announcement.title;
                card.appendChild(titleElement);

                if (announcement.createTime) {
                    var dateElement = document.createElement('p');
                    dateElement.textContent = formatAnnouncementDate(announcement.createTime);
                    dateElement.style.fontSize = '12px';
                    dateElement.style.color = '#aaa';
                    dateElement.style.marginTop = '-10px';
                    dateElement.style.marginBottom = '10px';
                    card.appendChild(dateElement);
                }

                if (announcement.contentImages && announcement.contentImages.length > 0) {
                    var imageElement = document.createElement('img');
                    imageElement.src = announcement.contentImages[0];
                    imageElement.alt = announcement.title;
                    imageElement.style.maxWidth = '90%';
                    imageElement.style.height = 'auto';
                    imageElement.style.borderRadius = '5px';
                    imageElement.style.marginTop = '10px';
                    card.appendChild(imageElement);
                }

                if (isNewsPage) {
                    card.addEventListener('click', function () {
                        renderSelectedAnnouncement(announcement);
                        window.history.replaceState({}, '', getInternalNewsUrl(announcement));
                    });
                } else {
                    card.addEventListener('click', function () {
                        window.location.href = getInternalNewsUrl(announcement);
                    });
                }

                container.appendChild(card);
            });

            if (isNewsPage) {
                hydrateSelectedAnnouncement(announcements);
            }
        } else {
            container.innerHTML = '<p>No announcements found at this time.</p>';
            if (isNewsPage) {
                renderSelectedAnnouncement(null);
            }
        }
    } catch (error) {
        var container = document.getElementById('blog-posts-container');
        if (container) {
            container.innerHTML = '<p>Failed to load announcements. Please try again later.</p>';
        }
    }
}

function renderSelectedAnnouncement(announcement) {
    if (!(document.body && document.body.dataset.page === "news")) {
        return;
    }

    var titleElement = document.getElementById('news-title');
    var dateElement = document.getElementById('news-date');
    var summaryElement = document.getElementById('news-summary');
    var imageElement = document.getElementById('news-image');
    var officialLink = document.getElementById('official-news-link');

    if (!announcement) {
        titleElement.textContent = 'Announcement Details';
        dateElement.textContent = '';
        summaryElement.textContent = 'We could not load the selected announcement. Choose another item from the list below.';
        imageElement.hidden = true;
        imageElement.removeAttribute('src');
        imageElement.removeAttribute('alt');
        officialLink.hidden = true;
        officialLink.removeAttribute('href');
        document.title = 'PUBG Mobile News in Pakistan | Tencent PK';
        return;
    }

    var formattedDate = formatAnnouncementDate(announcement.createTime);
    var officialUrl = getAnnouncementUrl(announcement);
    var imageUrl = (announcement.contentImages && announcement.contentImages.length > 0) ? announcement.contentImages[0] : '';

    titleElement.textContent = announcement.title || 'Announcement Details';
    dateElement.textContent = formattedDate;
    summaryElement.textContent = 'Official PUBG Mobile announcements are shown here as a curated feed. Open the official post for the full article and latest details.';

    if (imageUrl) {
        imageElement.src = imageUrl;
        imageElement.alt = announcement.title || 'PUBG Mobile announcement';
        imageElement.hidden = false;
    } else {
        imageElement.hidden = true;
        imageElement.removeAttribute('src');
        imageElement.removeAttribute('alt');
    }

    if (officialUrl) {
        officialLink.href = officialUrl;
        officialLink.hidden = false;
    } else {
        officialLink.hidden = true;
        officialLink.removeAttribute('href');
    }

    document.title = (announcement.title || 'PUBG Mobile News in Pakistan') + ' | Tencent PK';
}

function hydrateSelectedAnnouncement(announcements) {
    if (!(document.body && document.body.dataset.page === "news")) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var gid = params.get('gid');
    var pid = params.get('pid');
    var selectedAnnouncement = null;

    if (gid || pid) {
        selectedAnnouncement = announcements.find(function (announcement) {
            return String(announcement.groupId || '') === String(gid || '') &&
                String(announcement._id || '') === String(pid || '');
        }) || null;
    }

    if (!selectedAnnouncement && announcements.length > 0) {
        selectedAnnouncement = announcements[0];
        window.history.replaceState({}, '', getInternalNewsUrl(selectedAnnouncement));
    }

    renderSelectedAnnouncement(selectedAnnouncement);
}

document.addEventListener('DOMContentLoaded', fetchPubgAnnouncements);
