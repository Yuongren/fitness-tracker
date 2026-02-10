import React from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { Link } from 'react-router-dom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

function About() {
    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <FitnessCenterIcon sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Fitness Tracker
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
                    Your Personal Fitness Companion - Track, Plan, and Achieve Your Goals
                </Typography>
            </Box>

            {/* What is Fitness Tracker */}
            <Paper elevation={3} sx={{ p: 4, mb: 6, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#4CAF50' }}>
                    📱 What is Fitness Tracker?
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                    Fitness Tracker is a comprehensive web application designed to help you monitor and manage your fitness journey. 
                    Whether you're a beginner starting your wellness journey or an experienced athlete, this app provides all the tools 
                    you need to log activities, track progress, set goals, and stay motivated.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    With real-time statistics, smart goal management, workout scheduling, and push notifications, Fitness Tracker 
                    transforms your fitness routine into a structured, achievable plan. Track every step, every workout, and every 
                    achievement on your path to better health.
                </Typography>
            </Paper>

            {/* Key Features */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#4CAF50' }}>
                ✨ Key Features
            </Typography>

            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <LocalFireDepartmentIcon sx={{ mr: 1, color: '#ff6b6b', fontSize: 32 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Activity Logging
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Log various activities like running, cycling, weightlifting, yoga, swimming, and walking. 
                                Track duration, distance, and calories burned for each session.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <DirectionsWalkIcon sx={{ mr: 1, color: '#ff9800', fontSize: 32 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Steps Tracking
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Automatically track your daily steps, distance covered, and time spent walking. 
                                View daily summaries and weekly progress to stay motivated.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmojiEventsIcon sx={{ mr: 1, color: '#2196f3', fontSize: 32 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Goal Management
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Set daily, weekly, or monthly fitness goals. Track progress in real-time and receive 
                                notifications when you achieve your targets.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CalendarMonthIcon sx={{ mr: 1, color: '#9c27b0', fontSize: 32 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Calendar & Scheduling
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Plan workouts by scheduling them on specific dates and times. 
                                View your entire fitness calendar at a glance.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <NotificationsIcon sx={{ mr: 1, color: '#f44336', fontSize: 32 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Smart Reminders
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Receive browser notifications before your scheduled workouts. 
                                Customize reminder times to stay on track.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingUpIcon sx={{ mr: 1, color: '#4caf50', fontSize: 32 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Statistics & Analytics
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                View comprehensive statistics on your activities, including total duration, 
                                calories burned, distance covered, and more.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* How to Get Started */}
            <Paper elevation={3} sx={{ p: 4, mb: 6, backgroundColor: '#e8f5e9' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#4CAF50' }}>
                    🚀 How to Get Started
                </Typography>

                <List sx={{ mb: 2 }}>
                    <ListItem>
                        <ListItemIcon>
                            <Typography sx={{ fontWeight: 'bold', color: '#4CAF50' }}>1</Typography>
                        </ListItemIcon>
                        <ListItemText
                            primary="Create Your Account"
                            secondary="Register with your email and create a secure password. Fill in your profile with basic fitness information like age, weight, and fitness level."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Typography sx={{ fontWeight: 'bold', color: '#4CAF50' }}>2</Typography>
                        </ListItemIcon>
                        <ListItemText
                            primary="Log Your First Activity"
                            secondary="Navigate to Activities and log your first workout. Choose the activity type (running, cycling, etc.), duration, distance, and calories burned."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Typography sx={{ fontWeight: 'bold', color: '#4CAF50' }}>3</Typography>
                        </ListItemIcon>
                        <ListItemText
                            primary="Set Your Goals"
                            secondary="Go to Goals and set meaningful fitness targets - weekly workouts, total calories burned, distance covered, or custom goals."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Typography sx={{ fontWeight: 'bold', color: '#4CAF50' }}>4</Typography>
                        </ListItemIcon>
                        <ListItemText
                            primary="Schedule Your Workouts"
                            secondary="Use the Calendar feature to schedule future workouts. Set specific dates, times, and enable notifications to get reminders."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Typography sx={{ fontWeight: 'bold', color: '#4CAF50' }}>5</Typography>
                        </ListItemIcon>
                        <ListItemText
                            primary="Track Your Progress"
                            secondary="Visit your Dashboard to view statistics, activity summaries, and progress towards your goals. Monitor your steps daily."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Typography sx={{ fontWeight: 'bold', color: '#4CAF50' }}>6</Typography>
                        </ListItemIcon>
                        <ListItemText
                            primary="Stay Consistent"
                            secondary="Use the app regularly to log activities and track progress. Leverage the notification system to maintain consistency in your fitness routine."
                        />
                    </ListItem>
                </List>
            </Paper>

            {/* Activity Types */}
            <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#4CAF50' }}>
                    💪 Supported Activities
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ p: 2, backgroundColor: '#fff3e0', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="h6">🏃</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Running</Typography>
                            <Typography variant="caption" color="textSecondary">600-900 cal/hr</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="h6">🚴</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Cycling</Typography>
                            <Typography variant="caption" color="textSecondary">400-800 cal/hr</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ p: 2, backgroundColor: '#f3e5f5', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="h6">🏋️</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Weightlifting</Typography>
                            <Typography variant="caption" color="textSecondary">300-600 cal/hr</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="h6">🧘</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Yoga</Typography>
                            <Typography variant="caption" color="textSecondary">200-400 cal/hr</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ p: 2, backgroundColor: '#e0f2f1', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="h6">🏊</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Swimming</Typography>
                            <Typography variant="caption" color="textSecondary">500-900 cal/hr</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ p: 2, backgroundColor: '#fce4ec', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="h6">🚶</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Walking</Typography>
                            <Typography variant="caption" color="textSecondary">200-400 cal/hr</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Call to Action */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#4CAF50' }}>
                    ✅ Ready to Start Your Fitness Journey?
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        size="large"
                        component={Link}
                        to="/register"
                        sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#388e3c' } }}
                    >
                        Sign Up Now
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        component={Link}
                        to="/login"
                        sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                    >
                        Login
                    </Button>
                </Box>
            </Box>

            {/* Tips Section */}
            <Paper elevation={3} sx={{ p: 4, backgroundColor: '#fafafa' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#4CAF50' }}>
                    💡 Tips for Success
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                            <CheckCircleIcon sx={{ mr: 2, color: '#4CAF50', mt: 0.5 }} />
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Log Activities Consistently
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    The more data you log, the better insights you get about your fitness patterns and progress.
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                            <CheckCircleIcon sx={{ mr: 2, color: '#4CAF50', mt: 0.5 }} />
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Set Realistic Goals
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Start with achievable targets and gradually increase difficulty. Progress, not perfection.
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                            <CheckCircleIcon sx={{ mr: 2, color: '#4CAF50', mt: 0.5 }} />
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Enable Notifications
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Turn on workout reminders to maintain consistency and never miss a scheduled session.
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                            <CheckCircleIcon sx={{ mr: 2, color: '#4CAF50', mt: 0.5 }} />
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Review Your Progress Weekly
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Check your dashboard and statistics weekly to celebrate wins and adjust your goals if needed.
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}

export default About;
