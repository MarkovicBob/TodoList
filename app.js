const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const trashBin = document.getElementById("trash-bin");
const trashPanel = document.getElementById("trash-panel");
const trashItems = document.getElementById("trash-items");
const trashCount = document.getElementById("trash-count");
const completedBin = document.getElementById("completed-bin");
const completedPanel = document.getElementById("completed-panel");
const completedItems = document.getElementById("completed-items");
const completedCount = document.getElementById("completed-count");

// Trash bin functionality
let deletedTodos = [];
let completedTodos = [];
const TRASH_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to update trash bin visibility and count
function updateTrashBin() {
  if (deletedTodos.length > 0) {
    trashCount.style.display = "flex";
    trashCount.textContent = deletedTodos.length;
  } else {
    trashCount.style.display = "none";
    trashPanel.style.display = "none";
  }
}

// Function to update completed bin visibility and count
function updateCompletedBin() {
  if (completedTodos.length > 0) {
    completedCount.style.display = "flex";
    completedCount.textContent = completedTodos.length;
  } else {
    completedCount.style.display = "none";
    completedPanel.style.display = "none";
  }
}

// Function to format time remaining
function formatTimeRemaining(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Function to update trash panel
function updateTrashPanel() {
  trashItems.innerHTML = "";

  deletedTodos.forEach((item, index) => {
    const timeRemaining = item.deleteTime + TRASH_TIMEOUT - Date.now();

    if (timeRemaining <= 0) {
      // Remove expired items
      deletedTodos.splice(index, 1);
      updateTrashPanel();
      updateTrashBin();
      return;
    }

    const trashItem = document.createElement("div");
    trashItem.className = "trash-item";

    // Dodaj klase za različite nivoe urgentnosti
    if (timeRemaining <= 2000) {
      // Poslednje 2 sekunde - vrlo urgentno
      trashItem.classList.add("expiring-urgent");
    } else if (timeRemaining <= 5000) {
      // Poslednje 5 sekundi - umereno urgentno
      trashItem.classList.add("expiring-soon");
    }

    trashItem.innerHTML = `
      <div class="trash-item-text">${item.text}</div>
      <div class="trash-item-timer">Time remaining: ${formatTimeRemaining(
        timeRemaining
      )}</div>
      <div class="trash-item-actions">
        <button class="restore-btn" onclick="restoreItem(${index})">Restore</button>
        <button class="permanent-delete-btn" onclick="permanentDelete(${index})">Delete Forever</button>
      </div>
    `;

    trashItems.appendChild(trashItem);
  });
}

// Function to restore item from trash
function restoreItem(index) {
  const item = deletedTodos[index];

  // Recreate the todo item
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.addEventListener("change", function () {
    if (this.checked) {
      moveToCompleted(li);
    }
  });
  li.appendChild(checkbox);

  const textSpan = document.createElement("span");
  textSpan.innerText = item.text;
  textSpan.className = "todo-text";
  li.appendChild(textSpan);

  const editSpan = document.createElement("span");
  editSpan.innerText = "Edit";
  editSpan.className = "edit";
  li.appendChild(editSpan);

  const deleteSpan = document.createElement("span");
  deleteSpan.innerText = "Delete";
  deleteSpan.className = "delete";
  li.appendChild(deleteSpan);

  // Insert at original position or at the end
  const allTodos = Array.from(todoList.children);
  if (item.originalIndex >= allTodos.length) {
    todoList.appendChild(li);
  } else {
    todoList.insertBefore(li, allTodos[item.originalIndex]);
  }

  // Remove from trash
  deletedTodos.splice(index, 1);
  updateTrashPanel();
  updateTrashBin();
}

// Function to permanently delete item
function permanentDelete(index) {
  deletedTodos.splice(index, 1);
  updateTrashPanel();
  updateTrashBin();
}

// Function to move todo to completed
function moveToCompleted(todoElement) {
  const todoText = todoElement.querySelector(".todo-text").innerText;

  // Add to completed todos
  completedTodos.push({
    text: todoText,
    completedTime: Date.now(),
  });

  // Add flying animation class
  todoElement.classList.add("flying-to-completed");

  // Remove from DOM after animation
  setTimeout(() => {
    todoElement.remove();
    updateCompletedBin();
  }, 3000); // 3 seconds for the animation
}

// Function to update completed panel
function updateCompletedPanel() {
  completedItems.innerHTML = "";

  completedTodos.forEach((item, index) => {
    const completedItem = document.createElement("div");
    completedItem.className = "completed-item";
    completedItem.innerHTML = `
      <span class="completed-text">${item.text}</span>
      <div class="completed-item-actions">
        <button class="uncomplete-btn" onclick="uncompleteItem(${index})">Restore to Todo</button>
        <button class="remove-completed-btn" onclick="removeCompleted(${index})">Remove</button>
      </div>
    `;
    completedItems.appendChild(completedItem);
  });
}

// Function to remove completed item
function removeCompleted(index) {
  completedTodos.splice(index, 1);
  updateCompletedPanel();
  updateCompletedBin();
}

// Function to uncomplete item (restore to todo list)
function uncompleteItem(index) {
  const item = completedTodos[index];

  // Create new todo item
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.addEventListener("change", function () {
    if (this.checked) {
      moveToCompleted(li);
    }
  });
  li.appendChild(checkbox);

  const textSpan = document.createElement("span");
  textSpan.innerText = item.text;
  textSpan.className = "todo-text";
  li.appendChild(textSpan);

  const editSpan = document.createElement("span");
  editSpan.innerText = "Edit";
  editSpan.className = "edit";
  li.appendChild(editSpan);

  const deleteSpan = document.createElement("span");
  deleteSpan.innerText = "Delete";
  deleteSpan.className = "delete";
  li.appendChild(deleteSpan);

  // Add to todo list
  todoList.appendChild(li);

  // Remove from completed todos
  completedTodos.splice(index, 1);
  updateCompletedPanel();
  updateCompletedBin();
}

// Make functions globally accessible
window.removeCompleted = removeCompleted;
window.uncompleteItem = uncompleteItem;

// Completed bin click handler
completedBin.addEventListener("click", function (e) {
  e.stopPropagation(); // Prevent event bubbling
  if (completedPanel.style.display === "block") {
    completedPanel.style.display = "none";
  } else {
    completedPanel.style.display = "block";
    updateCompletedPanel();
  }
});

// Prevent completed panel from closing when clicking inside it
completedPanel.addEventListener("click", function (e) {
  e.stopPropagation();
});

// Trash bin click handler
trashBin.addEventListener("click", function (e) {
  e.stopPropagation(); // Prevent event bubbling
  if (trashPanel.style.display === "block") {
    trashPanel.style.display = "none";
  } else {
    trashPanel.style.display = "block";
    updateTrashPanel();
  }
});

// Prevent trash panel from closing when clicking inside it
trashPanel.addEventListener("click", function (e) {
  e.stopPropagation();
});

// Close trash panel when clicking outside
document.addEventListener("click", function (e) {
  if (trashPanel.style.display === "block") {
    trashPanel.style.display = "none";
  }
  if (completedPanel.style.display === "block") {
    completedPanel.style.display = "none";
  }
});

// Update trash panel every second
setInterval(() => {
  if (trashPanel.style.display === "block" && deletedTodos.length > 0) {
    updateTrashPanel();
  }
}, 1000);

// Initialize trash bin and completed bin
updateTrashBin();
updateCompletedBin();

todoForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const todoText = todoInput.value;
  if (todoText !== "") {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        moveToCompleted(li);
      }
    });
    li.appendChild(checkbox);

    const textSpan = document.createElement("span");
    textSpan.innerText = todoText;
    textSpan.className = "todo-text";
    li.appendChild(textSpan);

    const editSpan = document.createElement("span");
    editSpan.innerText = "Edit";
    editSpan.className = "edit";
    li.appendChild(editSpan);

    const deleteSpan = document.createElement("span");
    deleteSpan.innerText = "Delete";
    deleteSpan.className = "delete";
    li.appendChild(deleteSpan);

    todoList.appendChild(li);
    todoInput.value = "";
  }
});

