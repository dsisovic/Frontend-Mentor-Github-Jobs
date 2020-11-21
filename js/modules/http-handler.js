import { ui } from './ui.js';
class HttpHandler {

    constructor() { }

    checkForEmptyGithubJobs(emptyGithubJobs) {
        if (emptyGithubJobs) {
            this.setFetchErrorState(true, 'No Github Jobs available.');
            this.setLoadButtonRocketState('none');
        } else {
            this.setFetchErrorState(false);
            this.setLoadButtonRocketState('block');
        }
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
}

const httpHandler = new HttpHandler();

export { httpHandler };