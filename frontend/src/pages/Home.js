import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Paper,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    const features = [
        {
            icon: <FitnessCenterIcon sx={{ fontSize: 50, color: '#4CAF50', mb: 2 }} />,
            title: 'Activity Logging',
            description: 'Track all your workouts with detailed metrics including duration, calories, and distance.',
        },
        {
            icon: <TrendingUpIcon sx={{ fontSize: 50, color: '#2196F3', mb: 2 }} />,
            title: 'Progress Analytics',
            description: 'View your fitness journey with comprehensive statistics and visualizations.',
        },
        {
            icon: <EmojiEventsIcon sx={{ fontSize: 50, color: '#FF9800', mb: 2 }} />,
            title: 'Goal Setting',
            description: 'Set and track fitness goals for daily, weekly, and monthly targets.',
        },
        {
            icon: <TimerIcon sx={{ fontSize: 50, color: '#9C27B0', mb: 2 }} />,
            title: 'Step Counting',
            description: 'Monitor your daily steps with distance and duration tracking.',
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 50, color: '#F44336', mb: 2 }} />,
            title: 'Secure & Private',
            description: 'Your fitness data is encrypted and kept completely private.',
        },
        {
            icon: <GroupsIcon sx={{ fontSize: 50, color: '#00BCD4', mb: 2 }} />,
            title: 'Smart Scheduling',
            description: 'Schedule workouts with reminders and track them on your calendar.',
        },
    ];

    const stats = [
        { number: '1000+', label: 'Active Users' },
        { number: '50K+', label: 'Workouts Logged' },
        { number: '5M+', label: 'Steps Tracked' },
        { number: '100%', label: 'Satisfaction Rate' },
    ];

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <FitnessCenterIcon sx={{ fontSize: 80 }} />
                    </Box>
                    <Typography
                        variant="h2"
                        sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '2.5rem', md: '4rem' } }}
                    >
                        Fitness Tracker
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                        Your Personal Fitness Companion
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ mb: 4, maxWidth: 600, mx: 'auto', fontSize: '1.1rem', opacity: 0.9 }}
                    >
                        Track your workouts, achieve your goals, and transform your fitness journey with intelligent analytics and personalized insights.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleGetStarted}
                            sx={{
                                bgcolor: 'white',
                                color: '#4CAF50',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                '&:hover': { bgcolor: '#f0f0f0' },
                            }}
                        >
                            {user ? '🚀 Go to Dashboard' : '🚀 Get Started'}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            component={Link}
                            to="/about"
                            sx={{
                                color: 'white',
                                borderColor: 'white',
                                px: 4,
                                py: 1.5,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                            }}
                        >
                            Learn More
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Stats Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Grid container spacing={3}>
                    {stats.map((stat, index) => (
                        <Grid item xs={6} md={3} key={index}>
                            <Paper
                                sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                }}
                            >
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                                    {stat.number}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#666' }}>
                                    {stat.label}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography
                    variant="h3"
                    sx={{ textAlign: 'center', fontWeight: 'bold', mb: 6, color: '#333' }}
                >
                    🌟 Powerful Features
                </Typography>
                <Grid container spacing={3}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Card sx={{ height: '100%', boxShadow: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    {feature.icon}
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* How It Works Section */}
            <Box sx={{ bgcolor: '#f9f9f9', py: 8 }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        sx={{ textAlign: 'center', fontWeight: 'bold', mb: 6, color: '#333' }}
                    >
                        📋 How It Works
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                            <Box sx={{ mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        bgcolor: '#4CAF50',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.8rem',
                                        mx: 'auto',
                                    }}
                                >
                                    1️⃣
                                </Box>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Sign Up
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Create your free account in seconds
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                            <Box sx={{ mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        bgcolor: '#2196F3',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.8rem',
                                        mx: 'auto',
                                    }}
                                >
                                    2️⃣
                                </Box>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Log Activities
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Record your workouts with details
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                            <Box sx={{ mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        bgcolor: '#FF9800',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.8rem',
                                        mx: 'auto',
                                    }}
                                >
                                    3️⃣
                                </Box>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Set Goals
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Define your fitness objectives
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                            <Box sx={{ mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        bgcolor: '#9C27B0',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.8rem',
                                        mx: 'auto',
                                    }}
                                >
                                    4️⃣
                                </Box>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Track Progress
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Watch your fitness transform
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Testimonials Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography
                    variant="h3"
                    sx={{ textAlign: 'center', fontWeight: 'bold', mb: 6, color: '#333' }}
                >
                    💬 What Users Say
                </Typography>
                <Grid container spacing={3}>
                    {[
                        {
                            name: 'Alex Johnson',
                            role: 'Fitness Enthusiast',
                            message: 'Fitness Tracker has been a game-changer for my fitness journey. The analytics are incredible!',
                        },
                        {
                            name: 'Sarah Williams',
                            role: 'Athlete',
                            message: 'I love the goal-setting feature. It keeps me motivated and on track every single day.',
                        },
                        {
                            name: 'Mike Chen',
                            role: 'Busy Professional',
                            message: 'Simple, effective, and exactly what I needed to stay accountable to my fitness goals.',
                        },
                    ].map((testimonial, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card sx={{ height: '100%', boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: '#666' }}>
                                        "{testimonial.message}"
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                        {testimonial.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {testimonial.role}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* CTA Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
                    color: 'white',
                    py: 8,
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Ready to Transform Your Fitness?
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', opacity: 0.9 }}>
                        Join thousands of users already tracking their fitness journey
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleGetStarted}
                            sx={{
                                bgcolor: 'white',
                                color: '#4CAF50',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                '&:hover': { bgcolor: '#f0f0f0' },
                            }}
                        >
                            {user ? 'Go to Dashboard' : 'Sign Up Now'}
                        </Button>
                        {!user && (
                            <Button
                                variant="outlined"
                                size="large"
                                component={Link}
                                to="/login"
                                sx={{
                                    color: 'white',
                                    borderColor: 'white',
                                    px: 4,
                                    py: 1.5,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                                }}
                            >
                                Sign In
                            </Button>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: '#333', color: 'white', py: 4, textAlign: 'center' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2">
                        © 2026 Fitness Tracker. All rights reserved. Made with ❤️ for fitness enthusiasts.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Home;
