// components/ViewActivities.js
import { useEffect, useState } from 'react';
import axios from 'axios';

const ViewActivities = () => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchActivities = async () => {
            const res = await axios.get('http://localhost:5000/view_activities/1');
            setActivities(res.data);
        };

        fetchActivities();
    }, []);

    return (
        <div>
            <h2>Activity Logs</h2>
            {activities.map((activity, index) => (
                <div key={index}>
                    <p>{activity.type}: {activity.duration} minutes on {activity.date}</p>
                </div>
            ))}
        </div>
    );
};

export default ViewActivities;
