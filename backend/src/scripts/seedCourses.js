require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Task = require('../models/Task');
const FinalProject = require('../models/FinalProject');

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

const seedCourses = async() => {
    try {
        // Clear existing data
        await Course.deleteMany({});
        await Module.deleteMany({});
        await Task.deleteMany({});
        await FinalProject.deleteMany({});

        console.log('🗑️  Cleared existing data');

        // Create courses
        const courses = [{
                title: 'Full Stack Web Development',
                slug: 'full-stack-web-development',
                description: 'Master both front-end and back-end development with this comprehensive internship program. Learn HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB to build complete web applications from scratch.',
                shortDescription: 'Learn to build complete web applications with modern technologies',
                category: 'technology',
                difficulty: 'beginner',
                duration: 12,
                thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1234/web-dev.jpg',
                skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'REST API'],
                learningOutcomes: [
                    'Build responsive websites using HTML, CSS, and JavaScript',
                    'Create interactive user interfaces with React',
                    'Develop RESTful APIs using Node.js and Express',
                    'Work with MongoDB databases',
                    'Deploy full-stack applications'
                ],
                prerequisites: ['Basic computer knowledge', 'Internet connection'],
                totalModules: 6,
                totalTasks: 3,
                isActive: true
            },
            {
                title: 'UI/UX Design Masterclass',
                slug: 'ui-ux-design-masterclass',
                description: 'Learn the principles of user interface and user experience design. Master design tools like Figma, create wireframes, prototypes, and conduct user research to build user-centered digital products.',
                shortDescription: 'Master UI/UX design with Figma and user-centered methodologies',
                category: 'design',
                difficulty: 'intermediate',
                duration: 10,
                thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1234/ui-ux.jpg',
                skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Visual Design', 'Design Systems'],
                learningOutcomes: [
                    'Understand UI/UX design principles',
                    'Create wireframes and prototypes in Figma',
                    'Conduct user research and testing',
                    'Design responsive interfaces',
                    'Build design systems'
                ],
                prerequisites: ['Basic design interest', 'Creative mindset'],
                totalModules: 5,
                totalTasks: 3,
                isActive: true
            },
            {
                title: 'Digital Marketing Essentials',
                slug: 'digital-marketing-essentials',
                description: 'Master the fundamentals of digital marketing including SEO, social media marketing, content marketing, email marketing, and analytics. Learn to create and execute effective digital marketing campaigns.',
                shortDescription: 'Learn complete digital marketing strategies and tools',
                category: 'marketing',
                difficulty: 'beginner',
                duration: 8,
                thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1234/marketing.jpg',
                skills: ['SEO', 'Social Media', 'Content Marketing', 'Google Analytics', 'Email Marketing', 'PPC'],
                learningOutcomes: [
                    'Optimize websites for search engines',
                    'Create social media marketing strategies',
                    'Develop content marketing plans',
                    'Analyze marketing data with Google Analytics',
                    'Run paid advertising campaigns'
                ],
                prerequisites: ['Basic internet knowledge'],
                totalModules: 4,
                totalTasks: 2,
                isActive: true
            },
            {
                title: 'Data Science & Machine Learning',
                slug: 'data-science-machine-learning',
                description: 'Dive into data science and machine learning with Python. Learn data analysis, visualization, statistical modeling, machine learning algorithms, and apply them to real-world datasets.',
                shortDescription: 'Master data science and ML with hands-on Python projects',
                category: 'data-science',
                difficulty: 'intermediate',
                duration: 14,
                thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1234/data-science.jpg',
                skills: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization', 'TensorFlow', 'Scikit-learn'],
                learningOutcomes: [
                    'Perform data analysis with Pandas and NumPy',
                    'Create data visualizations',
                    'Build machine learning models',
                    'Work with real-world datasets',
                    'Deploy ML models'
                ],
                prerequisites: ['Basic programming knowledge', 'Mathematics fundamentals'],
                totalModules: 6,
                totalTasks: 3,
                isActive: true
            }
        ];

        const createdCourses = await Course.insertMany(courses);
        console.log(`✅ Created ${createdCourses.length} courses`);

        // Create modules for Full Stack Web Development
        const fullStackCourse = createdCourses[0];
        const fullStackModules = [{
                courseId: fullStackCourse._id,
                moduleNumber: 1,
                title: 'Introduction to Web Development',
                description: 'Learn the basics of web development, HTML structure, and CSS styling',
                videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
                videoType: 'youtube',
                duration: 3600,
                order: 1,
                isPreview: true,
                resources: [
                    { title: 'HTML Cheat Sheet', url: 'https://htmlcheatsheet.com', type: 'link' },
                    { title: 'CSS Guide', url: 'https://cssreference.io', type: 'link' }
                ]
            },
            {
                courseId: fullStackCourse._id,
                moduleNumber: 2,
                title: 'JavaScript Fundamentals',
                description: 'Master JavaScript basics, ES6 features, and DOM manipulation',
                videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
                videoType: 'youtube',
                duration: 4200,
                order: 2,
                resources: [
                    { title: 'JavaScript Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'link' }
                ]
            },
            {
                courseId: fullStackCourse._id,
                moduleNumber: 3,
                title: 'React.js Basics',
                description: 'Learn React components, props, state, and hooks',
                videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
                videoType: 'youtube',
                duration: 5400,
                order: 3
            },
            {
                courseId: fullStackCourse._id,
                moduleNumber: 4,
                title: 'Node.js & Express',
                description: 'Build backend APIs with Node.js and Express framework',
                videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
                videoType: 'youtube',
                duration: 4800,
                order: 4
            },
            {
                courseId: fullStackCourse._id,
                moduleNumber: 5,
                title: 'MongoDB & Database Design',
                description: 'Learn NoSQL databases and MongoDB operations',
                videoUrl: 'https://www.youtube.com/watch?v=c2M-rlkkT5o',
                videoType: 'youtube',
                duration: 3900,
                order: 5
            },
            {
                courseId: fullStackCourse._id,
                moduleNumber: 6,
                title: 'Full Stack Project & Deployment',
                description: 'Integrate frontend and backend, deploy your application',
                videoUrl: 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
                videoType: 'youtube',
                duration: 4500,
                order: 6
            }
        ];

        await Module.insertMany(fullStackModules);
        console.log(`✅ Created ${fullStackModules.length} modules for Full Stack course`);

        // Create tasks for Full Stack course
        const fullStackTasks = [{
                courseId: fullStackCourse._id,
                taskNumber: 1,
                title: 'Build a Portfolio Website',
                description: 'Create a responsive portfolio website using HTML, CSS, and JavaScript',
                instructions: `
# Task: Build Your Portfolio Website

## Requirements:
1. Create a multi-page portfolio with Home, About, Projects, and Contact pages
2. Use semantic HTML5 elements
3. Implement responsive design (mobile, tablet, desktop)
4. Add smooth scrolling and animations
5. Include at least 3 project showcases

## Submission:
- Deploy on GitHub Pages or Netlify
- Submit the live URL and GitHub repository link
        `,
                requiredModuleNumber: 2,
                maxPoints: 100,
                submissionType: 'link',
                order: 1
            },
            {
                courseId: fullStackCourse._id,
                taskNumber: 2,
                title: 'Create a React Todo App',
                description: 'Build a fully functional todo application using React with CRUD operations',
                instructions: `
# Task: React Todo Application

## Features Required:
1. Add new todos
2. Mark todos as complete/incomplete
3. Edit existing todos
4. Delete todos
5. Filter todos (All, Active, Completed)
6. Local storage persistence

## Submission:
- Deploy on Vercel or Netlify
- Submit live URL and GitHub repository
        `,
                requiredModuleNumber: 3,
                maxPoints: 100,
                submissionType: 'link',
                order: 2
            },
            {
                courseId: fullStackCourse._id,
                taskNumber: 3,
                title: 'Build a REST API',
                description: 'Create a RESTful API with Node.js, Express, and MongoDB',
                instructions: `
# Task: RESTful API Development

## Requirements:
1. Create endpoints for a blog system (Posts and Comments)
2. Implement CRUD operations
3. Add authentication with JWT
4. Connect to MongoDB
5. Add proper error handling
6. Write API documentation

## Endpoints:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/posts
- POST /api/posts
- PUT /api/posts/:id
- DELETE /api/posts/:id

## Submission:
- Deploy API on Render or Railway
- Submit API URL, documentation, and GitHub repository
        `,
                requiredModuleNumber: 5,
                maxPoints: 100,
                submissionType: 'mixed',
                order: 3
            }
        ];

        await Task.insertMany(fullStackTasks);
        console.log(`✅ Created ${fullStackTasks.length} tasks for Full Stack course`);

        // Create final project for Full Stack course
        const fullStackProject = {
            courseId: fullStackCourse._id,
            title: 'E-Commerce Web Application',
            description: 'Build a complete e-commerce platform with user authentication, product management, shopping cart, and payment integration.',
            requirements: [
                'User registration and authentication',
                'Product listing and search functionality',
                'Shopping cart with add/remove items',
                'Order management system',
                'Admin panel for product management',
                'Responsive design for all devices',
                'Payment gateway integration (test mode)',
                'Order history and tracking'
            ],
            submissionGuidelines: `
# Final Project Submission Guidelines

## What to Submit:
1. **Live Application URL** - Deployed on Vercel/Netlify (Frontend) and Render/Railway (Backend)
2. **GitHub Repository** - Well-documented code with README
3. **Video Demo** - 5-10 minute walkthrough of features
4. **Technical Documentation** - Architecture, tech stack, challenges faced

## Evaluation Criteria:
- Functionality (40%) - All features working correctly
- Code Quality (25%) - Clean, organized, commented code
- UI/UX Design (20%) - Professional and user-friendly interface
- Documentation (15%) - Clear README and code comments

## Deadline:
Submit within 2 weeks of completing all modules and tasks.
      `,
            technicalRequirements: [
                'Frontend: React.js',
                'Backend: Node.js with Express',
                'Database: MongoDB',
                'Authentication: JWT',
                'State Management: Context API or Redux',
                'Styling: CSS/Tailwind/Material-UI'
            ],
            evaluationCriteria: [
                { criterion: 'Functionality', weightage: 40, description: 'All features work correctly' },
                { criterion: 'Code Quality', weightage: 25, description: 'Clean, maintainable code' },
                { criterion: 'UI/UX Design', weightage: 20, description: 'Professional design' },
                { criterion: 'Documentation', weightage: 15, description: 'Clear documentation' }
            ],
            sampleProjects: [{
                title: 'Amazon Clone',
                url: 'https://github.com/example/amazon-clone',
                description: 'Full-featured e-commerce with Stripe integration'
            }]
        };

        await FinalProject.create(fullStackProject);
        console.log('✅ Created final project for Full Stack course');

        console.log('\n🎉 Database seeded successfully!');
        console.log(`\n📚 Access courses at: http://localhost:5000/api/courses`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

connectDB().then(seedCourses);