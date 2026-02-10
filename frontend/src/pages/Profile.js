import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    MenuItem,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { authAPI, statsAPI, activitiesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        weight: '',
        height: '',
        fitness_level: 'Beginner'
    });

    const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];

    useEffect(() => {
        fetchProfileAndStats();
        loadProfilePicture();
    }, []);

    const loadProfilePicture = () => {
        const savedPicture = localStorage.getItem(`profilePicture_${user?.username}`);
        if (savedPicture) {
            setProfilePicture(savedPicture);
        }
    };

    const fetchProfileAndStats = async () => {
        try {
            const [profileRes, statsRes, activitiesRes] = await Promise.all([
                authAPI.getProfile(),
                statsAPI.getStats(),
                activitiesAPI.getActivities()
            ]);
            
            setProfile(profileRes.data);
            setStats(statsRes.data);
            setActivities(activitiesRes.data || []);
            setFormData({
                full_name: profileRes.data.full_name || '',
                age: profileRes.data.age || '',
                weight: profileRes.data.weight || '',
                height: profileRes.data.height || '',
                fitness_level: profileRes.data.fitness_level || 'Beginner'
            });
        } catch (err) {
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handlePictureUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedFile(reader.result);
            };
            reader.readAsDataURL(file);
            setUploadDialogOpen(true);
        }
    };

    const handleSavePicture = () => {
        if (selectedFile) {
            localStorage.setItem(`profilePicture_${user?.username}`, selectedFile);
            setProfilePicture(selectedFile);
            setSuccess('Profile picture updated successfully!');
            setUploadDialogOpen(false);
            setSelectedFile(null);
        }
    };

    const handleEdit = () => {
        setEditing(true);
        setSuccess('');
        setError('');
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData({
            full_name: profile.full_name || '',
            age: profile.age || '',
            weight: profile.weight || '',
            height: profile.height || '',
            fitness_level: profile.fitness_level || 'Beginner'
        });
    };

    const handleSubmit = async () => {
        try {
            await authAPI.updateProfile(formData);
            setProfile({ ...profile, ...formData });
            updateUser({ username: user.username, ...formData });
            setEditing(false);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Get recent activities
    const recentActivities = activities.slice(0, 5);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                👤 My Profile
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* External profile picture removed — upload moved into Personal Information */}

                {/* Personal Information Section */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    src={profilePicture}
                                    sx={{ width: 64, height: 64, backgroundColor: '#4CAF50' }}
                                >
                                    {!profilePicture && user?.username?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    📋 Personal Information
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="profile-picture-input"
                                    type="file"
                                    onChange={handlePictureUpload}
                                />
                                <label htmlFor="profile-picture-input">
                                    <Button
                                        variant="contained"
                                        component="span"
                                        size="small"
                                        startIcon={<CameraAltIcon />}
                                    >
                                        Upload
                                    </Button>
                                </label>
                                {!editing && (
                                    <Button
                                        variant="outlined"
                                        onClick={handleEdit}
                                        startIcon={<EditIcon />}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {editing ? (
                            <Box component="form">
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Full Name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                />

                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Age"
                                        name="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={handleChange}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Weight (kg)"
                                        name="weight"
                                        type="number"
                                        value={formData.weight}
                                        onChange={handleChange}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Height (cm)"
                                        name="height"
                                        type="number"
                                        value={formData.height}
                                        onChange={handleChange}
                                    />
                                </Box>

                                <TextField
                                    select
                                    fullWidth
                                    margin="normal"
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

                                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmit}
                                        fullWidth
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                        fullWidth
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Username:</strong> {user?.username}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Email:</strong> {profile?.email}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Full Name:</strong> {profile?.full_name || 'Not set'}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Age:</strong> {profile?.age || 'Not set'}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Weight:</strong> {profile?.weight ? `${profile.weight} kg` : 'Not set'}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Height:</strong> {profile?.height ? `${profile.height} cm` : 'Not set'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Fitness Level:</strong> {profile?.fitness_level || 'Not set'}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Fitness Statistics */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            📊 Fitness Statistics
                        </Typography>

                        {stats ? (
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                                        <CardContent>
                                            <Typography color="inherit" gutterBottom variant="caption">
                                                Total Activities
                                            </Typography>
                                            <Typography variant="h4">
                                                {stats.total_activities || 0}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6}>
                                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                                        <CardContent>
                                            <Typography color="inherit" gutterBottom variant="caption">
                                                This Week
                                            </Typography>
                                            <Typography variant="h4">
                                                {stats.weekly_stats?.activity_count || 0}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6}>
                                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                                        <CardContent>
                                            <Typography color="inherit" gutterBottom variant="caption">
                                                Weekly Duration
                                            </Typography>
                                            <Typography variant="h4">
                                                {stats.weekly_stats?.total_duration || 0}
                                                <Typography variant="caption" color="inherit">
                                                    {' '}min
                                                </Typography>
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6}>
                                    <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                                        <CardContent>
                                            <Typography color="inherit" gutterBottom variant="caption">
                                                Calories Burned
                                            </Typography>
                                            <Typography variant="h4">
                                                {stats.weekly_stats?.total_calories?.toFixed(0) || 0}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                Loading statistics...
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Activity History */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, boxShadow: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            📈 Activity History
                        </Typography>
                        {activities && activities.length > 0 ? (
                            <TableContainer>
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
                                        {activities.map((activity) => (
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
                                No activities recorded yet.
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Image Upload Preview Dialog */}
            <Dialog
                open={uploadDialogOpen}
                onClose={() => {
                    setUploadDialogOpen(false);
                    setSelectedFile(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    📸 Preview Profile Picture
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                    {selectedFile && (
                        <Box>
                            <img
                                src={selectedFile}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: 300,
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                }}
                            />
                            <Typography variant="body2" color="textSecondary">
                                Does this look good? Click Save to confirm.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={() => {
                            setUploadDialogOpen(false);
                            setSelectedFile(null);
                        }}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            handleSavePicture();
                            setUploadDialogOpen(false);
                            setSuccess('Profile picture updated successfully!');
                            setTimeout(() => setSuccess(''), 3000);
                        }}
                        variant="contained"
                        startIcon={<SaveIcon />}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Profile;
