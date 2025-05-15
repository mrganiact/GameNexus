from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_sqlalchemy import SQLAlchemy
import os
from werkzeug.utils import secure_filename
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import logging
from datetime import timedelta  # ✅ New import for session lifetime

# Initialize environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here')

# ✅ Set session to be permanent and lifetime to 7 days
app.permanent_session_lifetime = timedelta(days=7)

# Constants
DEFAULT_PROPIC = "https://res.cloudinary.com/demo/image/upload/v1690000000/default.png"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Configurations
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///social.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

# --------------------------- MODELS ---------------------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    nickname = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    propic = db.Column(db.String(200), nullable=False, default=DEFAULT_PROPIC)
    posts = db.relationship('Post', backref='author', lazy=True)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Initialize database
with app.app_context():
    db.create_all()

# --------------------------- HELPER FUNCTIONS ---------------------------

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_current_user():
    if 'username' in session:
        return User.query.filter_by(username=session['username']).first()
    return None

# --------------------------- ROUTES ---------------------------

@app.route('/')
def home():
    posts = Post.query.order_by(Post.id.desc()).all()
    return render_template('dashboard.html', posts=posts, user=get_current_user())

@app.route('/upload', methods=['POST'])
def upload():
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        file = request.files.get('image')

        if not title:
            return jsonify({'error': 'Title is required'}), 400
        if not file or file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif'}), 400

        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0)
        if file_length > MAX_FILE_SIZE:
            return jsonify({'error': 'File size exceeds 5MB limit'}), 400

        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder="posts",
                resource_type="image",
                timeout=30
            )
            image_url = upload_result['secure_url']
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {str(e)}")
            return jsonify({'error': 'Failed to upload image to Cloudinary'}), 500

        user = get_current_user()
        new_post = Post(
            title=title,
            description=description,
            image_url=image_url,
            user_id=user.id
        )
        db.session.add(new_post)
        db.session.commit()

        return jsonify({
            'success': True,
            'post': {
                'title': title,
                'description': description,
                'filename': image_url
            }
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/user')
def user_page():
    all_users = User.query.all()
    return render_template("user.html", all_users=all_users, user=get_current_user())

@app.route("/account")
def account():
    if 'username' not in session:
        return redirect(url_for("login"))
    
    user = get_current_user()
    if not user:
        return "User not found", 404
    return render_template("profile.html", user=user)

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == 'POST':
        try:
            nickname = request.form.get("nickname", "").strip()
            username = request.form.get("username", "").strip()
            dob = request.form.get("dob", "").strip()
            password = request.form.get("password", "").strip()
            email = request.form.get("email", "").strip()
            propic = request.files.get("propic")

            if not all([nickname, username, dob, password, email]):
                return "All fields are required", 400

            if User.query.filter_by(username=username).first():
                return "Username already exists", 400
            if User.query.filter_by(email=email).first():
                return "Email already exists", 400

            filename = DEFAULT_PROPIC
            if propic and propic.filename != '' and allowed_file(propic.filename):
                upload_result = cloudinary.uploader.upload(
                    propic,
                    folder="profile_pics",
                    transformation=[
                        {'width': 200, 'height': 200, 'crop': "fill"},
                        {'quality': "auto"}
                    ]
                )
                filename = upload_result['secure_url']

            new_user = User(
                username=username,
                nickname=nickname,
                dob=dob,
                password=password,
                email=email,
                propic=filename
            )

            db.session.add(new_user)
            db.session.commit()

            session.permanent = True  # ✅ Make session permanent
            session['username'] = new_user.username
            return redirect(url_for("home"))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Signup error: {e}")
            return "Error creating account", 500

    return render_template("signup.html", user=None)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        user = User.query.filter_by(username=username, password=password).first()
        if user:
            session.permanent = True  # ✅ Make session permanent
            session["username"] = username
            return redirect(url_for("home"))
        else:
            return "Invalid credentials", 401

    return render_template("login.html", user=None)

@app.route("/logout")
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route("/x")
def x():
    return render_template('x.html')

# --------------------------- API ROUTES ---------------------------

@app.route('/api/posts')
def get_posts():
    search_query = request.args.get('q', '').strip()
    
    if search_query:
        posts = Post.query.filter(
            (Post.title.ilike(f'%{search_query}%')) | 
            (Post.description.ilike(f'%{search_query}%'))
        ).order_by(Post.id.desc()).all()
    else:
        posts = Post.query.order_by(Post.id.desc()).all()

    posts_data = [{
        'title': post.title,
        'description': post.description,
        'filename': post.image_url,
        'author': post.author.nickname if post.author else 'Unknown'
    } for post in posts]
    
    return jsonify(posts_data)

@app.route('/api/user/profile')
def get_user_profile():
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'username': user.username,
        'nickname': user.nickname,
        'email': user.email,
        'propic': user.propic
    })

# --------------------------- MAIN ---------------------------

if __name__ == "__main__":
    app.run(debug=os.getenv('FLASK_DEBUG', 'False') == 'True')
