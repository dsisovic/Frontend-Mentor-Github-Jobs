import { http } from './http.js';
import { ui } from './ui.js';
class BusinessLogic {

    lightTheme = true;
    fullTimeChecked = false;

    constructor() { }

    intializeApp() {
        http.fetchJobsList();
        this.setEventListeners();
        this.loadSavedTheme();
    }

    setEventListeners() {
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
        themeSwitcher.addEventListener('click', () => this.switchTheme());
        mobileSearch.addEventListener('click', () => this.onMobileSearch());
        loadMoreButton.addEventListener('click', () => http.fetchNextJobList());
        searchButton.addEventListener('click', () => this.onSearchButton(false));
        mobileWindowClose.addEventListener('click', () => this.onFilterClick(false));
        searchButtonMobile.addEventListener('click', () => this.onSearchButton(true));
        fullTimeCheckbox.addEventListener('click', () => this.handleFullTimeClick(false));
        fullTimeMobileCheckbox.addEventListener('click', () => this.handleFullTimeClick(true));

        document.addEventListener('keypress', (event) => this.onKeypress(event));
        window.addEventListener('scroll', this.debounceScroll(() => this.onPageScroll(), 100));
    }

    renderGithubJobs(githubJobs) {
        const mainDiv = ui.getSingleElement('#main');

        mainDiv.innerHTML = githubJobs
            .map(jobItem => {
                const imageElement = jobItem['company_logo'] ? `<img src="${jobItem['company_logo']}" alt="box-img" onerror='this.style.display = "none"'>` : '<span>N/A</span>';
                return `
                <div class="box">
                    <div class="box__header">
                        ${imageElement}
                    </div>
                    <div class="box__content">
                        <div class="box__content--day">
                            <span>${this.calculateTimePassed(jobItem['created_at'])}</span>
                            <span class="dot">&bull;</span>
                            <span>${jobItem.type}</span>
                        </div>
                        <div class="box__content--title" title="${jobItem.title}">${jobItem.title.length > 45 ? jobItem.title.slice(0, 45) + '...' : jobItem.title}</div>
                        <div class="box__content--company">${jobItem.company}</div>
                        <div class="box__content--location" title="${jobItem.location}">${jobItem.location.length > 25 ? jobItem.location.slice(0, 25) + '...' : jobItem.location}</div>
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

    debounceScroll(debounceCallback, waitTime) {
        let timeout;

        return (...args) => {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => debounceCallback.apply(context, args), waitTime);
        };
    }

    setFetchErrorState(showState, message) {
        const fetchErrorContainer = ui.getSingleElement('#fetch__error');

        if (showState) {
            fetchErrorContainer.textContent = message;
            fetchErrorContainer.style.display = 'block';
            this.setLoadButtonRocketState('none');
        } else {
            fetchErrorContainer.style.display = 'none';
            this.setLoadButtonRocketState('block');
        }
    }

    checkForEmptyGithubJobs(emptyGithubJobs) {
        if (emptyGithubJobs) {
            this.setFetchErrorState(true, 'No Github Jobs available.');
            this.setLoadButtonRocketState('none');
        } else {
            this.setFetchErrorState(false);
            this.setLoadButtonRocketState('block');
        }
    }

    setLoadButtonRocketState(state) {
        const rocket = ui.getSingleElement('#rocket');
        const loadMoreButton = ui.getSingleElement('#load-more__button');

        if (window.pageYOffset >= 1200 && state === 'block') {
            rocket.style.display = 'block';
        } else {
            rocket.style.display = 'none';
        }

        loadMoreButton.style.display = state;
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

    switchTheme() {
        const switchBall = ui.getSingleElement('.header__switch-ball');

        this.lightTheme = !this.lightTheme;

        if (this.lightTheme) {
            switchBall.style.left = '5px';
            document.documentElement.style.setProperty('--theme-color', '#f3f5f7');
            document.documentElement.style.setProperty('--input-color', 'white');
            document.documentElement.style.setProperty('--theme-font-color', 'black');
            this.setSavedTheme('light');
        } else {
            switchBall.style.left = '22px';
            document.documentElement.style.setProperty('--theme-color', '#121721');
            document.documentElement.style.setProperty('--input-color', '#19212E');
            document.documentElement.style.setProperty('--theme-font-color', 'white');
            this.setSavedTheme('dark');
        }
    }

    onSearchButton(mobileSearch) {
        const queryParams = this.formatQueryParams(mobileSearch);
        const loadButtonState = this.getLoadButtonState(queryParams, 3);
        const loadButtonStateCallback = ui.updateLoadMoreButtonState.bind(ui, loadButtonState);

        http.fetchJobsList(queryParams, loadButtonStateCallback);
    }

    getLoadButtonState(queryParams, length) {
        return queryParams.split('=&').length === length ? 'block' : 'none';
    }

    formatQueryParams(mobileSearch) {
        const titleInputValue = ui.getSingleElement('#titleInput').value || '';
        const locationInputValue = !mobileSearch ? ui.getSingleElement('#locationInput').value || '' : '';

        return `description=${titleInputValue}&location=${locationInputValue}&full_time=${this.fullTimeChecked ? 'yes' : 'no'}`;
    }

    formatMobileWindowQueryParams() {
        const titleInputValue = ui.getSingleElement('#titleInput').value || '';
        const locationInputValue = ui.getSingleElement('#mobile__location').value || '';

        return `description=${titleInputValue}&location=${locationInputValue}&full_time=${this.fullTimeChecked ? 'yes' : 'no'}`;
    }

    onKeypress(event) {
        if (event.key === 'Enter') {
            this.onSearchButton()
        }
    }

    onMobileSearch() {
        const queryParams = this.formatMobileWindowQueryParams();
        const loadButtonState = this.getLoadButtonState(queryParams, 2);

        const loadButtonStateCallback = ui.updateLoadMoreButtonState.bind(ui, loadButtonState);
        http.fetchJobsList(queryParams, loadButtonStateCallback);
        this.onFilterClick(false);
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('savedTheme');

        if (savedTheme) {
            this.lightTheme = savedTheme !== 'light';
            this.switchTheme();
        }
    }

    setSavedTheme(theme) {
        localStorage.setItem('savedTheme', theme);
    }
}

const businessLogic = new BusinessLogic();

export { businessLogic };