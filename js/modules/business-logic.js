import { http } from './http.js';
import { ui } from './ui.js';
import { theme } from './theme.js';
import { httpHandler } from './http-handler.js';
class BusinessLogic {

    lightTheme = true;
    fullTimeChecked = false;

    constructor() { }

    intializeApp() {
        http.fetchJobsList();
        this.setEventListeners();
        theme.loadSavedTheme();
    }

    setEventListeners() {
        const mainDiv = ui.getSingleElement('#main');
        const rocket = ui.getSingleElement('#rocket');
        const filter = ui.getSingleElement('#filter');
        const fullTimeCheckbox = ui.getSingleElement('.checkbox');
        const mobileSearch = ui.getSingleElement('#mobile__search');
        const searchButton = ui.getSingleElement('#search__button');
        const mobileWindowClose = ui.getSingleElement('#window__close');
        const loadMoreButton = ui.getSingleElement('#load-more__button');
        const themeSwitcher = ui.getSingleElement('.header__switch-container');
        const fullTimeMobileCheckbox = ui.getSingleElement('.checkbox__mobile');
        const searchButtonMobile = ui.getSingleElement('#search__button-mobile');

        rocket.addEventListener('click', () => this.goToTopPage());
        filter.addEventListener('click', () => this.onFilterClick(true));
        themeSwitcher.addEventListener('click', () => theme.switchTheme());
        mobileSearch.addEventListener('click', () => this.onMobileSearch());
        loadMoreButton.addEventListener('click', () => http.fetchNextJobList());
        searchButton.addEventListener('click', () => this.onSearchButton(false))
        mainDiv.addEventListener('click', (event) => this.onGetJobDetail(event));
        mobileWindowClose.addEventListener('click', () => this.onFilterClick(false));
        searchButtonMobile.addEventListener('click', () => this.onSearchButton(true));
        fullTimeCheckbox.addEventListener('click', () => this.handleFullTimeClick(false));
        fullTimeMobileCheckbox.addEventListener('click', () => this.handleFullTimeClick(true));

        document.addEventListener('keypress', (event) => this.onKeypress(event));
        window.addEventListener('scroll', this.debounceScroll(() => this.onPageScroll(), 20));
    }

    renderGithubJobs(githubJobs) {
        const mainDiv = ui.getSingleElement('#main');

        mainDiv.innerHTML = githubJobs
            .map(jobItem => {
                const { id, type, title, company, location, 'created_at': createdAt, 'company_logo': companyLogo } = jobItem;
                const imageElement = companyLogo ? `<img src="${companyLogo}" alt="box-img" onerror='this.style.display = "none"'>` : '<span>N/A</span>';

                return `
                <div class="box" id="${id}">
                    <div class="box__header">${imageElement}</div>
                    <div class="box__content">
                        <div class="box__content--day">
                            <span>${this.calculateTimePassed(createdAt)}</span>
                            <span class="dot">&bull;</span>
                            <span>${type}</span>
                        </div>
                        <div class="box__content--title" title="${title}">${title.length > 30 ? title.slice(0, 30) + '...' : title}</div>
                        <div class="box__content--company">${company}</div>
                        <div class="box__content--location" title="${location}">${location.length > 25 ? location.slice(0, 25) + '...' : location}</div>
                    </div>
                </div>
            `;
            })
            .join('');

        this.updateSpinnerState(false);
    }

    onFilterClick(showState) {
        const mainElement = ui.getSingleElement('#main');
        const headerElement = ui.getSingleElement('header');
        const rocketContainer = ui.getSingleElement('#rocket');
        const mobileWindow = ui.getSingleElement('#mobile__window');
        const loadMoreButton = ui.getSingleElement('#load-more__button');

        if (showState) {
            mobileWindow.style.display = 'block';
            mainElement.style.filter = 'blur(2px)';
            headerElement.style.filter = 'blur(2px)';
            loadMoreButton.style.filter = 'blur(2px)';
            rocketContainer.style.filter = 'blur(2px)';
        } else {
            mainElement.style.filter = 'none';
            mobileWindow.style.display = 'none';
            headerElement.style.filter = 'none';
            loadMoreButton.style.filter = 'none';
            rocketContainer.style.filter = 'none';
        }
    }

