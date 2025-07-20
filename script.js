let editMode = false;
let recipes = [];
const dataPath = "recipes.json"; // Path for your structure

/* -------------------------------
   Fetch Recipes
--------------------------------- */
async function fetchRecipes() {
  try {
    const response = await fetch(dataPath);
    if (!response.ok) throw new Error("Failed to load recipes.json");
    recipes = await response.json();
  } catch (err) {
    console.error("Error fetching recipes:", err);
    recipes = [];
  }
  return recipes;
}

/* -------------------------------
   ALL RECIPES HOMEPAGE
--------------------------------- */
async function loadAllRecipes() {
  await fetchRecipes();
  const container = document.getElementById("all-recipe-list");

  function display() {
    container.innerHTML = "";
    recipes.forEach((recipe, index) => {
      const card = document.createElement("div");
      card.className = "recipe-card";

      // ✅ Info section: Title + optional category/code
      const infoContainer = document.createElement("div");
      infoContainer.style.flex = "1";
      infoContainer.style.display = "flex";
      infoContainer.style.flexDirection = "column";
      infoContainer.style.textAlign = "left";

      const titleEl = document.createElement("strong");
      titleEl.textContent = recipe.title;

      const categoryEl = document.createElement("span");
      categoryEl.textContent = `Category: ${recipe.category || "N/A"}`;

      const codeEl = document.createElement("span");
      codeEl.textContent = `Code: ${recipe.code || "N/A"}`;

      infoContainer.appendChild(titleEl);
      infoContainer.appendChild(categoryEl);
      infoContainer.appendChild(codeEl);
      card.appendChild(infoContainer);

      // ✅ Edit/Delete Buttons in Edit Mode
      if (editMode) {
        const btnContainer = document.createElement("div");
        btnContainer.style.display = "flex";
        btnContainer.style.gap = "10px";

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

        btnContainer.appendChild(editBtn);
        btnContainer.appendChild(deleteBtn);
        card.appendChild(btnContainer);
      } else {
        // ✅ Normal click opens recipe detail
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
   COMMON EVENTS: Search, Toggle Edit, Add Recipe
--------------------------------- */
function attachCommonEvents(display, container, searchId) {
  // ✅ Search Filter
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
          card.onclick = () =>
            (window.location.href = `recipe.html?title=${encodeURIComponent(recipe.title)}`);
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
      display();
    });
  }

  // ✅ Add Recipe
  const addForm = document.getElementById("addRecipeForm");
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("newRecipeTitle").value.trim();
      const category = document.getElementById("newRecipeCategory").value.trim();
      const code = document.getElementById("newRecipeCode").value.trim();

      if (title) {
        recipes.push({
          title,
          category,
          code,
          ingredients: [],
          instructions: [],
          notes: "",
          story: "",
          photo: "",
          tags: [],
          date_added: new Date().toISOString().split("T")[0]
        });

        // ✅ Clear inputs after adding
        document.getElementById("newRecipeTitle").value = "";
        document.getElementById("newRecipeCategory").value = "";
        document.getElementById("newRecipeCode").value = "";

        display();
      }
    });
  }
}

/* -------------------------------
   Edit Recipe Function
--------------------------------- */
function editRecipe(index, callback) {
  const newTitle = prompt("Enter new title:", recipes[index].title);
  const newCategory = prompt("Enter new category:", recipes[index].category || "");
  const newCode = prompt("Enter new code:", recipes[index].code || "");

  if (newTitle) recipes[index].title = newTitle.trim();
  if (newCategory) recipes[index].category = newCategory.trim();
  if (newCode) recipes[index].code = newCode.trim();

  callback();
}

/* -------------------------------
   Recipe Detail Page
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
      <h2>Category:</h2>
      <p>${recipe.category || "N/A"}</p>
      <h2>Code:</h2>
      <p>${recipe.code || "N/A"}</p>
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
