/* -------------------------------
   HOMEPAGE: LOAD CATEGORIES
--------------------------------- */
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

function loadCategories() {
  const container = document.getElementById("category-list");
  if (!container) return;

  container.innerHTML = "";
  categoryList.forEach((cat, index) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.textContent = cat;

    if (editMode) {
      card.style.justifyContent = "space-between";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "✖";
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        categoryList.splice(index, 1);
        loadCategories();
      };

      card.appendChild(deleteBtn);
    } else {
      card.onclick = () => {
        window.location.href = `category.html?category=${encodeURIComponent(cat)}`;
      };
    }

    container.appendChild(card);
  });
}

// ✅ Toggle Edit Mode for Categories
const toggleBtn = document.getElementById("toggleEditModeBtn");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    editMode = !editMode;
    document.getElementById("editPanel").style.display = editMode ? "block" : "none";
    toggleBtn.textContent = editMode ? "Exit Edit Mode" : "Edit Categories";
    loadCategories();
  });
}

// ✅ Add Category
const addForm = document.getElementById("addCategoryForm");
if (addForm) {
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newCategory = document.getElementById("newCategory").value.trim();
    if (newCategory) {
      categoryList.push(newCategory.toUpperCase());
      document.getElementById("newCategory").value = "";
      loadCategories();
    }
  });
}
