import View from './View.js';
import icon from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline'); // looking for closest parent of class btn--inline ( we chose this class because it's common for BOTH pagination buttons and exists ONLY on them )

      if (!btn) return;

      const pageGoTo = +btn.dataset.goto;
      handler(pageGoTo);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // Page 1, and there are other pages
    if (curPage === 1 && numPages > 1) {
      return `<button data-goto = " ${
        curPage + 1
      }" class="btn--inline pagination__btn--next">
              <span>Page ${curPage + 1}</span>
              <svg class="search__icon">
                <use href="${icon}#icon-arrow-right"></use>
              </svg>
            </button>`;
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return `<button data-goto = " ${
        curPage - 1
      }" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icon}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPage - 1}</span>
          </button>`;
    }

    // Other page
    if (curPage < numPages) {
      return `<button data-goto = " ${
        curPage - 1
      }"class="btn--inline pagination__btn--prev">
              <svg class="search__icon">
                <use href="${icon}#icon-arrow-left"></use>
              </svg>
              <span>Page ${curPage - 1}</span>
             </button>
             <button   data-goto = " ${
               curPage + 1
             }"class="btn--inline pagination__btn--next">
                <span>Page ${curPage + 1}</span>
                <svg class="search__icon">
                  <use href="${icon}#icon-arrow-right"></use>
                </svg>
              </button>`;
    }
    // Page 1, and there are NO other pages
    return '';
  }
}

export default new PaginationView();
