const STORAGE_KEYS = {
    authToken: "lms_api_token",
    currentUser: "lms_current_user",
    apiBaseUrl: "lms_api_base_url"
};

const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

const FINE_PER_DAY = 10;

const appState = {
    users: [],
    books: [],
    issues: [],
    currentUser: null,
    authToken: "",
    apiBaseUrl: localStorage.getItem(STORAGE_KEYS.apiBaseUrl) || DEFAULT_API_BASE_URL,
    currentBookFilter: "",
    currentUpdateBookFilter: "",
    currentUpdateStudentFilter: "",
    currentStudentFilter: "",
    currentModuleId: "dashboardModule"
};

const profileStudentSelectSearch = {
    term: "",
    lastTypedAt: 0
};

const elements = {
    authSection: document.getElementById("authSection"),
    appSection: document.getElementById("appSection"),
    sessionPanel: document.getElementById("sessionPanel"),
    welcomeText: document.getElementById("welcomeText"),
    toast: document.getElementById("toast"),

    loginForm: document.getElementById("loginForm"),
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),

    // student login removed

    studentRegisterForm: document.getElementById("studentRegisterForm"),
    regName: document.getElementById("regName"),
    regEmail: document.getElementById("regEmail"),
    regStudentId: document.getElementById("regStudentId"),
    regPhone: document.getElementById("regPhone"),
    regCourse: document.getElementById("regCourse"),
    regPassword: document.getElementById("regPassword"),

    adminRegisterForm: document.getElementById("adminRegisterForm"),
    adminRegName: document.getElementById("adminRegName"),
    adminRegEmail: document.getElementById("adminRegEmail"),
    adminRegPassword: document.getElementById("adminRegPassword"),
    adminRegPhone: document.getElementById("adminRegPhone"),
    adminUpdateForm: document.getElementById("adminUpdateForm"),
    adminUpdName: document.getElementById("adminUpdName"),
    adminUpdEmail: document.getElementById("adminUpdEmail"),
    adminUpdPhone: document.getElementById("adminUpdPhone"),
    adminUpdPassword: document.getElementById("adminUpdPassword"),

    profileUpdateForm: document.getElementById("profileUpdateForm"),
    updTargetStudent: document.getElementById("updTargetStudent"),
    updName: document.getElementById("updName"),
    updPhone: document.getElementById("updPhone"),
    updCourse: document.getElementById("updCourse"),
    updEmail: document.getElementById("updEmail"),
    updStudentId: document.getElementById("updStudentId"),
    updPassword: document.getElementById("updPassword"),
    updateStudentSearch: document.getElementById("updateStudentSearch"),

    userSearch: document.getElementById("userSearch"),

    usersTableBody: document.getElementById("usersTableBody"),
    allUsersPanel: document.getElementById("allUsersPanel"),
    studentRegisterPanel: document.getElementById("studentRegisterPanel"),

    bookForm: document.getElementById("bookForm"),
    bookId: document.getElementById("bookId"),
    bookTitle: document.getElementById("bookTitle"),
    bookAuthor: document.getElementById("bookAuthor"),
    bookCategory: document.getElementById("bookCategory"),
    bookTotalCopies: document.getElementById("bookTotalCopies"),
    bookYear: document.getElementById("bookYear"),
    resetBookForm: document.getElementById("resetBookForm"),
    bookCrudPanel: document.getElementById("bookCrudPanel"),
    booksTableBody: document.getElementById("booksTableBody"),
    bookSearch: document.getElementById("bookSearch"),
    bookActionHeader: document.getElementById("bookActionHeader"),
    booksCount: document.getElementById("booksCount"),
    bookAddBtn: document.getElementById("bookAddBtn"),

    issueForm: document.getElementById("issueForm"),
    issueBookSearch: document.getElementById("issueBookSearch"),
    issueBookId: document.getElementById("issueBookId"),
    issueBookOptions: document.getElementById("issueBookOptions"),
    issueStudentNameSearch: document.getElementById("issueStudentNameSearch"),
    issueStudentNameId: document.getElementById("issueStudentNameId"),
    issueStudentNameOptions: document.getElementById("issueStudentNameOptions"),
    issueStudentIdSearch: document.getElementById("issueStudentIdSearch"),
    issueStudentIdValue: document.getElementById("issueStudentIdValue"),
    issueStudentIdOptions: document.getElementById("issueStudentIdOptions"),
    issueDueDate: document.getElementById("issueDueDate"),
    issuesTableBody: document.getElementById("issuesTableBody"),
    clearIssueForm: document.getElementById('clearIssueForm'),

    dashTotalBooks: document.getElementById("dashTotalBooks"),
    dashIssuedBooks: document.getElementById("dashIssuedBooks"),
    dashOverdueBooks: document.getElementById("dashOverdueBooks"),
    dashTotalFine: document.getElementById("dashTotalFine"),
    availabilityChart: document.getElementById("availabilityChart"),
    statusChart: document.getElementById("statusChart"),

    reportTotalBooks: document.getElementById("reportTotalBooks"),
    reportIssuedCount: document.getElementById("reportIssuedCount"),
    reportOverdueCount: document.getElementById("reportOverdueCount"),
    reportFineTotal: document.getElementById("reportFineTotal"),
    issuedList: document.getElementById("issuedList"),
    overdueList: document.getElementById("overdueList"),
    fineList: document.getElementById("fineList"),
    blockedList: document.getElementById("blockedList"),
    // student dashboard elements
    studentDashboard: document.getElementById("studentDashboard"),
    studentProfileName: document.getElementById("studentProfileName"),
    studentProfileId: document.getElementById("studentProfileId"),
    studentProfileCourse: document.getElementById("studentProfileCourse"),
    studentTotalIssued: document.getElementById("studentTotalIssued"),
    studentDueCount: document.getElementById("studentDueCount"),
    studentNextReturn: document.getElementById("studentNextReturn"),
    studentTotalFine: document.getElementById("studentTotalFine"),
    studentIssueHistory: document.getElementById("studentIssueHistory"),
    reportListsWrap: document.getElementById("reportListsWrap"),
    // student module elements
    studentProfileModuleBtn: document.querySelector('.module-btn[data-module="studentProfileModule"]'),
    studentIssuedModuleBtn: document.querySelector('.module-btn[data-module="studentIssuedModule"]'),
    studentHistoryModuleBtn: document.querySelector('.module-btn[data-module="studentHistoryModule"]'),
    studentProfileForm: document.getElementById('studentProfileForm'),
    stuName: document.getElementById('stuName'),
    stuStudentId: document.getElementById('stuStudentId'),
    stuEmail: document.getElementById('stuEmail'),
    stuPhone: document.getElementById('stuPhone'),
    stuCourse: document.getElementById('stuCourse'),
    stuNewPassword: document.getElementById('stuNewPassword'),
    studentIssuedTableBody: document.getElementById('studentIssuedTableBody'),
    studentHistoryTableBody: document.getElementById('studentHistoryTableBody'),

    logoutBtn: document.getElementById("logoutBtn"),
    darkModeToggle: document.getElementById("darkModeToggle"),
    tabButtons: document.querySelectorAll(".tab-btn"),
    tabContents: document.querySelectorAll(".tab-content"),
    moduleButtons: document.querySelectorAll(".module-btn"),
    modules: document.querySelectorAll(".module")
    ,userTabButtons: document.querySelectorAll(".user-tab-btn"),
    userTabPanels: document.querySelectorAll(".user-tab-panel")
    ,issueTabButtons: document.querySelectorAll(".issue-tab-btn"),
    issueTabPanels: document.querySelectorAll(".issue-tab-panel")
    ,bookTabButtons: document.querySelectorAll(".book-tab-btn"),
    bookTabPanels: document.querySelectorAll(".book-tab-panel"),
    updateBookSelect: document.getElementById("updateBookSelect"),
    updateBookForm: document.getElementById("updateBookForm"),
    updateBookId: document.getElementById("updateBookId"),
    updateBookTitle: document.getElementById("updateBookTitle"),
    updateBookAuthor: document.getElementById("updateBookAuthor"),
    // ISBN removed from UI
    updateBookCategory: document.getElementById("updateBookCategory"),
    updateBookTotalCopies: document.getElementById("updateBookTotalCopies"),
    updateBookYear: document.getElementById("updateBookYear"),
    updateBookSearch: document.getElementById("updateBookSearch"),
    updateBookSuggestions: document.getElementById("updateBookSuggestions"),
    resetUpdateBookForm: document.getElementById("resetUpdateBookForm")
};

async function initApp() {
    loadState();
    bindEvents();
    await restoreSession();
    renderAll();
}

