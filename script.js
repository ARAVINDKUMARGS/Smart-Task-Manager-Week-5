/**
 * ============================================================================
 * SMART TASK MANAGER - VANILLA JAVASCRIPT APPLICATION CORE
 * InternNova Week 5 JavaScript Project (100 Marks)
 * 
 * Demonstrates:
 * - Variables (const, let)
 * - Functions (Arrow functions, callbacks, pure utility functions)
 * - Arrays & Objects (State management, schemas, destructuring)
 * - Conditionals (if/else, ternary operator, switch statements)
 * - Loops & Array Methods (filter, map, reduce, find, findIndex, some, every, forEach, sort)
 * - DOM Manipulation (selectors, classList, dataset, template literals, event delegation)
 * - Events (DOMContentLoaded, click, submit, input, change, keydown)
 * - LocalStorage Persistence & Error Handling
 * ============================================================================
 */

// Strict Mode for cleaner code and safety
'use strict';

/* ==========================================================================
   MODULE 1: CONFIGURATION & CONSTANTS
   ========================================================================== */
const STORAGE_KEYS = {
  TASKS: 'internnova_smart_tasks_v1',
  THEME: 'internnova_smart_theme_v1'
};

// Priority weight map for sorting (Higher number = higher priority)
const PRIORITY_WEIGHTS = {
  High: 3,
  Medium: 2,
  Low: 1
};

