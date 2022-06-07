import { URL_API, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '', // Planned: add smth it in the future (like analitics). Actual : query = search result
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    cookingTime: recipe.cooking_time,
    id: recipe.id,
    title: recipe.title,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    publisher: recipe.publisher,
    servings: recipe.servings,
    sourceUrl: recipe.source_url,
    ...(recipe.key && { key: recipe.key }),
  };
};

////// Load recipes from API
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${URL_API}${id}?key=${KEY}`);

    state.recipe = createRecipeObject(data);
    // console.log(state.recipe);

    // A way to mark all books as bookmarked or NOT bookmarked (true / false):
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    // some is used here to return true or false to every id (useful in this situation for 'if-else' statement )
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

////// Search for recipes
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${URL_API}?search=${query}&key=${KEY}`);

    // We take recipes from loaded data and want to create a new Arrray
    // which contains the new objects where the property names are different
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        image: rec.image_url,
        publisher: rec.publisher,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

////// Determain which recipes should be on the page
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9

  return state.search.results.slice(start, end);
};

export const updatedServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // Add bookmark (to state)
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear;
  ('bookmarks');
};

// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    // 1. convert back to array (looks lie ['ingredient', '0.5,,Avocado']),
    // 2. filter by 2 conditions: [0] index startswith 'ingredient'  and [1] not empty
    // 3. use map to separate all ingredient by comma, delete empty spaces + destructuring []
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        // const ingsArr = ing[1].replaceAll(' ', '').split(','); // this return an array of 3 elements
        const ingsArr = ing[1].split(',').map(el => el.trim()); // this return an array of 3 elements

        if (ingsArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)'
          );
        const [quantity, unit, description] = ingsArr; //  we separate this array into 3 vars (desctructure)
        return { quantity: quantity ? +quantity : null, unit, description }; // we create Object out of 3 vars
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    // console.log(recipe);

    const data = await AJAX(
      `${URL_API}?search=${recipe.title}&key=${KEY}`,
      recipe
    );
    // console.log(data);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