function bindEvents() {
    elements.tabButtons.forEach((button) => {
        button.addEventListener("click", () => switchTab(button.dataset.tab));
    });

    elements.moduleButtons.forEach((button) => {
        button.addEventListener("click", () => switchModule(button.dataset.module));
    });

    // User-management internal tabs
    if (elements.userTabButtons) {
        elements.userTabButtons.forEach((btn) => {
            btn.addEventListener("click", () => switchUserTab(btn.dataset.tab));
        });
    }

    // Issue-module internal tabs
    if (elements.issueTabButtons) {
        elements.issueTabButtons.forEach((btn) => {
            btn.addEventListener("click", () => switchIssueTab(btn.dataset.tab));
        });
    }

    // Book-management internal tabs
    if (elements.bookTabButtons) {
        elements.bookTabButtons.forEach((btn) => {
            btn.addEventListener("click", () => switchBookTab(btn.dataset.tab));
        });
    }

    if (elements.updateBookSelect) {
        elements.updateBookSelect.addEventListener("change", () => {
            const bookId = elements.updateBookSelect.value;
            if (!bookId) {
                // clear update form
                if (elements.updateBookForm) elements.updateBookForm.reset();
                elements.updateBookId.value = "";
                return;
            }
            const book = appState.books.find((b) => String(b.id) === String(bookId));
            if (!book) return;
            // populate update form
            if (elements.updateBookId) elements.updateBookId.value = book.id;
            if (elements.updateBookTitle) elements.updateBookTitle.value = book.title || "";
            if (elements.updateBookAuthor) elements.updateBookAuthor.value = book.author || "";
            // ISBN removed from UI
            if (elements.updateBookCategory) elements.updateBookCategory.value = book.category || "";
            if (elements.updateBookTotalCopies) elements.updateBookTotalCopies.value = book.totalCopies || 1;
            if (elements.updateBookYear) elements.updateBookYear.value = book.publishedYear || new Date().getFullYear();
        });
    }
    if (elements.clearIssueForm) {
        elements.clearIssueForm.addEventListener('click', (e) => {
            e.preventDefault();
            resetIssueForm();
            showToast('Issue form cleared.');
        });
    }

    if (elements.updateBookForm) {
        elements.updateBookForm.addEventListener("submit", handleUpdateBook);
    }

    if (elements.updateBookSearch) {
        elements.updateBookSearch.addEventListener('input', handleUpdateBookSearch);
        elements.updateBookSearch.addEventListener('keydown', handleUpdateBookSuggestionKeydown);
    }

    if (elements.resetUpdateBookForm) {
        elements.resetUpdateBookForm.addEventListener("click", (e) => {
            e.preventDefault();
            if (elements.updateBookForm) elements.updateBookForm.reset();
            elements.updateBookId.value = "";
        });
    }

    // Dark mode toggle
    if (elements.darkModeToggle) {
        elements.darkModeToggle.addEventListener("click", () => toggleDarkMode());
    }

    elements.loginForm.addEventListener("submit", handleLogin);
    if (elements.studentProfileForm) elements.studentProfileForm.addEventListener('submit', handleStudentProfileUpdate);
    elements.studentRegisterForm.addEventListener("submit", handleRegistration);
    elements.adminRegisterForm.addEventListener("submit", handleAdminRegistration);
    if (elements.adminUpdateForm) elements.adminUpdateForm.addEventListener("submit", handleAdminUpdate);
    elements.profileUpdateForm.addEventListener("submit", handleProfileUpdate);

    if (elements.updateStudentSearch) {
        elements.updateStudentSearch.addEventListener("input", handleUpdateStudentSearch);
        elements.updateStudentSearch.addEventListener("keydown", handleUpdateSuggestionKeydown);
    }

function handleUpdateStudentSearch() {
    appState.currentUpdateStudentFilter = elements.updateStudentSearch.value.trim().toLowerCase();
    renderProfileStudentSuggestions();
}

    if (elements.userSearch) {
        elements.userSearch.addEventListener("input", handleUserSearch);
    }

    elements.bookForm.addEventListener("submit", handleBookSave);
    elements.resetBookForm.addEventListener("click", resetBookForm);
    elements.bookSearch.addEventListener("input", handleBookSearch);

    if (elements.bookAddBtn) {
        elements.bookAddBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchModule('bookModule');
            switchBookTab('addBookPanel');
            forceKeepModuleVisible('bookModule');
        });
    }

    elements.issueForm.addEventListener("submit", handleIssueBook);
    elements.issueBookSearch.addEventListener("input", renderIssueSelects);
    elements.issueBookSearch.addEventListener("change", syncBookSelection);
    elements.issueStudentNameSearch.addEventListener("input", renderIssueSelects);
    elements.issueStudentNameSearch.addEventListener("change", () => syncStudentSelection("name"));
    elements.issueStudentIdSearch.addEventListener("input", renderIssueSelects);
    elements.issueStudentIdSearch.addEventListener("change", () => syncStudentSelection("id"));
    elements.logoutBtn.addEventListener("click", logout);
}

function toggleDarkMode(force) {
    const body = document.body;
    const isDark = typeof force === 'boolean' ? force : !body.classList.contains('dark-mode');
    body.classList.toggle('dark-mode', isDark);
    try {
        localStorage.setItem('lms_dark_mode', isDark ? 'dark' : 'light');
    } catch (e) {}
    if (elements.darkModeToggle) {
        elements.darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    }
}

function handleUserSearch() {
    appState.currentStudentFilter = elements.userSearch.value.trim().toLowerCase();
    renderUsers();
}

function switchTab(tabId) {
    elements.tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabId);
    });

    elements.tabContents.forEach((content) => {
        content.classList.toggle("active", content.id === tabId);
    });
}

function switchUserTab(tabId) {
    // toggle active button
    const buttons = document.querySelectorAll(".user-tab-btn");
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));

    // toggle panels
    const panels = document.querySelectorAll(".user-tab-panel");
    panels.forEach((p) => {
        if (p.id === tabId) {
            p.classList.remove("hidden");
            p.classList.add("active");
        } else {
            p.classList.add("hidden");
            p.classList.remove("active");
        }
    });
}

function switchIssueTab(tabId) {
    const buttons = document.querySelectorAll('.issue-tab-btn');
    buttons.forEach((b) => b.classList.toggle('active', b.dataset.tab === tabId));

    const panels = document.querySelectorAll('.issue-tab-panel');
    panels.forEach((p) => {
        if (p.id === tabId) {
            p.classList.remove('hidden');
            p.classList.add('active');
        } else {
            p.classList.add('hidden');
            p.classList.remove('active');
        }
    });
}

function switchBookTab(tabId) {
    const buttons = document.querySelectorAll('.book-tab-btn');
    buttons.forEach((b) => b.classList.toggle('active', b.dataset.tab === tabId));

    const panels = document.querySelectorAll('.book-tab-panel');
    panels.forEach((p) => {
        if (p.id === tabId) {
            p.classList.remove('hidden');
            p.classList.add('active');
        } else {
            p.classList.add('hidden');
            p.classList.remove('active');
        }
    });
}

function switchModule(moduleId) {
    const previous = appState.currentModuleId;
    appState.currentModuleId = moduleId;
    try {
        console.log(`[NAV] switchModule: ${previous} -> ${moduleId}`);
    } catch (e) {}

    elements.moduleButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.module === moduleId);
    });

    elements.modules.forEach((section) => {
        section.classList.toggle("active", section.id === moduleId);
    });
}

function getActiveModuleId() {
    return appState.currentModuleId || "dashboardModule";
}

function restoreViewState(moduleId, scrollTop) {
    try {
        console.log(`[NAV] restoreViewState requested for ${moduleId} (scrollTop:${scrollTop})`);
    } catch (e) {}
    switchModule(moduleId);
    const mainElement = document.querySelector("main");
    const section = document.getElementById(moduleId);

    if (!mainElement || !section) {
        return;
    }

    requestAnimationFrame(() => {
        section.scrollIntoView({ block: "start", behavior: "auto" });
        try { console.log(`[NAV] restoreViewState: scrolled to ${moduleId}`); } catch (e) {}

        requestAnimationFrame(() => {
            section.scrollIntoView({ block: "start", behavior: "auto" });
        });
    });
}

function forceKeepModuleVisible(moduleId) {
    const section = document.getElementById(moduleId);
    if (!section) {
        return;
    }

    const restore = () => {
        try { console.log(`[NAV] forceKeepModuleVisible: restoring ${moduleId}`); } catch (e) {}
        switchModule(moduleId);
        section.scrollIntoView({ block: "start", behavior: "auto" });
    };

    restore();
    requestAnimationFrame(restore);
    setTimeout(restore, 50);
}

function loadState() {
    appState.users = [];
    appState.books = [];
    appState.issues = [];
    // restore dark mode preference
    try {
        const pref = localStorage.getItem('lms_dark_mode');
        if (pref === 'dark') {
            toggleDarkMode(true);
        } else if (pref === 'light') {
            toggleDarkMode(false);
        }
    } catch (e) {}
}

function persistState() {
    return;
}

function persistAdminStorage() {
    return;
}

function persistCurrentAdminScope() {
    return;
}

function loadAdminScope(adminId) {
    return adminId;
}