    goToTopPage() {
        const rocketFlame = ui.getSingleElement('#rocket__flame');

        rocketFlame.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onPageScroll() {
        const rocket = ui.getSingleElement('#rocket');
        const rocketFlame = ui.getSingleElement('#rocket__flame');

        if (window.pageYOffset >= 1200) {
            rocket.style.display = 'block';
        } else {
            rocket.style.display = 'none';
            rocketFlame.style.display = 'none';
        }
    }

    updateSpinnerState(showSpinner) {
        const loadingWrapper = ui.getSingleElement('#loading');
        const documentHeight = document.documentElement.scrollHeight;

        loadingWrapper.style.opacity = showSpinner ? '1' : '0';
        loadingWrapper.style.height = showSpinner ? `${documentHeight}px` : '0px';
    }

    calculateTimePassed(jobPostDate) {
        const currentMilliseconds = new Date().getTime();
        const jobPostMilliseconds = new Date(jobPostDate).getTime();

        const milliseconds = currentMilliseconds - jobPostMilliseconds;
        const minutes = Math.floor(milliseconds / 60000);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);
        const months = Number.parseInt(days / 30, 0);

        if (hours <= 0) {
            const minutePrefix = this.getCorrectTimePrefix(minutes === 1, 'minute', 'minutes');
            return `${minutes} ${minutePrefix} ago`;
        } else if (days <= 0) {
            const hoursPrefix = this.getCorrectTimePrefix(hours === 1, 'hour', 'hours');
            return `${hours} ${hoursPrefix} ago`;
        } else if (months <= 0) {
            const daysPrefix = this.getCorrectTimePrefix(days === 1, 'day', 'days');
            return `${days} ${daysPrefix} ago`;
        }
        const monthsPrefix = this.getCorrectTimePrefix(months === 1, 'month', 'months');
        return `${months} ${monthsPrefix} ago`;
    }

    getCorrectTimePrefix(condition, truePrefix, falsePrefix) {
        return condition ? truePrefix : falsePrefix;
    }

    handleFullTimeClick(mobileCheckbox) {
        const elementPrefix = mobileCheckbox ? '-mobile' : '';
        const blankCheckboxElement = ui.getSingleElement(`.checkbox__element${elementPrefix}`);
        const checkedCheckboxElement = ui.getSingleElement(`.checkbox__checked${elementPrefix}`);

        this.fullTimeChecked = !this.fullTimeChecked;

        if (this.fullTimeChecked) {
            blankCheckboxElement.style.background = '#5964E0';
            checkedCheckboxElement.style.display = 'block';
        } else {
            blankCheckboxElement.style.background = '#f3f5f7';
            checkedCheckboxElement.style.display = 'none';
        }
    }

    onSearchButton(mobileSearch) {
        const queryParams = httpHandler.formatQueryParams(mobileSearch);
        const loadButtonState = this.getLoadButtonState(queryParams, 3);
        const loadButtonStateCallback = ui.updateLoadMoreButtonState.bind(ui, loadButtonState);

        http.fetchJobsList(queryParams, loadButtonStateCallback);
    }

    getLoadButtonState(queryParams, length) {
        return queryParams.split('=&').length === length ? 'block' : 'none';
    }

    onKeypress(event) {
        if (event.key === 'Enter') {
            this.onSearchButton()
        }
    }

    onMobileSearch() {
        const queryParams = httpHandler.formatMobileWindowQueryParams();
        const loadButtonState = this.getLoadButtonState(queryParams, 2);

        const loadButtonStateCallback = ui.updateLoadMoreButtonState.bind(ui, loadButtonState);
        http.fetchJobsList(queryParams, loadButtonStateCallback);
        this.onFilterClick(false);
    }

    onGetJobDetail(event) {
        const isMainElement = event.target.id === 'main';
        const isBoxElement = event.target.className === 'box';

        if (isBoxElement) {
            this.navigateToJobDetail(event.target.id);
        }

        if (!isMainElement && !isBoxElement) {
            let parentElement = event.target.parentElement;

            while (parentElement.className !== 'box') {
                parentElement = parentElement.parentElement;
            }

            this.navigateToJobDetail(parentElement.id);
        }
    }

    debounceScroll(debounceCallback, waitTime) {
        let timeout;

        return (...args) => {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => debounceCallback.apply(context, args), waitTime);
        };
    }

    navigateToJobDetail(jobId) {
        window.location.replace(`/Frontend-Mentor-Github-Jobs/html/job.html?id=${jobId}`);
    }
}

const businessLogic = new BusinessLogic();

export { businessLogic };