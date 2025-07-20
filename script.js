let editMode = false;
let recipes = [];
const dataPath = "../data/recipes.json";

// ✅ Fetch recipes from JSON
async function fetchRecipes() {
  const response = await fetch(dataPath);
  recipes = await response.json();
  return recipes;
}

// ✅ Format category names
function formatCategory(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

  // ✅ Function to display recipes
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
            editRecipe(index);
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

  // ✅ Search filter
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      container.innerHTML = "";
      recipes
        .filter(r => r.title.toLowerCase().includes(term) && r.category.toLowerCase() === category.toLowerCase())
        .forEach((recipe) => {
          const card = document.createElement("div");
          card.className = "recipe-card";
          card.innerHTML = `<span>${recipe.title}</span>`;
          container.appendChild(card);
        });
    });
  }

  // ✅ Toggle Edit Mode
  const toggleBtn = document.getElementById("toggleEditModeBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      editMode = !editMode;
      document.getElementById("editPanel").style.display = editMode ? "block" : "none";
      toggleBtn.textContent = editMode ? "Exit Edit Mode" : "Edit Recipes";
      display(); // ✅ Refresh cards immediately
    });
  }

  // ✅ Add new recipe
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