// Sample seed tasks loaded when LocalStorage is empty
const INITIAL_SAMPLE_TASKS = [
  {
    id: 'task_demo_1',
    title: 'Complete InternNova Week 5 JavaScript Project',
    description: 'Implement full CRUD, filtering, statistics, and LocalStorage persistence with clean code documentation.',
    category: 'Study',
    priority: 'High',
    dueDate: getFormattedDateOffset(1), // Tomorrow
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'task_demo_2',
    title: 'Review JavaScript Array Methods (map, filter, reduce)',
    description: 'Deep dive into functional programming principles and immutable state transformations.',
    category: 'Study',
    priority: 'Medium',
    dueDate: getFormattedDateOffset(3),
    completed: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_demo_3',
    title: 'Prepare Weekly Sprint Presentation',
    description: 'Create slide deck highlighting user metrics, code architecture, and key performance milestones.',
    category: 'Work',
    priority: 'High',
    dueDate: getFormattedDateOffset(0), // Today
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task_demo_4',
    title: 'Schedule Annual Dental Checkup',
    description: 'Call clinic reception to confirm booking for routine dental prophylaxis and checkup.',
    category: 'Health',
    priority: 'Low',
    dueDate: getFormattedDateOffset(-2), // Overdue by 2 days (for demo)
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'task_demo_5',
    title: 'Monthly Budget Planning & Expense Audit',
    description: 'Review bank statements, track recurring subscription charges, and set investment targets.',
    category: 'Finance',
    priority: 'Medium',
    dueDate: getFormattedDateOffset(7),
    completed: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/* ==========================================================================
   MODULE 2: APPLICATION STATE (Reactive in-memory state)
   ========================================================================== */
// JS CONCEPT: Variables (let for reassignable state, const for immutable structure)
let tasks = [];
let activeStatusFilter = 'all';      // 'all' | 'pending' | 'completed' | 'overdue'
let activeCategoryFilter = 'all';    // 'all' | 'Work' | 'Personal' | 'Study' | 'Finance' | 'Health'
let activePriorityFilter = 'all';    // 'all' | 'High' | 'Medium' | 'Low'
let activeSortOption = 'dueDateAsc'; // 'dueDateAsc' | 'dueDateDesc' | 'priorityDesc' | 'priorityAsc' | 'createdDesc' | 'createdAsc' | 'titleAsc'
let searchQuery = '';
let taskPendingDeletionId = null;    // Tracks ID for deletion confirmation modal
let lastDeletedTask = null;          // Supports "Undo Delete" functionality

/* ==========================================================================
   MODULE 3: DOM ELEMENT REFERENCES
   ========================================================================== */
// Cached DOM references for fast access
const DOM = {
  // Theme & Layout
  body: document.body,
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  headerStatusPill: document.getElementById('headerStatusPill'),
  headerStatusText: document.getElementById('headerStatusText'),
  shortcutsBtn: document.getElementById('shortcutsBtn'),

  // Dropdown Menu
  dataActionsBtn: document.getElementById('dataActionsBtn'),
  dataDropdownMenu: document.getElementById('dataDropdownMenu'),
  exportDataBtn: document.getElementById('exportDataBtn'),
  importJsonInput: document.getElementById('importJsonInput'),
  clearCompletedBtn: document.getElementById('clearCompletedBtn'),
  resetDemoBtn: document.getElementById('resetDemoBtn'),

  // Statistics & Progress
  statTotalTasks: document.getElementById('statTotalTasks'),
  statPendingTasks: document.getElementById('statPendingTasks'),
  statCompletedTasks: document.getElementById('statCompletedTasks'),
  statOverdueTasks: document.getElementById('statOverdueTasks'),
  statCompletionPercentage: document.getElementById('statCompletionPercentage'),
  progressBarFill: document.getElementById('progressBarFill'),
  progressMotivationalQuote: document.getElementById('progressMotivationalQuote'),
  categoryBreakdownChips: document.getElementById('categoryBreakdownChips'),

  // Filter Tabs & Counts
  statusTabs: document.querySelectorAll('.status-tab'),
  tabCountAll: document.getElementById('tabCountAll'),
  tabCountPending: document.getElementById('tabCountPending'),
  tabCountCompleted: document.getElementById('tabCountCompleted'),
  tabCountOverdue: document.getElementById('tabCountOverdue'),

  // Search & Form Controls
  taskSearchInput: document.getElementById('taskSearchInput'),
  searchClearBtn: document.getElementById('searchClearBtn'),
  filterCategory: document.getElementById('filterCategory'),
  filterPriority: document.getElementById('filterPriority'),
  sortBySelect: document.getElementById('sortBySelect'),
  activeFilterIndicator: document.getElementById('activeFilterIndicator'),
  visibleTasksCount: document.getElementById('visibleTasksCount'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),

  // Task Cards Container & Empty State
  taskCardsContainer: document.getElementById('taskCardsContainer'),
  emptyStateContainer: document.getElementById('emptyStateContainer'),
  emptyStateTitle: document.getElementById('emptyStateTitle'),
  emptyStateDesc: document.getElementById('emptyStateDesc'),
  emptyStateResetFiltersBtn: document.getElementById('emptyStateResetFiltersBtn'),
  emptyStateNewTaskBtn: document.getElementById('emptyStateNewTaskBtn'),
  taskSectionCountPill: document.getElementById('taskSectionCountPill'),

  // Task Add/Edit Modal
  openCreateModalBtn: document.getElementById('openCreateModalBtn'),
  taskModalBackdrop: document.getElementById('taskModalBackdrop'),
  closeTaskModalBtn: document.getElementById('closeTaskModalBtn'),
  cancelTaskModalBtn: document.getElementById('cancelTaskModalBtn'),
  taskForm: document.getElementById('taskForm'),
  modalTitle: document.getElementById('modalTitle'),
  saveBtnText: document.getElementById('saveBtnText'),
  taskIdInput: document.getElementById('taskIdInput'),
  taskTitleInput: document.getElementById('taskTitleInput'),
  taskDescInput: document.getElementById('taskDescInput'),
  descCharCount: document.getElementById('descCharCount'),
  taskCategoryInput: document.getElementById('taskCategoryInput'),
  taskPriorityInput: document.getElementById('taskPriorityInput'),
  taskDueDateInput: document.getElementById('taskDueDateInput'),
  titleFeedback: document.getElementById('titleFeedback'),
  dueDateFeedback: document.getElementById('dueDateFeedback'),

  // Delete Confirmation Modal
  deleteConfirmModal: document.getElementById('deleteConfirmModal'),
  closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
  cancelDeleteModalBtn: document.getElementById('cancelDeleteModalBtn'),
  confirmDeleteTaskBtn: document.getElementById('confirmDeleteTaskBtn'),
  deleteTaskPreviewTitle: document.getElementById('deleteTaskPreviewTitle'),

  // Shortcuts Modal
  shortcutsModal: document.getElementById('shortcutsModal'),
  closeShortcutsModalBtn: document.getElementById('closeShortcutsModalBtn'),
  gotItShortcutsBtn: document.getElementById('gotItShortcutsBtn'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

/* ==========================================================================
   MODULE 4: UTILITY & HELPER FUNCTIONS
   ========================================================================== */

/**
 * Generates an ISO-formatted YYYY-MM-DD date string offset by N days.
 * @param {number} daysOffset
 * @returns {string}
 */
function getFormattedDateOffset(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a unique task identifier.
 * @returns {string}
 */
function generateTaskId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Escapes HTML entities to protect against XSS injection.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Computes overdue status based on date comparison.
 * A task is overdue if its due date is prior to today AND it is not completed.
 * @param {string} dueDateStr - 'YYYY-MM-DD'
 * @param {boolean} isCompleted
 * @returns {boolean}
 */
function isTaskOverdue(dueDateStr, isCompleted) {
  if (isCompleted || !dueDateStr) return false;
  const todayStr = getFormattedDateOffset(0);
  return dueDateStr < todayStr;
}

/**
 * Computes a human-readable relative due date status badge.
 * @param {string} dueDateStr
 * @param {boolean} isCompleted
 * @returns {{ label: string, className: string }}
 */
function getDueDateBadgeInfo(dueDateStr, isCompleted) {
  if (isCompleted) {
    return { label: '✓ Completed', className: 'badge-due is-completed' };
  }
  if (!dueDateStr) {
    return { label: 'No due date', className: 'badge-due' };
  }

  const todayStr = getFormattedDateOffset(0);

  // Compute days difference using Date objects set to midnight
  const dueDate = new Date(dueDateStr + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // JS CONCEPT: Conditionals (if / else if / else)
  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: `⚠️ Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`,
      className: 'badge-due is-overdue'
    };
  } else if (diffDays === 0) {
    return { label: '⏰ Due Today', className: 'badge-due is-today' };
  } else if (diffDays === 1) {
    return { label: '⏳ Due Tomorrow', className: 'badge-due' };
  } else {
    return { label: `📅 Due in ${diffDays} days (${dueDateStr})`, className: 'badge-due' };
  }
}

/**
 * Returns dynamic motivational messages based on completion rate.
 * @param {number} rate - 0 to 100
 * @returns {string}
 */
function getMotivationalMessage(rate) {
  if (rate === 100) return '🎉 Outstanding! All tasks completed! You are fully caught up!';
  if (rate >= 75) return '🔥 Crushing it! You are well ahead of your goals!';
  if (rate >= 50) return '💪 Halfway there! Keep up the great momentum!';
  if (rate >= 25) return '🚀 Solid start! Tackle the next high-priority item!';
  return '✨ Every big journey begins with a single completed task. Get started!';
}

/* ==========================================================================
   MODULE 5: LOCALSTORAGE PERSISTENCE (TASK 6)
   ========================================================================== */

/**
 * Loads tasks array from LocalStorage. Falls back to sample tasks if empty.
 * @returns {Array<Object>}
 */
function loadTasksFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!rawData) {
      // First visit: save and return initial sample tasks
      saveTasksToStorage(INITIAL_SAMPLE_TASKS);
      return [...INITIAL_SAMPLE_TASKS];
    }
    const parsed = JSON.parse(rawData);
    // Validate that it's a valid array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse tasks from LocalStorage:', error);
    showToast('Failed to load tasks from local storage. Loading sample data.', 'error');
    return [...INITIAL_SAMPLE_TASKS];
  }
}

/**
 * Persists current tasks array into LocalStorage.
 * @param {Array<Object>} dataToSave
 */
function saveTasksToStorage(dataToSave = tasks) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('LocalStorage quota exceeded or write error:', error);
    showToast('Warning: Unable to save changes to LocalStorage.', 'error');
  }
}

