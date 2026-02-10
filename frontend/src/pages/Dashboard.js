import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    ButtonGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { statsAPI, activitiesAPI, workoutsAPI } from '../services/api';
import Activities from './Activities';
import Goals from './Goals';
import Steps from './Steps';
import Calendar from './Calendar';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [summary, setSummary] = useState({});
    const [recentActivities, setRecentActivities] = useState([]);
    const [activitiesFull, setActivitiesFull] = useState([]);
    const [upcomingWorkouts, setUpcomingWorkouts] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [tabValue, setTabValue] = useState(0);
    const [recentAnchor, setRecentAnchor] = useState(null);
    const [recentDialogOpen, setRecentDialogOpen] = useState(false);
    const [selectedRecentActivity, setSelectedRecentActivity] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, [selectedPeriod]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, summaryRes, activitiesRes, upcomingRes] = await Promise.all([
                statsAPI.getStats(),
                activitiesAPI.getSummary(),
                activitiesAPI.getActivities(),
                workoutsAPI.getUpcomingWorkouts(),
            ]);
            
            setStats(statsRes.data);
            setSummary(summaryRes.data);
            setRecentActivities(activitiesRes.data.slice(0, 5));
            setActivitiesFull(activitiesRes.data || []);
            setUpcomingWorkouts(upcomingRes.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const lineChartData = {
        labels: Object.keys(summary).slice(-7),
        datasets: [
            {
                label: 'Calories Burned',
                data: Object.values(summary).slice(-7).map(day => day.total_calories),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const doughnutData = stats ? {
        labels: Object.keys(stats.activity_distribution),
        datasets: [
            {
                data: Object.values(stats.activity_distribution),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                ],
            },
        ],
    } : null;

    return (
        <Container maxWidth="xl" className="dashboard-container">
            {/* Navigation Tabs */}
            <Paper className="tabs-paper">
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="📊 Overview" />
                    <Tab label="🏃 Activities" />
                    <Tab label="🎯 Goals" />
                    <Tab label="👟 Steps" />
                    <Tab label="📅 Calendar & Schedule" />
                </Tabs>
            </Paper>

            {/* Tab Content */}
            {tabValue === 0 && (
            <>
                <Box className="dashboard-header" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        📊 Fitness Dashboard
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Stay motivated and track your fitness journey
                    </Typography>
                </Box>
                <ButtonGroup variant="outlined" size="small">
                    <Button 
                        onClick={() => setSelectedPeriod('week')}
                        variant={selectedPeriod === 'week' ? 'contained' : 'outlined'}
                    >
                        This Week
                    </Button>
                    <Button 
                        onClick={() => setSelectedPeriod('last-week')}
                        variant={selectedPeriod === 'last-week' ? 'contained' : 'outlined'}
                    >
                        Last Week
                    </Button>
                    <Button 
                        onClick={() => setSelectedPeriod('month')}
                        variant={selectedPeriod === 'month' ? 'contained' : 'outlined'}
                    >
                        This Month
                    </Button>
                    <Button 
                        onClick={() => setSelectedPeriod('last-month')}
                        variant={selectedPeriod === 'last-month' ? 'contained' : 'outlined'}
                    >
                        Last Month
                    </Button>
                </ButtonGroup>
            </Box>

            <Grid container spacing={3}>
                {/* Stats Cards - Full Width Top Row */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%', boxShadow: 2, '&:hover': { boxShadow: 4, transform: 'translateY(-4px)' }, transition: 'all 0.3s ease' }}>
                        <CardContent>
                            <Typography color="inherit" gutterBottom variant="caption" sx={{ opacity: 0.9 }}>
                                Weekly Workouts
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                                {stats?.weekly_stats?.activity_count || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                Keep it up! 💪
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%', boxShadow: 2, '&:hover': { boxShadow: 4, transform: 'translateY(-4px)' }, transition: 'all 0.3s ease' }}>
                        <CardContent>
                            <Typography color="inherit" gutterBottom variant="caption" sx={{ opacity: 0.9 }}>
                                Total Duration
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                                {stats?.weekly_stats?.total_duration || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                min | On track!
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: '100%', boxShadow: 2, '&:hover': { boxShadow: 4, transform: 'translateY(-4px)' }, transition: 'all 0.3s ease' }}>
                        <CardContent>
                            <Typography color="inherit" gutterBottom variant="caption" sx={{ opacity: 0.9 }}>
                                Calories Burned
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                                {stats?.weekly_stats?.total_calories?.toFixed(0) || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                Great effort! 🔥
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', height: '100%', boxShadow: 2, '&:hover': { boxShadow: 4, transform: 'translateY(-4px)' }, transition: 'all 0.3s ease' }}>
                        <CardContent>
                            <Typography color="inherit" gutterBottom variant="caption" sx={{ opacity: 0.9 }}>
                                Total Distance
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                                {stats?.weekly_stats?.total_distance?.toFixed(1) || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                km | Going strong! 🚀
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Charts - Better Layout */}
                <Grid item xs={12} lg={8}>
                    <Paper className="paper-p2" sx={{ height: '100%', boxShadow: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            📈 7-Day Progress
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper className="paper-p2" sx={{ height: '100%', boxShadow: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            🎯 Activity Distribution
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            {doughnutData && <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />}
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent Activities (dropdown + dialog) */}
                <Grid item xs={12} lg={4}>
                    <Paper className="paper-p2" sx={{ boxShadow: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                            🏃 Recent Activities
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                            <Button variant="contained" fullWidth onClick={(e) => setRecentAnchor(e.currentTarget)}>
                                View Recent Activities
                            </Button>
                            <Menu
                                anchorEl={recentAnchor}
                                open={Boolean(recentAnchor)}
                                onClose={() => setRecentAnchor(null)}
                            >
                                {recentActivities.length === 0 && (
                                    <MenuItem disabled>No recent activities</MenuItem>
                                )}
                                {recentActivities.map((activity) => (
                                    <MenuItem key={activity.id} onClick={() => { setRecentDialogOpen(true); setRecentAnchor(null); }}>
                                        {activity.activity_type} — {new Date(activity.date).toLocaleDateString()}
                                    </MenuItem>
                                ))}
                            </Menu>

                            <Dialog open={recentDialogOpen} onClose={() => setRecentDialogOpen(false)} maxWidth="md" fullWidth>
                                <DialogTitle sx={{ fontWeight: 'bold' }}>📋 All Activities</DialogTitle>
                                <DialogContent>
                                    {activitiesFull && activitiesFull.length > 0 ? (
                                        <TableContainer sx={{ mt: 2 }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Activity Type</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Duration (min)</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Calories</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Distance (km)</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {activitiesFull.map((activity) => (
                                                        <TableRow key={activity.id} hover>
                                                            <TableCell>{activity.activity_type}</TableCell>
                                                            <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                                                            <TableCell>{activity.duration}</TableCell>
                                                            <TableCell>{activity.calories_burned ?? 'N/A'}</TableCell>
                                                            <TableCell>{activity.distance ?? 'N/A'}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                                            No activities recorded yet. Start logging your workouts!
                                        </Typography>
                                    )}
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setRecentDialogOpen(false)}>Close</Button>
                                </DialogActions>
                            </Dialog>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            </>
            )}

            {/* Activities Tab */}
            {tabValue === 1 && <Activities />}

            {/* Goals Tab */}
            {tabValue === 2 && <Goals />}

            {/* Steps Tab */}
            {tabValue === 3 && <Steps />}

            {/* Calendar Tab */}
            {tabValue === 4 && <Calendar />}
        </Container>
    );
};

export default Dashboard;