const API_BASE_URL = 'https://api.wallchain.xyz/voices/points/paginated';
const PAGE_SIZE = 100; // Fetch more results to increase chance of finding user
const MAX_PAGES_TO_FETCH = 10; // Limit to first 10 pages for performance

// Store all fetched data
let allUsers = [];
let currentPage = 1;
let totalPages = 1;

// Search for user by nickname
async function searchUser() {
    const nickname = document.getElementById('nicknameInput').value.trim();
    
    if (!nickname) {
        showError('Please enter a nickname');
        return;
    }

    // Reset state
    allUsers = [];
    currentPage = 1;
    
    // Show loading state
    setLoadingState(true);
    hideError();
    hideResults();

    try {
        // Fetch data from API
        await fetchAllPages(nickname);
        
        // Find user in fetched data
        const user = findUser(nickname);
        
        if (user) {
            displayUserData(user);
        } else {
            showError(`User "${nickname}" not found in the leaderboard. Please check the nickname and try again.`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        showError('Failed to fetch data from API. Please try again later.');
    } finally {
        setLoadingState(false);
    }
}

// Fetch pages until user is found or all pages are fetched
async function fetchAllPages(nickname) {
    let found = false;
    
    while (!found && currentPage <= MAX_PAGES_TO_FETCH) {
        const data = await fetchPage(currentPage);
        
        if (!data || !data.data) {
            break;
        }
        
        allUsers = allUsers.concat(data.data);
        
        // Check if user is in current batch
        if (findUser(nickname)) {
            found = true;
            break;
        }
        
        // Check if there are more pages
        if (data.pagination) {
            totalPages = data.pagination.totalPages || 1;
            if (currentPage >= totalPages) {
                break;
            }
        } else {
            break;
        }
        
        currentPage++;
    }
}

// Fetch a single page from API
async function fetchPage(page) {
    const url = `${API_BASE_URL}?pageSize=${PAGE_SIZE}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Find user by nickname (case-insensitive)
function findUser(nickname) {
    const normalizedNickname = nickname.toLowerCase().trim();
    return allUsers.find(user => {
        const userName = (user.username || user.name || user.address || '').toLowerCase().trim();
        return userName === normalizedNickname;
    });
}

// Extract points from project object
function getProjectPoints(project) {
    return project.points || project.totalPoints || 0;
}

// Display user data
function displayUserData(user) {
    // Update user name
    const userName = user.username || user.name || user.address || 'Unknown User';
    document.getElementById('userName').textContent = userName;
    
    // Calculate total points
    const projects = user.projects || user.projectPoints || [];
    const totalPoints = projects.reduce((sum, project) => {
        return sum + getProjectPoints(project);
    }, 0);
    
    // Update stats
    document.getElementById('totalPoints').textContent = formatNumber(totalPoints);
    document.getElementById('projectCount').textContent = projects.length;
    
    // Update rank if available
    const rank = user.rank || user.position || findUserRank(user);
    document.getElementById('userRank').textContent = rank > 0 ? `#${rank}` : '-';
    
    // Display projects
    displayProjects(projects);
    
    // Show results
    document.getElementById('results').style.display = 'block';
}

// Find user rank in all users
function findUserRank(user) {
    const userId = user.id || user.address || user.username;
    const index = allUsers.findIndex(u => {
        const uId = u.id || u.address || u.username;
        return uId === userId;
    });
    return index >= 0 ? index + 1 : 0;
}

// Display projects list
function displayProjects(projects) {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';
    
    if (!projects || projects.length === 0) {
        projectsList.innerHTML = '<p>No projects found for this user.</p>';
        return;
    }
    
    // Sort projects by points (descending)
    const sortedProjects = [...projects].sort((a, b) => {
        const pointsA = getProjectPoints(a);
        const pointsB = getProjectPoints(b);
        return pointsB - pointsA;
    });
    
    sortedProjects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsList.appendChild(projectCard);
    });
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const projectName = project.projectName || project.name || 'Unknown Project';
    const points = getProjectPoints(project);
    
    let detailsHTML = '';
    
    // Add additional details if available
    if (project.category) {
        detailsHTML += `<div class="project-detail-item">📁 Category: ${project.category}</div>`;
    }
    if (project.referrals || project.referralCount) {
        const refCount = project.referrals || project.referralCount;
        detailsHTML += `<div class="project-detail-item">👥 Referrals: ${refCount}</div>`;
    }
    if (project.lastActivity || project.lastUpdated) {
        const dateStr = project.lastActivity || project.lastUpdated;
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                detailsHTML += `<div class="project-detail-item">🕒 Last Activity: ${date.toLocaleDateString()}</div>`;
            }
        } catch (e) {
            // Ignore invalid dates
        }
    }
    
    card.innerHTML = `
        <div class="project-name">${projectName}</div>
        <div class="project-points">${formatNumber(points)} points</div>
        ${detailsHTML ? `<div class="project-details">${detailsHTML}</div>` : ''}
    `;
    
    return card;
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Hide error message
function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// Hide results
function hideResults() {
    document.getElementById('results').style.display = 'none';
}

// Set loading state
function setLoadingState(isLoading) {
    const searchBtn = document.getElementById('searchBtn');
    const searchBtnText = document.getElementById('searchBtnText');
    const searchBtnLoading = document.getElementById('searchBtnLoading');
    
    searchBtn.disabled = isLoading;
    searchBtnText.style.display = isLoading ? 'none' : 'inline';
    searchBtnLoading.style.display = isLoading ? 'inline' : 'none';
}

// Allow Enter key to trigger search
document.getElementById('nicknameInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchUser();
    }
});