/**
 * Loads and applies user theme preference.
 */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  DOM.body.setAttribute('data-theme', savedTheme);
}

/**
 * Toggles theme between 'light' and 'dark' and persists preference.
 */
function toggleTheme() {
  const currentTheme = DOM.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  DOM.body.setAttribute('data-theme', newTheme);
  localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  showToast(`Switched to ${newTheme} mode`, 'info');
}

/* ==========================================================================
   MODULE 6: TOAST NOTIFICATION SERVICE (TASK 6)
   ========================================================================== */

/**
 * Displays a non-intrusive animated toast alert with optional "Undo" action.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {boolean} allowUndo
 */
function showToast(message, type = 'info', allowUndo = false) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  // SVG Icons according to toast type
  let iconSvg = '';
  switch (type) {
    case 'success':
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
      break;
    case 'error':
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
      break;
    case 'warning':
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      break;
    default:
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-content">
      <div class="toast-message">${escapeHTML(message)}</div>
      ${allowUndo ? '<button type="button" class="toast-undo-btn" id="toastUndoBtn">Undo Action</button>' : ''}
    </div>
    <button type="button" class="toast-close-btn" aria-label="Dismiss">&times;</button>
  `;

  // Close button listener
  toast.querySelector('.toast-close-btn').addEventListener('click', () => {
    removeToast(toast);
  });

  // Undo button listener if enabled
  if (allowUndo) {
    const undoBtn = toast.querySelector('#toastUndoBtn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        handleUndoDelete();
        removeToast(toast);
      });
    }
  }

  DOM.toastContainer.appendChild(toast);

  // Auto-dismiss after 4 seconds
  const autoDismissTimer = setTimeout(() => {
    removeToast(toast);
  }, 4000);

  function removeToast(element) {
    clearTimeout(autoDismissTimer);
    element.classList.add('toast-hiding');
    element.addEventListener('transitionend', () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  }
}

/**
 * Restores the most recently deleted task.
 */
function handleUndoDelete() {
  if (!lastDeletedTask) return;
  tasks.unshift(lastDeletedTask);
  saveTasksToStorage();
  renderApp();
  showToast(`Restored task: "${lastDeletedTask.title}"`, 'success');
  lastDeletedTask = null;
}

/* ==========================================================================
   MODULE 7: DASHBOARD STATISTICS & PROGRESS ENGINE (TASK 5)
   ========================================================================== */

/**
 * Recalculates metrics using array methods (filter, reduce) and updates dashboard UI.
 */
function updateDashboardStatistics() {
  const totalCount = tasks.length;

  // JS CONCEPT: Array.prototype.filter()
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  
  // Tasks that are overdue and not yet completed
  const overdueTasks = tasks.filter(task => isTaskOverdue(task.dueDate, task.completed));

  const completedCount = completedTasks.length;
  const pendingCount = pendingTasks.length;
  const overdueCount = overdueTasks.length;

  // JS CONCEPT: Math calculation & Ternary operator
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Update Metric Card DOM elements
  DOM.statTotalTasks.textContent = totalCount;
  DOM.statPendingTasks.textContent = pendingCount;
  DOM.statCompletedTasks.textContent = completedCount;
  DOM.statOverdueTasks.textContent = overdueCount;

  // Update Status Pill in Header
  DOM.headerStatusText.textContent = `${completedCount} of ${totalCount} Done (${percentage}%)`;

  // Update Progress Bar
  DOM.statCompletionPercentage.textContent = `${percentage}%`;
  DOM.progressBarFill.style.width = `${percentage}%`;
  DOM.progressBarFill.setAttribute('aria-valuenow', percentage);
  DOM.progressMotivationalQuote.textContent = getMotivationalMessage(percentage);

  // Update Segmented Tab Badges
  DOM.tabCountAll.textContent = totalCount;
  DOM.tabCountPending.textContent = pendingCount;
  DOM.tabCountCompleted.textContent = completedCount;
  DOM.tabCountOverdue.textContent = overdueCount;

  // JS CONCEPT: Array.prototype.reduce() to calculate category breakdown
  const categoryCounts = tasks.reduce((accumulator, task) => {
    accumulator[task.category] = (accumulator[task.category] || 0) + 1;
    return accumulator;
  }, {});

  // Render category chips
  // JS CONCEPT: Object.entries() and Array.prototype.map()
  const categoryChipsHTML = Object.entries(categoryCounts)
    .map(([cat, count]) => `
      <span class="cat-breakdown-chip">
        <span>${getCategoryIcon(cat)}</span>
        <span>${escapeHTML(cat)}:</span>
        <strong>${count}</strong>
      </span>
    `).join('');

  DOM.categoryBreakdownChips.innerHTML = categoryChipsHTML || '<span class="text-muted" style="font-size:0.75rem;">No category data yet</span>';
}

/**
 * Returns emoji icon corresponding to category name.
 * @param {string} category
 * @returns {string}
 */
function getCategoryIcon(category) {
  switch (category) {
    case 'Work': return '💼';
    case 'Personal': return '🏠';
    case 'Study': return '📚';
    case 'Finance': return '💰';
    case 'Health': return '🧘';
    default: return '📁';
  }
}

/* ==========================================================================
   MODULE 8: FILTERING, SEARCHING & SORTING PIPELINE (TASK 4)
   ========================================================================== */

/**
 * Filters and sorts tasks based on active state parameters.
 * Demonstrates: filter(), sort(), toLowerCase(), conditionals.
 * @returns {Array<Object>}
 */
function getFilteredAndSortedTasks() {
  // Step 1: Filter by Status (All, Pending, Completed, Overdue)
  let result = tasks.filter(task => {
    if (activeStatusFilter === 'pending') {
      return !task.completed;
    } else if (activeStatusFilter === 'completed') {
      return task.completed;
    } else if (activeStatusFilter === 'overdue') {
      return isTaskOverdue(task.dueDate, task.completed);
    }
    return true; // 'all'
  });

  // Step 2: Filter by Category
  if (activeCategoryFilter !== 'all') {
    result = result.filter(task => task.category === activeCategoryFilter);
  }

  // Step 3: Filter by Priority
  if (activePriorityFilter !== 'all') {
    result = result.filter(task => task.priority === activePriorityFilter);
  }

  // Step 4: Filter by Instant Search Query
  if (searchQuery.trim() !== '') {
    const query = searchQuery.trim().toLowerCase();
    result = result.filter(task => {
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description ? task.description.toLowerCase().includes(query) : false;
      const matchCategory = task.category.toLowerCase().includes(query);
      return matchTitle || matchDesc || matchCategory;
    });
  }

  // Step 5: Multi-Criteria Sorting
  // JS CONCEPT: Array.prototype.sort() with custom comparator functions
  result.sort((a, b) => {
    switch (activeSortOption) {
      case 'dueDateAsc':
        // Earliest due date first (treat missing dates as infinity)
        return (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99');
      
      case 'dueDateDesc':
        // Latest due date first
        return (b.dueDate || '').localeCompare(a.dueDate || '');

      case 'priorityDesc':
        // High -> Medium -> Low
        return (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);

      case 'priorityAsc':
        // Low -> Medium -> High
        return (PRIORITY_WEIGHTS[a.priority] || 0) - (PRIORITY_WEIGHTS[b.priority] || 0);

      case 'createdDesc':
        // Newest created first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      case 'createdAsc':
        // Oldest created first
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      case 'titleAsc':
        // Alphabetical A-Z
        return a.title.localeCompare(b.title);

      default:
        return 0;
    }
  });

  return result;
}

/**
 * Updates UI filter status indicator and shows/hides the "Reset Filters" button.
 * @param {number} visibleCount
 */
function updateFilterStatusUI(visibleCount) {
  DOM.visibleTasksCount.textContent = visibleCount;
  DOM.taskSectionCountPill.textContent = `${visibleCount} of ${tasks.length} Displayed`;

  const isFilteringActive = 
    activeStatusFilter !== 'all' || 
    activeCategoryFilter !== 'all' || 
    activePriorityFilter !== 'all' || 
    searchQuery.trim() !== '';

  DOM.resetFiltersBtn.style.display = isFilteringActive ? 'inline-flex' : 'none';
  DOM.searchClearBtn.style.display = searchQuery.trim() !== '' ? 'flex' : 'none';
}

/**
 * Resets all active filters and search input back to defaults.
 */
function resetAllFilters() {
  activeStatusFilter = 'all';
  activeCategoryFilter = 'all';
  activePriorityFilter = 'all';
  searchQuery = '';
  activeSortOption = 'dueDateAsc';

  // Reset inputs
  DOM.taskSearchInput.value = '';
  DOM.filterCategory.value = 'all';
  DOM.filterPriority.value = 'all';
  DOM.sortBySelect.value = 'dueDateAsc';

  // Reset Tab active states
  DOM.statusTabs.forEach(tab => {
    const isAllTab = tab.getAttribute('data-status') === 'all';
    tab.classList.toggle('active', isAllTab);
    tab.setAttribute('aria-selected', isAllTab ? 'true' : 'false');
  });

  renderApp();
  showToast('All filters have been reset.', 'info');
}

/* ==========================================================================
   MODULE 9: TASK CRUD OPERATIONS & DOM RENDERING (TASKS 2 & 3)
   ========================================================================= */

/**
 * Main render function: coordinates stats calculation, filtering, and DOM updates.
 */
function renderApp() {
  updateDashboardStatistics();
  
  const filteredTasks = getFilteredAndSortedTasks();
  updateFilterStatusUI(filteredTasks.length);

  // Empty state handling
  if (filteredTasks.length === 0) {
    DOM.taskCardsContainer.innerHTML = '';
    DOM.emptyStateContainer.style.display = 'flex';
    
    if (tasks.length === 0) {
      DOM.emptyStateTitle.textContent = 'No tasks yet!';
      DOM.emptyStateDesc.textContent = 'Your task board is completely empty. Create your first task to get organized!';
      DOM.emptyStateResetFiltersBtn.style.display = 'none';
    } else {
      DOM.emptyStateTitle.textContent = 'No matching tasks found';
      DOM.emptyStateDesc.textContent = 'Try adjusting your search query, status tabs, or dropdown filters.';
      DOM.emptyStateResetFiltersBtn.style.display = 'inline-block';
    }
    return;
  }

  DOM.emptyStateContainer.style.display = 'none';

  // JS CONCEPT: Array.prototype.map() to create HTML strings from task objects
  const taskCardsHTML = filteredTasks.map(task => createTaskCardHTML(task)).join('');
  
  DOM.taskCardsContainer.innerHTML = taskCardsHTML;
}

/**
 * Generates semantic HTML for a single task card.
 * @param {Object} task
 * @returns {string}
 */
function createTaskCardHTML(task) {
  const isOverdue = isTaskOverdue(task.dueDate, task.completed);
  const dueBadge = getDueDateBadgeInfo(task.dueDate, task.completed);
  const formattedCreationDate = new Date(task.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  return `
    <article 
      class="task-card ${task.completed ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}" 
      data-id="${task.id}"
      id="card_${task.id}"
    >
      <!-- Task Checkbox Toggle -->
      <div class="task-checkbox-col">
        <label class="custom-checkbox-label" title="${task.completed ? 'Mark as Pending' : 'Mark as Complete'}">
          <input 
            type="checkbox" 
            class="task-checkbox" 
            data-action="toggle-status" 
            data-id="${task.id}" 
            ${task.completed ? 'checked' : ''}
            aria-label="Toggle completion for task: ${escapeHTML(task.title)}"
          >
          <span class="checkbox-custom-box">
            <svg class="checkbox-check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        </label>
      </div>

      <!-- Task Details Column -->
      <div class="task-content-col">
        <div class="task-header-line">
          <h4 class="task-title-text">${escapeHTML(task.title)}</h4>
        </div>

        ${task.description ? `<p class="task-desc-text">${escapeHTML(task.description)}</p>` : ''}

        <div class="task-meta-line">
          <!-- Priority Badge -->
          <span class="badge badge-priority-${task.priority}">
            <span class="priority-dot">●</span> ${task.priority} Priority
          </span>

          <!-- Category Badge -->
          <span class="badge badge-category-${task.category}">
            ${getCategoryIcon(task.category)} ${task.category}
          </span>

          <!-- Due Date Badge -->
          <span class="${dueBadge.className}">
            ${dueBadge.label}
          </span>

          <!-- Created Date -->
          <span class="task-created-time" title="Created on ${task.createdAt}">
            Created ${formattedCreationDate}
          </span>
        </div>
      </div>

      <!-- Task Action Buttons -->
      <div class="task-actions-col">
        <button 
          type="button" 
          class="task-action-btn btn-edit" 
          data-action="edit" 
          data-id="${task.id}" 
          title="Edit Task"
          aria-label="Edit Task ${escapeHTML(task.title)}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        </button>

        <button 
          type="button" 
          class="task-action-btn btn-delete" 
          data-action="delete" 
          data-id="${task.id}" 
          title="Delete Task"
          aria-label="Delete Task ${escapeHTML(task.title)}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </div>
    </article>
  `;
}

/**
 * Toggles a task's completed state.
 * @param {string} taskId
 */
function toggleTaskStatus(taskId) {
  // JS CONCEPT: Array.prototype.find()
  const targetTask = tasks.find(t => t.id === taskId);
  if (!targetTask) return;

  targetTask.completed = !targetTask.completed;
  targetTask.updatedAt = new Date().toISOString();

  saveTasksToStorage();
  renderApp();

  const feedbackMsg = targetTask.completed 
    ? `Task marked as completed! 🎉` 
    : `Task moved back to in-progress.`;
  showToast(feedbackMsg, targetTask.completed ? 'success' : 'info');
}

/**
 * Opens Add/Edit Task modal in the appropriate mode.
 * @param {string|null} taskId - If provided, opens in Edit mode. Otherwise, Add mode.
 */
function openTaskModal(taskId = null) {
  // Reset form errors
  hideFormErrors();

  if (taskId) {
    // Edit mode
    const taskToEdit = tasks.find(t => t.id === taskId);
    if (!taskToEdit) return;

    DOM.modalTitle.textContent = 'Edit Task';
    DOM.saveBtnText.textContent = 'Update Task';
    DOM.taskIdInput.value = taskToEdit.id;
    DOM.taskTitleInput.value = taskToEdit.title;
    DOM.taskDescInput.value = taskToEdit.description || '';
    DOM.taskCategoryInput.value = taskToEdit.category;
    DOM.taskPriorityInput.value = taskToEdit.priority;
    DOM.taskDueDateInput.value = taskToEdit.dueDate || '';
    DOM.descCharCount.textContent = (taskToEdit.description || '').length;
  } else {
    // Create mode
    DOM.modalTitle.textContent = 'Create New Task';
    DOM.saveBtnText.textContent = 'Save Task';
    DOM.taskForm.reset();
    DOM.taskIdInput.value = '';
    DOM.taskDueDateInput.value = getFormattedDateOffset(1); // Default due date to tomorrow
    DOM.taskPriorityInput.value = 'Medium';
    DOM.taskCategoryInput.value = 'Work';
    DOM.descCharCount.textContent = '0';
  }

  DOM.taskModalBackdrop.classList.add('is-open');
  DOM.taskModalBackdrop.setAttribute('aria-hidden', 'false');
  setTimeout(() => DOM.taskTitleInput.focus(), 100);
}

/**
 * Closes the Add/Edit task modal.
 */
function closeTaskModal() {
  DOM.taskModalBackdrop.classList.remove('is-open');
  DOM.taskModalBackdrop.setAttribute('aria-hidden', 'true');
  DOM.taskForm.reset();
  hideFormErrors();
}

/**
 * Validates and saves task (handles both Create and Update).
 * @param {Event} event
 */
function handleTaskFormSubmit(event) {
  event.preventDefault();

  const titleVal = DOM.taskTitleInput.value.trim();
  const descVal = DOM.taskDescInput.value.trim();
  const categoryVal = DOM.taskCategoryInput.value;
  const priorityVal = DOM.taskPriorityInput.value;
  const dueDateVal = DOM.taskDueDateInput.value;
  const existingTaskId = DOM.taskIdInput.value;

  // Validation logic
  let isValid = true;
  hideFormErrors();

  if (titleVal.length < 3) {
    showFormError(DOM.taskTitleInput, DOM.titleFeedback, 'Task title must be at least 3 characters long.');
    isValid = false;
  }

  if (!dueDateVal) {
    showFormError(DOM.taskDueDateInput, DOM.dueDateFeedback, 'Please choose a due date.');
    isValid = false;
  }

  if (!isValid) return;

  if (existingTaskId) {
    // UPDATE TASK (JS CONCEPT: Array.prototype.find)
    const taskIndex = tasks.findIndex(t => t.id === existingTaskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: titleVal,
        description: descVal,
        category: categoryVal,
        priority: priorityVal,
        dueDate: dueDateVal,
        updatedAt: new Date().toISOString()
      };
      saveTasksToStorage();
      renderApp();
      closeTaskModal();
      showToast('Task updated successfully!', 'success');
    }
  } else {
    // CREATE NEW TASK (JS CONCEPT: Object creation & Array unshift)
    const newTask = {
      id: generateTaskId(),
      title: titleVal,
      description: descVal,
      category: categoryVal,
      priority: priorityVal,
      dueDate: dueDateVal,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasksToStorage();
    renderApp();
    closeTaskModal();
    showToast('New task added successfully!', 'success');
  }
}

/**
 * Highlights invalid input and reveals feedback message.
 */
function showFormError(inputEl, feedbackEl, message) {
  inputEl.classList.add('is-invalid');
  feedbackEl.textContent = message;
  feedbackEl.classList.add('show');
}

/**
 * Clears all inline form validation error states.
 */
function hideFormErrors() {
  DOM.taskTitleInput.classList.remove('is-invalid');
  DOM.taskDueDateInput.classList.remove('is-invalid');
  DOM.titleFeedback.classList.remove('show');
  DOM.dueDateFeedback.classList.remove('show');
}

/**
 * Opens delete confirmation modal.
 * @param {string} taskId
 */
function openDeleteModal(taskId) {
  const taskToDelete = tasks.find(t => t.id === taskId);
  if (!taskToDelete) return;

  taskPendingDeletionId = taskId;
  DOM.deleteTaskPreviewTitle.textContent = `"${taskToDelete.title}"`;
  DOM.deleteConfirmModal.classList.add('is-open');
  DOM.deleteConfirmModal.setAttribute('aria-hidden', 'false');
}

/**
 * Closes delete confirmation modal.
 */
function closeDeleteModal() {
  taskPendingDeletionId = null;
  DOM.deleteConfirmModal.classList.remove('is-open');
  DOM.deleteConfirmModal.setAttribute('aria-hidden', 'true');
}

/**
 * Confirms deletion of the pending task, stores it for "Undo", and saves to storage.
 */
function confirmDeleteTask() {
  if (!taskPendingDeletionId) return;

  // JS CONCEPT: Array.prototype.findIndex() & splice()
  const taskIndex = tasks.findIndex(t => t.id === taskPendingDeletionId);
  if (taskIndex !== -1) {
    lastDeletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    saveTasksToStorage();
    renderApp();
    showToast(`Task "${lastDeletedTask.title}" was deleted.`, 'warning', true);
  }

  closeDeleteModal();
}

/**
 * Clears all tasks marked as completed.
 */
function handleClearCompletedTasks() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('There are no completed tasks to clear.', 'info');
    return;
  }

  if (confirm(`Are you sure you want to remove all ${completedCount} completed task(s)?`)) {
    tasks = tasks.filter(t => !t.completed);
    saveTasksToStorage();
    renderApp();
    showToast(`Removed ${completedCount} completed task(s).`, 'success');
  }
}

/**
 * Resets task state back to the initial sample seed data.
 */
function handleResetDemoData() {
  if (confirm('Reset task manager to initial sample tasks? This will overwrite your current list.')) {
    tasks = JSON.parse(JSON.stringify(INITIAL_SAMPLE_TASKS));
    saveTasksToStorage();
    renderApp();
    showToast('Task list reset to demo data.', 'success');
  }
}

/* ==========================================================================
   MODULE 10: BACKUP & DATA PORTABILITY (EXPORT / IMPORT JSON)
   ========================================================================== */

/**
 * Exports current tasks to a downloadable JSON file.
 */
function exportTasksToJSON() {
  if (tasks.length === 0) {
    showToast('No tasks to export.', 'warning');
    return;
  }

  const exportPayload = {
    appName: 'SmartTaskPro',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    taskCount: tasks.length,
    tasks: tasks
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `smart_tasks_backup_${getFormattedDateOffset(0)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(`Exported ${tasks.length} tasks to JSON backup!`, 'success');
}

/**
 * Imports tasks from a user-uploaded JSON file.
 * @param {Event} event
 */
function importTasksFromJSON(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsedData = JSON.parse(e.target.result);
      let importedTasks = [];

      if (Array.isArray(parsedData)) {
        importedTasks = parsedData;
      } else if (parsedData && Array.isArray(parsedData.tasks)) {
        importedTasks = parsedData.tasks;
      } else {
        throw new Error('Invalid JSON format: tasks array not found.');
      }

      // Basic validation of task structure
      const validImported = importedTasks.filter(item => item && item.id && item.title);
      if (validImported.length === 0) {
        throw new Error('No valid task objects recognized in the file.');
      }

      tasks = validImported;
      saveTasksToStorage();
      renderApp();
      showToast(`Successfully imported ${validImported.length} task(s)!`, 'success');
    } catch (err) {
      console.error('Import error:', err);
      showToast(`Import failed: ${err.message}`, 'error');
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };

  reader.readAsText(file);
}