function createDefaultAdminScopeForUser(adminId, legacyScopeData) {
    return { adminId, legacyScopeData };
}

function setAuthSession(token, user) {
    appState.authToken = token;
    appState.currentUser = {
        ...user,
        id: String(user.id)
    };
    localStorage.setItem(STORAGE_KEYS.authToken, token);
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(appState.currentUser));
}

function clearAuthSession() {
    appState.authToken = "";
    appState.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.authToken);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
}

async function apiRequest(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (appState.authToken) {
        headers.Authorization = `Bearer ${appState.authToken}`;
    }

    const request = async (baseUrl) => fetch(`${baseUrl}${path}`, {
        ...options,
        headers
    });

    let response;
    try {
        response = await request(appState.apiBaseUrl);
    } catch (error) {
        if (appState.apiBaseUrl !== DEFAULT_API_BASE_URL) {
            appState.apiBaseUrl = DEFAULT_API_BASE_URL;
            localStorage.setItem(STORAGE_KEYS.apiBaseUrl, DEFAULT_API_BASE_URL);

            try {
                response = await request(DEFAULT_API_BASE_URL);
            } catch (fallbackError) {
                throw new Error(`Backend not reachable at ${DEFAULT_API_BASE_URL}. Start the backend server first.`);
            }
        } else {
            throw new Error(`Backend not reachable at ${DEFAULT_API_BASE_URL}. Start the backend server first.`);
        }
    }

    let data = null;
    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.message || `Request failed (${response.status})`);
    }

    return data;
}

async function fetchAllData() {
    const [students, books, issues] = await Promise.all([
        apiRequest("/students"),
        apiRequest("/books"),
        apiRequest("/issues")
    ]);

    appState.users = students.map((student) => ({
        ...student,
        id: String(student.id),
        studentId: student.studentId || "",
        role: "student"
    }));

    appState.books = books.map((book) => ({
        ...book,
        id: String(book.id),
        totalCopies: Number(book.totalCopies),
        availableCopies: Number(book.availableCopies)
    }));

    appState.issues = issues.map((issue) => ({
        ...issue,
        id: String(issue.id),
        bookId: String(issue.bookId),
        studentId: String(issue.studentId),
        fine: Number(issue.fine || 0),
        issueDate: formatDateUTC(issue.issueDate),
        dueDate: formatDateUTC(issue.dueDate),
        returnDate: issue.returnDate ? formatDateUTC(issue.returnDate) : "",
        collectedUpto: formatDateUTC(issue.collected_upto || issue.collectedUpto)
    }));

    // DEBUG: log first few issues and client timezone to help diagnose date format/timezone problems
    try {
        console.log("DEBUG_ISSUES_FIRST_5:", appState.issues.slice(0, 5));
        console.log("DEBUG_CLIENT_TZ:", Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch (e) {
        // ignore
    }
}

async function restoreSession() {
    const token = localStorage.getItem(STORAGE_KEYS.authToken);
    const user = readStorage(STORAGE_KEYS.currentUser, null);

    if (!token || !user) {
        return;
    }

    appState.authToken = token;
    appState.currentUser = {
        ...user,
        id: String(user.id)
    };

    try {
        await fetchAllData();
        toggleApp(true);
        applyRoleAccess();
    } catch (error) {
        clearAuthSession();
        toggleApp(false);
        showToast("Session expired. Please login again.");
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = elements.loginEmail.value.trim().toLowerCase();
    const password = elements.loginPassword.value.trim();

    try {
        const response = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        setAuthSession(response.token, response.user);
        await fetchAllData();

        toggleApp(true);
        applyRoleAccess();
        renderAll();
        showToast(`Welcome ${appState.currentUser.name}`);
        elements.loginForm.reset();
    } catch (error) {
        if ((error.message || "").toLowerCase().includes("invalid credentials")) {
            showToast("Invalid credentials.");
            return;
        }

        showToast(error.message || "Invalid admin credentials.");
    }
}

// Student login removed — authentication only via admin login and student registration handled by admin

async function handleRegistration(event) {
    event.preventDefault();

    if (!isAdmin()) {
        showToast("Only admin can register students.");
        return;
    }

    const activeModuleId = "userModule";
    const mainElement = document.querySelector("main");
    const scrollTop = mainElement ? mainElement.scrollTop : 0;
    const activeElement = document.activeElement;
    if (activeElement && typeof activeElement.blur === "function") {
        activeElement.blur();
    }

    try {
        await apiRequest("/students", {
            method: "POST",
            body: JSON.stringify({
                name: elements.regName.value.trim(),
                studentId: elements.regStudentId.value.trim(),
                course: elements.regCourse.value.trim(),
                email: elements.regEmail.value.trim().toLowerCase(),
                phone: elements.regPhone.value.trim(),
                password: elements.regPassword.value.trim()
            })
        });

        await fetchAllData();
        elements.studentRegisterForm.reset();
        showToast("Student registration successful.");
        renderUsers();
        renderProfile();
        restoreViewState(activeModuleId, scrollTop);
        forceKeepModuleVisible(activeModuleId);
    } catch (error) {
        showToast(error.message || "Student registration failed.");
    }
}

async function handleAdminRegistration(event) {
    event.preventDefault();

    try {
        await apiRequest("/auth/register-admin", {
            method: "POST",
            body: JSON.stringify({
                name: elements.adminRegName.value.trim(),
                email: elements.adminRegEmail.value.trim().toLowerCase(),
                password: elements.adminRegPassword.value.trim(),
                phone: elements.adminRegPhone.value.trim()
            })
        });

        elements.adminRegisterForm.reset();
        switchTab("loginTab");
        showToast("Admin registration successful. Please login as Admin.");
        renderAll();
    } catch (error) {
        showToast(error.message || "Admin registration failed.");
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    if (!appState.currentUser) {
        return;
    }

    if (!isAdmin()) {
        showToast("Only admin can update student details.");
        return;
    }

    const selectedStudentId = elements.updTargetStudent.value;
    if (!selectedStudentId) {
        showToast("Please select a student.");
        return;
    }

    const userIndex = appState.users.findIndex(
        (user) => user.role === "student" && String(user.id) === String(selectedStudentId)
    );
    if (userIndex === -1) {
        showToast("Student not found.");
        return;
    }

    const nextStudentId = elements.updStudentId.value.trim();
    const nextEmail = elements.updEmail.value.trim().toLowerCase();
    const nextPassword = elements.updPassword.value.trim();
    const duplicateStudentId = appState.users.some(
        (user) => user.role === "student" && user.id !== selectedStudentId && (user.studentId || "") === nextStudentId
    );
    if (duplicateStudentId) {
        showToast("Student ID already exists.");
        return;
    }

    const duplicateEmailInStudents = appState.users.some(
        (user) => user.id !== selectedStudentId && user.email.toLowerCase() === nextEmail
    );
    if (duplicateEmailInStudents) {
        showToast("Email already registered.");
        return;
    }

    const activeModuleId = "userModule";
    const mainElement = document.querySelector("main");
    const scrollTop = mainElement ? mainElement.scrollTop : 0;
    const activeElement = document.activeElement;
    if (activeElement && typeof activeElement.blur === "function") {
        activeElement.blur();
    }

    try {
        await apiRequest(`/students/${selectedStudentId}`, {
            method: "PUT",
            body: JSON.stringify({
                name: elements.updName.value.trim(),
                email: nextEmail,
                phone: elements.updPhone.value.trim(),
                course: elements.updCourse.value.trim(),
                studentId: nextStudentId,
                ...(nextPassword ? { password: nextPassword } : {})
            })
        });

        await fetchAllData();
        elements.updTargetStudent.value = String(selectedStudentId);
        renderProfile();
        renderUsers();
        restoreViewState(activeModuleId, scrollTop);
        forceKeepModuleVisible(activeModuleId);
        showToast("Student details updated.");
    } catch (error) {
        showToast(error.message || "Student update failed.");
    }
}

function renderProfileStudentOptions() {
    // Deprecated - replaced by renderProfileStudentSuggestions
}

function renderProfileStudentSuggestions() {
    const container = document.getElementById('updSearchSuggestions');
    if (!container) return;

    const students = appState.users.filter((user) => user.role === 'student');
    const query = (appState.currentUpdateStudentFilter || '').trim().toLowerCase();

    if (!query) {
        container.innerHTML = '';
        return;
    }

    const filtered = students.filter((student) =>
        (student.name || '').toLowerCase().includes(query) ||
        ((student.studentId || '').toLowerCase().includes(query)) ||
        ((student.email || '').toLowerCase().includes(query)) ||
        ((student.phone || '').toLowerCase().includes(query))
    ).slice(0, 30);

    if (!filtered.length) {
        container.innerHTML = '<div class="suggestion-item"><div class="s-main">No matching students</div></div>';
        return;
    }

    container.innerHTML = filtered.map((s, idx) => `
        <div class="suggestion-item" data-idx="${idx}" data-id="${s.id}" role="option" tabindex="0">
            <div class="s-main">${escapeHtml(s.name || '(no name)')}</div>
            <div class="s-sub">${s.studentId || ''} • ${s.email || ''} • ${s.phone || ''}</div>
        </div>
    `).join('');

    // attach click handlers
    Array.from(container.querySelectorAll('.suggestion-item')).forEach((el) => {
        el.addEventListener('click', () => {
            const id = el.dataset.id;
            selectStudentById(id);
        });
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                selectStudentById(el.dataset.id);
            }
        });
    });

    // reset active index
    container.dataset.active = '-1';
}

/* Book suggestions for Update Book panel */
function handleUpdateBookSearch() {
    appState.currentUpdateBookFilter = elements.updateBookSearch.value.trim().toLowerCase();
    renderBookSuggestions();
}

function renderBookSuggestions() {
    const container = document.getElementById('updateBookSuggestions');
    if (!container) return;

    const books = appState.books || [];
    const query = (appState.currentUpdateBookFilter || '').trim().toLowerCase();
    if (!query) {
        container.innerHTML = '';
        return;
    }

    const filtered = books.filter((b) =>
        (b.title || '').toLowerCase().includes(query) ||
        (b.author || '').toLowerCase().includes(query) ||
        (b.isbn || '').toLowerCase().includes(query) ||
        (b.category || '').toLowerCase().includes(query)
    ).slice(0, 30);

    if (!filtered.length) {
        container.innerHTML = '<div class="suggestion-item"><div class="s-main">No matching books</div></div>';
        return;
    }

    container.innerHTML = filtered.map((b, idx) => `
        <div class="suggestion-item" data-idx="${idx}" data-id="${b.id}" role="option" tabindex="0">
            <div class="s-main">${escapeHtml(b.title || '(no title)')}</div>
            <div class="s-sub">${escapeHtml(b.author || '')} • ${escapeHtml(b.isbn || '')} • ${escapeHtml(b.category || '')}</div>
        </div>
    `).join('');

    Array.from(container.querySelectorAll('.suggestion-item')).forEach((el) => {
        el.addEventListener('click', () => selectBookById(el.dataset.id));
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                selectBookById(el.dataset.id);
            }
        });
    });

    container.dataset.active = '-1';
}

