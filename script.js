let editMode = false;
let recipes = [];
const dataPath = "../data/recipes.json";

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
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ✅ Fetch recipes from JSON
async function fetchRecipes() {
  const response = await fetch(dataPath);
  recipes = await response.json();
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

    // ✅ Add category text
    const span = document.createElement("span");
    span.textContent = formatCategory(cat);
    card.appendChild(span);

    // ✅ Add or remove edit-mode class
    if (editMode) {
      card.classList.add("edit-mode");

      // Add delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "✖";
      deleteBtn.onclick = () => {
        categoryList.splice(index, 1);
        loadCategories();
      };
      card.appendChild(deleteBtn);
    } else {
      card.classList.remove("edit-mode");
      // ✅ Normal click to go to recipes
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

  // ✅ Format header title
  titleEl.innerText = formatCategory(category);

  await fetchRecipes();
  const container = document.getElementById("recipe-list");

  function display(list) {
    container.innerHTML = "";
    list.forEach((recipe, index) => {
      if (recipe.category && recipe.category.toLowerCase() === category.toLowerCase()) {
        const card = document.createElement("div");
        card.className = "recipe-card"; // ✅ Consistent with CSS
        card.innerHTML = `<span>${recipe.title}</span>`;

        if (editMode) {
          // ✅ Add edit and delete buttons for Edit Mode
          const editBtn = document.createElement("button");
          editBtn.textContent = "Edit";
          editBtn.style.marginLeft = "10px";
          editBtn.onclick = () => editRecipe(index);

          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "✖";
          deleteBtn.className = "delete-btn"; // ✅ Match category delete button styling
          deleteBtn.onclick = () => {
            recipes.splice(index, 1);
            display(recipes);
          };

          card.appendChild(editBtn);
          card.appendChild(deleteBtn);
        } else {
          // ✅ Normal click goes to recipe details page
          card.onclick = () =>
            window.location.href = `recipe.html?title=${encodeURIComponent(recipe.title)}`;
        }

        container.appendChild(card);
      }
    });
  }

  display(recipes);

  // ✅ Search filter
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      const term = e.target.value.toLowerCase();
      display(recipes.filter(r => r.title.toLowerCase().includes(term)));
    });
  }

  // ✅ Toggle Edit Mode functionality
  const toggleBtn = document.getElementById("toggleEditModeBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      editMode = !editMode;
      document.getElementById("editPanel").style.display = editMode ? "block" : "none";
      toggleBtn.textContent = editMode ? "Exit Edit Mode" : "Edit Recipes";
      display(recipes); // ✅ Refresh list to show/hide buttons
    });
  }

  // ✅ Handle Add Recipe form
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
        display(recipes);
      }
    });
  }

  // ✅ Export Updated Recipes
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const exportArea = document.getElementById("exportData");
      exportArea.style.display = "block";
      exportArea.value = JSON.stringify(recipes, null, 2);
    });
  }
}

  // ✅ Toggle Edit Mode
  const toggleBtn = document.getElementById("toggleEditModeBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      editMode = !editMode;
      document.getElementById("editPanel").style.display = editMode ? "block" : "none";
      toggleBtn.textContent = editMode ? "Exit Edit Mode" : "Edit Recipes";
      display(recipes);
    });
  }

  // ✅ Add Recipe
  const addForm = document.getElementById("addRecipeForm");
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("newRecipeTitle").value.trim();
      const cat = document.getElementById("newRecipeCategory").value.trim();
      if (title && cat) {
        recipes.push({ title, category: cat, ingredients: [], instructions: [], notes: "", story: "", photo: "", tags: [] });
        document.getElementById("newRecipeTitle").value = "";
        document.getElementById("newRecipeCategory").value = "";
        display(recipes);
      }
    });
  }

  // ✅ Export JSON
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const exportArea = document.getElementById("exportData");
      exportArea.style.display = "block";
      exportArea.value = JSON.stringify(recipes, null, 2);
    });
  }
}

/* -------------------------------
   RECIPE PAGE: LOAD SINGLE RECIPE
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
      ${recipe.photo ? `<img src="../data/${recipe.photo}" alt="${recipe.title}" style="max-width:100%; margin-bottom:10px;">` : ""}
      <h2>Ingredients</h2>
      <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      <h2>Instructions</h2>
      <ol>${recipe.instructions.map(s => `<li>${s}</li>`).join('')}</ol>
      ${recipe.notes ? `<p><strong>Notes:</strong> ${recipe.notes}</p>` : ""}
      ${recipe.story ? `<p><em>${recipe.story}</em></p>` : ""}
    `;
  }

  // ✅ Print Button
  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }
}

/* -------------------------------
   EDIT RECIPE FUNCTION
--------------------------------- */
function editRecipe(index) {
  const newTitle = prompt("Enter new title:", recipes[index].title);
  const newCategory = prompt("Enter new category:", recipes[index].category);
  if (newTitle && newCategory) {
    recipes[index].title = newTitle.trim();
    recipes[index].category = newCategory.trim();
    loadRecipes();
  }
}

/* -------------------------------
   HOMEPAGE EVENTS
--------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Homepage Edit Mode for Categories
  const toggleBtn = document.getElementById("toggleEditModeBtn");
  if (toggleBtn && document.getElementById("category-list")) {
    toggleBtn.addEventListener("click", () => {
      editMode = !editMode;
      document.getElementById("editPanel").style.display = editMode ? "block" : "none";
      toggleBtn.textContent = editMode ? "Exit Edit Mode" : "Edit Categories";
      loadCategories();
    });

    const addForm = document.getElementById("addCategoryForm");
    if (addForm) {
      addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newCat = document.getElementById("newCategory").value.trim();
        if (newCat && !categoryList.includes(newCat.toUpperCase())) {
          categoryList.push(newCat.toUpperCase());
          document.getElementById("newCategory").value = "";
          loadCategories();
        }
      });
    }

    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const exportArea = document.getElementById("exportData");
        exportArea.style.display = "block";
        exportArea.value = JSON.stringify({ categories: categoryList }, null, 2);
      });
    }

    loadCategories();

    // ✅ Add listener for "View All Recipes" button (if it exists)
    const viewAllBtn = document.getElementById("viewAllRecipesBtn");
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", () => {
        window.location.href = "all-recipes.html";
      });
    }
  }
});

