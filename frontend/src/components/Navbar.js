import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Box,
    Container,
    Menu,
    MenuItem,
    Divider,
    IconButton,
    Badge,
    Popover,
    List,
    ListItem,
    ListItemText,
    Chip,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'workout', message: 'Your morning run is in 15 minutes', time: '5 min ago' },
        { id: 2, type: 'goal', message: 'Goal achieved: 10,000 steps', time: '1 hour ago' },
        { id: 3, type: 'activity', message: 'Activity logged: 5km run', time: '2 hours ago' },
    ]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNotificationOpen = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const clearNotifications = () => {
        setNotifications([]);
        handleNotificationClose();
    };

    const notificationsOpen = Boolean(notificationAnchor);
    const notificationId = notificationsOpen ? 'notification-popover' : undefined;

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Left Section - Logo and Brand ONLY */}
                    <FitnessCenterIcon sx={{ mr: 2 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        to="/"
                        sx={{
                            fontWeight: 700,
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Fitness Tracker
                    </Typography>

                    {/* Right Section - Everything Else */}
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Home Link */}
                        <Button
                            component={Link}
                            to="/"
                            sx={{ color: 'white', display: 'flex', alignItems: 'center' }}
                        >
                            🏠 Home
                        </Button>

                        {/* Dashboard Link - Only for authenticated users */}
                        {user && (
                            <Button
                                component={Link}
                                to="/dashboard"
                                sx={{ color: 'white', display: 'flex', alignItems: 'center' }}
                            >
                                <DashboardIcon sx={{ mr: 0.5 }} />
                                Dashboard
                            </Button>
                        )}

                        {/* About Link */}
                        <Button
                            component={Link}
                            to="/about"
                            sx={{ color: 'white', display: 'flex', alignItems: 'center' }}
                        >
                            <InfoIcon sx={{ mr: 0.5 }} />
                            About
                        </Button>

                        {/* Notifications - Only for authenticated users */}
                        {user && (
                            <>
                                {/* Notification Icon */}
                                <IconButton
                                    color="inherit"
                                    onClick={handleNotificationOpen}
                                    sx={{ position: 'relative' }}
                                >
                                    <Badge badgeContent={notifications.length} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>

                                {/* Notification Popover */}
                                <Popover
                                    id={notificationId}
                                    open={notificationsOpen}
                                    anchorEl={notificationAnchor}
                                    onClose={handleNotificationClose}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                >
                                    <Box sx={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
                                        <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Notifications
                                                </Typography>
                                                {notifications.length > 0 && (
                                                    <Button
                                                        size="small"
                                                        onClick={clearNotifications}
                                                        sx={{ color: '#666' }}
                                                    >
                                                        Clear All
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                        {notifications.length === 0 ? (
                                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                                <Typography color="textSecondary">
                                                    No notifications yet
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <List sx={{ p: 0 }}>
                                                {notifications.map((notif) => (
                                                    <ListItem
                                                        key={notif.id}
                                                        sx={{
                                                            borderBottom: '1px solid #eee',
                                                            py: 1.5,
                                                            px: 2,
                                                            '&:hover': { backgroundColor: '#f9f9f9' }
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <span>
                                                        {notif.type === 'workout' && '🏃'}
                                                        {notif.type === 'goal' && '🎯'}
                                                        {notif.type === 'activity' && '📊'}
                                                    </span>
                                                                    {notif.message}
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <Chip
                                                                    size="small"
                                                                    label={notif.time}
                                                                    variant="outlined"
                                                                    sx={{ mt: 0.5 }}
                                                                />
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        )}
                                    </Box>
                                </Popover>

                                {/* Profile Icon Button */}
                                <IconButton
                                    component={Link}
                                    to="/profile"
                                    sx={{ color: 'white' }}
                                    title="Profile"
                                >
                                    <PersonIcon />
                                </IconButton>
                            </>
                        )}

                        {user ? (
                            <IconButton 
                                color="inherit" 
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <LogoutIcon />
                            </IconButton>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    component={Link}
                                    to="/login"
                                    sx={{ color: 'white' }}
                                >
                                    Login
                                </Button>
                                <Button
                                    component={Link}
                                    to="/register"
                                    sx={{ color: 'white' }}
                                >
                                    Register
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;