function selectBookById(id) {
    if (!id) return;
    const book = appState.books.find((b) => String(b.id) === String(id));
    if (!book) return;
    if (elements.updateBookId) elements.updateBookId.value = String(book.id);
    if (elements.updateBookTitle) elements.updateBookTitle.value = book.title || '';
    if (elements.updateBookAuthor) elements.updateBookAuthor.value = book.author || '';
    // ISBN removed from UI
    if (elements.updateBookCategory) elements.updateBookCategory.value = book.category || '';
    if (elements.updateBookTotalCopies) elements.updateBookTotalCopies.value = book.totalCopies || 1;
    if (elements.updateBookYear) elements.updateBookYear.value = book.publishedYear || new Date().getFullYear();
    if (elements.updateBookSearch) elements.updateBookSearch.value = book.title || '';
    const container = document.getElementById('updateBookSuggestions');
    if (container) container.innerHTML = '';
}

function handleUpdateBookSuggestionKeydown(e) {
    const container = document.getElementById('updateBookSuggestions');
    if (!container) return;
    const items = Array.from(container.querySelectorAll('.suggestion-item'));
    if (!items.length) return;

    let active = parseInt(container.dataset.active || '-1', 10);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        active = Math.min(active + 1, items.length - 1);
        setActiveSuggestion(items, active, container);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        active = Math.max(active - 1, 0);
        setActiveSuggestion(items, active, container);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (active >= 0 && active < items.length) selectBookById(items[active].dataset.id);
    } else if (e.key === 'Escape') {
        container.innerHTML = '';
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function selectStudentById(id) {
    if (!id) return;
    const student = appState.users.find((u) => String(u.id) === String(id));
    if (!student) return;
    if (elements.updTargetStudent) elements.updTargetStudent.value = String(student.id);
    elements.updName.value = student.name || '';
    elements.updPhone.value = student.phone || '';
    elements.updCourse.value = student.course || '';
    elements.updEmail.value = student.email || '';
    elements.updStudentId.value = student.studentId || '';
    // set search input to the selected student's name
    if (elements.updateStudentSearch) elements.updateStudentSearch.value = student.name || '';
    // clear suggestions
    const container = document.getElementById('updSearchSuggestions');
    if (container) container.innerHTML = '';
}

function handleUpdateSuggestionKeydown(e) {
    const container = document.getElementById('updSearchSuggestions');
    if (!container) return;
    const items = Array.from(container.querySelectorAll('.suggestion-item'));
    if (!items.length) return;

    let active = parseInt(container.dataset.active || '-1', 10);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        active = Math.min(active + 1, items.length - 1);
        setActiveSuggestion(items, active, container);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        active = Math.max(active - 1, 0);
        setActiveSuggestion(items, active, container);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (active >= 0 && active < items.length) {
            selectStudentById(items[active].dataset.id);
        }
    } else if (e.key === 'Escape') {
        container.innerHTML = '';
    }
}