todoList.addEventListener("click", function (event) {
  if (event.target.className === "delete") {
    const li = event.target.parentElement;
    const todoText = li.querySelector(".todo-text").innerText;
    const originalIndex = Array.from(todoList.children).indexOf(li);

    // Add to trash
    deletedTodos.push({
      text: todoText,
      originalIndex: originalIndex,
      deleteTime: Date.now(),
    });

    // Remove from DOM
    li.remove();

    // Update trash bin
    updateTrashBin();

    // Auto-delete after timeout
    setTimeout(() => {
      const itemIndex = deletedTodos.findIndex(
        (item) =>
          item.text === todoText &&
          item.deleteTime === deletedTodos[deletedTodos.length - 1].deleteTime
      );
      if (itemIndex !== -1) {
        deletedTodos.splice(itemIndex, 1);
        updateTrashBin();
        if (trashPanel.style.display === "block") {
          updateTrashPanel();
        }
      }
    }, TRASH_TIMEOUT);
  }

  if (event.target.className === "edit") {
    const li = event.target.parentElement;
    const textSpan = li.querySelector(".todo-text");
    const currentText = textSpan.innerText;

    // Create input field for editing
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = currentText;
    editInput.className = "edit-input";

    // Create save button
    const saveBtn = document.createElement("span");
    saveBtn.innerText = "Save";
    saveBtn.className = "edit save";

    // Create cancel button
    const cancelBtn = document.createElement("span");
    cancelBtn.innerText = "Cancel";
    cancelBtn.className = "delete cancel";

    // Replace text with input field
    li.innerHTML = "";
    li.appendChild(editInput);
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);

    editInput.focus();

    // Save functionality
    const saveEdit = function () {
      const newText = editInput.value;
      if (newText !== "") {
        li.innerHTML = "";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "todo-checkbox";
        checkbox.addEventListener("change", function () {
          if (this.checked) {
            moveToCompleted(li);
          }
        });
        li.appendChild(checkbox);

        const newTextSpan = document.createElement("span");
        newTextSpan.innerText = newText;
        newTextSpan.className = "todo-text";
        li.appendChild(newTextSpan);

        const newEditSpan = document.createElement("span");
        newEditSpan.innerText = "Edit";
        newEditSpan.className = "edit";
        li.appendChild(newEditSpan);

        const newDeleteSpan = document.createElement("span");
        newDeleteSpan.innerText = "Delete";
        newDeleteSpan.className = "delete";
        li.appendChild(newDeleteSpan);
      }
    };

    // Cancel functionality
    const cancelEdit = function () {
      li.innerHTML = "";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "todo-checkbox";
      checkbox.addEventListener("change", function () {
        if (this.checked) {
          moveToCompleted(li);
        }
      });
      li.appendChild(checkbox);

      const originalTextSpan = document.createElement("span");
      originalTextSpan.innerText = currentText;
      originalTextSpan.className = "todo-text";
      li.appendChild(originalTextSpan);

      const originalEditSpan = document.createElement("span");
      originalEditSpan.innerText = "Edit";
      originalEditSpan.className = "edit";
      li.appendChild(originalEditSpan);

      const originalDeleteSpan = document.createElement("span");
      originalDeleteSpan.innerText = "Delete";
      originalDeleteSpan.className = "delete";
      li.appendChild(originalDeleteSpan);
    };

    saveBtn.addEventListener("click", saveEdit);
    cancelBtn.addEventListener("click", cancelEdit);

    // Save on Enter key
    editInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        saveEdit();
      }
    });
  }

  if (event.target.className === "todo-text") {
    event.target.parentElement.classList.toggle("completed");
  }
});
