import { businessLogic } from './business-logic.js';
import { ui } from './ui.js';

class Http {

    githubJobs = [];
    currentFetchPage = 1;
    githubJobsUrl = 'https://jobs.github.com/positions.json';

    constructor() { }

    async fetchJobsList(queryParams, loadButtonCallback) {
        businessLogic.updateSpinnerState(true);
        businessLogic.setFetchErrorState(false);

        try {
            const fetchUrl = this.getFetchUrl(queryParams);
            const jobsList = await fetch(fetchUrl);
            const jobsListJson = await jobsList.json();

            this.githubJobs = jobsListJson;
            businessLogic.renderGithubJobs(this.githubJobs);
            businessLogic.checkForEmptyGithubJobs(this.githubJobs.length === 0);

            if (loadButtonCallback) {
                loadButtonCallback();
            }
        } catch {
            businessLogic.setFetchErrorState(true, 'Error fetching Github Jobs. Please try again.');
            businessLogic.updateSpinnerState(false);
        }
    }

    async fetchNextJobList(queryParams) {
        const mainDiv = ui.getSingleElement('#main');
        ui.clearElementChildren(mainDiv);
        businessLogic.updateSpinnerState(true);
        businessLogic.setFetchErrorState(false);

        try {
            this.currentFetchPage += 1;
            const fetchUrl = this.getFetchUrl(queryParams, `?page=${this.currentFetchPage}`);
            const jobsList = await fetch(fetchUrl);
            const jobsListJson = await jobsList.json();

            this.githubJobs = [...this.githubJobs, ...jobsListJson];
            businessLogic.renderGithubJobs(this.githubJobs);
            businessLogic.checkForEmptyGithubJobs(this.githubJobs.length === 0);
        } catch {
            businessLogic.setFetchErrorState(true, 'Error fetching Github Jobs. Please try again.');
            businessLogic.updateSpinnerState(false);
        }
    }

    getAvailableGithubJobs() {
        return this.githubJobs;
    }

    getFetchUrl(queryParams, pageQueryParam) {
        if (pageQueryParam) {
            return queryParams ? this.githubJobsUrl + pageQueryParam + queryParams : this.githubJobsUrl + pageQueryParam;
        }
        return queryParams ? this.githubJobsUrl + `?${queryParams}` : this.githubJobsUrl;
    }
}

const http = new Http();
export { http };