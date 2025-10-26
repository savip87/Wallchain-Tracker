let currentPage = 1;
let currentUsername = '';
let totalPages = 1;
const pageSize = 10;

// Demo mode - will be used when API is not accessible
const DEMO_MODE = false; // Set to true to test with demo data

// Demo data for testing
const DEMO_DATA = {
    data: [
        {
            username: 'DemoUser',
            totalPoints: 15420,
            projects: [
                { name: 'Uniswap', points: 3500 },
                { name: 'Aave', points: 2800 },
                { name: 'Compound', points: 2100 },
                { name: 'SushiSwap', points: 1900 },
                { name: 'Curve', points: 1750 },
                { name: 'Balancer', points: 1520 },
                { name: '1inch', points: 1200 },
                { name: 'Yearn', points: 650 }
            ]
        },
        {
            username: 'TestUser',
            totalPoints: 8750,
            projects: [
                { name: 'Uniswap', points: 2500 },
                { name: 'Aave', points: 2000 },
                { name: 'Compound', points: 1500 },
                { name: 'SushiSwap', points: 1250 },
                { name: 'Curve', points: 1000 },
                { name: 'Balancer', points: 500 }
            ]
        }
    ],
    hasNextPage: true,
    currentPage: 1,
    totalPages: 5
};

// Поиск пользователя
async function searchUser() {
    const username = document.getElementById('usernameInput').value.trim();
    
    if (!username) {
        showError('Пожалуйста, введите никнейм');
        return;
    }
    
    currentUsername = username;
    currentPage = 1;
    await fetchUserData();
}

// Получение данных с API
async function fetchUserData() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const resultsEl = document.getElementById('results');
    
    // Показываем загрузку
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    resultsEl.classList.add('hidden');
    
    try {
        let data;
        
        // Use demo data if in demo mode
        if (DEMO_MODE) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            data = DEMO_DATA;
        } else {
            const response = await fetch(
                `https://api.wallchain.xyz/voices/points/paginated?pageSize=${pageSize}&page=${currentPage}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            data = await response.json();
        }
        
        // Поиск пользователя в данных
        const userData = findUserInData(data, currentUsername);
        
        if (userData) {
            displayUserData(userData, data);
        } else {
            // Если не найден на текущей странице, попробуем поискать на других
            const foundData = await searchUserInAllPages(currentUsername);
            if (foundData) {
                displayUserData(foundData.user, foundData.pageData);
            } else {
                showError(`Пользователь "${currentUsername}" не найден`);
            }
        }
        
    } catch (error) {
        console.error('Error fetching data:', error);
        showError('Ошибка при загрузке данных. Проверьте соединение и попробуйте снова.');
    } finally {
        loadingEl.classList.add('hidden');
    }
}

// Поиск пользователя в данных
function findUserInData(data, username) {
    if (!data || !data.data) return null;
    
    const usernameLower = username.toLowerCase();
    return data.data.find(user => 
        user.username && user.username.toLowerCase() === usernameLower
    );
}

// Поиск пользователя на всех страницах
async function searchUserInAllPages(username) {
    // Skip multi-page search in demo mode
    if (DEMO_MODE) {
        return null;
    }
    
    // Попробуем первые 10 страниц
    for (let page = 1; page <= 10; page++) {
        try {
            const response = await fetch(
                `https://api.wallchain.xyz/voices/points/paginated?pageSize=${pageSize}&page=${page}`
            );
            
            if (!response.ok) break;
            
            const data = await response.json();
            const user = findUserInData(data, username);
            
            if (user) {
                currentPage = page;
                return { user, pageData: data };
            }
            
            // Если достигли последней страницы
            if (!data.hasNextPage) break;
            
        } catch (error) {
            console.error(`Error searching page ${page}:`, error);
            break;
        }
    }
    
    return null;
}

// Отображение данных пользователя
function displayUserData(userData, pageData) {
    const resultsEl = document.getElementById('results');
    const userNameEl = document.getElementById('userName');
    const totalPointsEl = document.getElementById('totalPoints');
    const projectsListEl = document.getElementById('projectsList');
    
    // Отображаем имя пользователя
    userNameEl.textContent = userData.username || currentUsername;
    
    // Общие баллы
    const totalPoints = userData.totalPoints || 0;
    totalPointsEl.textContent = totalPoints.toLocaleString();
    
    // Очищаем список проектов
    projectsListEl.innerHTML = '';
    
    // Отображаем баллы по проектам
    if (userData.projects && Array.isArray(userData.projects)) {
        userData.projects.forEach(project => {
            const projectCard = createProjectCard(project);
            projectsListEl.appendChild(projectCard);
        });
    } else if (userData.pointsByProject) {
        // Альтернативная структура данных
        Object.entries(userData.pointsByProject).forEach(([projectName, points]) => {
            const projectCard = createProjectCard({ name: projectName, points: points });
            projectsListEl.appendChild(projectCard);
        });
    } else {
        projectsListEl.innerHTML = '<p class="no-projects">Нет данных по проектам</p>';
    }
    
    // Обновляем пагинацию
    updatePagination(pageData);
    
    // Показываем результаты
    resultsEl.classList.remove('hidden');
}

// Создание карточки проекта
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const projectName = project.name || project.projectName || 'Неизвестный проект';
    const points = project.points || project.totalPoints || 0;
    
    card.innerHTML = `
        <div class="project-name">${projectName}</div>
        <div class="project-points">${points.toLocaleString()} баллов</div>
    `;
    
    return card;
}

// Обновление пагинации
function updatePagination(data) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    pageInfo.textContent = `Страница ${currentPage}`;
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = !data.hasNextPage;
}

// Предыдущая страница
async function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        await fetchUserData();
    }
}

// Следующая страница
async function nextPage() {
    currentPage++;
    await fetchUserData();
}

// Показать ошибку
function showError(message) {
    const errorEl = document.getElementById('error');
    const resultsEl = document.getElementById('results');
    
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    resultsEl.classList.add('hidden');
}

// Обработка Enter в поле ввода
document.getElementById('usernameInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchUser();
    }
});
