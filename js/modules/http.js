import { businessLogic } from './business-logic.js';
import { jobBusinessLogic } from './job-business-logic.js';
import { httpHandler } from './http-handler.js';
import { ui } from './ui.js';
class Http {

    githubJobs = [];
    currentFetchPage = 1;
    githubJobsUrl = 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json';
    githubJobDetailUrl = 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions/';

    constructor() { }

    async fetchJobsList(queryParams, loadButtonCallback) {
        businessLogic.updateSpinnerState(true);
        httpHandler.setFetchErrorState(false);

        try {
            const fetchUrl = this.getFetchUrl(queryParams);
            const jobsList = await fetch(fetchUrl);
            const jobsListJson = await jobsList.json();

            this.githubJobs = jobsListJson;
            businessLogic.renderGithubJobs(this.githubJobs);
            httpHandler.checkForEmptyGithubJobs(this.githubJobs.length === 0);

            if (loadButtonCallback) {
                loadButtonCallback();
            }
        } catch {
            httpHandler.setFetchErrorState(true, 'Error fetching Github Jobs. Please try again.');
            businessLogic.updateSpinnerState(false);
        }
    }

    async fetchNextJobList(queryParams) {
        const mainDiv = ui.getSingleElement('#main');
        ui.clearElementChildren(mainDiv);
        businessLogic.updateSpinnerState(true);
        httpHandler.setFetchErrorState(false);

        try {
            this.currentFetchPage += 1;
            const fetchUrl = this.getFetchUrl(queryParams, `?page=${this.currentFetchPage}`);
            const jobsList = await fetch(fetchUrl);
            const jobsListJson = await jobsList.json();

            this.githubJobs = [...this.githubJobs, ...jobsListJson];
            businessLogic.renderGithubJobs(this.githubJobs);
            httpHandler.checkForEmptyGithubJobs(this.githubJobs.length === 0);
        } catch {
            httpHandler.setFetchErrorState(true, 'Error fetching Github Jobs. Please try again.');
            businessLogic.updateSpinnerState(false);
        }
    }

    async fetchJobDetails(jobId) {
        try {
            const jobDetailData = await fetch(`${this.githubJobDetailUrl}${jobId}.json`);
            const jobDetailJson = await jobDetailData.json();

            jobBusinessLogic.initializeJobDetailPage(jobDetailJson);
        } catch {
            window.location.href = '/Frontend-Mentor-Github-Jobs';
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