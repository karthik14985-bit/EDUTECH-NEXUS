// Exact 5 Courses required by EDUTECH NEXUS specification (10 lessons each)
const coursesData = [
  {
    "title": "Full Stack Development",
    "slug": "full-stack-development",
    "category": "Web Development",
    "description": "Complete hands-on curriculum covering modern frontend engineering, backend microservices, REST APIs, and database integration with MongoDB.",
    "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    "thumbnail": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    "instructor": "A. Sundar (Lead Full Stack Architect)",
    "duration": "10 weeks",
    "difficulty": "Intermediate",
    "level": "Intermediate",
    "xp": 500,
    "xpReward": 500,
    "totalLessons": 10,
    "status": "active",
    "requirements": [
      "Basic computer literacy",
      "Familiarity with web browsers",
      "Code editor (VS Code recommended)"
    ],
    "learningOutcomes": [
      "Build responsive client-side web applications using semantic HTML5, modern CSS3, and JavaScript ES6+",
      "Develop scalable RESTful web APIs and authentication pipelines with Node.js and Express",
      "Model and persist enterprise application data using MongoDB and Mongoose schemas",
      "Architect single-page applications with React component hierarchies and state hooks",
      "Deploy full-stack applications with environment configuration and security best practices"
    ],
    "lessons": [
      {
        "lessonNumber": 1,
        "title": "Introduction to Web Development",
        "description": "Understand the architecture of the modern web: client-server model, HTTP/HTTPS protocols, browsers, and the full stack landscape.",
        "learningObjectives": [
          "Understand HTTP client-server model",
          "Explore frontend vs backend roles",
          "Set up modern developer workspace"
        ],
        "duration": "20 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "nu_pCVPKzTk",
        "videoUrl": "https://www.youtube.com/watch?v=nu_pCVPKzTk",
        "defaultVideo": "/videos/full-stack-development/lesson-01-html-fundamentals.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 2,
        "title": "HTML Fundamentals",
        "description": "Semantic markup, document structure, forms, inputs, tables, accessibility, and modern HTML5 specifications.",
        "learningObjectives": [
          "Write semantic HTML5 documents",
          "Build accessible forms and inputs",
          "Structure SEO-friendly documents"
        ],
        "duration": "22 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "UB1O30fR-EE",
        "videoUrl": "https://www.youtube.com/watch?v=UB1O30fR-EE",
        "defaultVideo": "/videos/full-stack-development/lesson-01-html-fundamentals.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 3,
        "title": "CSS Fundamentals",
        "description": "CSS cascade, selectors, box model, margins, borders, padding, colors, typography, and specificity rules.",
        "learningObjectives": [
          "Master CSS box model calculations",
          "Implement clean color and typography systems",
          "Understand specificity and inheritance"
        ],
        "duration": "25 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "yfoY53QXEnI",
        "videoUrl": "https://www.youtube.com/watch?v=yfoY53QXEnI",
        "defaultVideo": "/videos/full-stack-development/lesson-02-css-fundamentals.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 4,
        "title": "Responsive Web Design",
        "description": "CSS Flexbox, CSS Grid layouts, media queries, viewport configuration, and mobile-first design principles.",
        "learningObjectives": [
          "Build flexible layouts with Flexbox and Grid",
          "Write media queries for all device sizes",
          "Adopt mobile-first layout techniques"
        ],
        "duration": "26 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "srvUrASNj0s",
        "videoUrl": "https://www.youtube.com/watch?v=srvUrASNj0s",
        "defaultVideo": "/videos/full-stack-development/lesson-03-responsive-web-design.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 5,
        "title": "JavaScript Fundamentals",
        "description": "Variables (let/const), data types, control flow, functions, scope, arrow functions, and array iteration methods.",
        "learningObjectives": [
          "Write robust ES6+ JavaScript",
          "Master array methods (map, filter, reduce)",
          "Understand functional scoping and closures"
        ],
        "duration": "28 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "W6NZfCO5SIk",
        "videoUrl": "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        "defaultVideo": "/videos/full-stack-development/lesson-04-javascript-fundamentals.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 6,
        "title": "Advanced JavaScript and DOM",
        "description": "Document Object Model (DOM) tree manipulation, event bubbling/capturing, asynchronous JavaScript, Promises, and async/await.",
        "learningObjectives": [
          "Manipulate DOM elements dynamically",
          "Handle user interaction events cleanly",
          "Consume asynchronous APIs with async/await"
        ],
        "duration": "30 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "0ik6X4DJKCc",
        "videoUrl": "https://www.youtube.com/watch?v=0ik6X4DJKCc",
        "defaultVideo": "/videos/full-stack-development/lesson-05-dom-and-events.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 7,
        "title": "React Fundamentals",
        "description": "Component architecture, JSX, props, state management with useState and useEffect, and building interactive client UIs.",
        "learningObjectives": [
          "Construct modular React functional components",
          "Manage component lifecycle with hooks",
          "Handle form state and conditional rendering"
        ],
        "duration": "32 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "bMknfKXIFA8",
        "videoUrl": "https://www.youtube.com/watch?v=bMknfKXIFA8",
        "defaultVideo": "/videos/full-stack-development/lesson-06-node-js-fundamentals.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 8,
        "title": "Node.js and Express.js",
        "description": "Node.js runtime, event loop, CommonJS/ES modules, Express server architecture, routing, middleware, and error handling.",
        "learningObjectives": [
          "Create an Express HTTP web server",
          "Design RESTful API endpoints",
          "Implement custom Express middleware"
        ],
        "duration": "30 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "Oe421EPjeBE",
        "videoUrl": "https://www.youtube.com/watch?v=Oe421EPjeBE",
        "defaultVideo": "/videos/full-stack-development/lesson-07-express-js.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 9,
        "title": "MongoDB and Database Integration",
        "description": "NoSQL document concepts, MongoDB Atlas, Mongoose schemas, models, CRUD queries, indexing, and validation.",
        "learningObjectives": [
          "Connect Express applications to MongoDB",
          "Design Mongoose schemas with validation",
          "Execute relational-style population queries"
        ],
        "duration": "28 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "ofme2o29ngU",
        "videoUrl": "https://www.youtube.com/watch?v=ofme2o29ngU",
        "defaultVideo": "/videos/full-stack-development/lesson-08-mongodb-and-mongoose.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 10,
        "title": "Full Stack Project Development",
        "description": "End-to-end integration: authentication with JWT, protected routes, file uploads, full stack deployment, and project packaging.",
        "learningObjectives": [
          "Integrate React frontend with Express backend",
          "Secure endpoints with JWT tokens",
          "Deploy full-stack app to production"
        ],
        "duration": "35 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "7CqJlxBYj-M",
        "videoUrl": "https://www.youtube.com/watch?v=7CqJlxBYj-M",
        "defaultVideo": "/videos/full-stack-development/lesson-10-full-stack-final-project.mp4",
        "xp": 50
      }
    ]
  },
  {
    "title": "Artificial Intelligence (AI)",
    "slug": "artificial-intelligence",
    "category": "Artificial Intelligence",
    "description": "Learn the core paradigms of Artificial Intelligence, intelligent agents, heuristic search, knowledge representation, and ethics in AI.",
    "image": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    "thumbnail": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    "instructor": "Dr. A. Ramanathan (AI Research Lead)",
    "duration": "8 weeks",
    "difficulty": "Beginner",
    "level": "Beginner",
    "xp": 500,
    "xpReward": 500,
    "totalLessons": 10,
    "status": "active",
    "requirements": [
      "Basic computer science fundamentals",
      "Curiosity about intelligent systems",
      "No advanced mathematics required"
    ],
    "learningOutcomes": [
      "Understand core definitions, history, and taxonomy of Artificial Intelligence",
      "Analyze intelligent agent architectures and environmental interactions (PEAS)",
      "Master search algorithms: BFS, DFS, heuristic, and A* search techniques",
      "Examine knowledge representation, semantic networks, and logic systems",
      "Explore ethical frameworks, fairness, and safety in modern AI deployments"
    ],
    "lessons": [
      {
        "lessonNumber": 1,
        "title": "Introduction to Artificial Intelligence",
        "description": "Explore intelligence definitions, Turing test, Dartmouth conference origins, and modern AI paradigms.",
        "learningObjectives": [
          "Define artificial intelligence",
          "Differentiate between narrow, general, and super AI",
          "Survey modern AI applications"
        ],
        "duration": "20 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "JMUxmLyrhSk",
        "videoUrl": "https://www.youtube.com/watch?v=JMUxmLyrhSk",
        "defaultVideo": "/videos/ai-fundamentals/lesson-01-introduction-to-artificial-intelligence.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 2,
        "title": "History and Evolution of AI",
        "description": "From symbolic AI and the expert system boom to AI winters and the contemporary deep learning renaissance.",
        "learningObjectives": [
          "Trace the timeline of AI evolution",
          "Identify key milestones and AI winters",
          "Understand catalysts of modern AI"
        ],
        "duration": "22 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "0yCJMt8ChCw",
        "videoUrl": "https://www.youtube.com/watch?v=0yCJMt8ChCw",
        "defaultVideo": "/videos/ai-fundamentals/lesson-02-history-and-evolution-of-ai.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 3,
        "title": "Types of Artificial Intelligence",
        "description": "Classifying AI systems: Reactive Machines, Limited Memory, Theory of Mind, and Self-Aware AI architectures.",
        "learningObjectives": [
          "Differentiate AI capabilities and classifications",
          "Compare symbolic vs sub-symbolic systems",
          "Assess functional boundaries"
        ],
        "duration": "25 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "5q87K1WaoFI",
        "videoUrl": "https://www.youtube.com/watch?v=5q87K1WaoFI",
        "defaultVideo": "/videos/ai-fundamentals/lesson-03-ai-applications.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 4,
        "title": "Intelligent Agents",
        "description": "Agents, sensors, actuators, and environments (PEAS formulation) and agent structures (reflex, goal-based, utility).",
        "learningObjectives": [
          "Formulate PEAS descriptors for any agent",
          "Distinguish simple reflex from goal-based agents",
          "Understand environmental properties"
        ],
        "duration": "24 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "z_5gqXz3c1U",
        "videoUrl": "https://www.youtube.com/watch?v=z_5gqXz3c1U",
        "defaultVideo": "/videos/ai-fundamentals/lesson-04-intelligent-agents.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 5,
        "title": "Problem Solving in AI",
        "description": "Problem formulation, state space representations, initial states, transition models, and goal test verification.",
        "learningObjectives": [
          "Formulate problems as state spaces",
          "Define successor functions and action models",
          "Analyze state search branching factors"
        ],
        "duration": "26 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "J34GxqReg0s",
        "videoUrl": "https://www.youtube.com/watch?v=J34GxqReg0s",
        "defaultVideo": "/videos/ai-fundamentals/lesson-05-problem-solving-in-ai.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 6,
        "title": "Knowledge Representation",
        "description": "Propositional logic, first-order predicate logic, semantic networks, conceptual graphs, and ontologies.",
        "learningObjectives": [
          "Construct propositional statements",
          "Model domain knowledge with semantic networks",
          "Translate natural assertions into predicate logic"
        ],
        "duration": "28 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "FhY6_B25Xyg",
        "videoUrl": "https://www.youtube.com/watch?v=FhY6_B25Xyg",
        "defaultVideo": "/videos/ai-fundamentals/lesson-06-knowledge-representation.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 7,
        "title": "Search Algorithms",
        "description": "Uninformed search (BFS, DFS, Uniform Cost) versus Informed heuristic search (Greedy Best-First, A* Algorithm).",
        "learningObjectives": [
          "Implement BFS and DFS traversals",
          "Calculate heuristic admissibility and consistency",
          "Execute A* search on graph spaces"
        ],
        "duration": "26 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "7LZHxTZHc5s",
        "videoUrl": "https://www.youtube.com/watch?v=7LZHxTZHc5s",
        "defaultVideo": "/videos/ai-fundamentals/lesson-07-search-techniques.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 8,
        "title": "Machine Learning Fundamentals",
        "description": "How AI connects with machine learning: supervised, unsupervised, reinforcement learning, and cost function optimization.",
        "learningObjectives": [
          "Contrast rule-based AI with statistical learning",
          "Understand optimization and loss curves",
          "Explore training and inference lifecycles"
        ],
        "duration": "28 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "ukzFI9rgwfU",
        "videoUrl": "https://www.youtube.com/watch?v=ukzFI9rgwfU",
        "defaultVideo": "/videos/ai-fundamentals/lesson-08-ai-ethics-and-responsible-ai.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 9,
        "title": "Natural Language Processing",
        "description": "Text preprocessing, tokenization, stemming, TF-IDF, embeddings, and language understanding architectures.",
        "learningObjectives": [
          "Tokenize and vectorize text inputs",
          "Extract sentiments and syntactic parts of speech",
          "Understand transformer and attention foundations"
        ],
        "duration": "30 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "CMrHM8a3hqw",
        "videoUrl": "https://www.youtube.com/watch?v=CMrHM8a3hqw",
        "defaultVideo": "/videos/ai-fundamentals/lesson-09-real-world-ai-systems.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 10,
        "title": "Real-World AI Applications",
        "description": "Industrial implementations in autonomous vehicles, diagnostic healthcare, generative models, and AI safety ethics.",
        "learningObjectives": [
          "Analyze commercial AI case studies",
          "Identify algorithmic bias and ethical challenges",
          "Synthesize AI course knowledge into practical solutions"
        ],
        "duration": "32 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "JDxq-m7UC-Y",
        "videoUrl": "https://www.youtube.com/watch?v=JDxq-m7UC-Y",
        "defaultVideo": "/videos/ai-fundamentals/lesson-10-ai-mini-project.mp4",
        "xp": 50
      }
    ]
  },
  {
    "title": "Machine Learning (ML)",
    "slug": "machine-learning",
    "category": "Machine Learning",
    "description": "Master practical machine learning algorithms, data preparation, linear regression, classification, clustering, and model validation.",
    "image": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
    "thumbnail": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
    "instructor": "Dr. V. Srinivasan (Chief Data Scientist)",
    "duration": "8 weeks",
    "difficulty": "Intermediate",
    "level": "Intermediate",
    "xp": 500,
    "xpReward": 500,
    "totalLessons": 10,
    "status": "active",
    "requirements": [
      "Basic Python programming",
      "Elementary linear algebra and statistics",
      "Familiarity with Jupyter notebooks"
    ],
    "learningOutcomes": [
      "Ingest, inspect, clean, and preprocess real-world tabular data using Pandas and NumPy",
      "Train, evaluate, and tune linear and logistic regression models with Scikit-Learn",
      "Construct tree-based models including Decision Trees and Random Forests",
      "Implement unsupervised clustering techniques like K-Means and evaluate cluster coherence",
      "Diagnose overfitting vs underfitting with cross-validation and hyperparameter tuning"
    ],
    "lessons": [
      {
        "lessonNumber": 1,
        "title": "Introduction to Machine Learning",
        "description": "Understanding machine learning paradigms: learning patterns from data, train/test separation, and ML engineering pipeline.",
        "learningObjectives": [
          "Define machine learning taxonomy",
          "Understand feature matrices and target vectors",
          "Set up scientific computing environment"
        ],
        "duration": "20 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "ukzFI9rgwfU",
        "videoUrl": "https://www.youtube.com/watch?v=ukzFI9rgwfU",
        "defaultVideo": "/videos/ai-and-machine-learning/lesson-01-introduction-to-machine-learning.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 2,
        "title": "Types of Machine Learning",
        "description": "Deep dive into supervised learning, unsupervised learning, self-supervised learning, and reinforcement learning.",
        "learningObjectives": [
          "Compare regression vs classification",
          "Understand unsupervised clustering and dimensionality reduction",
          "Analyze real-world ML use cases"
        ],
        "duration": "22 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "7eh4d6sabA0",
        "videoUrl": "https://www.youtube.com/watch?v=7eh4d6sabA0",
        "defaultVideo": "/videos/ai-and-machine-learning/lesson-02-types-of-machine-learning.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 3,
        "title": "Data Collection and Preparation",
        "description": "Sourcing datasets, parsing CSV/JSON/SQL sources, handling missing entries, and exploratory data analysis (EDA).",
        "learningObjectives": [
          "Conduct EDA using Pandas and Matplotlib",
          "Detect outliers and skewed distributions",
          "Identify data leakage hazards"
        ],
        "duration": "25 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "0LTXpeRC3_8",
        "videoUrl": "https://www.youtube.com/watch?v=0LTXpeRC3_8",
        "defaultVideo": "/videos/ai-and-machine-learning/lesson-03-data-preparation.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 4,
        "title": "Data Preprocessing",
        "description": "Feature scaling (StandardScaler, MinMaxScaler), categorical encoding (One-Hot, Ordinal), and train-test splits.",
        "learningObjectives": [
          "Scale numerical feature distributions",
          "Encode categorical variables properly",
          "Construct reusable preprocessing pipelines"
        ],
        "duration": "24 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "i_LwzRVP7bg",
        "videoUrl": "https://www.youtube.com/watch?v=i_LwzRVP7bg",
        "defaultVideo": "/videos/ai-and-machine-learning/lesson-04-linear-regression.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 5,
        "title": "Linear Regression",
        "description": "Simple and multiple linear regression, ordinary least squares (OLS), cost function (MSE), and gradient descent.",
        "learningObjectives": [
          "Derive simple linear regression model",
          "Interpret regression coefficients and R² score",
          "Train regression models in Scikit-Learn"
        ],
        "duration": "26 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "E5RjzSK0fvY",
        "videoUrl": "https://www.youtube.com/watch?v=E5RjzSK0fvY",
        "defaultVideo": "/videos/ai-and-machine-learning/lesson-04-linear-regression.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 6,
        "title": "Classification Algorithms",
        "description": "Binary and multiclass classification: Logistic Regression, sigmoid function, Decision Boundary, and K-Nearest Neighbors.",
        "learningObjectives": [
          "Understand logistic probability mappings",
          "Tune classification threshold levels",
          "Implement K-Nearest Neighbors classifier"
        ],
        "duration": "28 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "zM4VZR0px8E",
        "videoUrl": "https://www.youtube.com/watch?v=zM4VZR0px8E",
        "defaultVideo": "/videos/ai-and-machine-learning/lesson-05-classification.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 7,
        "title": "Decision Trees and Random Forest",
        "description": "Information gain, Gini impurity, entropy, decision tree splitting, ensemble methods, bagging, and Random Forest classifier.",
        "learningObjectives": [
          "Calculate Gini impurity and information gain",
          "Prevent decision tree overfitting with max_depth",
          "Train ensemble Random Forest models"
        ],
        "duration": "30 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "_L39rN6gz7Y",
        "videoUrl": "https://www.youtube.com/watch?v=_L39rN6gz7Y",
        "defaultVideo": "/videos/ai-and-machine-learning/lesson-06-decision-trees.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 8,
        "title": "Clustering Algorithms",
        "description": "Unsupervised partitioning with K-Means, inertia, elbow method, silhouette scores, and hierarchical clustering.",
        "learningObjectives": [
          "Formulate K-Means centroid updates",
          "Select optimal K clusters via the Elbow method",
          "Assess silhouette coefficient quality"
        ],
        "duration": "26 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "4b5d3muPQmA",
        "videoUrl": "https://www.youtube.com/watch?v=4b5d3muPQmA",
        "defaultVideo": "/videos/ai-and-machine-learning/lesson-07-clustering.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 9,
        "title": "Model Evaluation",
        "description": "Evaluation metrics: Confusion Matrix, Precision, Recall, F1-Score, ROC-AUC curve, and k-fold cross-validation.",
        "learningObjectives": [
          "Evaluate classification with Precision and Recall",
          "Plot and interpret ROC-AUC curves",
          "Execute k-fold cross-validation"
        ],
        "duration": "28 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "wpNl-Juuqzc",
        "videoUrl": "https://www.youtube.com/watch?v=wpNl-Juuqzc",
        "defaultVideo": "/videos/ai-and-machine-learning/lesson-08-model-evaluation.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 10,
        "title": "Machine Learning Project",
        "description": "End-to-end predictive modeling project: problem statement, preprocessing, model selection, hyperparameter tuning, and export.",
        "learningObjectives": [
          "Execute end-to-end ML project pipeline",
          "Save and reload trained models with Joblib",
          "Document findings and business metrics"
        ],
        "duration": "35 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "f_uwKZIAeM0",
        "videoUrl": "https://www.youtube.com/watch?v=f_uwKZIAeM0",
        "defaultVideo": "/videos/ai-and-machine-learning/lesson-10-machine-learning-mini-project.mp4",
        "xp": 50
      }
    ]
  },
  {
    "title": "Python Programming",
    "slug": "python-programming",
    "category": "Programming",
    "description": "Comprehensive foundation in Python programming from core syntax, control flow, functions, collections, to OOP and capstone automation.",
    "image": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80",
    "thumbnail": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80",
    "instructor": "S. Meenakshi (Senior Python Consultant)",
    "duration": "6 weeks",
    "difficulty": "Beginner",
    "level": "Beginner",
    "xp": 500,
    "xpReward": 500,
    "totalLessons": 10,
    "status": "active",
    "requirements": [
      "No prior programming experience required",
      "Computer running Windows, macOS, or Linux",
      "Python 3 installed"
    ],
    "learningOutcomes": [
      "Write clean, readable, idiomatic Python code adhering to PEP 8 standards",
      "Master core data structures: lists, tuples, dictionaries, sets, and comprehensions",
      "Encapsulate logic into reusable functions with positional, default, and keyword arguments",
      "Model real-world entities through Object-Oriented Programming (classes, inheritance)",
      "Handle file I/O operations and build defensive code with structured exception handling"
    ],
    "lessons": [
      {
        "lessonNumber": 1,
        "title": "Introduction to Python",
        "description": "Python installation, IDE setup (VS Code), interactive shell, syntax philosophy, and running first script.",
        "learningObjectives": [
          "Set up Python 3 development environment",
          "Execute scripts from terminal and IDE",
          "Understand Python indentation and comments"
        ],
        "duration": "18 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "kqtD5dpn9C8",
        "videoUrl": "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        "defaultVideo": "/videos/python-programming/lesson-01-introduction-to-python.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 2,
        "title": "Variables and Data Types",
        "description": "Dynamic typing, integers, floats, strings, booleans, type conversion (casting), and formatted f-strings.",
        "learningObjectives": [
          "Declare and inspect Python variables",
          "Cast between primitive data types",
          "Format console output with f-strings"
        ],
        "duration": "20 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "khKv-8q7YmY",
        "videoUrl": "https://www.youtube.com/watch?v=khKv-8q7YmY",
        "defaultVideo": "/videos/python-programming/lesson-02-variables-and-data-types.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 3,
        "title": "Operators and Expressions",
        "description": "Arithmetic operators, comparison operators, logical operators (and, or, not), membership, and identity operators.",
        "learningObjectives": [
          "Evaluate compound conditional expressions",
          "Use membership operators (in / not in)",
          "Avoid identity vs equality pitfalls"
        ],
        "duration": "22 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "v5MR5JnKcZI",
        "videoUrl": "https://www.youtube.com/watch?v=v5MR5JnKcZI",
        "defaultVideo": "/videos/python-programming/lesson-03-operators-and-expressions.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 4,
        "title": "Conditional Statements",
        "description": "if, elif, and else branching logic, nested conditionals, pass statement, and ternary conditional expressions.",
        "learningObjectives": [
          "Structure decision branches with clean indentation",
          "Evaluate multi-clause elif statements",
          "Write concise ternary expressions"
        ],
        "duration": "22 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "AWek49wXGzI",
        "videoUrl": "https://www.youtube.com/watch?v=AWek49wXGzI",
        "defaultVideo": "/videos/python-programming/lesson-04-conditional-statements.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 5,
        "title": "Loops",
        "description": "for loops with range(), while loops with condition flags, break, continue, and loop else clauses.",
        "learningObjectives": [
          "Iterate sequences using for loops and range()",
          "Implement while loops with safe termination",
          "Use break and continue appropriately"
        ],
        "duration": "24 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "6iF8Xb7Z3wQ",
        "videoUrl": "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
        "defaultVideo": "/videos/python-programming/lesson-05-loops.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 6,
        "title": "Functions",
        "description": "Defining functions with def, parameters, return values, *args, **kwargs, docstrings, and lambda expressions.",
        "learningObjectives": [
          "Define modular, well-documented functions",
          "Accept variable positional and keyword arguments",
          "Write inline lambda functions"
        ],
        "duration": "26 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "9Os0o3wzS_I",
        "videoUrl": "https://www.youtube.com/watch?v=9Os0o3wzS_I",
        "defaultVideo": "/videos/python-programming/lesson-06-functions.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 7,
        "title": "Lists, Tuples, and Dictionaries",
        "description": "Indexed sequences, mutability vs immutability, list operations, dictionary key-value lookups, and list comprehensions.",
        "learningObjectives": [
          "Perform slicing and manipulation on lists",
          "Leverage immutable tuples for fixed records",
          "Master fast key-value lookups with dictionaries"
        ],
        "duration": "28 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "daefaLgNkw0",
        "videoUrl": "https://www.youtube.com/watch?v=daefaLgNkw0",
        "defaultVideo": "/videos/python-programming/lesson-07-lists-tuples-and-dictionaries.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 8,
        "title": "Object-Oriented Programming",
        "description": "Classes, objects, __init__ constructor, instance methods, self reference, inheritance, and encapsulation.",
        "learningObjectives": [
          "Model real-world entities through classes",
          "Implement inheritance for code reuse",
          "Protect state with encapsulation"
        ],
        "duration": "30 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "JeznW_7DlB0",
        "videoUrl": "https://www.youtube.com/watch?v=JeznW_7DlB0",
        "defaultVideo": "/videos/python-programming/lesson-08-object-oriented-programming.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 9,
        "title": "File Handling and Exception Handling",
        "description": "Reading/writing files using with open(), try-except-finally blocks, handling FileNotFoundError, and custom exceptions.",
        "learningObjectives": [
          "Safely read and write text and CSV files",
          "Catch and handle exceptions with try-except",
          "Ensure cleanup with context managers"
        ],
        "duration": "26 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "b5qUu4hP_zM",
        "videoUrl": "https://www.youtube.com/watch?v=b5qUu4hP_zM",
        "defaultVideo": "/videos/python-programming/lesson-09-file-handling-and-exceptions.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 10,
        "title": "Python Mini Project",
        "description": "Capstone project: Command-line file analyzer and automated reporting tool combining data structures, functions, and OOP.",
        "learningObjectives": [
          "Architect multi-file Python project",
          "Process datasets and output formatted reports",
          "Apply clean code practices"
        ],
        "duration": "35 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "rfscVS0vtbw",
        "videoUrl": "https://www.youtube.com/watch?v=rfscVS0vtbw",
        "defaultVideo": "/videos/python-programming/lesson-10-python-mini-project.mp4",
        "xp": 50
      }
    ]
  },
  {
    "title": "Java Programming",
    "slug": "java-programming",
    "category": "Programming",
    "description": "Master enterprise object-oriented programming with Java: syntax, OOP paradigms, collections framework, exception handling, and project architecture.",
    "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    "thumbnail": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    "instructor": "K. Sundaram (Principal Java Architect)",
    "duration": "8 weeks",
    "difficulty": "Beginner",
    "level": "Beginner",
    "xp": 500,
    "xpReward": 500,
    "totalLessons": 10,
    "status": "active",
    "requirements": [
      "Basic computer problem-solving ability",
      "No prior Java knowledge required",
      "JDK 17+ installed on workstation"
    ],
    "learningOutcomes": [
      "Understand JVM, JRE, bytecode, and compilation lifecycle",
      "Master object-oriented concepts: encapsulation, inheritance, polymorphism",
      "Leverage Java Collections Framework: ArrayList, HashMap, LinkedList, HashSet",
      "Implement robust exception handling with try-catch-finally and custom exceptions",
      "Build modular, production-ready console and enterprise Java applications"
    ],
    "lessons": [
      {
        "lessonNumber": 1,
        "title": "Introduction to Java",
        "description": "JVM architecture, bytecode, JRE vs JDK, installing tools, and writing, compiling, and executing your first Java program.",
        "learningObjectives": [
          "Understand Java compilation & JVM execution",
          "Compile and run Java programs via terminal",
          "Learn Java file naming and package rules"
        ],
        "duration": "20 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "eIrMbAQSU34",
        "videoUrl": "https://www.youtube.com/watch?v=eIrMbAQSU34",
        "defaultVideo": "/videos/sample-lesson.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 2,
        "title": "Java Variables and Data Types",
        "description": "Primitive types (int, double, char, boolean), reference types, type casting (widening vs narrowing), and memory allocation.",
        "learningObjectives": [
          "Declare and initialize primitive variables",
          "Perform safe and explicit type conversions",
          "Understand memory stack vs heap basics"
        ],
        "duration": "22 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "m4-HM_H7v0k",
        "videoUrl": "https://www.youtube.com/watch?v=m4-HM_H7v0k",
        "defaultVideo": "/videos/sample-lesson.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 3,
        "title": "Operators and Expressions",
        "description": "Arithmetic, relational, logical, bitwise, assignment, and ternary operators in Java expressions.",
        "learningObjectives": [
          "Evaluate compound Java expressions",
          "Master operator precedence rules",
          "Use ternary conditional operators"
        ],
        "duration": "22 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "ldYLYRNaucM",
        "videoUrl": "https://www.youtube.com/watch?v=ldYLYRNaucM",
        "defaultVideo": "/videos/sample-lesson.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 4,
        "title": "Conditional Statements",
        "description": "if, else-if, else ladders, nested conditionals, and switch statements with modern switch expressions.",
        "learningObjectives": [
          "Structure multi-branch conditional logic",
          "Use modern switch yield statements",
          "Avoid unreachable code errors"
        ],
        "duration": "24 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "Z1Yd7upQsXY",
        "videoUrl": "https://www.youtube.com/watch?v=Z1Yd7upQsXY",
        "defaultVideo": "/videos/sample-lesson.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 5,
        "title": "Loops",
        "description": "for loops, while loops, do-while loops, enhanced for-each loops, break, and continue statements.",
        "learningObjectives": [
          "Execute standard and enhanced for-each loops",
          "Write while loops with guaranteed termination",
          "Apply break and continue correctly"
        ],
        "duration": "25 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "7mK_9pWq89A",
        "videoUrl": "https://www.youtube.com/watch?v=7mK_9pWq89A",
        "defaultVideo": "/videos/sample-lesson.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 6,
        "title": "Arrays and Strings",
        "description": "1D and 2D arrays, Array utility class, String immutability, String pool, StringBuilder, and StringBuffer.",
        "learningObjectives": [
          "Declare and traverse multi-dimensional arrays",
          "Understand String pool and immutability",
          "Use StringBuilder for performance optimization"
        ],
        "duration": "26 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "bSrm9RXwBaI",
        "videoUrl": "https://www.youtube.com/watch?v=bSrm9RXwBaI",
        "defaultVideo": "/videos/sample-lesson.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 7,
        "title": "Methods and Functions",
        "description": "Method declarations, parameter passing (pass by value), return types, static methods, and method overloading.",
        "learningObjectives": [
          "Define modular methods with proper signatures",
          "Implement method overloading cleanly",
          "Understand static versus instance methods"
        ],
        "duration": "26 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "9Jp44kH_h5c",
        "videoUrl": "https://www.youtube.com/watch?v=9Jp44kH_h5c",
        "defaultVideo": "/videos/sample-lesson.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 8,
        "title": "Object-Oriented Programming",
        "description": "Classes, objects, constructors, this keyword, encapsulation, inheritance, method overriding, and polymorphism.",
        "learningObjectives": [
          "Encapsulate data with private fields and getters/setters",
          "Extend classes using inheritance",
          "Achieve runtime polymorphism"
        ],
        "duration": "30 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "RRubcjpTkks",
        "videoUrl": "https://www.youtube.com/watch?v=RRubcjpTkks",
        "defaultVideo": "/videos/sample-lesson.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 9,
        "title": "Exception Handling and Collections",
        "description": "try-catch-finally, checked vs unchecked exceptions, List (ArrayList), Set (HashSet), and Map (HashMap).",
        "learningObjectives": [
          "Handle runtime exceptions defensively",
          "Store and manipulate collections of objects",
          "Perform fast key-value lookups with HashMap"
        ],
        "duration": "28 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "viTHc_4XfCA",
        "videoUrl": "https://www.youtube.com/watch?v=viTHc_4XfCA",
        "defaultVideo": "/videos/sample-lesson.mp4",
        "xp": 50
      },
      {
        "lessonNumber": 10,
        "title": "Java Mini Project",
        "description": "Capstone project: Object-oriented student management system with validation, collections persistence, and interactive CLI.",
        "learningObjectives": [
          "Architect complete OOP Java console project",
          "Apply SOLID principles to software design",
          "Prepare for technical interviews"
        ],
        "duration": "35 minutes",
        "videoType": "youtube",
        "youtubeVideoId": "U_8pG9jO6lI",
        "videoUrl": "https://www.youtube.com/watch?v=U_8pG9jO6lI",
        "defaultVideo": "/videos/sample-lesson.mp4",
        "xp": 50
      }
    ]
  }
];

module.exports = coursesData;
