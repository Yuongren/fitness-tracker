from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from config import Config
from models import db, User, Activity, Goal, UserProfile, Steps, ScheduledWorkout
import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app, 
     resources={r"/api/*": {"origins": "*"}}, 
     supports_credentials=True,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])
db.init_app(app)
jwt = JWTManager(app)

# Register blueprints
from auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Create all database tables (deferred until first app context)
@app.before_request
def init_db():
    if not hasattr(app, 'db_initialized'):
        with app.app_context():
            db.create_all()
            app.db_initialized = True

# Root endpoint
@app.route('/')
def home():
    return jsonify({
        'message': 'Fitness Tracker API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/*',
            'activities': '/api/activities',
            'goals': '/api/goals',
            'stats': '/api/stats',
            'health': '/api/health'
        }
    })

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Fitness Tracker API is running'}), 200

# ==================== ACTIVITY ROUTES ====================
@app.route('/api/activities', methods=['POST'])
@jwt_required()
def log_activity():
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        
        print(f"📝 [LOG-ACTIVITY] Received data: {data}")
        
        # Validate required fields
        if not data or not data.get('activity_type'):
            print("❌ [LOG-ACTIVITY] Missing activity_type")
            return jsonify({'error': 'activity_type is required'}), 400
        
        if data.get('duration') is None or data.get('duration') == '':
            print("❌ [LOG-ACTIVITY] Missing or empty duration")
            return jsonify({'error': 'duration is required'}), 400
        
        # Parse duration as integer
        try:
            duration = int(data.get('duration', 0))
            print(f"✅ [LOG-ACTIVITY] Parsed duration: {duration}")
        except (ValueError, TypeError) as e:
            print(f"❌ [LOG-ACTIVITY] Invalid duration: {e}")
            return jsonify({'error': 'duration must be a valid number'}), 400
        
        # Parse distance if provided
        distance = None
        if data.get('distance') and data.get('distance') != '':
            try:
                distance = float(data.get('distance'))
                print(f"✅ [LOG-ACTIVITY] Parsed distance: {distance}")
            except (ValueError, TypeError):
                print(f"⚠️ [LOG-ACTIVITY] Could not parse distance: {data.get('distance')}")
        
        # Parse calories_burned if provided
        calories_burned = None
        if data.get('calories_burned') and data.get('calories_burned') != '':
            try:
                calories_burned = float(data.get('calories_burned'))
                print(f"✅ [LOG-ACTIVITY] Parsed calories_burned: {calories_burned}")
            except (ValueError, TypeError):
                print(f"⚠️ [LOG-ACTIVITY] Could not parse calories_burned: {data.get('calories_burned')}")
        
        # Parse date if provided
        date_obj = None
        if data.get('date'):
            try:
                date_obj = datetime.datetime.strptime(data['date'], '%Y-%m-%d')
                print(f"✅ [LOG-ACTIVITY] Parsed date: {date_obj}")
            except ValueError as e:
                print(f"⚠️ [LOG-ACTIVITY] Invalid date, using current time: {e}")
                date_obj = datetime.datetime.utcnow()
        else:
            date_obj = datetime.datetime.utcnow()
        
        print(f"📊 [LOG-ACTIVITY] Creating activity: type={data.get('activity_type')}, duration={duration}, distance={distance}, calories={calories_burned}, date={date_obj}")
        
        activity = Activity(
            user_id=user_id,
            activity_type=data.get('activity_type', 'Exercise'),
            duration=duration,
            distance=distance,
            calories_burned=calories_burned,
            notes=data.get('notes'),
            date=date_obj
        )
        
        db.session.add(activity)
        db.session.commit()
        
        print(f"✅ [LOG-ACTIVITY] Activity created with ID: {activity.id}")
        
        # Check and update goals
        try:
            print(f"📊 [LOG-ACTIVITY] Updating goals for user {user_id}")
            update_goals(user_id, activity)
            print(f"✅ [LOG-ACTIVITY] Goals updated successfully")
        except Exception as e:
            print(f"⚠️ [LOG-ACTIVITY] Error updating goals: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return jsonify({
            'message': 'Activity logged successfully',
            'activity_id': activity.id
        }), 201
    except Exception as e:
        print(f"Error logging activity: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to log activity: {str(e)}'}), 422

@app.route('/api/activities', methods=['GET'])
@jwt_required()
def get_activities():
    try:
        user_id = int(get_jwt_identity())
        activities = Activity.query.filter_by(user_id=user_id).order_by(Activity.date.desc()).all()
        
        return jsonify([{
            'id': a.id,
            'activity_type': a.activity_type,
            'duration': a.duration,
            'distance': a.distance,
            'calories_burned': a.calories_burned,
            'date': a.date.isoformat() if a.date else None,
            'notes': a.notes
        } for a in activities]), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get activities: {str(e)}'}), 422

@app.route('/api/activities/<int:activity_id>', methods=['DELETE'])
@jwt_required()
def delete_activity(activity_id):
    user_id = int(get_jwt_identity())
    activity = Activity.query.filter_by(id=activity_id, user_id=user_id).first()
    
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    db.session.delete(activity)
    db.session.commit()
    
    return jsonify({'message': 'Activity deleted successfully'}), 200

# ==================== GOAL ROUTES ====================
@app.route('/api/goals', methods=['POST'])
@jwt_required()
def set_goal():
    try:
        # Get JWT identity
        user_id = int(get_jwt_identity())
        print(f"🔐 [GOALS-POST] User ID from JWT: {user_id}")
        
        # Get JSON data
        if not request.is_json:
            print("❌ [GOALS-POST] Request is not JSON")
            return jsonify({'error': 'Missing JSON in request'}), 400
            
        data = request.get_json()
        print(f"📝 [GOALS-POST] Parsed JSON data: {data}")
        
        if not data:
            print("❌ [GOALS-POST] No data provided")
            return jsonify({'error': 'No data provided'}), 400
            
        # Validate required fields
        if 'goal_type' not in data:
            print("❌ [GOALS-POST] Missing goal_type")
            return jsonify({'error': 'Goal type is required'}), 400
            
        if 'target_value' not in data:
            print("❌ [GOALS-POST] Missing target_value")
            return jsonify({'error': 'Target value is required'}), 400
        
        # Parse target value
        try:
            target_value = float(data['target_value'])
        except (ValueError, TypeError):
            print(f"❌ [GOALS-POST] Invalid target_value: {data.get('target_value')}")
            return jsonify({'error': 'Target value must be a number'}), 400
        
        # Parse current value (default to 0)
        current_value = 0
        if 'current_value' in data and data['current_value'] is not None:
            try:
                current_value = float(data['current_value'])
            except (ValueError, TypeError):
                current_value = 0
        
        # Parse end date if provided
        end_date_obj = None
        if 'end_date' in data and data['end_date']:
            try:
                end_date_obj = datetime.datetime.strptime(data['end_date'], '%Y-%m-%d')
                print(f"📅 [GOALS-POST] Parsed end date: {end_date_obj}")
            except ValueError as e:
                print(f"⚠️ [GOALS-POST] Invalid date format: {e}")
                return jsonify({'error': f'Invalid date format. Use YYYY-MM-DD'}), 400
        
        print(f"📊 [GOALS-POST] Creating goal: user_id={user_id}, type={data['goal_type']}, target={target_value}, current={current_value}")
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            print(f"❌ [GOALS-POST] User {user_id} not found in database!")
            return jsonify({'error': 'User not found'}), 404
        
        print(f"✅ [GOALS-POST] User found: {user.username}")
        
        # Create goal
        goal = Goal(
            user_id=user_id,
            goal_type=data['goal_type'],
            target_value=target_value,
            current_value=current_value,
            end_date=end_date_obj
        )
        
        db.session.add(goal)
        db.session.commit()
        
        print(f"✅ [GOALS-POST] Goal created with ID: {goal.id}")
        
        return jsonify({
            'message': 'Goal set successfully',
            'goal_id': goal.id,
            'goal': {
                'id': goal.id,
                'goal_type': goal.goal_type,
                'target_value': goal.target_value,
                'current_value': goal.current_value,
                'is_completed': goal.is_completed,
                'end_date': goal.end_date.isoformat() if goal.end_date else None
            }
        }), 201
        
    except Exception as e:
        print(f"❌ [GOALS-POST] Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to set goal: {str(e)}'}), 422

@app.route('/api/goals', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = int(get_jwt_identity())
    goals = Goal.query.filter_by(user_id=user_id).all()
    
    response_goals = []
    for g in goals:
        progress = 0
        if g.target_value > 0:
            progress = min((g.current_value / g.target_value * 100), 100)
        
        response_goals.append({
            'id': g.id,
            'goal_type': g.goal_type,
            'target_value': g.target_value,
            'current_value': g.current_value,
            'start_date': g.start_date.isoformat() if g.start_date else None,
            'end_date': g.end_date.isoformat() if g.end_date else None,
            'is_completed': g.is_completed,
            'progress': progress
        })
    
    return jsonify(response_goals), 200

@app.route('/api/goals/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        print(f"Updating goal {goal_id} for user {user_id} with data: {data}")  # Debug
        
        goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        # Update fields if provided
        if 'goal_type' in data:
            goal.goal_type = data['goal_type']
        if 'target_value' in data:
            goal.target_value = float(data['target_value'])
        if 'current_value' in data:
            goal.current_value = float(data['current_value'])
        if 'end_date' in data and data['end_date']:
            try:
                goal.end_date = datetime.datetime.strptime(data['end_date'], '%Y-%m-%d')
            except ValueError:
                pass
        
        # Check if goal is completed
        if goal.current_value >= goal.target_value:
            goal.is_completed = True
        else:
            goal.is_completed = False
        
        db.session.commit()
        
        return jsonify({'message': 'Goal updated successfully'}), 200
    except Exception as e:
        print(f"Error updating goal: {str(e)}")  # Debug
        return jsonify({'error': f'Failed to update goal: {str(e)}'}), 422

@app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    db.session.delete(goal)
    db.session.commit()
    
    return jsonify({'message': 'Goal deleted successfully'}), 200

# ==================== STATISTICS ROUTES ====================
@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())
    
    # Calculate weekly stats
    week_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    weekly_activities = Activity.query.filter(
        Activity.user_id == user_id,
        Activity.date >= week_ago
    ).all()
    
    total_duration = sum(a.duration for a in weekly_activities if a.duration)
    total_calories = sum(a.calories_burned for a in weekly_activities if a.calories_burned)
    total_distance = sum(a.distance for a in weekly_activities if a.distance)
    
    # Activity type distribution
    activity_counts = {}
    for a in weekly_activities:
        activity_counts[a.activity_type] = activity_counts.get(a.activity_type, 0) + 1
    
    # Get total activities count
    total_activities = Activity.query.filter_by(user_id=user_id).count()
    
    # Get goals progress
    goals = Goal.query.filter_by(user_id=user_id).all()
    goals_progress = []
    for goal in goals:
        progress = 0
        if goal.target_value > 0:
            progress = min((goal.current_value / goal.target_value * 100), 100)
        goals_progress.append({
            'goal_type': goal.goal_type,
            'progress': progress,
            'is_completed': goal.is_completed
        })
    
    return jsonify({
        'weekly_stats': {
            'total_duration': total_duration or 0,
            'total_calories': total_calories or 0,
            'total_distance': total_distance or 0,
            'activity_count': len(weekly_activities)
        },
        'activity_distribution': activity_counts,
        'total_activities': total_activities,
        'goals_progress': goals_progress
    }), 200

@app.route('/api/activities/summary', methods=['GET'])
@jwt_required()
def get_activity_summary():
    user_id = int(get_jwt_identity())
    
    # Get last 30 days of activities
    month_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    activities = Activity.query.filter(
        Activity.user_id == user_id,
        Activity.date >= month_ago
    ).order_by(Activity.date).all()
    
    # Group by date
    daily_summary = {}
    for activity in activities:
        if activity.date:
            date_str = activity.date.strftime('%Y-%m-%d')
            if date_str not in daily_summary:
                daily_summary[date_str] = {
                    'total_duration': 0,
                    'total_calories': 0,
                    'activities': []
                }
            
            daily_summary[date_str]['total_duration'] += activity.duration or 0
            daily_summary[date_str]['total_calories'] += activity.calories_burned or 0
            daily_summary[date_str]['activities'].append({
                'type': activity.activity_type,
                'duration': activity.duration,
                'calories': activity.calories_burned
            })
    
    # Fill in missing dates for the last 30 days
    today = datetime.datetime.utcnow().date()
    for i in range(30):
        date_str = (today - datetime.timedelta(days=i)).strftime('%Y-%m-%d')
        if date_str not in daily_summary:
            daily_summary[date_str] = {
                'total_duration': 0,
                'total_calories': 0,
                'activities': []
            }
    
    # Sort by date
    sorted_summary = dict(sorted(daily_summary.items(), reverse=True))
    
    return jsonify(sorted_summary), 200

# ==================== HELPER FUNCTIONS ====================
def update_goals(user_id, activity):
    """Update goals based on logged activity - non-blocking"""
    try:
        goals = Goal.query.filter_by(user_id=user_id, is_completed=False).all()
        print(f"📊 [UPDATE-GOALS] Found {len(goals)} incomplete goals for user {user_id}")
        
        if not goals:
            print(f"📊 [UPDATE-GOALS] No goals to update")
            return
        
        for goal in goals:
            try:
                print(f"  Processing goal {goal.id}: {goal.goal_type}")
                if goal.goal_type == 'weekly_workouts':
                    # Check activities this week
                    today = datetime.datetime.utcnow()
                    start_of_week = today - datetime.timedelta(days=today.weekday())
                    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
                    
                    weekly_count = Activity.query.filter(
                        Activity.user_id == user_id,
                        Activity.date >= start_of_week
                    ).count()
                    
                    goal.current_value = weekly_count
                    if weekly_count >= goal.target_value:
                        goal.is_completed = True
                
                elif goal.goal_type == 'calories_burned':
                    goal.current_value = (goal.current_value or 0) + (activity.calories_burned or 0)
                    if goal.current_value >= goal.target_value:
                        goal.is_completed = True
                
                elif goal.goal_type == 'total_duration':
                    goal.current_value = (goal.current_value or 0) + (activity.duration or 0)
                    if goal.current_value >= goal.target_value:
                        goal.is_completed = True
                
                elif goal.goal_type == 'total_distance':
                    goal.current_value = (goal.current_value or 0) + (activity.distance or 0)
                    if goal.current_value >= goal.target_value:
                        goal.is_completed = True
            except Exception as e:
                print(f"⚠️ [UPDATE-GOALS] Error updating goal {goal.id}: {str(e)}")
                continue
        
        db.session.commit()
        print(f"✅ [UPDATE-GOALS] Goals updated and committed")
    except Exception as e:
        print(f"❌ [UPDATE-GOALS] Error: {str(e)}")
        import traceback
        traceback.print_exc()

# ==================== STEPS ROUTES ====================
@app.route('/api/steps', methods=['POST'])
@jwt_required()
def log_steps():
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        
        print(f"👟 [LOG-STEPS] Received data: {data}")
        
        # Validate required fields
        if not data or data.get('steps') is None or data.get('steps') == '':
            print("❌ [LOG-STEPS] Missing or empty steps")
            return jsonify({'error': 'steps is required'}), 400
        
        # Parse steps as integer
        try:
            steps = int(data.get('steps', 0))
            print(f"✅ [LOG-STEPS] Parsed steps: {steps}")
        except (ValueError, TypeError) as e:
            print(f"❌ [LOG-STEPS] Invalid steps: {e}")
            return jsonify({'error': 'steps must be a valid number'}), 400
        
        # Parse duration if provided (in minutes)
        duration = None
        if data.get('duration') and data.get('duration') != '':
            try:
                duration = int(data.get('duration'))
                print(f"✅ [LOG-STEPS] Parsed duration: {duration} minutes")
            except (ValueError, TypeError):
                print(f"⚠️ [LOG-STEPS] Could not parse duration: {data.get('duration')}")
        
        # Parse distance if provided (in km)
        distance = None
        if data.get('distance') and data.get('distance') != '':
            try:
                distance = float(data.get('distance'))
                print(f"✅ [LOG-STEPS] Parsed distance: {distance} km")
            except (ValueError, TypeError):
                print(f"⚠️ [LOG-STEPS] Could not parse distance: {data.get('distance')}")
        
        # Parse date if provided
        date_obj = None
        if data.get('date'):
            try:
                date_obj = datetime.datetime.strptime(data['date'], '%Y-%m-%d')
                print(f"✅ [LOG-STEPS] Parsed date: {date_obj}")
            except ValueError as e:
                print(f"⚠️ [LOG-STEPS] Invalid date, using current time: {e}")
                date_obj = datetime.datetime.utcnow()
        else:
            date_obj = datetime.datetime.utcnow()
        
        print(f"📊 [LOG-STEPS] Creating step entry: steps={steps}, duration={duration}min, distance={distance}km, date={date_obj}")
        
        step_entry = Steps(
            user_id=user_id,
            steps=steps,
            duration=duration,
            distance=distance,
            notes=data.get('notes'),
            date=date_obj
        )
        
        db.session.add(step_entry)
        db.session.commit()
        
        print(f"✅ [LOG-STEPS] Step entry created with ID: {step_entry.id}")
        
        return jsonify({
            'message': 'Steps logged successfully',
            'step_id': step_entry.id
        }), 201
    except Exception as e:
        print(f"❌ [LOG-STEPS] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to log steps: {str(e)}'}), 422

@app.route('/api/steps', methods=['GET'])
@jwt_required()
def get_steps():
    try:
        user_id = int(get_jwt_identity())
        
        # Optional query parameters for filtering
        date_filter = request.args.get('date')  # Format: YYYY-MM-DD
        limit = request.args.get('limit', 30, type=int)
        
        query = Steps.query.filter_by(user_id=user_id)
        
        # Filter by date if provided
        if date_filter:
            try:
                filter_date = datetime.datetime.strptime(date_filter, '%Y-%m-%d')
                next_date = filter_date + datetime.timedelta(days=1)
                query = query.filter(
                    Steps.date >= filter_date,
                    Steps.date < next_date
                )
            except ValueError:
                pass
        
        steps_list = query.order_by(Steps.date.desc()).limit(limit).all()
        
        print(f"👟 [GET-STEPS] Retrieved {len(steps_list)} step entries for user {user_id}")
        
        return jsonify([{
            'id': s.id,
            'steps': s.steps,
            'duration': s.duration,
            'distance': s.distance,
            'date': s.date.isoformat() if s.date else None,
            'notes': s.notes
        } for s in steps_list]), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get steps: {str(e)}'}), 422

@app.route('/api/steps/<int:step_id>', methods=['PUT'])
@jwt_required()
def update_steps(step_id):
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        
        print(f"👟 [UPDATE-STEPS] Updating step entry {step_id} for user {user_id}")
        
        step_entry = Steps.query.filter_by(id=step_id, user_id=user_id).first()
        
        if not step_entry:
            print(f"❌ [UPDATE-STEPS] Step entry {step_id} not found")
            return jsonify({'error': 'Step entry not found'}), 404
        
        # Update fields if provided
        if 'steps' in data and data['steps'] is not None:
            try:
                step_entry.steps = int(data['steps'])
            except (ValueError, TypeError):
                return jsonify({'error': 'steps must be a valid number'}), 400
        
        if 'duration' in data and data['duration'] is not None:
            try:
                step_entry.duration = int(data['duration'])
            except (ValueError, TypeError):
                pass
        
        if 'distance' in data and data['distance'] is not None:
            try:
                step_entry.distance = float(data['distance'])
            except (ValueError, TypeError):
                pass
        
        if 'notes' in data:
            step_entry.notes = data['notes']
        
        if 'date' in data and data['date']:
            try:
                step_entry.date = datetime.datetime.strptime(data['date'], '%Y-%m-%d')
            except ValueError:
                pass
        
        db.session.commit()
        
        print(f"✅ [UPDATE-STEPS] Step entry {step_id} updated successfully")
        
        return jsonify({'message': 'Step entry updated successfully'}), 200
    except Exception as e:
        print(f"❌ [UPDATE-STEPS] Error: {str(e)}")
        return jsonify({'error': f'Failed to update steps: {str(e)}'}), 422

@app.route('/api/steps/<int:step_id>', methods=['DELETE'])
@jwt_required()
def delete_steps(step_id):
    try:
        user_id = int(get_jwt_identity())
        
        step_entry = Steps.query.filter_by(id=step_id, user_id=user_id).first()
        
        if not step_entry:
            print(f"❌ [DELETE-STEPS] Step entry {step_id} not found")
            return jsonify({'error': 'Step entry not found'}), 404
        
        db.session.delete(step_entry)
        db.session.commit()
        
        print(f"✅ [DELETE-STEPS] Step entry {step_id} deleted successfully")
        
        return jsonify({'message': 'Step entry deleted successfully'}), 200
    except Exception as e:
        print(f"❌ [DELETE-STEPS] Error: {str(e)}")
        return jsonify({'error': f'Failed to delete steps: {str(e)}'}), 422

@app.route('/api/steps/summary', methods=['GET'])
@jwt_required()
def get_steps_summary():
    """Get daily step summary for the last N days"""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get('days', 30, type=int)
        
        # Get steps from the last N days
        days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        steps_list = Steps.query.filter(
            Steps.user_id == user_id,
            Steps.date >= days_ago
        ).order_by(Steps.date.desc()).all()
        
        # Group by date
        daily_summary = {}
        for step in steps_list:
            if step.date:
                date_str = step.date.strftime('%Y-%m-%d')
                if date_str not in daily_summary:
                    daily_summary[date_str] = {
                        'total_steps': 0,
                        'total_distance': 0,
                        'total_duration': 0,
                        'entries': []
                    }
                
                daily_summary[date_str]['total_steps'] += step.steps or 0
                daily_summary[date_str]['total_distance'] += step.distance or 0
                daily_summary[date_str]['total_duration'] += step.duration or 0
                daily_summary[date_str]['entries'].append({
                    'id': step.id,
                    'steps': step.steps,
                    'duration': step.duration,
                    'distance': step.distance,
                    'notes': step.notes
                })
        
        # Sort by date
        sorted_summary = dict(sorted(daily_summary.items(), reverse=True))
        
        print(f"👟 [STEPS-SUMMARY] Retrieved summary for {len(sorted_summary)} days")
        
        return jsonify(sorted_summary), 200
    except Exception as e:
        print(f"❌ [STEPS-SUMMARY] Error: {str(e)}")
        return jsonify({'error': f'Failed to get steps summary: {str(e)}'}), 422

# ==================== SCHEDULED WORKOUTS ROUTES ====================
@app.route('/api/workouts/schedule', methods=['POST'])
@jwt_required()
def schedule_workout():
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        
        print(f"📅 [SCHEDULE-WORKOUT] Received data: {data}")
        
        # Validate required fields
        if not data or not data.get('activity_type'):
            return jsonify({'error': 'activity_type is required'}), 400
        
        if not data.get('scheduled_date'):
            return jsonify({'error': 'scheduled_date is required'}), 400
        
        if not data.get('scheduled_time'):
            return jsonify({'error': 'scheduled_time is required (HH:MM format)'}), 400
        
        # Parse date
        try:
            scheduled_date = datetime.datetime.strptime(data['scheduled_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Validate time format
        try:
            time_parts = data['scheduled_time'].split(':')
            if len(time_parts) != 2:
                raise ValueError('Invalid time format')
            datetime.datetime.strptime(data['scheduled_time'], '%H:%M')
        except ValueError:
            return jsonify({'error': 'Invalid time format. Use HH:MM'}), 400
        
        # Parse duration if provided
        duration = None
        if data.get('duration'):
            try:
                duration = int(data['duration'])
            except (ValueError, TypeError):
                pass
        
        # Parse reminder time (default 15 minutes before)
        reminder_time = 15
        if data.get('reminder_time'):
            try:
                reminder_time = int(data['reminder_time'])
            except (ValueError, TypeError):
                pass
        
        print(f"📅 [SCHEDULE-WORKOUT] Creating scheduled workout for user {user_id}")
        
        scheduled_workout = ScheduledWorkout(
            user_id=user_id,
            activity_type=data['activity_type'],
            scheduled_date=scheduled_date,
            scheduled_time=data['scheduled_time'],
            duration=duration,
            goal_type=data.get('goal_type', 'daily'),  # daily, weekly, monthly
            title=data.get('title', f"{data['activity_type']} Workout"),
            description=data.get('description'),
            reminder_enabled=data.get('reminder_enabled', True),
            reminder_time=reminder_time
        )
        
        db.session.add(scheduled_workout)
        db.session.commit()
        
        print(f"✅ [SCHEDULE-WORKOUT] Scheduled workout created with ID: {scheduled_workout.id}")
        
        return jsonify({
            'message': 'Workout scheduled successfully',
            'workout_id': scheduled_workout.id,
            'workout': {
                'id': scheduled_workout.id,
                'activity_type': scheduled_workout.activity_type,
                'scheduled_date': scheduled_workout.scheduled_date.isoformat(),
                'scheduled_time': scheduled_workout.scheduled_time,
                'title': scheduled_workout.title,
                'reminder_enabled': scheduled_workout.reminder_enabled
            }
        }), 201
    except Exception as e:
        print(f"❌ [SCHEDULE-WORKOUT] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to schedule workout: {str(e)}'}), 422

@app.route('/api/workouts/schedule', methods=['GET'])
@jwt_required()
def get_scheduled_workouts():
    try:
        user_id = int(get_jwt_identity())
        
        # Optional query parameters
        start_date = request.args.get('start_date')  # YYYY-MM-DD
        end_date = request.args.get('end_date')      # YYYY-MM-DD
        goal_type = request.args.get('goal_type')    # daily, weekly, monthly
        
        query = ScheduledWorkout.query.filter_by(user_id=user_id)
        
        # Filter by date range if provided
        if start_date:
            try:
                start = datetime.datetime.strptime(start_date, '%Y-%m-%d')
                query = query.filter(ScheduledWorkout.scheduled_date >= start)
            except ValueError:
                pass
        
        if end_date:
            try:
                end = datetime.datetime.strptime(end_date, '%Y-%m-%d')
                end = end.replace(hour=23, minute=59, second=59)
                query = query.filter(ScheduledWorkout.scheduled_date <= end)
            except ValueError:
                pass
        
        # Filter by goal type if provided
        if goal_type:
            query = query.filter_by(goal_type=goal_type)
        
        workouts = query.order_by(ScheduledWorkout.scheduled_date).all()
        
        print(f"📅 [GET-WORKOUTS] Retrieved {len(workouts)} scheduled workouts for user {user_id}")
        
        return jsonify([{
            'id': w.id,
            'activity_type': w.activity_type,
            'scheduled_date': w.scheduled_date.isoformat(),
            'scheduled_time': w.scheduled_time,
            'duration': w.duration,
            'goal_type': w.goal_type,
            'title': w.title,
            'description': w.description,
            'reminder_enabled': w.reminder_enabled,
            'reminder_time': w.reminder_time,
            'is_completed': w.is_completed,
            'completed_date': w.completed_date.isoformat() if w.completed_date else None
        } for w in workouts]), 200
    except Exception as e:
        print(f"❌ [GET-WORKOUTS] Error: {str(e)}")
        return jsonify({'error': f'Failed to get scheduled workouts: {str(e)}'}), 422

@app.route('/api/workouts/schedule/<int:workout_id>', methods=['PUT'])
@jwt_required()
def update_scheduled_workout(workout_id):
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        
        print(f"📅 [UPDATE-WORKOUT] Updating workout {workout_id}")
        
        workout = ScheduledWorkout.query.filter_by(id=workout_id, user_id=user_id).first()
        
        if not workout:
            return jsonify({'error': 'Scheduled workout not found'}), 404
        
        # Update fields if provided
        if 'activity_type' in data:
            workout.activity_type = data['activity_type']
        
        if 'scheduled_date' in data:
            try:
                workout.scheduled_date = datetime.datetime.strptime(data['scheduled_date'], '%Y-%m-%d')
            except ValueError:
                pass
        
        if 'scheduled_time' in data:
            workout.scheduled_time = data['scheduled_time']
        
        if 'duration' in data and data['duration'] is not None:
            workout.duration = int(data['duration'])
        
        if 'title' in data:
            workout.title = data['title']
        
        if 'description' in data:
            workout.description = data['description']
        
        if 'reminder_enabled' in data:
            workout.reminder_enabled = data['reminder_enabled']
        
        if 'reminder_time' in data:
            workout.reminder_time = int(data['reminder_time'])
        
        if 'is_completed' in data:
            workout.is_completed = data['is_completed']
            if data['is_completed']:
                workout.completed_date = datetime.datetime.utcnow()
        
        db.session.commit()
        
        print(f"✅ [UPDATE-WORKOUT] Workout {workout_id} updated")
        
        return jsonify({'message': 'Scheduled workout updated successfully'}), 200
    except Exception as e:
        print(f"❌ [UPDATE-WORKOUT] Error: {str(e)}")
        return jsonify({'error': f'Failed to update scheduled workout: {str(e)}'}), 422

@app.route('/api/workouts/schedule/<int:workout_id>', methods=['DELETE'])
@jwt_required()
def delete_scheduled_workout(workout_id):
    try:
        user_id = int(get_jwt_identity())
        
        workout = ScheduledWorkout.query.filter_by(id=workout_id, user_id=user_id).first()
        
        if not workout:
            return jsonify({'error': 'Scheduled workout not found'}), 404
        
        db.session.delete(workout)
        db.session.commit()
        
        print(f"✅ [DELETE-WORKOUT] Workout {workout_id} deleted")
        
        return jsonify({'message': 'Scheduled workout deleted successfully'}), 200
    except Exception as e:
        print(f"❌ [DELETE-WORKOUT] Error: {str(e)}")
        return jsonify({'error': f'Failed to delete scheduled workout: {str(e)}'}), 422

@app.route('/api/workouts/upcoming', methods=['GET'])
@jwt_required()
def get_upcoming_workouts():
    """Get upcoming workouts for the next N days (default 7)"""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get('days', 7, type=int)
        
        now = datetime.datetime.utcnow()
        future = now + datetime.timedelta(days=days)
        
        workouts = ScheduledWorkout.query.filter(
            ScheduledWorkout.user_id == user_id,
            ScheduledWorkout.scheduled_date >= now,
            ScheduledWorkout.scheduled_date <= future,
            ScheduledWorkout.is_completed == False
        ).order_by(ScheduledWorkout.scheduled_date).all()
        
        print(f"📅 [UPCOMING-WORKOUTS] Retrieved {len(workouts)} upcoming workouts")
        
        return jsonify([{
            'id': w.id,
            'activity_type': w.activity_type,
            'scheduled_date': w.scheduled_date.isoformat(),
            'scheduled_time': w.scheduled_time,
            'title': w.title,
            'duration': w.duration,
            'reminder_enabled': w.reminder_enabled,
            'reminder_time': w.reminder_time,
            'time_until': (w.scheduled_date - now).total_seconds() / 60  # minutes until workout
        } for w in workouts]), 200
    except Exception as e:
        print(f"❌ [UPCOMING-WORKOUTS] Error: {str(e)}")
        return jsonify({'error': f'Failed to get upcoming workouts: {str(e)}'}), 422

# ==================== ERROR HANDLERS ====================
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested URL was not found on the server.'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An internal error occurred.'
    }), 500

# ==================== MAIN ====================
if __name__ == '__main__':
    print("\n" + "="*50)
    print("FITNESS TRACKER API")
    print("="*50)
    print("\nAvailable endpoints:")
    print("-" * 30)
    print("GET  /                   - API information")
    print("GET  /api/health         - Health check")
    print("POST /api/auth/register  - Register new user")
    print("POST /api/auth/login     - Login")
    print("GET  /api/auth/profile   - Get user profile (requires auth)")
    print("GET  /api/auth/check     - Check authentication (requires auth)")
    print("POST /api/activities     - Log activity (requires auth)")
    print("GET  /api/activities     - Get activities (requires auth)")
    print("GET  /api/stats          - Get statistics (requires auth)")
    print("POST /api/goals          - Set goal (requires auth)")
    print("GET  /api/goals          - Get goals (requires auth)")
    print("POST /api/steps          - Log steps (requires auth)")
    print("GET  /api/steps          - Get steps (requires auth)")
    print("GET  /api/steps/summary  - Get steps summary (requires auth)")
    print("POST /api/workouts/schedule     - Schedule workout (requires auth)")
    print("GET  /api/workouts/schedule     - Get scheduled workouts (requires auth)")
    print("GET  /api/workouts/upcoming     - Get upcoming workouts (requires auth)")
    print("-" * 30)
    print("\nStarting server on http://localhost:5000")
    print("="*50 + "\n")
    
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)