import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Menu,
    MenuItem,
    Grid,
    Card,
    CardContent,
    ButtonGroup,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { activitiesAPI } from '../services/api';
import ActivityForm from '../components/ActivityForm';

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, activityId: null });
    const [showForm, setShowForm] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [logDialogOpen, setLogDialogOpen] = useState(false);
    const [selectedActivityType, setSelectedActivityType] = useState('Running');

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await activitiesAPI.getActivities();
            setActivities(response.data);
        } catch (err) {
            setError('Failed to load activities');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (activityId) => {
        setDeleteDialog({ open: true, activityId });
    };

    const handleDeleteConfirm = async () => {
        try {
            await activitiesAPI.deleteActivity(deleteDialog.activityId);
            setActivities(activities.filter(activity => activity.id !== deleteDialog.activityId));
            setDeleteDialog({ open: false, activityId: null });
        } catch (err) {
            setError('Failed to delete activity');
            console.error(err);
        }
    };

    const handleActivityLogged = () => {
        setShowForm(false);
        fetchActivities();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Activities
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        onClick={(e) => setMenuAnchor(e.currentTarget)}
                    >
                        Log Activity
                    </Button>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                    >
                        <MenuItem onClick={() => { setSelectedActivityType('Running'); setLogDialogOpen(true); setMenuAnchor(null); }}>🏃 Running</MenuItem>
                        <MenuItem onClick={() => { setSelectedActivityType('Cycling'); setLogDialogOpen(true); setMenuAnchor(null); }}>🚴 Cycling</MenuItem>
                        <MenuItem onClick={() => { setSelectedActivityType('Weightlifting'); setLogDialogOpen(true); setMenuAnchor(null); }}>🏋️ Weightlifting</MenuItem>
                        <MenuItem onClick={() => { setSelectedActivityType('Yoga'); setLogDialogOpen(true); setMenuAnchor(null); }}>🧘 Yoga</MenuItem>
                        <MenuItem onClick={() => { setSelectedActivityType('Swimming'); setLogDialogOpen(true); setMenuAnchor(null); }}>🏊 Swimming</MenuItem>
                        <MenuItem onClick={() => { setSelectedActivityType('Walking'); setLogDialogOpen(true); setMenuAnchor(null); }}>🚶 Walking</MenuItem>
                    </Menu>

                    <Dialog open={logDialogOpen} onClose={() => setLogDialogOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{ fontWeight: 'bold' }}>📝 Log Your Activity</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, mt: 1 }}>
                                Track your workout and stay motivated! Fill in the details below to log your {selectedActivityType.toLowerCase()} session.
                            </Typography>
                            <ActivityForm
                                initialType={selectedActivityType}
                                onActivityLogged={() => { fetchActivities(); setLogDialogOpen(false); }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setLogDialogOpen(false)} variant="outlined">Cancel</Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Activity Type</TableCell>
                            <TableCell align="right">Duration (min)</TableCell>
                            <TableCell align="right">Distance (km)</TableCell>
                            <TableCell align="right">Calories</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                                        No activities logged yet. Log your first activity!
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell>{formatDate(activity.date)}</TableCell>
                                    <TableCell>{activity.activity_type}</TableCell>
                                    <TableCell align="right">{activity.duration}</TableCell>
                                    <TableCell align="right">{activity.distance || '-'}</TableCell>
                                    <TableCell align="right">{activity.calories_burned || '-'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(activity.id)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, activityId: null })}
            >
                <DialogTitle>Delete Activity</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this activity? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, activityId: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Activities;