function setActiveSuggestion(items, index, container) {
    items.forEach((it) => it.classList.remove('active'));
    const target = items[index];
    if (!target) return;
    target.classList.add('active');
    container.dataset.active = String(index);
    // ensure visible
    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function handleProfileStudentSelectSearch(event) {
    // legacy helper for select-style quick-typing — no longer used when suggestions are enabled
    return;
}

async function handleBookSave(event) {
    event.preventDefault();
    if (!isAdmin()) {
        showToast("Only admin can add/update books.");
        return;
    }

    const existingBookId = elements.bookId.value;
    const totalCopies = Number(elements.bookTotalCopies.value);

    const payload = {
        title: elements.bookTitle.value.trim(),
        author: elements.bookAuthor.value.trim(),
        category: elements.bookCategory.value.trim(),
        totalCopies,
        publishedYear: Number(elements.bookYear.value)
    };
    // include isbn only when provided (UI no longer exposes it)
    if (elements.bookIsbn && elements.bookIsbn.value && elements.bookIsbn.value.trim()) payload.isbn = elements.bookIsbn.value.trim();

    try {
        if (!existingBookId) {
            await apiRequest("/books", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            showToast("Book added.");
        } else {
            await apiRequest(`/books/${existingBookId}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            showToast("Book updated.");
        }

        await fetchAllData();
        resetBookForm();
        renderAll();
    } catch (error) {
        showToast(error.message || "Book save failed.");
    }
}

function resetBookForm() {
    elements.bookForm.reset();
    elements.bookId.value = "";
}

function handleBookSearch() {
    appState.currentBookFilter = elements.bookSearch.value.trim().toLowerCase();
    renderBooks();
}

async function handleIssueBook(event) {
    event.preventDefault();

    syncBookSelection();
    syncStudentSelection("name");
    syncStudentSelection("id");

    const bookId = elements.issueBookId.value;
    const studentId = elements.issueStudentIdValue.value || elements.issueStudentNameId.value;
    const dueDate = elements.issueDueDate.value;

    if (!bookId) {
        showToast("Please select a book.");
        return;
    }

    if (!studentId) {
        showToast("Please select a student.");
        return;
    }

    if (!dueDate) {
        showToast("Please set a due date.");
        return;
    }

    const book = appState.books.find((item) => item.id === bookId);
    if (!book) {
        showToast("Book not found.");
        return;
    }

    if (book.availableCopies < 1) {
        showToast("Book unavailable.");
        return;
    }

    const student = appState.users.find((item) => item.id === studentId);
    if (!student) {
        showToast("Student not found.");
        return;
    }

    if (student.blocked) {
        showToast("Student is blocked and cannot issue books.");
        return;
    }

    if (!isAdmin() && appState.currentUser.id !== studentId) {
        showToast("Students can issue only for themselves.");
        return;
    }

    try {
        await apiRequest("/issues", {
            method: "POST",
            body: JSON.stringify({
                bookId,
                studentId,
                dueDate
            })
        });

        await fetchAllData();
        resetIssueForm();
        showToast(`Book issued to ${student.name} successfully.`);
        renderAll();
    } catch (error) {
        showToast(error.message || "Issue failed.");
    }
}

function resetIssueForm() {
    elements.issueForm.reset();
    elements.issueBookId.value = "";
    elements.issueStudentNameId.value = "";
    elements.issueStudentIdValue.value = "";
    renderIssueSelects();
}

function syncBookSelection() {
    const query = elements.issueBookSearch.value.trim().toLowerCase();
    const books = appState.books.filter((item) => item.availableCopies > 0);
    const book = findBestBookMatch(books, query);

    if (!book) {
        elements.issueBookId.value = "";
        return;
    }

    elements.issueBookId.value = book.id;
    elements.issueBookSearch.value = `${book.title} (${book.author})`;
}

function syncStudentSelection(source) {
    const students = appState.users.filter((student) => student.role === "student");
    const query = source === "name"
        ? elements.issueStudentNameSearch.value.trim().toLowerCase()
        : elements.issueStudentIdSearch.value.trim().toLowerCase();
    const selectedStudent = source === "name"
        ? findBestStudentByName(students, query)
        : findBestStudentByStudentId(students, query);

    if (!selectedStudent) {
        return;
    }

    elements.issueStudentNameId.value = selectedStudent.id;
    elements.issueStudentIdValue.value = selectedStudent.id;
    elements.issueStudentNameSearch.value = selectedStudent.name;
    elements.issueStudentIdSearch.value = selectedStudent.studentId || "";
}

function findBestBookMatch(books, query) {
    if (!query) {
        return books[0] || null;
    }

    const exactLabel = books.find((book) => `${book.title} (${book.author})`.toLowerCase() === query);
    if (exactLabel) {
        return exactLabel;
    }

    const exactTitle = books.find((book) => book.title.toLowerCase() === query);
    if (exactTitle) {
        return exactTitle;
    }

    const startsWithTitle = books.find((book) => book.title.toLowerCase().startsWith(query));
    if (startsWithTitle) {
        return startsWithTitle;
    }

    const byAuthor = books.find((book) => book.author.toLowerCase().includes(query));
    if (byAuthor) {
        return byAuthor;
    }

    return books.find((book) => book.title.toLowerCase().includes(query)) || null;
}

function findBestStudentByName(students, query) {
    if (!query) {
        return students[0] || null;
    }

    const exactName = students.find((student) => student.name.toLowerCase() === query);
    if (exactName) {
        return exactName;
    }

    const startsWithName = students.find((student) => student.name.toLowerCase().startsWith(query));
    if (startsWithName) {
        return startsWithName;
    }

    return students.find((student) => student.name.toLowerCase().includes(query)) || null;
}

function findBestStudentByStudentId(students, query) {
    if (!query) {
        return students[0] || null;
    }

    const exactId = students.find((student) => (student.studentId || "").toLowerCase() === query);
    if (exactId) {
        return exactId;
    }

    const startsWithId = students.find((student) => (student.studentId || "").toLowerCase().startsWith(query));
    if (startsWithId) {
        return startsWithId;
    }

    return students.find((student) => (student.studentId || "").toLowerCase().includes(query)) || null;
}

async function handleBookAction(action, bookId) {
    if (action === "edit") {
        if (!isAdmin()) {
            return;
        }
        const book = appState.books.find((item) => String(item.id) === String(bookId));
        if (!book) {
            return;
        }
        elements.bookId.value = book.id;
        elements.bookTitle.value = book.title;
        elements.bookAuthor.value = book.author;
        elements.bookCategory.value = book.category;
        elements.bookTotalCopies.value = book.totalCopies;
        elements.bookYear.value = book.publishedYear;
        switchModule("bookModule");
        switchBookTab("addBookPanel");
        return;
    }

    if (action === "delete") {
        if (!isAdmin()) {
            return;
        }
        const activeIssueExists = appState.issues.some((issue) => String(issue.bookId) === String(bookId) && issue.status === "issued");
        if (activeIssueExists) {
            showToast("Cannot delete. Book is currently issued.");
            return;
        }

        try {
            await apiRequest(`/books/${bookId}`, {
                method: "DELETE"
            });
            await fetchAllData();
            renderAll();
            showToast("Book deleted.");
        } catch (error) {
            const msg = (error && error.message) ? error.message : "Book delete failed.";
            // if backend reports active issues, refresh data and show actionable message
            if (msg.toLowerCase().includes('active issues') || msg.toLowerCase().includes('currently issued')) {
                await fetchAllData();
                renderAll();
                showToast("Cannot delete: book has active issued copies. Return them first.");
            } else {
                showToast(msg);
            }
        }
    }
}

async function handleIssueAction(action, issueId) {
    const issueIndex = appState.issues.findIndex((item) => String(item.id) === String(issueId));
    if (issueIndex === -1) {
        return;
    }

    const issue = appState.issues[issueIndex];

    if (action === "return") {
        const canReturn = isAdmin() || issue.studentId === appState.currentUser.id;
        if (!canReturn) {
            showToast("Not authorized to return this book.");
            return;
        }

        if (issue.status === "returned") {
            showToast("Already returned.");
            return;
        }

        try {
            const response = await apiRequest(`/issues/${issueId}/return`, {
                method: "POST"
            });
            await fetchAllData();
            renderAll();
            showToast(`Book returned. Fine: ₹${response.fine}`);
        } catch (error) {
            showToast(error.message || "Return failed.");
        }
    }
    else if (action === "collect") {
        try {
            const response = await apiRequest(`/issues/${issueId}/collect`, { method: "POST" });
            await fetchAllData();
            renderAll();
            showToast(`Fine collected: ₹${response.collected}`);
        } catch (err) {
            showToast(err.message || "Collect failed.");
        }
    }
}

function applyRoleAccess() {
    const admin = isAdmin();

    elements.allUsersPanel.classList.toggle("hidden", !admin);
    elements.studentRegisterPanel.classList.toggle("hidden", !admin);
    elements.bookCrudPanel.classList.toggle("hidden", !admin);
    elements.bookActionHeader.textContent = admin ? "Actions" : "Status";

    if (admin) {
        elements.issueStudentNameSearch.disabled = false;
        elements.issueStudentIdSearch.disabled = false;
    } else {
        elements.issueStudentNameSearch.disabled = true;
        elements.issueStudentIdSearch.disabled = true;
    }

    // Make profile/update form read-only for non-admin users
    if (elements.profileUpdateForm) {
        const controls = elements.profileUpdateForm.querySelectorAll('input,select,textarea,button');
        controls.forEach((c) => {
            // allow admins to interact normally
            if (admin) {
                c.removeAttribute('disabled');
                if (c.tagName === 'INPUT' || c.tagName === 'TEXTAREA') c.readOnly = false;
            } else {
                // disable buttons (including submit) and make inputs read-only
                if (c.tagName === 'BUTTON') {
                    c.disabled = true;
                } else if (c.tagName === 'INPUT' || c.tagName === 'TEXTAREA' || c.tagName === 'SELECT') {
                    try { c.readOnly = true; } catch (e) {}
                    try { c.disabled = true; } catch (e) {}
                }
            }
        });
    }

    // Limit visible user-management tabs for students: only allow the update/profile tab (read-only)
    if (elements.userTabButtons) {
        elements.userTabButtons.forEach((btn) => {
            const tab = btn.dataset.tab;
            if (admin) {
                btn.classList.remove('hidden');
            } else {
                // show only updPanel for students
                if (tab === 'updPanel') {
                    btn.classList.remove('hidden');
                } else {
                    btn.classList.add('hidden');
                }
            }
        });
    }

    // Limit top-level modules: students see only reports
    if (elements.moduleButtons) {
        elements.moduleButtons.forEach((btn) => {
            const module = btn.dataset.module;
            if (admin) {
                btn.classList.remove('hidden');
            } else {
                // show student modules
                if (['dashboardModule','studentProfileModule','studentIssuedModule','studentHistoryModule'].includes(module)) {
                    btn.classList.remove('hidden');
                } else {
                    btn.classList.add('hidden');
                }
            }
        });
        // ensure UI is on reports for students
        if (!admin) {
            switchModule('dashboardModule');
        }
    }
}

function toggleApp(isLoggedIn) {
    elements.authSection.classList.toggle("hidden", isLoggedIn);
    elements.appSection.classList.toggle("hidden", !isLoggedIn);
    elements.sessionPanel.classList.toggle("hidden", !isLoggedIn);

    if (isLoggedIn && appState.currentUser) {
        elements.welcomeText.textContent = `${appState.currentUser.name} (${appState.currentUser.role})`;
    }
}

function logout() {
    clearAuthSession();
    appState.users = [];
    appState.books = [];
    appState.issues = [];
    toggleApp(false);
    showToast("Logged out.");
}

function renderAll() {
    try { console.log(`[NAV] renderAll start (current:${getActiveModuleId()})`); } catch (e) {}
    renderProfile();
    renderUsers();
    renderBooks();
    renderIssueSelects();
    renderIssues();
    renderDashboard();
    renderStudentProfile();
    renderStudentIssued();
    renderStudentHistory();
    renderReports();
    try { console.log(`[NAV] renderAll end (current:${getActiveModuleId()})`); } catch (e) {}
}

function renderStudentProfile() {
    if (!appState.currentUser) return;
    if (isAdmin()) return; // only for students
    const u = appState.currentUser;
    if (elements.studentProfileForm) {
        elements.stuName.value = u.name || '';
        elements.stuStudentId.value = u.studentId || '';
        elements.stuEmail.value = u.email || '';
        elements.stuPhone.value = u.phone || '';
        elements.stuCourse.value = u.course || '';
        elements.stuNewPassword.value = '';
    }
}

function renderStudentIssued() {
    if (!appState.currentUser) return;
    if (isAdmin()) return;
    const studentId = String(appState.currentUser.id);
    const current = appState.issues.filter((i) => String(i.studentId) === studentId && i.status === 'issued');
    if (!elements.studentIssuedTableBody) return;
    if (!current.length) {
        elements.studentIssuedTableBody.innerHTML = '<tr><td colspan="4">No issued books</td></tr>';
        return;
    }
    elements.studentIssuedTableBody.innerHTML = current.map((issue) => {
        const book = appState.books.find((b) => String(b.id) === String(issue.bookId));
        const title = book ? escapeHtml(book.title) : '-';
        return `<tr><td>${title}</td><td>${formatDateUTC(issue.issueDate)}</td><td>${formatDateUTC(issue.dueDate)}</td><td>${escapeHtml(issue.status)}</td></tr>`;
    }).join('');
}

function renderStudentHistory() {
    if (!appState.currentUser) return;
    if (isAdmin()) return;
    const studentId = String(appState.currentUser.id);
    const history = appState.issues.filter((i) => String(i.studentId) === studentId && i.status !== 'issued');
    if (!elements.studentHistoryTableBody) return;
    if (!history.length) {
        elements.studentHistoryTableBody.innerHTML = '<tr><td colspan="4">No history</td></tr>';
        return;
    }
    elements.studentHistoryTableBody.innerHTML = history.map((issue) => {
        const book = appState.books.find((b) => String(b.id) === String(issue.bookId));
        const title = book ? escapeHtml(book.title) : '-';
        return `<tr><td>${title}</td><td>${formatDateUTC(issue.issueDate)}</td><td>${issue.returnDate ? formatDateUTC(issue.returnDate) : '-'}</td><td>${escapeHtml(issue.status)}</td></tr>`;
    }).join('');
}

function renderProfile() {
    if (!appState.currentUser) {
        return;
    }

    if (!isAdmin()) {
        elements.updName.value = appState.currentUser.name || "";
        elements.updPhone.value = appState.currentUser.phone || "";
        elements.updCourse.value = appState.currentUser.course || "";
        elements.updEmail.value = appState.currentUser.email || "";
        elements.updStudentId.value = appState.currentUser.studentId || "";
        // Show detailed student profile in top session area
        const name = appState.currentUser.name || "-";
        const sid = appState.currentUser.studentId || "-";
        const course = appState.currentUser.course || "-";
        elements.welcomeText.textContent = `${name} | ID: ${sid} | ${course}`;
        return;
    }
    // For admins, populate fields based on search input (no visible dropdown)
    renderProfileStudentOptions();
}

async function handleStudentProfileUpdate(event) {
    event.preventDefault();
    if (!appState.currentUser) return;
    if (isAdmin()) {
        showToast('Admins should update via Admin panel.');
        return;
    }

    const name = elements.stuName.value.trim();
    const email = elements.stuEmail.value.trim().toLowerCase();
    const phone = elements.stuPhone.value.trim();
    const course = elements.stuCourse.value.trim();
    const password = elements.stuNewPassword.value;

    try {
        const body = { name, email, phone, course };
        if (password) body.password = password;

        const response = await apiRequest('/auth/me', { method: 'PUT', body: JSON.stringify(body) });
        // update local session
        appState.currentUser = { ...appState.currentUser, name: response.name, email: response.email, phone: response.phone, course: response.course };
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(appState.currentUser));
        showToast('Profile updated.');
        renderAll();
    } catch (err) {
        showToast(err.message || 'Update failed.');
    }
}

async function handleAdminUpdate(event) {
    event.preventDefault();
    if (!isAdmin()) {
        showToast("Not authorized");
        return;
    }

    const name = elements.adminUpdName.value.trim();
    const email = elements.adminUpdEmail.value.trim().toLowerCase();
    const phone = elements.adminUpdPhone.value.trim();
    const password = elements.adminUpdPassword.value;

    try {
        const body = { name, email, phone };
        if (password) body.password = password;

        const response = await apiRequest("/auth/me", {
            method: "PUT",
            body: JSON.stringify(body)
        });

        // update local session
        appState.currentUser = { ...appState.currentUser, name: response.name, email: response.email, phone: response.phone };
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(appState.currentUser));
        elements.welcomeText.textContent = `${appState.currentUser.name} (${appState.currentUser.role})`;
        showToast("Admin profile updated.");
        elements.adminUpdateForm.reset();
        renderAll();
    } catch (err) {
        showToast(err.message || "Update failed.");
    }
}

function renderUsers() {
    const query = appState.currentStudentFilter || "";
    const students = appState.users.filter((user) => user.role === "student");
    const filteredStudents = students.filter((user) => {
        if (!query) return true;
        return (
            user.name.toLowerCase().includes(query) ||
            (user.studentId || "").toLowerCase().includes(query) ||
            (user.email || "").toLowerCase().includes(query) ||
            (user.phone || "").toLowerCase().includes(query)
        );
    });

    const rows = filteredStudents
        .map((user) => {
            const isStudent = user.role === "student";
            const deletedBadge = isStudent && user.deletedAt ? '<span class="badge badge-secondary">Deleted</span>' : '';
            const blockedBadge = isStudent && user.blocked && !user.deletedAt ? '<span class="badge badge-danger">Blocked</span>' : '';
            
            let actions = '';
            if (isStudent && isAdmin()) {
                if (user.deletedAt) {
                    // Show restore button for deleted students
                    actions = `<button class="btn btn-success" data-student-action="restore" data-student-id="${user.id}">Restore</button>`;
                } else {
                    // Show block/unblock and delete buttons for active students
                    actions = (user.blocked
                        ? `<button class="btn btn-light" data-student-action="unblock" data-student-id="${user.id}">Unblock</button>`
                        : `<button class="btn btn-warning" data-student-action="block" data-student-id="${user.id}">Block</button>`)
                        + ` <button class="btn btn-danger" data-student-action="delete" data-student-id="${user.id}">Delete</button>`;
                }
            }

            return `<tr>
                <td>${user.id}</td>
                <td>${user.name} ${deletedBadge} ${blockedBadge}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.studentId || "-"}</td>
                <td>${user.phone || "-"}</td>
                <td>${user.course || "-"}</td>
                <td>${actions}</td>
            </tr>`;
        })
        .join("");

    elements.usersTableBody.innerHTML = rows || `<tr><td colspan="8">No students found.</td></tr>`;

    elements.usersTableBody.querySelectorAll("[data-student-action]").forEach((button) => {
        button.addEventListener("click", () => handleStudentAction(button.dataset.studentAction, button.dataset.studentId));
    });
}

async function handleStudentAction(action, studentId) {
    if (!isAdmin()) return;

    try {
        if (action === "delete") {
            const ok = confirm("Delete this student? Data is soft-deleted and can be restored.");
            if (!ok) return;
            await apiRequest(`/students/${studentId}`, { method: "DELETE" });
            showToast("Student deleted (can be restored).");
        } else if (action === "block") {
            await apiRequest(`/students/${studentId}/block`, { method: "POST" });
            showToast("Student blocked.");
        } else if (action === "unblock") {
            await apiRequest(`/students/${studentId}/unblock`, { method: "POST" });
            showToast("Student unblocked.");
        } else if (action === "restore") {
            await apiRequest(`/students/${studentId}/restore`, { method: "POST" });
            showToast("Student restored.");
        }

        await fetchAllData();
        renderAll();
    } catch (err) {
        showToast(err.message || "Action failed.");
    }
}

function renderBooks() {
    const query = appState.currentBookFilter;
    const filteredBooks = appState.books.filter((book) => {
        if (!query) {
            return true;
        }
        return (
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        );
    });

    // update count in title bar if present
    try {
        if (elements.booksCount) elements.booksCount.textContent = String(filteredBooks.length);
    } catch (e) {}

    const rows = filteredBooks
        .map((book) => {
            const availabilityText = `${book.availableCopies}/${book.totalCopies}`;
            const actions = isAdmin()
                ? `<button class="btn btn-light" data-book-action="edit" data-book-id="${book.id}">Edit</button>
                   <button class="btn btn-danger" data-book-action="delete" data-book-id="${book.id}">Delete</button>`
                : `<span>${book.availableCopies > 0 ? "Available" : "Not Available"}</span>`;

            return `<tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>${availabilityText}</td>
                <td>${actions}</td>
            </tr>`;
        })
        .join("");

    elements.booksTableBody.innerHTML = rows || `<tr><td colspan="6">No books found.</td></tr>`;

    elements.booksTableBody.querySelectorAll("[data-book-action]").forEach((button) => {
        button.addEventListener("click", () => handleBookAction(button.dataset.bookAction, button.dataset.bookId));
    });

    // populate update select for Update Book panel
    if (elements.updateBookSelect) {
        const options = appState.books
            .map((b) => `<option value="${b.id}">${b.title} — ${b.author}</option>`)
            .join("");
        elements.updateBookSelect.innerHTML = `<option value="">-- Select a book --</option>${options}`;
    }
}

async function handleUpdateBook(event) {
    event.preventDefault();
    if (!isAdmin()) {
        showToast("Only admin can update books.");
        return;
    }

    const bookId = elements.updateBookId.value;
    if (!bookId) {
        showToast("Select a book to update.");
        return;
    }

    const payload = {
        title: elements.updateBookTitle.value.trim(),
        author: elements.updateBookAuthor.value.trim(),
        category: elements.updateBookCategory.value.trim(),
        totalCopies: Number(elements.updateBookTotalCopies.value),
        publishedYear: Number(elements.updateBookYear.value)
    };
    // ISBN not provided via UI

    try {
        await apiRequest(`/books/${bookId}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
        showToast("Book updated.");
        await fetchAllData();
        renderAll();
    } catch (err) {
        showToast(err.message || "Update failed.");
    }
}

function renderIssueSelects() {
    const availableBooks = appState.books.filter((book) => book.availableCopies > 0);
    const students = appState.users.filter((user) => user.role === "student");
    const bookSearchText = elements.issueBookSearch.value.trim().toLowerCase();
    const studentNameSearchText = elements.issueStudentNameSearch.value.trim().toLowerCase();
    const studentIdSearchText = elements.issueStudentIdSearch.value.trim().toLowerCase();

    const filteredBooks = availableBooks.filter((book) => {
        if (!bookSearchText) {
            return true;
        }
        return (
            book.title.toLowerCase().includes(bookSearchText) ||
            book.author.toLowerCase().includes(bookSearchText)
        );
    });

    const filteredStudentsByName = students.filter((student) => {
        if (!studentNameSearchText) {
            return true;
        }
        return student.name.toLowerCase().includes(studentNameSearchText);
    });

    const filteredStudentsById = students.filter((student) => {
        if (!studentIdSearchText) {
            return true;
        }
        return (student.studentId || "").toLowerCase().includes(studentIdSearchText);
    });

    elements.issueBookOptions.innerHTML = filteredBooks
        .map((book) => `<option value="${book.title} (${book.author})"></option>`)
        .join("");

    elements.issueStudentNameOptions.innerHTML = filteredStudentsByName
        .map((student) => `<option value="${student.name}"></option>`)
        .join("");

    elements.issueStudentIdOptions.innerHTML = filteredStudentsById
        .map((student) => `<option value="${student.studentId || "NA"}"></option>`)
        .join("");

    if (!isAdmin() && appState.currentUser) {
        elements.issueStudentNameSearch.value = appState.currentUser.name;
        elements.issueStudentIdSearch.value = appState.currentUser.studentId || "";
        elements.issueStudentNameId.value = appState.currentUser.id;
        elements.issueStudentIdValue.value = appState.currentUser.id;
    }

    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 15);
    elements.issueDueDate.value = toDateInputValue(defaultDueDate);
}

function renderIssues() {
    // Start with issues visible to the current role
    let visibleIssues = isAdmin()
        ? appState.issues.slice()
        : appState.issues.filter((issue) => issue.studentId === appState.currentUser.id);

    // For students show only currently relevant issues (issued or returned with outstanding fine)
    visibleIssues = visibleIssues.filter((issue) => {
        if (issue.status === 'issued') return true;
        const fineNow = getCurrentFine(issue);
        return fineNow > 0;
    });

    if (!isAdmin()) {
        // Simplified view for students: Book | Issue Date | Due Date | Fine
        const rows = visibleIssues
            .map((issue) => {
                const book = appState.books.find((item) => item.id === issue.bookId);
                const fineAmount = getCurrentFine(issue);
                return `<tr>
                    <td>${book ? escapeHtml(book.title) : "-"}</td>
                    <td>${issue.issueDate}</td>
                    <td>${issue.dueDate}</td>
                    <td>₹${fineAmount}</td>
                </tr>`;
            })
            .join("");

        // Replace table header to match simplified columns for students
        const header = `<tr>
            <th>Book</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Fine</th>
        </tr>`;

        // If the table header element exists, replace its thead
        try {
            const table = elements.issuesTableBody.closest('table');
            if (table) {
                const thead = table.querySelector('thead');
                if (thead) thead.innerHTML = header;
            }
        } catch (e) {}

        elements.issuesTableBody.innerHTML = rows || `<tr><td colspan="4">No issue records found.</td></tr>`;
        return;
    }

    // Admin view (unchanged)
    const rows = visibleIssues
        .map((issue) => {
            const book = appState.books.find((item) => item.id === issue.bookId);
            const student = appState.users.find((item) => item.id === issue.studentId);
            const overdue = isOverdue(issue);
            const statusText = issue.status === "issued" && overdue ? "issued (overdue)" : issue.status;
            const fineAmount = getCurrentFine(issue);
            const collectBtn = (fineAmount > 0)
                ? `<button class="btn btn-primary" data-issue-action="collect" data-issue-id="${issue.id}">Collect Fine</button>`
                : "";
            const actionBtn = issue.status === "issued"
                ? `<button class="btn btn-secondary" data-issue-action="return" data-issue-id="${issue.id}">Return</button>`
                : "-";

            return `<tr>
                <td>${issue.id}</td>
                <td>${book ? book.title : "-"}</td>
                <td>${student ? student.name : "-"}</td>
                <td>${student ? (student.studentId || "-") : "-"}</td>
                <td>${issue.issueDate}</td>
                <td>${issue.dueDate}</td>
                <td>${issue.returnDate || "-"}</td>
                <td>${statusText}</td>
                <td>₹${fineAmount}</td>
                <td>${actionBtn} ${collectBtn}</td>
            </tr>`;
        })
        .join("");

    elements.issuesTableBody.innerHTML = rows || `<tr><td colspan="10">No issue records found.</td></tr>`;

    elements.issuesTableBody.querySelectorAll("[data-issue-action]").forEach((button) => {
        button.addEventListener("click", () => handleIssueAction(button.dataset.issueAction, button.dataset.issueId));
    });
}

function findBestStudentMatch(students, searchText) {
    const byExactId = students.find((student) => (student.studentId || "").toLowerCase() === searchText);
    if (byExactId) {
        return byExactId;
    }

    const byExactName = students.find((student) => student.name.toLowerCase() === searchText);
    if (byExactName) {
        return byExactName;
    }

    const byStartsWithId = students.find((student) => (student.studentId || "").toLowerCase().startsWith(searchText));
    if (byStartsWithId) {
        return byStartsWithId;
    }

    const byStartsWithName = students.find((student) => student.name.toLowerCase().startsWith(searchText));
    if (byStartsWithName) {
        return byStartsWithName;
    }

    return students[0];
}

function renderDashboard() {
    const totalBooks = appState.books.reduce((sum, book) => sum + book.totalCopies, 0);
    const issuedBooks = appState.issues.filter((issue) => issue.status === "issued").length;
    const overdueBooks = appState.issues.filter((issue) => issue.status === "issued" && isOverdue(issue)).length;
    const totalFine = filterIssuesByRole(appState.issues).reduce((sum, issue) => sum + getCurrentFine(issue), 0);

    elements.dashTotalBooks.textContent = String(totalBooks);
    elements.dashIssuedBooks.textContent = String(issuedBooks);
    elements.dashOverdueBooks.textContent = String(overdueBooks);
    elements.dashTotalFine.textContent = `₹${totalFine}`;

    renderBarChart(elements.availabilityChart, [
        { label: "Available", value: appState.books.reduce((sum, book) => sum + book.availableCopies, 0) },
        { label: "Issued", value: appState.books.reduce((sum, book) => sum + (book.totalCopies - book.availableCopies), 0) }
    ]);

    renderBarChart(elements.statusChart, [
        { label: "Issued", value: issuedBooks },
        { label: "Returned", value: appState.issues.filter((issue) => issue.status === "returned").length },
        { label: "Overdue", value: overdueBooks }
    ]);
}

function renderReports() {
    const totalBookCount = appState.books.reduce((sum, book) => sum + book.totalCopies, 0);
    const issuedBooks = appState.issues.filter((issue) => issue.status === "issued");
    const overdueBooks = appState.issues.filter((issue) => issue.status === "issued" && isOverdue(issue));
    const totalFine = appState.issues.reduce((sum, issue) => sum + getCurrentFine(issue), 0);
    const blockedStudents = appState.users.filter((user) => user.role === "student" && user.blocked);

    elements.reportTotalBooks.textContent = String(totalBookCount);
    elements.reportIssuedCount.textContent = String(issuedBooks.length);
    elements.reportOverdueCount.textContent = String(overdueBooks.length);
    elements.reportFineTotal.textContent = `₹${totalFine}`;

    const visibleIssued = filterIssuesByRole(issuedBooks);
    const visibleOverdue = filterIssuesByRole(overdueBooks);
    const fineIssues = filterIssuesByRole(appState.issues.filter((issue) => getCurrentFine(issue) > 0));
    const visibleBlockedStudents = isAdmin()
        ? blockedStudents
        : blockedStudents.filter((student) => student.id === appState.currentUser.id);

    elements.issuedList.innerHTML = listFromIssues(visibleIssued, false);
    elements.overdueList.innerHTML = listFromIssues(visibleOverdue, false);
    elements.fineList.innerHTML = listFromIssues(fineIssues, true);
    elements.blockedList.innerHTML = listFromBlockedStudents(visibleBlockedStudents);

    // If current user is a student, show student dashboard with detailed info
    if (!isAdmin() && appState.currentUser) {
        const studentId = appState.currentUser.id;
        const student = appState.users.find((u) => String(u.id) === String(studentId)) || appState.currentUser;
        const studentIssuesAll = appState.issues.filter((issue) => String(issue.studentId) === String(studentId));
        const currentlyIssued = studentIssuesAll.filter((i) => i.status === 'issued');
        const dueCount = currentlyIssued.filter((i) => isOverdue(i)).length;
        // next return = earliest due date among currently issued
        let nextReturn = null;
        currentlyIssued.forEach((i) => {
            const d = parseDateAsUTC(i.dueDate);
            if (!d) return;
            if (!nextReturn || d.getTime() < nextReturn.getTime()) nextReturn = d;
        });

        const totalFineForStudent = studentIssuesAll.reduce((s, it) => s + getCurrentFine(it), 0);

        // populate profile
        if (elements.studentProfileName) elements.studentProfileName.textContent = student.name || '-';
        if (elements.studentProfileId) elements.studentProfileId.textContent = student.studentId || '-';
        if (elements.studentProfileCourse) elements.studentProfileCourse.textContent = student.course || '-';

        if (elements.studentTotalIssued) elements.studentTotalIssued.textContent = String(currentlyIssued.length);
        if (elements.studentDueCount) elements.studentDueCount.textContent = String(dueCount);
        if (elements.studentNextReturn) elements.studentNextReturn.textContent = nextReturn ? formatDateUTC(nextReturn.toISOString().slice(0,10)) : '-';
        if (elements.studentTotalFine) elements.studentTotalFine.textContent = `₹${totalFineForStudent}`;

        // history table
        if (elements.studentIssueHistory) {
            if (!studentIssuesAll.length) {
                elements.studentIssueHistory.innerHTML = '<tr><td colspan="6">No history</td></tr>';
            } else {
                elements.studentIssueHistory.innerHTML = studentIssuesAll
                    .sort((a,b) => (a.issueDate || '').localeCompare(b.issueDate || ''))
                    .map((issue) => {
                        const book = appState.books.find((b) => String(b.id) === String(issue.bookId));
                        const title = book ? escapeHtml(book.title) : '-';
                        const issueDate = formatDateUTC(issue.issueDate);
                        const dueDate = formatDateUTC(issue.dueDate);
                        const returnDate = issue.returnDate ? formatDateUTC(issue.returnDate) : '-';
                        const status = issue.status || '-';
                        const fine = getCurrentFine(issue);
                        return `<tr>
                            <td>${title}</td>
                            <td>${issueDate}</td>
                            <td>${dueDate}</td>
                            <td>${returnDate}</td>
                            <td>${status}</td>
                            <td>₹${fine}</td>
                        </tr>`;
                    })
                    .join('');
            }
        }

        // show student dashboard, hide generic report lists
        if (elements.studentDashboard) elements.studentDashboard.classList.remove('hidden');
        if (elements.reportListsWrap) elements.reportListsWrap.classList.add('hidden');
    } else {
        // admin or anonymous: hide student dashboard and show generic reports
        if (elements.studentDashboard) elements.studentDashboard.classList.add('hidden');
        if (elements.reportListsWrap) elements.reportListsWrap.classList.remove('hidden');
    }

}

function filterIssuesByRole(issues) {
    if (isAdmin()) {
        return issues;
    }
    return issues.filter((issue) => issue.studentId === appState.currentUser.id);
}

function listFromIssues(issues, includeFine) {
    if (issues.length === 0) {
        return "<li>No data</li>";
    }

    return issues
        .map((issue) => {
            const book = appState.books.find((item) => item.id === issue.bookId);
            const student = appState.users.find((item) => item.id === issue.studentId);
            const fineText = includeFine ? ` | Fine: ₹${getCurrentFine(issue)}` : "";
            return `<li>${book ? escapeHtml(book.title) : "-"} - ${student ? escapeHtml(student.name) : "-"}${fineText}</li>`;
        })
        .join("");
}

function listFromBlockedStudents(students) {
    if (!students.length) {
        return "<li>No blocked students</li>";
    }

    return students
        .map((student) => {
            const studentId = student.studentId || "-";
            const phone = student.phone || "-";
            return `<li>${student.name} | ID: ${studentId} | Email: ${student.email} | Phone: ${phone}</li>`;
        })
        .join("");
}

function renderBarChart(container, items) {
    const maxValue = Math.max(...items.map((item) => item.value), 1);
    const barColors = ["#2563eb", "#0f766e", "#d97706", "#dc2626", "#7c3aed"];
    container.innerHTML = items
        .map((item, index) => {
            const heightPercent = Math.max(Math.round((item.value / maxValue) * 100), item.value > 0 ? 8 : 2);
            const barColor = barColors[index % barColors.length];
            return `<div class="bar-item">
                <div class="bar-track">
                    <div class="bar" style="--target-height:${heightPercent}%; background:${barColor};"></div>
                </div>
                <div class="bar-meta">
                    <span class="bar-label">${item.label}</span>
                    <span class="bar-value">${item.value}</span>
                </div>
            </div>`;
        })
        .join("");
}

function isOverdue(issue) {
    if (issue.status !== "issued") return false;
    const due = parseDateAsUTC(issue.dueDate);
    const today = parseDateAsUTC(getToday());
    if (!due || !today) return false;
    if (today.getTime() <= due.getTime()) return false;

    if (issue.collectedUpto) {
        const collected = parseDateAsUTC(issue.collectedUpto);
        if (collected) {
            // if already collected up to today or beyond, it's not overdue
            if (collected.getTime() >= today.getTime() || collected.getTime() >= due.getTime()) return false;
        }
    }

    return true;
}

function getCurrentFine(issue) {
    const storedFine = Number(issue.fine || 0);
    if (issue.status === "returned") {
        return storedFine;
    }
    // For issued items, compute overdue days up to today and subtract already-collected days (using UTC dates)
    const due = parseDateAsUTC(issue.dueDate);
    const today = parseDateAsUTC(getToday());
    if (!due || !today) return 0;
    if (today.getTime() <= due.getTime()) return 0;

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalOverdueDays = Math.ceil((today.getTime() - due.getTime()) / msPerDay);

    let alreadyCollectedDays = 0;
    if (issue.collectedUpto) {
        const collected = parseDateAsUTC(issue.collectedUpto);
        if (collected && collected.getTime() > due.getTime()) {
            alreadyCollectedDays = Math.ceil((collected.getTime() - due.getTime()) / msPerDay);
        }
    }

    const outstandingDays = Math.max(0, totalOverdueDays - alreadyCollectedDays);
    return outstandingDays * FINE_PER_DAY;
}

function calculateFine(dueDate, returnDate) {
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
    const diffMs = returned.getTime() - due.getTime();
    if (diffMs <= 0) {
        return 0;
    }
    const daysLate = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return daysLate * FINE_PER_DAY;
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.remove("hidden");
    setTimeout(() => elements.toast.classList.add("hidden"), 2200);
}

function readStorage(key, fallbackValue) {
    const raw = localStorage.getItem(key);
    if (!raw) {
        return fallbackValue;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        return fallbackValue;
    }
}

function isAdmin() {
    return appState.currentUser && appState.currentUser.role === "admin";
}

function createId(prefix) {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function getToday() {
    return toDateInputValue(new Date());
}

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Format an ISO date/string as YYYY-MM-DD using UTC components to avoid local timezone shifts
function formatDateUTC(input) {
    if (!input) return "";
    // If already in YYYY-MM-DD form, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(input).trim())) {
        return String(input).trim();
    }

    // If input is an ISO-like string with a date portion, preserve the server-provided date
    // (handles forms like "2026-05-16" or "2026-05-16T00:00:00" or with offsets)
    const s = String(input).trim();
    const match = s.match(/^(\d{4}-\d{2}-\d{2})(?:[Tt].*)?$/);
    if (match) {
        return match[1];
    }

    // Fallback: attempt to parse and return UTC date components
    let iso = s;
    if (/^\d{4}-\d{2}-\d{2}T/.test(iso) && !iso.endsWith('Z')) {
        iso = iso + 'Z';
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function parseDateAsUTC(dateStr) {
    if (!dateStr) return null;
    const parts = String(dateStr).split('-').map((p) => Number(p));
    if (parts.length < 3) return null;
    const [y, m, d] = parts;
    return new Date(Date.UTC(y, m - 1, d));
}

initApp();