import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import Steps from './pages/Steps';
import Calendar from './pages/Calendar';
import About from './pages/About';

const theme = createTheme({
    palette: {
        primary: {
            main: '#4CAF50',
        },
        secondary: {
            main: '#2196F3',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/about" element={<About />} />
                        
                        <Route element={<PrivateRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/activities" element={<Activities />} />
                            <Route path="/goals" element={<Goals />} />
                            <Route path="/steps" element={<Steps />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;