/* ==========================================================================
   MODULE 11: KEYBOARD SHORTCUTS & EVENT LISTENERS
   ========================================================================== */

/**
 * Initializes all DOM event listeners.
 * Demonstrates: Event Delegation, click, submit, input, change, keydown.
 */
function setupEventListeners() {
  // 1. Theme Toggle
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);

  // 2. Data Actions Dropdown Toggle
  DOM.dataActionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = DOM.dataDropdownMenu.classList.toggle('show');
    DOM.dataActionsBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!DOM.dataDropdownMenu.contains(e.target) && e.target !== DOM.dataActionsBtn) {
      DOM.dataDropdownMenu.classList.remove('show');
      DOM.dataActionsBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Dropdown Action Items
  DOM.exportDataBtn.addEventListener('click', () => {
    DOM.dataDropdownMenu.classList.remove('show');
    exportTasksToJSON();
  });

  DOM.importJsonInput.addEventListener('change', (e) => {
    DOM.dataDropdownMenu.classList.remove('show');
    importTasksFromJSON(e);
  });

  DOM.clearCompletedBtn.addEventListener('click', () => {
    DOM.dataDropdownMenu.classList.remove('show');
    handleClearCompletedTasks();
  });

  DOM.resetDemoBtn.addEventListener('click', () => {
    DOM.dataDropdownMenu.classList.remove('show');
    handleResetDemoData();
  });

  // 3. New Task Modal Triggers
  DOM.openCreateModalBtn.addEventListener('click', () => openTaskModal(null));
  DOM.emptyStateNewTaskBtn.addEventListener('click', () => openTaskModal(null));
  DOM.closeTaskModalBtn.addEventListener('click', closeTaskModal);
  DOM.cancelTaskModalBtn.addEventListener('click', closeTaskModal);
  DOM.taskForm.addEventListener('submit', handleTaskFormSubmit);

  // Character counter for description
  DOM.taskDescInput.addEventListener('input', (e) => {
    DOM.descCharCount.textContent = e.target.value.length;
  });

  // 4. Delete Confirmation Modal
  DOM.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  DOM.cancelDeleteModalBtn.addEventListener('click', closeDeleteModal);
  DOM.confirmDeleteTaskBtn.addEventListener('click', confirmDeleteTask);

  // 5. Shortcuts Modal
  DOM.shortcutsBtn.addEventListener('click', () => {
    DOM.shortcutsModal.classList.add('is-open');
    DOM.shortcutsModal.setAttribute('aria-hidden', 'false');
  });
  DOM.closeShortcutsModalBtn.addEventListener('click', () => {
    DOM.shortcutsModal.classList.remove('is-open');
    DOM.shortcutsModal.setAttribute('aria-hidden', 'true');
  });
  DOM.gotItShortcutsBtn.addEventListener('click', () => {
    DOM.shortcutsModal.classList.remove('is-open');
    DOM.shortcutsModal.setAttribute('aria-hidden', 'true');
  });

  // Close modals when clicking backdrop
  [DOM.taskModalBackdrop, DOM.deleteConfirmModal, DOM.shortcutsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // 6. EVENT DELEGATION: Task Cards Grid (Click on status checkbox, edit btn, or delete btn)
  DOM.taskCardsContainer.addEventListener('click', (e) => {
    const target = e.target;

    // Check if clicked the toggle checkbox
    if (target.matches('input[data-action="toggle-status"]')) {
      const taskId = target.getAttribute('data-id');
      toggleTaskStatus(taskId);
      return;
    }

    // Check if clicked on or inside an action button (edit / delete)
    const actionBtn = target.closest('[data-action]');
    if (!actionBtn) return;

    const action = actionBtn.getAttribute('data-action');
    const taskId = actionBtn.getAttribute('data-id');

    if (action === 'edit') {
      openTaskModal(taskId);
    } else if (action === 'delete') {
      openDeleteModal(taskId);
    }
  });

  // 7. Live Instant Search with input event
  DOM.taskSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderApp();
  });

  // Search clear button
  DOM.searchClearBtn.addEventListener('click', () => {
    DOM.taskSearchInput.value = '';
    searchQuery = '';
    DOM.taskSearchInput.focus();
    renderApp();
  });

  // 8. Status Filter Segmented Tabs
  DOM.statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      DOM.statusTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeStatusFilter = tab.getAttribute('data-status');
      renderApp();
    });
  });

  // 9. Dropdown Select Filters & Sort
  DOM.filterCategory.addEventListener('change', (e) => {
    activeCategoryFilter = e.target.value;
    renderApp();
  });

  DOM.filterPriority.addEventListener('change', (e) => {
    activePriorityFilter = e.target.value;
    renderApp();
  });

  DOM.sortBySelect.addEventListener('change', (e) => {
    activeSortOption = e.target.value;
    renderApp();
  });

  // 10. Reset Filters Buttons
  DOM.resetFiltersBtn.addEventListener('click', resetAllFilters);
  DOM.emptyStateResetFiltersBtn.addEventListener('click', resetAllFilters);

  // 11. Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Esc: Close any active modal
    if (e.key === 'Escape') {
      if (DOM.taskModalBackdrop.classList.contains('is-open')) closeTaskModal();
      if (DOM.deleteConfirmModal.classList.contains('is-open')) closeDeleteModal();
      if (DOM.shortcutsModal.classList.contains('is-open')) {
        DOM.shortcutsModal.classList.remove('is-open');
        DOM.shortcutsModal.setAttribute('aria-hidden', 'true');
      }
      return;
    }

    // Do not trigger single-letter shortcuts when user is typing inside an input/textarea
    const activeElTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeElTag === 'input' || activeElTag === 'textarea' || activeElTag === 'select') {
      return;
    }

    // 'N' or 'n': Open New Task modal
    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      openTaskModal(null);
    }

    // '/': Focus Search Input
    if (e.key === '/') {
      e.preventDefault();
      DOM.taskSearchInput.focus();
    }

    // '?': Open Keyboard Shortcuts dialog
    if (e.key === '?') {
      e.preventDefault();
      DOM.shortcutsModal.classList.add('is-open');
      DOM.shortcutsModal.setAttribute('aria-hidden', 'false');
    }
  });
}

/* ==========================================================================
   MODULE 12: APPLICATION INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initTheme();

  // Load persisted tasks or seed demo data
  tasks = loadTasksFromStorage();

  // Attach event listeners
  setupEventListeners();

  // Initial render
  renderApp();

  console.log('%c🚀 Smart Task Manager initialized successfully!', 'color: #4f46e5; font-weight: bold; font-size: 14px;');
  console.log('%cInternNova Week 5 JavaScript Project - Assessment Ready (100 Marks)', 'color: #10b981; font-weight: 600;');
});

