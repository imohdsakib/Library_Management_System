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

    studentRegisterForm: document.getElementById("studentRegisterForm"),
    regName: document.getElementById("regName"),
    regEmail: document.getElementById("regEmail"),
    regStudentId: document.getElementById("regStudentId"),
    regPhone: document.getElementById("regPhone"),
    regCourse: document.getElementById("regCourse"),

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

    usersTableBody: document.getElementById("usersTableBody"),
    allUsersPanel: document.getElementById("allUsersPanel"),
    studentRegisterPanel: document.getElementById("studentRegisterPanel"),

    bookForm: document.getElementById("bookForm"),
    bookId: document.getElementById("bookId"),
    bookTitle: document.getElementById("bookTitle"),
    bookAuthor: document.getElementById("bookAuthor"),
    bookIsbn: document.getElementById("bookIsbn"),
    bookCategory: document.getElementById("bookCategory"),
    bookTotalCopies: document.getElementById("bookTotalCopies"),
    bookYear: document.getElementById("bookYear"),
    resetBookForm: document.getElementById("resetBookForm"),
    bookCrudPanel: document.getElementById("bookCrudPanel"),
    booksTableBody: document.getElementById("booksTableBody"),
    bookSearch: document.getElementById("bookSearch"),
    bookActionHeader: document.getElementById("bookActionHeader"),

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

    logoutBtn: document.getElementById("logoutBtn"),
    tabButtons: document.querySelectorAll(".tab-btn"),
    tabContents: document.querySelectorAll(".tab-content"),
    moduleButtons: document.querySelectorAll(".module-btn"),
    modules: document.querySelectorAll(".module")
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

    elements.loginForm.addEventListener("submit", handleLogin);
    elements.studentRegisterForm.addEventListener("submit", handleRegistration);
    elements.adminRegisterForm.addEventListener("submit", handleAdminRegistration);
    if (elements.adminUpdateForm) elements.adminUpdateForm.addEventListener("submit", handleAdminUpdate);
    elements.profileUpdateForm.addEventListener("submit", handleProfileUpdate);
    elements.updTargetStudent.addEventListener("change", renderProfile);
    elements.updTargetStudent.addEventListener("keydown", handleProfileStudentSelectSearch);

    elements.bookForm.addEventListener("submit", handleBookSave);
    elements.resetBookForm.addEventListener("click", resetBookForm);
    elements.bookSearch.addEventListener("input", handleBookSearch);

    elements.issueForm.addEventListener("submit", handleIssueBook);
    elements.issueBookSearch.addEventListener("input", renderIssueSelects);
    elements.issueBookSearch.addEventListener("change", syncBookSelection);
    elements.issueStudentNameSearch.addEventListener("input", renderIssueSelects);
    elements.issueStudentNameSearch.addEventListener("change", () => syncStudentSelection("name"));
    elements.issueStudentIdSearch.addEventListener("input", renderIssueSelects);
    elements.issueStudentIdSearch.addEventListener("change", () => syncStudentSelection("id"));
    elements.logoutBtn.addEventListener("click", logout);
}

function switchTab(tabId) {
    elements.tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabId);
    });

    elements.tabContents.forEach((content) => {
        content.classList.toggle("active", content.id === tabId);
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
        issueDate: String(issue.issueDate).slice(0, 10),
        dueDate: String(issue.dueDate).slice(0, 10),
        returnDate: issue.returnDate ? String(issue.returnDate).slice(0, 10) : ""
    }));
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
                phone: elements.regPhone.value.trim()
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
                studentId: nextStudentId
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
    const students = appState.users.filter((user) => user.role === "student");
    const selected = elements.updTargetStudent.value;

    const options = students
        .map((student) => `<option value="${student.id}">${student.name}</option>`)
        .join("");

    elements.updTargetStudent.innerHTML = `<option value="">Select a student</option>${options}`;

    if (!students.length) {
        elements.updTargetStudent.value = "";
        return;
    }

    const hasPreviousSelection = students.some((student) => student.id === selected);
    elements.updTargetStudent.value = hasPreviousSelection ? selected : "";
}

