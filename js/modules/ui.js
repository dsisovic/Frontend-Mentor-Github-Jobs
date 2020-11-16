
class UI {
    constructor() { }

    getSingleElement(elementSelector) {
        return document.querySelector(elementSelector);
    }

    clearElementChildren(htmlElement) {
        while (htmlElement.firstChild) {
            htmlElement.removeChild(htmlElement.lastChild);
        }
    }

    updateLoadMoreButtonState(loadButtonState) {
        const loadMoreButton = this.getSingleElement('#load-more__button');
        loadMoreButton.style.display = loadButtonState;
    }
}

const ui = new UI();

export { ui };