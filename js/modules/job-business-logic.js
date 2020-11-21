import { http } from './http.js';
import { ui } from './ui.js';
import { businessLogic } from './business-logic.js';
import { theme } from './theme.js';
class JobBusinessLogic {

    constructor() { }

    intializeApp() {
        const jobId = this.getJobId();
        http.fetchJobDetails(jobId);
    }

    setThemeSwitcher() {
        const themeSwitcher = ui.getSingleElement('.header__switch-container');
        themeSwitcher.addEventListener('click', () => theme.switchTheme());
    }

    getJobId() {
        const indexOfId = window.location.href.indexOf('id=') + 3;
        return window.location.href.slice(indexOfId, window.location.href.length);
    }

    getApplyUrl(applyHTMLstring) {
        const domParser = new DOMParser();
        const parsedHTML = domParser.parseFromString(applyHTMLstring, 'text/html');

        return parsedHTML.querySelector('a').href;
    }

    initializeJobDetailPage(jobDetailResponse) {
        const {
            description, company, location, title, type, 'created_at': createdAt,
            'company_url': companyUrl, 'company_logo': companyLogo, 'how_to_apply': howToApply
        } = jobDetailResponse;

        const bodyElement = ui.getSingleElement('body');
        const appplyUrl = this.getApplyUrl(howToApply);

        bodyElement.innerHTML = `
        <header class="header">
        <div class="header__img"></div>
        <div class="header__content">
            <a href="/Frontend-Mentor-Github-Jobs">devjobs</a>
            <div class="header__switch">
                <div>
                    <img src="../assets/desktop/icon-sun.svg" alt="sun">
                </div>
                <span class="header__switch-container">
                    <span class="header__switch-ball"></span>
                </span>
                <img src="../assets/desktop/icon-moon.svg" alt="moon">
            </div>
        </div>
        <div class="header__company">
            <div class="header__company-logo">
                <div>
                ${companyLogo ? `<img src="${companyLogo}" alt="job-logo" id="job-logo">` : 'N/A'}
                </div>
            </div>
            <div class="header__company-apply">
                <div>
                    <h1>${company}</h1>
                    <p>${companyUrl ? companyUrl : ''}</p>
                </div>
                <div>
                    <a href="${companyUrl}" target="_blank" class="${companyUrl ? '' : 'disabled'}">Company site</a>
                </div>
            </div>
        </div>
        </header>
        <main class="main">
            <div class="main__top">
                <div>
                    <div>
                        <span>${businessLogic.calculateTimePassed(createdAt)}</span>
                        <span class="dot">&bull;</span>
                        <span>${type}</span>
                    </div>
                    <h3>${title}</h3>
                    <span class="main__location">${location}</span>
                </div>
                <div>
                    <button>Apply Now</button>
                </div>
            </div>
        <div class="main__content">${description}</div>
        </main>
        <div class="apply">
            <h4>How to Apply</h4>${howToApply}
        </div>
        <footer class="footer">
            <div>
                <h5>${title}</h5>
                <span>${company}</span>
            </div>
            <div>
                <button>Apply Now</button>
            </div>
        </footer>
        `;

        this.setThemeSwitcher();
        this.setButtonEventListeners(appplyUrl);
    }

    setButtonEventListeners(appplyUrl) {
        const buttons = ui.getMultipleElements('button');

        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();

                const anchor = document.createElement('a');
                anchor.setAttribute('target', '_blank');
                anchor.href = appplyUrl;

                anchor.click();
            });
        });
    }
}

const jobBusinessLogic = new JobBusinessLogic();

export { jobBusinessLogic };
