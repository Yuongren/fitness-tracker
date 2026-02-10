import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import { goalsAPI } from '../services/api';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, goalId: null });
    const [editingGoal, setEditingGoal] = useState(null);
    const [goalForm, setGoalForm] = useState({
        goal_type: 'weekly_workouts',
        target_value: '',
        current_value: '0',
        end_date: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const goalTypes = [
        { value: 'weekly_workouts', label: 'Workouts per Week' },
        { value: 'total_duration', label: 'Total Duration (minutes)' },
        { value: 'total_distance', label: 'Total Distance (km)' },
        { value: 'calories_burned', label: 'Calories Burned' },
        { value: 'weight_loss', label: 'Weight Loss (kg)' },
        { value: 'strength_gain', label: 'Strength Gain' }
    ];

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const response = await goalsAPI.getGoals();
            setGoals(response.data);
            setError('');
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to load goals';
            setError(errorMsg);
            showSnackbar(errorMsg, 'error');
            console.error('Error fetching goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpenDialog = (goal = null) => {
        if (goal) {
            setEditingGoal(goal);
            setGoalForm({
                goal_type: goal.goal_type,
                target_value: goal.target_value.toString(),
                current_value: goal.current_value.toString(),
                end_date: goal.end_date ? goal.end_date.split('T')[0] : ''
            });
        } else {
            setEditingGoal(null);
            setGoalForm({
                goal_type: 'weekly_workouts',
                target_value: '',
                current_value: '0',
                end_date: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingGoal(null);
        setError('');
    };

    const handleSubmit = async () => {
        try {
            // Validate required fields
            if (!goalForm.target_value || goalForm.target_value === '') {
                alert('Target value is required');
                return;
            }

            // Prepare data
            const goalData = {
                goal_type: goalForm.goal_type,
                target_value: parseFloat(goalForm.target_value),
                current_value: parseFloat(goalForm.current_value) || 0,
            };

            // Only include end_date if provided
            if (goalForm.end_date) {
                goalData.end_date = goalForm.end_date;
            }

            console.log('Sending goal data:', goalData);

            if (editingGoal) {
                // Update existing goal
                await goalsAPI.updateGoal(editingGoal.id, goalData);
                showSnackbar('Goal updated successfully!', 'success');
            } else {
                // Create new goal
                await goalsAPI.setGoal(goalData);
                showSnackbar('Goal created successfully!', 'success');
            }

            // Refresh goals list
            await fetchGoals();
            handleCloseDialog();
            setError('');
        } catch (err) {
            console.error('DEBUG - Full error object:', err);
            console.error('DEBUG - Error response:', err.response);
            console.error('DEBUG - Error response data:', err.response?.data);
            console.error('DEBUG - Error message:', err.response?.data?.error || err.message);
            
            // Show the actual error from backend
            if (err.response?.data?.error) {
                alert(`Backend Error: ${err.response.data.error}`);
            }
            
            const errorMsg = err.response?.data?.error || err.message || 'Failed to save goal';
            setError(errorMsg);
            showSnackbar(errorMsg, 'error');
        }
    };

    const handleDeleteClick = (goalId) => {
        setDeleteDialog({ open: true, goalId });
    };

    const handleDeleteConfirm = async () => {
        try {
            await goalsAPI.deleteGoal(deleteDialog.goalId);
            setGoals(goals.filter(goal => goal.id !== deleteDialog.goalId));
            setDeleteDialog({ open: false, goalId: null });
            showSnackbar('Goal deleted successfully!', 'success');
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to delete goal';
            setError(errorMsg);
            showSnackbar(errorMsg, 'error');
        }
    };

    const getGoalTypeLabel = (type) => {
        const goalType = goalTypes.find(t => t.value === type);
        return goalType ? goalType.label : type;
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
            <Typography variant="h4" gutterBottom>
                Fitness Goals
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" color="textSecondary">
                    Set and track your fitness goals
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => handleOpenDialog()}
                >
                    ＋ Set New Goal
                </Button>
            </Box>

            <Grid container spacing={3}>
                {goals.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                                No goals set yet
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                                Set your first fitness goal to start tracking your progress!
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => handleOpenDialog()}
                            >
                                ＋ Set Your First Goal
                            </Button>
                        </Paper>
                    </Grid>
                ) : (
                    goals.map((goal) => (
                        <Grid item xs={12} md={6} lg={4} key={goal.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" component="div">
                                                {getGoalTypeLabel(goal.goal_type)}
                                                {goal.is_completed && ' ✓'}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Target: {goal.target_value} | Current: {goal.current_value}
                                            </Typography>
                                            {goal.end_date && (
                                                <Typography variant="caption" color="textSecondary">
                                                    Target Date: {new Date(goal.end_date).toLocaleDateString()}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box>
                                            <Button
                                                size="small"
                                                onClick={() => handleOpenDialog(goal)}
                                                sx={{ mr: 1 }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(goal.id)}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={goal.progress}
                                                color={goal.progress >= 100 ? 'success' : 'primary'}
                                            />
                                        </Box>
                                        <Box sx={{ minWidth: 35 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                {Math.round(goal.progress)}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2">
                                        {goal.is_completed ? 'Goal Completed! 🎉' : 'In Progress'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Add/Edit Goal Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingGoal ? 'Edit Goal' : 'Set New Goal'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            select
                            fullWidth
                            label="Goal Type"
                            value={goalForm.goal_type}
                            onChange={(e) => setGoalForm({ ...goalForm, goal_type: e.target.value })}
                            margin="normal"
                            required
                        >
                            {goalTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Target Value"
                            type="number"
                            value={goalForm.target_value}
                            onChange={(e) => setGoalForm({ ...goalForm, target_value: e.target.value })}
                            margin="normal"
                            required
                            inputProps={{ min: 0, step: 0.1 }}
                            error={!goalForm.target_value}
                            helperText={!goalForm.target_value ? 'Target value is required' : ''}
                        />

                        <TextField
                            fullWidth
                            label="Current Value"
                            type="number"
                            value={goalForm.current_value}
                            onChange={(e) => setGoalForm({ ...goalForm, current_value: e.target.value })}
                            margin="normal"
                            inputProps={{ min: 0, step: 0.1 }}
                        />

                        <TextField
                            fullWidth
                            label="Target Date (Optional)"
                            type="date"
                            value={goalForm.end_date}
                            onChange={(e) => setGoalForm({ ...goalForm, end_date: e.target.value })}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={!goalForm.target_value}
                    >
                        {editingGoal ? 'Update' : 'Set Goal'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, goalId: null })}
            >
                <DialogTitle>Delete Goal</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this goal? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, goalId: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Goals;