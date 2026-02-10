import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('API Request:', {
            url: config.url,
            method: config.method,
            data: config.data,
            hasToken: !!token
        });
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('No token found in localStorage');
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
API.interceptors.response.use(
    (response) => {
        console.log('API Response Success:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('API Error Details:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, redirecting to login');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (userData) => API.post('/auth/register', userData),
    login: (credentials) => API.post('/auth/login', credentials),
    getProfile: () => API.get('/auth/profile'),
    updateProfile: (profileData) => API.put('/auth/profile', profileData),
    checkAuth: () => API.get('/auth/check'),
};

export const activitiesAPI = {
    logActivity: (activityData) => {
        console.log('=== LOGGING ACTIVITY ===');
        console.log('Data to send:', JSON.stringify(activityData));
        console.log('Data type:', typeof activityData);
        console.log('Data keys:', Object.keys(activityData));
        return API.post('/activities', activityData);
    },
    getActivities: () => API.get('/activities'),
    deleteActivity: (id) => API.delete(`/activities/${id}`),
    getSummary: () => API.get('/activities/summary'),
};

export const goalsAPI = {
    setGoal: (goalData) => {
        console.log('Sending goal data:', goalData);  // Debug log
        return API.post('/goals', goalData);
    },
    getGoals: () => {
        console.log('Getting goals...');  // Debug log
        return API.get('/goals');
    },
    updateGoal: (id, goalData) => API.put(`/goals/${id}`, goalData),
    deleteGoal: (id) => API.delete(`/goals/${id}`),
};

export const statsAPI = {
    getStats: () => API.get('/stats'),
};

export const stepsAPI = {
    logSteps: (stepsData) => {
        console.log('👟 Logging steps:', stepsData);
        return API.post('/steps', stepsData).then(response => response.data);
    },
    getSteps: (limit = 30) => {
        console.log('👟 Getting steps...');
        return API.get(`/steps?limit=${limit}`).then(response => response.data);
    },
    getStepsByDate: (date) => {
        console.log(`👟 Getting steps for date: ${date}`);
        return API.get(`/steps?date=${date}`).then(response => response.data);
    },
    updateSteps: (id, stepsData) => {
        console.log(`👟 Updating step entry ${id}:`, stepsData);
        return API.put(`/steps/${id}`, stepsData).then(response => response.data);
    },
    deleteSteps: (id) => {
        console.log(`👟 Deleting step entry ${id}`);
        return API.delete(`/steps/${id}`).then(response => response.data);
    },
    getStepsSummary: (days = 30) => {
        console.log(`👟 Getting steps summary for ${days} days...`);
        return API.get(`/steps/summary?days=${days}`).then(response => response.data);
    },
};

export const workoutsAPI = {
    scheduleWorkout: (workoutData) => {
        console.log('📅 Scheduling workout:', workoutData);
        return API.post('/workouts/schedule', workoutData).then(response => response.data);
    },
    getScheduledWorkouts: (startDate = null, endDate = null, goalType = null) => {
        console.log('📅 Getting scheduled workouts...');
        let url = '/workouts/schedule';
        const params = [];
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        if (goalType) params.push(`goal_type=${goalType}`);
        if (params.length > 0) url += '?' + params.join('&');
        return API.get(url).then(response => response.data);
    },
    updateScheduledWorkout: (id, workoutData) => {
        console.log(`📅 Updating scheduled workout ${id}:`, workoutData);
        return API.put(`/workouts/schedule/${id}`, workoutData).then(response => response.data);
    },
    deleteScheduledWorkout: (id) => {
        console.log(`📅 Deleting scheduled workout ${id}`);
        return API.delete(`/workouts/schedule/${id}`).then(response => response.data);
    },
    getUpcomingWorkouts: (days = 7) => {
        console.log(`📅 Getting upcoming workouts for ${days} days...`);
        return API.get(`/workouts/upcoming?days=${days}`).then(response => response.data);
    },
    markWorkoutComplete: (id) => {
        console.log(`📅 Marking workout ${id} as complete`);
        return API.put(`/workouts/schedule/${id}`, { is_completed: true }).then(response => response.data);
    },
};