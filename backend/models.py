from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    activities = db.relationship('Activity', backref='user', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', lazy=True, cascade='all, delete-orphan')
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    scheduled_workouts = db.relationship('ScheduledWorkout', backref='user', lazy=True, cascade='all, delete-orphan')

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    fitness_level = db.Column(db.String(50), default='Beginner')

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False, default='Exercise')
    duration = db.Column(db.Integer, nullable=False, default=0)
    distance = db.Column(db.Float)
    calories_burned = db.Column(db.Float)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    goal_type = db.Column(db.String(50), nullable=False, default='weekly_workouts')
    target_value = db.Column(db.Float, nullable=False, default=0)
    current_value = db.Column(db.Float, default=0)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    is_completed = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<Goal {self.id}: {self.goal_type} - {self.current_value}/{self.target_value}>'

class Steps(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    steps = db.Column(db.Integer, nullable=False, default=0)
    distance = db.Column(db.Float)  # Distance in km
    duration = db.Column(db.Integer)  # Duration in minutes
    date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    
    def __repr__(self):
        return f'<Steps {self.id}: {self.steps} steps, {self.distance}km, {self.duration}min>'

class ScheduledWorkout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)  # Running, Cycling, etc.
    scheduled_date = db.Column(db.DateTime, nullable=False)  # Date and time of workout
    scheduled_time = db.Column(db.String(5), nullable=False)  # HH:MM format
    duration = db.Column(db.Integer)  # Expected duration in minutes
    goal_type = db.Column(db.String(50))  # daily, weekly, monthly
    title = db.Column(db.String(100))  # Workout title/name
    description = db.Column(db.Text)  # Detailed description
    reminder_enabled = db.Column(db.Boolean, default=True)  # Enable notifications
    reminder_time = db.Column(db.Integer, default=15)  # Minutes before workout to remind
    is_completed = db.Column(db.Boolean, default=False)  # Completed status
    completed_date = db.Column(db.DateTime)  # When it was completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ScheduledWorkout {self.id}: {self.activity_type} on {self.scheduled_date}>' 