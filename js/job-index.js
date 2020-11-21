import { jobBusinessLogic } from './modules/job-business-logic.js';

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        jobBusinessLogic.intializeApp();
    });
})();