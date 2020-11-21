import { ui } from './ui.js';

class Theme {

    constructor() { }

    switchTheme() {
        const switchBall = ui.getSingleElement('.header__switch-ball');

        this.lightTheme = !this.lightTheme;

        if (this.lightTheme) {
            switchBall.style.left = '5px';
            document.documentElement.style.setProperty('--theme-color', '#f3f5f7');
            document.documentElement.style.setProperty('--input-color', 'white');
            document.documentElement.style.setProperty('--theme-font-color', 'black');
            document.documentElement.style.setProperty('--job-detail-paragraph', 'black');
            this.setSavedTheme('light');
        } else {
            switchBall.style.left = '22px';
            document.documentElement.style.setProperty('--theme-color', '#121721');
            document.documentElement.style.setProperty('--input-color', '#19212E');
            document.documentElement.style.setProperty('--theme-font-color', 'white');
            document.documentElement.style.setProperty('--job-detail-paragraph', '#6d7f97');
            this.setSavedTheme('dark');
        }
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

const theme = new Theme();

export { theme };