function handleProfileStudentSelectSearch(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    const now = Date.now();
    const timeoutMs = 700;
    const isBackspace = event.key === "Backspace";

    if (isBackspace) {
        if (!profileStudentSelectSearch.term) {
            return;
        }

        event.preventDefault();
        profileStudentSelectSearch.term = profileStudentSelectSearch.term.slice(0, -1);
        profileStudentSelectSearch.lastTypedAt = now;

        if (!profileStudentSelectSearch.term) {
            return;
        }
    } else if (event.key.length === 1) {
        const typedChar = event.key.toLowerCase();

        if (now - profileStudentSelectSearch.lastTypedAt > timeoutMs) {
            profileStudentSelectSearch.term = typedChar;
        } else {
            profileStudentSelectSearch.term += typedChar;
        }

        profileStudentSelectSearch.lastTypedAt = now;
    } else {
        return;
    }

    const options = Array.from(elements.updTargetStudent.options).filter((option) => option.value);
    const matchedOption = options.find((option) =>
        option.textContent.toLowerCase().includes(profileStudentSelectSearch.term)
    );

    if (!matchedOption) {
        return;
    }

    event.preventDefault();
    elements.updTargetStudent.value = matchedOption.value;
    renderProfile();
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
        isbn: elements.bookIsbn.value.trim(),
        category: elements.bookCategory.value.trim(),
        totalCopies,
        publishedYear: Number(elements.bookYear.value)
    };

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
        elements.bookIsbn.value = book.isbn;
        elements.bookCategory.value = book.category;
        elements.bookTotalCopies.value = book.totalCopies;
        elements.bookYear.value = book.publishedYear;
        switchModule("bookModule");
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
            showToast(error.message || "Book delete failed.");
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
    renderReports();
    try { console.log(`[NAV] renderAll end (current:${getActiveModuleId()})`); } catch (e) {}
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
        elements.welcomeText.textContent = `${appState.currentUser.name} (${appState.currentUser.role})`;
        return;
    }

    renderProfileStudentOptions();
    const selectedStudentId = elements.updTargetStudent.value;
    const selectedStudent = appState.users.find(
        (user) => user.role === "student" && user.id === selectedStudentId
    );

    if (!selectedStudent) {
        elements.updName.value = "";
        elements.updPhone.value = "";
        elements.updCourse.value = "";
        elements.updEmail.value = "";
        elements.updStudentId.value = "";
        // Prefill admin update form if present
        if (elements.adminUpdName) {
            elements.adminUpdName.value = appState.currentUser.name || "";
            elements.adminUpdEmail.value = appState.currentUser.email || "";
            elements.adminUpdPhone.value = appState.currentUser.phone || "";
            elements.adminUpdPassword.value = "";
        }
        return;
    }

    elements.updName.value = selectedStudent.name || "";
    elements.updPhone.value = selectedStudent.phone || "";
    elements.updCourse.value = selectedStudent.course || "";
    elements.updEmail.value = selectedStudent.email || "";
    elements.updStudentId.value = selectedStudent.studentId || "";
    elements.welcomeText.textContent = `${appState.currentUser.name} (${appState.currentUser.role})`;
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
    const rows = appState.users
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

    elements.usersTableBody.innerHTML = rows || `<tr><td colspan="8">No users found.</td></tr>`;

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
                <td>${book.isbn}</td>
                <td>${book.category}</td>
                <td>${availabilityText}</td>
                <td>${actions}</td>
            </tr>`;
        })
        .join("");

    elements.booksTableBody.innerHTML = rows || `<tr><td colspan="7">No books found.</td></tr>`;

    elements.booksTableBody.querySelectorAll("[data-book-action]").forEach((button) => {
        button.addEventListener("click", () => handleBookAction(button.dataset.bookAction, button.dataset.bookId));
    });
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
    const visibleIssues = isAdmin()
        ? appState.issues
        : appState.issues.filter((issue) => issue.studentId === appState.currentUser.id);

    const rows = visibleIssues
        .map((issue) => {
            const book = appState.books.find((item) => item.id === issue.bookId);
            const student = appState.users.find((item) => item.id === issue.studentId);
            const overdue = isOverdue(issue);
            const statusText = issue.status === "issued" && overdue ? "issued (overdue)" : issue.status;
            const fineAmount = getCurrentFine(issue);
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
                <td>${actionBtn}</td>
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
    const totalFine = appState.issues.reduce((sum, issue) => sum + getCurrentFine(issue), 0);

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
            return `<li>${book ? book.title : "-"} - ${student ? student.name : "-"}${fineText}</li>`;
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
    return issue.status === "issued" && new Date(issue.dueDate) < new Date(getToday());
}

function getCurrentFine(issue) {
    const storedFine = Number(issue.fine || 0);
    if (issue.status === "returned") {
        return storedFine;
    }

    if (!isOverdue(issue)) {
        return 0;
    }

    return calculateFine(issue.dueDate, getToday());
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

initApp();