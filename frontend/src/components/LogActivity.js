// components/LogActivity.js
import { useState } from 'react';
import axios from 'axios';

const LogActivity = () => {
    const [type, setType] = useState('');
    const [duration, setDuration] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/log_activity', { type, duration, date, user_id: 1 });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Activity Type" value={type} onChange={(e) => setType(e.target.value)} />
            <input type="number" placeholder="Duration (minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <input type="date" placeholder="Date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button type="submit">Log Activity</button>
        </form>
    );
};

export default LogActivity;
