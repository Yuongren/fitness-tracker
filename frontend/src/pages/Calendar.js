import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Chip,
    IconButton,
    Alert,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { workoutsAPI } from '../services/api';

function WorkoutCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [workouts, setWorkouts] = useState([]);
    const [upcomingWorkouts, setUpcomingWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [formData, setFormData] = useState({
        activity_type: 'Running',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '09:00',
        duration: '',
        goal_type: 'daily',
        title: '',
        description: '',
        reminder_enabled: true,
        reminder_time: 15,
    });

    useEffect(() => {
        fetchWorkouts();
        fetchUpcomingWorkouts();
        
        // Setup notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Check for upcoming workouts every minute
        const interval = setInterval(() => {
            checkForNotifications();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
            
            const data = await workoutsAPI.getScheduledWorkouts(startOfMonth, endOfMonth);
            console.log('📅 Workouts fetched:', data);
            setWorkouts(data);
        } catch (err) {
            console.error('❌ Error fetching workouts:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUpcomingWorkouts = async () => {
        try {
            const data = await workoutsAPI.getUpcomingWorkouts(7);
            console.log('📅 Upcoming workouts:', data);
            setUpcomingWorkouts(data);
        } catch (err) {
            console.error('❌ Error fetching upcoming workouts:', err);
        }
    };

    const checkForNotifications = async () => {
        try {
            const upcoming = await workoutsAPI.getUpcomingWorkouts(1);
            const now = new Date();

            upcoming.forEach(workout => {
                if (workout.reminder_enabled && workout.time_until <= workout.reminder_time && workout.time_until > 0) {
                    // Send notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(`Workout Reminder: ${workout.title}`, {
                            body: `Your ${workout.activity_type} workout starts in ${Math.round(workout.time_until)} minutes`,
                            icon: '💪',
                        });
                    }
                }
            });
        } catch (err) {
            console.error('Error checking notifications:', err);
        }
    };

    const handleOpenDialog = (workout = null) => {
        if (workout) {
            setEditingWorkout(workout);
            setFormData({
                activity_type: workout.activity_type,
                scheduled_date: workout.scheduled_date.split('T')[0],
                scheduled_time: workout.scheduled_time,
                duration: workout.duration || '',
                goal_type: workout.goal_type,
                title: workout.title,
                description: workout.description || '',
                reminder_enabled: workout.reminder_enabled,
                reminder_time: workout.reminder_time,
            });
        } else {
            setEditingWorkout(null);
            setFormData({
                activity_type: 'Running',
                scheduled_date: new Date().toISOString().split('T')[0],
                scheduled_time: '09:00',
                duration: '',
                goal_type: 'daily',
                title: '',
                description: '',
                reminder_enabled: true,
                reminder_time: 15,
            });
        }
        setDialogOpen(true);
    };

    const handleSaveWorkout = async () => {
        try {
            const data = {
                ...formData,
                duration: formData.duration ? parseInt(formData.duration) : null,
                reminder_time: parseInt(formData.reminder_time),
            };

            if (editingWorkout) {
                await workoutsAPI.updateScheduledWorkout(editingWorkout.id, data);
                console.log('✅ Workout updated');
            } else {
                await workoutsAPI.scheduleWorkout(data);
                console.log('✅ Workout scheduled');
            }

            setDialogOpen(false);
            fetchWorkouts();
            fetchUpcomingWorkouts();
        } catch (err) {
            console.error('❌ Error saving workout:', err);
            alert('Error saving workout: ' + err.message);
        }
    };

    const handleDeleteWorkout = async (workoutId) => {
        if (window.confirm('Are you sure you want to delete this scheduled workout?')) {
            try {
                await workoutsAPI.deleteScheduledWorkout(workoutId);
                console.log('✅ Workout deleted');
                fetchWorkouts();
                fetchUpcomingWorkouts();
            } catch (err) {
                console.error('❌ Error deleting workout:', err);
                alert('Error deleting workout: ' + err.message);
            }
        }
    };

    const handleCompleteWorkout = async (workout) => {
        try {
            await workoutsAPI.markWorkoutComplete(workout.id);
            console.log('✅ Workout marked as complete');
            fetchWorkouts();
            fetchUpcomingWorkouts();
        } catch (err) {
            console.error('❌ Error completing workout:', err);
        }
    };

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

    const getWorkoutsForDate = (day) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        return workouts.filter(w => w.scheduled_date.split('T')[0] === dateStr);
    };

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth(currentDate); i++) {
        calendarDays.push(i);
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <CalendarMonthIcon sx={{ fontSize: 40, mr: 2, color: '#4CAF50' }} />
                <Typography variant="h3">Workout Calendar & Scheduler</Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Upcoming Workouts */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, backgroundColor: '#e8f5e9' }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            📅 Next 7 Days
                        </Typography>
                        {upcomingWorkouts.length === 0 ? (
                            <Typography color="textSecondary">No workouts scheduled</Typography>
                        ) : (
                            upcomingWorkouts.map(workout => (
                                <Card key={workout.id} sx={{ mb: 1 }}>
                                    <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                            {workout.title}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(workout.scheduled_date).toLocaleDateString()} {workout.scheduled_time}
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <Chip size="small" label={`${Math.round(workout.time_until)}min`} />
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ mt: 2 }}
                        >
                            Schedule Workout
                        </Button>
                    </Paper>
                </Grid>

                {/* Calendar */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        {/* Month Navigation */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Button onClick={prevMonth}>← Previous</Button>
                            <Typography variant="h6">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </Typography>
                            <Button onClick={nextMonth}>Next →</Button>
                        </Box>

                        {/* Calendar Grid */}
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {/* Day Headers */}
                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <Grid item xs={12 / 7} key={day}>
                                            <Box sx={{ textAlign: 'center', fontWeight: 'bold', py: 1 }}>
                                                {day}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Calendar Days */}
                                <Grid container spacing={1}>
                                    {calendarDays.map((day, index) => {
                                        const dayWorkouts = day ? getWorkoutsForDate(day) : [];
                                        return (
                                            <Grid item xs={12 / 7} key={index}>
                                                <Paper
                                                    sx={{
                                                        p: 1,
                                                        minHeight: 120,
                                                        backgroundColor: day ? '#fafafa' : '#f5f5f5',
                                                        border: dayWorkouts.length > 0 ? '2px solid #4CAF50' : '1px solid #ddd',
                                                    }}
                                                >
                                                    {day && (
                                                        <>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                                {day}
                                                            </Typography>
                                                            <Box sx={{ mt: 0.5 }}>
                                                                {dayWorkouts.map(w => (
                                                                    <Chip
                                                                        key={w.id}
                                                                        size="small"
                                                                        label={w.activity_type}
                                                                        icon={w.is_completed ? <CheckCircleIcon /> : undefined}
                                                                        onClick={() => handleOpenDialog(w)}
                                                                        sx={{ mb: 0.5, mr: 0.5, cursor: 'pointer' }}
                                                                        color={w.is_completed ? 'success' : 'primary'}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </>
                                                    )}
                                                </Paper>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Schedule Workout Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingWorkout ? 'Edit Scheduled Workout' : 'Schedule New Workout'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Activity Type</InputLabel>
                        <Select
                            value={formData.activity_type}
                            onChange={(e) => setFormData({...formData, activity_type: e.target.value})}
                            label="Activity Type"
                        >
                            <MenuItem value="Running">🏃 Running</MenuItem>
                            <MenuItem value="Cycling">🚴 Cycling</MenuItem>
                            <MenuItem value="Weightlifting">🏋️ Weightlifting</MenuItem>
                            <MenuItem value="Yoga">🧘 Yoga</MenuItem>
                            <MenuItem value="Swimming">🏊 Swimming</MenuItem>
                            <MenuItem value="Walking">🚶 Walking</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Workout Title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g., Morning Run"
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                        <TextField
                            label="Date"
                            type="date"
                            value={formData.scheduled_date}
                            onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Time"
                            type="time"
                            value={formData.scheduled_time}
                            onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Duration (minutes)"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Frequency</InputLabel>
                        <Select
                            value={formData.goal_type}
                            onChange={(e) => setFormData({...formData, goal_type: e.target.value})}
                            label="Frequency"
                        >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />

                    <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.reminder_enabled}
                                    onChange={(e) => setFormData({...formData, reminder_enabled: e.target.checked})}
                                />
                            }
                            label="Enable Reminder Notification"
                        />
                    </Box>

                    {formData.reminder_enabled && (
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Remind Me (minutes before)"
                            type="number"
                            value={formData.reminder_time}
                            onChange={(e) => setFormData({...formData, reminder_time: e.target.value})}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveWorkout} variant="contained" color="primary">
                        {editingWorkout ? 'Update' : 'Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default WorkoutCalendar;
