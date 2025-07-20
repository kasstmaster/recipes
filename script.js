let editMode = false;
let recipes = [];
const dataPath = "recipes.json"; // ✅ Path is correct for your structure

// ✅ Global category list for homepage
let categoryList = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SIDE DISHES",
  "APPETIZERS & SNACKS",
  "DESSERTS",
  "DRINKS",
  "ALCOHOL DRINKS",
  "CHILDREN’S",
  "HOMEMADE INGREDIENTS",
  "HOW-TO & TECHNIQUES"
];

// ✅ Helper: Format category names in Title Case
function formatCategory(name) {
  return name
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ✅ Fetch recipes from JSON
async function fetchRecipes() {
  try {
    const response = await fetch(dataPath);
    if (!response.ok) throw new Error("Failed to load recipes.json");
    recipes = await response.json();
  } catch (err) {
    console.error("Error fetching recipes:", err);
    recipes = []; // ✅ Fallback to empty list
  }
  return recipes;
}

/* -------------------------------
   HOMEPAGE: LOAD CATEGORIES
--------------------------------- */
function loadCategories() {
  const container = document.getElementById("category-list");
  if (!container) return;
  container.innerHTML = "";

  categoryList.forEach((cat, index) => {
    const card = document.createElement("div");
    card.className = "category-card";

    const span = document.createElement("span");
    span.textContent = formatCategory(cat);
    card.appendChild(span);

    if (editMode) {
      card.classList.add("edit-mode");
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "✖";
      deleteBtn.onclick = () => {
        categoryList.splice(index, 1);
        loadCategories();
      };
      card.appendChild(deleteBtn);
    } else {
      card.onclick = () =>
        (window.location.href = `recipes.html?category=${encodeURIComponent(cat)}`);
    }

    container.appendChild(card);
  });
}

/* -------------------------------
   CATEGORY PAGE: LOAD RECIPES
--------------------------------- */
async function loadRecipes() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const titleEl = document.getElementById("category-title");
  if (!titleEl) return;

  titleEl.innerText = formatCategory(category);

  await fetchRecipes();
  const container = document.getElementById("recipe-list");

  function display() {
    container.innerHTML = "";
    recipes.forEach((recipe, index) => {
      if (recipe.category && recipe.category.toLowerCase() === category.toLowerCase()) {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `<span>${recipe.title}</span>`;

        if (editMode) {
          card.style.justifyContent = "space-between";

          const editBtn = document.createElement("button");
          editBtn.textContent = "Edit";
          editBtn.onclick = (e) => {
            e.stopPropagation();
            editRecipe(index, display);
          };

          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "✖";
          deleteBtn.className = "delete-btn";
          deleteBtn.onclick = (e) => {
            e.stopPropagation();
            recipes.splice(index, 1);
            display();
          };

          card.appendChild(editBtn);
          card.appendChild(deleteBtn);
        } else {
          card.onclick = () =>
            (window.location.href = `recipe.html?title=${encodeURIComponent(recipe.title)}`);
        }

        container.appendChild(card);
      }
    });
  }

  display();
  attachCommonEvents(display, container, "search");
}

/* -------------------------------
   ALL RECIPES PAGE
--------------------------------- */
async function loadAllRecipes() {
  await fetchRecipes();
  const container = document.getElementById("all-recipe-list");

  function display() {
    container.innerHTML = "";
    recipes.forEach((recipe, index) => {
      const card = document.createElement("div");
      card.className = "recipe-card";
      card.innerHTML = `<span>${recipe.title}</span>`;

      if (editMode) {
        card.style.justifyContent = "space-between";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = (e) => {
          e.stopPropagation();
          editRecipe(index, display);
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✖";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          recipes.splice(index, 1);
          display();
        };

        card.appendChild(editBtn);
        card.appendChild(deleteBtn);
      } else {
        card.onclick = () =>
          (window.location.href = `recipe.html?title=${encodeURIComponent(recipe.title)}`);
      }

      container.appendChild(card);
    });
  }

  display();
  attachCommonEvents(display, container, "searchAll");
}

/* -------------------------------
   COMMON EVENTS (Search + Toggle + Add)
--------------------------------- */
function attachCommonEvents(display, container, searchId) {
  const searchInput = document.getElementById(searchId);
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      container.innerHTML = "";
      recipes
        .filter(r => r.title.toLowerCase().includes(term))
        .forEach((recipe) => {
          const card = document.createElement("div");
          card.className = "recipe-card";
          card.innerHTML = `<span>${recipe.title}</span>`;
          container.appendChild(card);
        });
    });
  }

  const toggleBtn = document.getElementById("toggleEditModeBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      editMode = !editMode;
      document.getElementById("editPanel").style.display = editMode ? "block" : "none";
      toggleBtn.textContent = editMode ? "Exit Edit Mode" : "Edit Recipes";
      display();
    });
  }

  const addForm = document.getElementById("addRecipeForm");
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("newRecipeTitle").value.trim();
      const cat = document.getElementById("newRecipeCategory").value.trim();
      if (title && cat) {
        recipes.push({
          title,
          category: cat,
          ingredients: [],
          instructions: [],
          notes: "",
          story: "",
          photo: "",
          tags: []
        });
        document.getElementById("newRecipeTitle").value = "";
        document.getElementById("newRecipeCategory").value = "";
        display();
      }
    });
  }
}

/* -------------------------------
   EDIT RECIPE FUNCTION
--------------------------------- */
function editRecipe(index, callback) {
  const newTitle = prompt("Enter new title:", recipes[index].title);
  const newCategory = prompt("Enter new category:", recipes[index].category);
  if (newTitle && newCategory) {
    recipes[index].title = newTitle.trim();
    recipes[index].category = newCategory.trim();
    callback(); // ✅ Keeps Edit Mode ON
  }
}

/* -------------------------------
   RECIPE PAGE
--------------------------------- */
async function loadRecipeDetails() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");
  await fetchRecipes();
  const recipe = recipes.find(r => r.title === title);

  if (recipe) {
    const container = document.getElementById("recipe-details");
    document.getElementById("recipe-title").innerText = recipe.title;
    container.innerHTML = `
      ${recipe.photo ? `<img src="${recipe.photo}" alt="${recipe.title}" style="max-width:100%; margin-bottom:10px;">` : ""}
      <h2>Ingredients</h2>
      <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      <h2>Instructions</h2>
      <ol>${recipe.instructions.map(s => `<li>${s}</li>`).join('')}</ol>
      ${recipe.notes ? `<p><strong>Notes:</strong> ${recipe.notes}</p>` : ""}
      ${recipe.story ? `<p><em>${recipe.story}</em></p>` : ""}
    `;
  }

  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }
}

/* -------------------------------
   HOMEPAGE EVENTS
--------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("category-list")) {
    const toggleBtn = document.getElementById("toggleEditModeBtn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        editMode = !editMode;
        document.getElementById("editPanel").style.display = editMode ? "block" : "none";
        toggleBtn.textContent = editMode ? "Exit Edit Mode" : "Edit Categories";
        loadCategories();
      });
    }

    const addForm = document.getElementById("addCategoryForm");
    if (addForm) {
      addForm.addEventListener("submit", e => {
        e.preventDefault();
        const newCat = document.getElementById("newCategory").value.trim();
        if (newCat && !categoryList.includes(newCat.toUpperCase())) {
          categoryList.push(newCat.toUpperCase());
          document.getElementById("newCategory").value = "";
          loadCategories();
        }
      });
    }

    loadCategories();
  }
});
