import React, { useState } from 'react';
import { 
    Container, 
    Paper, 
    TextField, 
    Button, 
    Typography, 
    Box,
    Alert,
    CircularProgress,
    MenuItem
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        age: '',
        weight: '',
        height: '',
        fitness_level: 'Beginner'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            // Remove confirmPassword from data sent to API
            const { confirmPassword, ...registerData } = formData;
            
            const response = await authAPI.register(registerData);
            if (response.data.access_token) {
                login(
                    { 
                        id: response.data.user_id, 
                        username: response.data.username 
                    },
                    response.data.access_token
                );
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 4,
                    marginBottom: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Create Account
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                autoComplete="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <TextField
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </Box>

                        <TextField
                            margin="normal"
                            fullWidth
                            id="full_name"
                            label="Full Name"
                            name="full_name"
                            autoComplete="name"
                            value={formData.full_name}
                            onChange={handleChange}
                        />

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                type="number"
                                fullWidth
                                id="age"
                                label="Age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                InputProps={{ inputProps: { min: 1, max: 120 } }}
                            />
                            <TextField
                                type="number"
                                fullWidth
                                id="weight"
                                label="Weight (kg)"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                InputProps={{ inputProps: { min: 1, max: 300, step: 0.1 } }}
                            />
                            <TextField
                                type="number"
                                fullWidth
                                id="height"
                                label="Height (cm)"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                InputProps={{ inputProps: { min: 50, max: 250, step: 0.1 } }}
                            />
                        </Box>

                        <TextField
                            select
                            fullWidth
                            margin="normal"
                            id="fitness_level"
                            label="Fitness Level"
                            name="fitness_level"
                            value={formData.fitness_level}
                            onChange={handleChange}
                        >
                            {fitnessLevels.map((level) => (
                                <MenuItem key={level} value={level}>
                                    {level}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Register'}
                        </Button>
                        
                        <Box textAlign="center">
                            <Typography variant="body2">
                                Already have an account?{' '}
                                <Link to="/login" style={{ textDecoration: 'none' }}>
                                    Login here
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;