import React, { useState } from 'react';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
    Card,
    CardContent,
    Alert,
    Chip,
    Stack,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { activitiesAPI } from '../services/api';

// Activity suggestions and tips
const ACTIVITY_SUGGESTIONS = {
    'Running': {
        emoji: '🏃',
        hasDistance: true,
        tips: [
            '💡 Average running burns 600-900 calories/hour',
            '📏 Typical pace: 8-12 km/hour',
            '⏱️ Recommended duration: 30-60 minutes',
            '💧 Stay hydrated during runs',
        ],
        recommendedDistance: 'Usually 5-15 km',
        calorieRange: '10-15 cal/min',
    },
    'Cycling': {
        emoji: '🚴',
        hasDistance: true,
        tips: [
            '💡 Average cycling burns 400-800 calories/hour',
            '📏 Typical speed: 15-30 km/hour',
            '⏱️ Recommended duration: 30-90 minutes',
            '🚲 Use proper gear for safety',
        ],
        recommendedDistance: 'Usually 10-40 km',
        calorieRange: '6-13 cal/min',
    },
    'Weightlifting': {
        emoji: '🏋️',
        hasDistance: false,
        tips: [
            '💡 Average weightlifting burns 300-600 calories/hour',
            '⏱️ Recommended duration: 45-90 minutes',
            '💪 Rest 1-2 minutes between sets',
            '🎯 Focus on proper form over weight',
        ],
        recommendedDistance: 'N/A - Resistance training',
        calorieRange: '5-10 cal/min',
    },
    'Yoga': {
        emoji: '🧘',
        hasDistance: false,
        tips: [
            '💡 Average yoga burns 200-400 calories/hour',
            '⏱️ Recommended duration: 60-90 minutes',
            '🌬️ Focus on breathing and flexibility',
            '😌 Best for recovery and mindfulness',
        ],
        recommendedDistance: 'N/A - Flexibility training',
        calorieRange: '3-7 cal/min',
    },
    'Swimming': {
        emoji: '🏊',
        hasDistance: true,
        tips: [
            '💡 Average swimming burns 500-900 calories/hour',
            '📏 Typical speed: 4-8 km/hour',
            '⏱️ Recommended duration: 30-60 minutes',
            '🌊 Low impact on joints',
        ],
        recommendedDistance: 'Usually 1-3 km',
        calorieRange: '8-15 cal/min',
    },
    'Walking': {
        emoji: '🚶',
        hasDistance: true,
        tips: [
            '💡 Average walking burns 200-400 calories/hour',
            '📏 Typical pace: 4-6 km/hour',
            '⏱️ Recommended duration: 30-60 minutes',
            '🎯 Daily goal: 10,000 steps',
        ],
        recommendedDistance: 'Usually 2-10 km',
        calorieRange: '3-7 cal/min',
    },
};

const ActivityForm = ({ onActivityLogged, initialType }) => {
    const [formData, setFormData] = useState({
        activity_type: initialType || 'Running',
        duration: '',
        distance: '',
        calories_burned: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const currentActivity = ACTIVITY_SUGGESTIONS[formData.activity_type];

    const handleActivityChange = (e) => {
        setFormData({...formData, activity_type: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.duration || formData.duration === '') {
                alert('Duration is required');
                setLoading(false);
                return;
            }
            
            // Convert string values to numbers, only include if provided
            const activityData = {
                activity_type: formData.activity_type,
                duration: parseInt(formData.duration) || 0,
                date: formData.date,
            };
            
            // Only include optional fields if they have values
            if (formData.distance && formData.distance !== '') {
                activityData.distance = parseFloat(formData.distance);
            }
            if (formData.calories_burned && formData.calories_burned !== '') {
                activityData.calories_burned = parseFloat(formData.calories_burned);
            }
            if (formData.notes && formData.notes !== '') {
                activityData.notes = formData.notes;
            }
            
            console.log('Sending activity data:', activityData);
            await activitiesAPI.logActivity(activityData);
            
            setSuccess(`✅ ${formData.activity_type} logged successfully!`);
            setFormData({
                activity_type: 'Running',
                duration: '',
                distance: '',
                calories_burned: '',
                notes: '',
                date: new Date().toISOString().split('T')[0],
            });
            
            onActivityLogged && onActivityLogged();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error logging activity:', error);
            console.error('Full error response:', error.response);
            const errorMsg = error.response?.data?.error || error.message;
            alert('Failed to log activity: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FitnessCenterIcon sx={{ mr: 2, fontSize: 32, color: '#4CAF50' }} />
                <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                    Log New Activity
                </Typography>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            
            <FormControl fullWidth margin="normal">
                <InputLabel>Activity Type</InputLabel>
                <Select
                    value={formData.activity_type}
                    onChange={handleActivityChange}
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

            {/* Activity Suggestions Card */}
            {currentActivity && (
                <Card sx={{ mt: 3, mb: 3, backgroundColor: '#f5f5f5', border: '2px solid #4CAF50' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ mr: 1 }}>
                                {currentActivity.emoji}
                            </Typography>
                            <Typography variant="h6">
                                {formData.activity_type} Tips & Suggestions
                            </Typography>
                        </Box>

                        <Stack spacing={1} sx={{ mb: 2 }}>
                            {currentActivity.tips.map((tip, index) => (
                                <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>{tip.split(' ')[0]}</span>
                                    {tip}
                                </Typography>
                            ))}
                        </Stack>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip 
                                label={`Distance: ${currentActivity.recommendedDistance}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                            <Chip 
                                label={`Calories: ${currentActivity.calorieRange}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        </Box>
                    </CardContent>
                </Card>
            )}

            <TextField
                fullWidth
                margin="normal"
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="e.g., 30"
                required
                inputProps={{ min: '1', step: '1' }}
            />

            {/* Distance field - only show for activities that track distance */}
            {currentActivity?.hasDistance && (
                <TextField
                    fullWidth
                    margin="normal"
                    label="Distance (km)"
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                    placeholder="Optional - e.g., 5.2"
                    inputProps={{ min: '0', step: '0.1' }}
                />
            )}

            <TextField
                fullWidth
                margin="normal"
                label="Calories Burned"
                type="number"
                value={formData.calories_burned}
                onChange={(e) => setFormData({...formData, calories_burned: e.target.value})}
                placeholder="Optional - e.g., 250"
                inputProps={{ min: '0', step: '1' }}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Optional - How did you feel? Any comments?"
            />

            <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                sx={{ mt: 3 }}
                disabled={loading}
                fullWidth
            >
                {loading ? 'Logging...' : `Log ${formData.activity_type}`}
            </Button>
        </Box>
    );
};

export default ActivityForm;