import argparse
import html
import json
import re
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
VIDEO_ROOT = ROOT / "frontend" / "videos"
MAP_PATH = ROOT / "frontend" / "js" / "course-video-map.js"
REPORT_PATH = VIDEO_ROOT / "VIDEO-REPORT.md"
LICENSE = "CC BY 4.0"
LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/"
WIDTH, HEIGHT, FPS = 960, 540, 10
SCENE_SECONDS = 7


LESSONS = [
    ("AI Fundamentals", "Introduction to Artificial Intelligence", [
        ("What AI means", ["AI builds systems that perform tasks associated with human intelligence.", "Examples include perception, language, prediction, planning, and decision support."]),
        ("How a system works", ["A system receives inputs, represents useful information, then produces an output or action.", "The method may be rules, a learned model, search, or a combination."]),
        ("Choose a useful task", ["Start with a clear problem, a measurable outcome, and suitable data.", "Compare the AI solution with a simpler baseline and check its limitations."]),
    ]),
    ("AI Fundamentals", "History and Evolution of AI", [
        ("Early foundations", ["Logic, computation, and theories of learning shaped the idea of machine intelligence.", "The 1956 Dartmouth workshop helped establish artificial intelligence as a research field."]),
        ("Changing approaches", ["Early symbolic systems used explicit rules and search.", "Statistical learning later used data; deep learning expanded pattern recognition with layered neural networks."]),
        ("Why progress comes in waves", ["Results depend on algorithms, computing power, data, and realistic goals.", "Evaluate each generation by what it can reliably do, not by the label attached to it."]),
    ]),
    ("AI Fundamentals", "AI Applications", [
        ("Common application areas", ["AI supports image recognition, speech tools, recommendations, forecasting, and robotics.", "Each application maps inputs to a decision, prediction, or generated response."]),
        ("Match method to task", ["Use classification for categories, regression for numeric estimates, and search for action sequences.", "A model is useful only when its output fits the real decision."]),
        ("Evaluate in context", ["Measure accuracy and also latency, cost, accessibility, and error impact.", "Test representative cases and keep a human review path for high-stakes decisions."]),
    ]),
    ("AI Fundamentals", "Intelligent Agents", [
        ("Agent and environment", ["An agent observes its environment through sensors and affects it through actions.", "A percept history helps the agent choose what to do next."]),
        ("Rational behavior", ["A rational agent selects actions expected to improve a stated performance measure.", "Its choices depend on available evidence, goals, and constraints."]),
        ("A simple agent loop", ["Observe the current state, select an action, act, and observe again.", "A thermostat is a small example: compare measured temperature with a target and switch heating."]),
    ]),
    ("AI Fundamentals", "Problem Solving in AI", [
        ("Define the problem", ["Specify an initial state, legal actions, a goal test, and action costs.", "A precise model prevents a search algorithm from solving the wrong task."]),
        ("Search a state space", ["Search explores states reachable from the start by applying valid actions.", "Breadth-first search is complete for finite branching and finds shallowest paths with equal step costs."]),
        ("Judge the solution", ["Check that the returned path reaches the goal and respects constraints.", "Compare solution quality and search cost, including time and memory."]),
    ]),
    ("AI Fundamentals", "Knowledge Representation", [
        ("Represent useful facts", ["A representation encodes entities, properties, relationships, and rules.", "Choose a form that supports the questions the system must answer."]),
        ("Rules and relationships", ["A rule can express an implication; a graph can express connected entities.", "Ontologies name concepts and relations so systems can share structured meaning."]),
        ("Reason carefully", ["Inference derives conclusions from stored facts and rules.", "Check missing knowledge, inconsistent rules, and uncertainty before treating a conclusion as certain."]),
    ]),
    ("AI Fundamentals", "Search Techniques", [
        ("Search as exploration", ["A search problem has a start state, actions, a goal test, and often path costs.", "The frontier stores discovered states waiting to be explored."]),
        ("Choose a strategy", ["Breadth-first search uses a queue and expands shallow states first.", "Depth-first search uses a stack and may use less memory; uniform-cost search expands the least-cost path."]),
        ("Prevent wasted work", ["Track visited states to avoid repeatedly exploring cycles.", "Compare completeness, optimality, time, and memory, then select a strategy that fits the problem."]),
    ]),
    ("AI Fundamentals", "AI Ethics and Responsible AI", [
        ("Identify possible harms", ["AI can amplify bias, expose private data, or make decisions that are hard to explain.", "Risk depends on who is affected and how an output is used."]),
        ("Build safeguards", ["Use representative data, document limitations, protect sensitive information, and test disparate outcomes.", "Provide understandable explanations and a way to challenge consequential decisions."]),
        ("Keep accountability", ["Assign people responsibility for monitoring, escalation, and correction.", "Reassess a system when its users, data, or operating environment change."]),
    ]),
    ("AI Fundamentals", "Real-World AI Systems", [
        ("A system is more than a model", ["Production AI combines data collection, preprocessing, a model, and an application interface.", "Monitoring and human processes are part of the system too."]),
        ("Follow the data path", ["Inputs are validated, transformed, and sent to a model for prediction.", "The application checks the result before presenting or acting on it."]),
        ("Operate responsibly", ["Track accuracy, latency, failures, and changes in input data.", "Use access controls, fallback behavior, and clear ownership to handle incidents."]),
    ]),
    ("AI Fundamentals", "AI Mini Project", [
        ("Frame a small problem", ["Choose one user need and define a measurable success criterion.", "Decide what the system predicts or recommends and what it must not do."]),
        ("Build a baseline", ["Prepare a small, permitted dataset and separate evaluation examples before tuning.", "Implement the simplest suitable method first, then compare alternatives fairly."]),
        ("Present evidence", ["Report test results, important errors, limitations, and next steps.", "A useful demonstration explains when the solution works and when a person should override it."]),
    ]),
    ("Python Programming", "Introduction to Python", [
        ("Run a Python program", ["Python executes source code through an interpreter.", "A script can define values, call functions, and display a result with print()."]),
        ("Read basic syntax", ["Indentation groups statements into blocks; colons introduce compound statements.", "Names refer to objects, and expressions combine values and operations."]),
        ("Build incrementally", ["Run a small example, inspect the output, then change one part at a time.", "Use clear names and error messages to make debugging easier."]),
    ]),
    ("Python Programming", "Variables and Data Types", [
        ("Names refer to values", ["Assignment binds a name to an object; it does not declare a fixed type.", "Use descriptive names such as student_count or is_active."]),
        ("Choose a suitable type", ["Integers and floats represent numbers; strings represent text; booleans represent true or false.", "Lists, tuples, and dictionaries organize collections."]),
        ("Inspect and convert", ["type(value) helps inspect an object's type.", "Convert deliberately, such as int(\"42\"); validate input because not every string can become a number."]),
    ]),
    ("Python Programming", "Operators and Expressions", [
        ("Combine values", ["Arithmetic operators calculate; comparisons produce booleans; and, or, and not combine conditions.", "The meaning of an operator depends on operand types."]),
        ("Respect precedence", ["Parentheses make evaluation order explicit.", "For example, (price * quantity) - discount communicates intent better than relying on precedence memory."]),
        ("Avoid surprising operations", ["The plus operator adds numbers but concatenates strings.", "Check types and test boundary values, especially when dividing or converting user input."]),
    ]),
    ("Python Programming", "Conditional Statements", [
        ("Branch on a condition", ["if runs a block when its condition is true.", "Use elif for another condition and else for the remaining case."]),
        ("Indent the branches", ["Python uses indentation to define each block.", "Keep related statements aligned and use consistent spaces so the control flow stays clear."]),
        ("Check boundary cases", ["Compare values such as zero, the threshold itself, and values just above or below it.", "Combine conditions with and or or only when the logic is readable."]),
    ]),
    ("Python Programming", "Loops", [
        ("Repeat with for", ["A for loop visits each item in an iterable.", "range(5) produces five integer values starting at zero."]),
        ("Repeat with while", ["A while loop continues while its condition remains true.", "Update the state inside the loop so it can eventually stop."]),
        ("Control and verify", ["break exits a loop; continue skips to the next iteration.", "Test empty collections and termination conditions to prevent off-by-one errors or infinite loops."]),
    ]),
    ("Python Programming", "Functions", [
        ("Define a reusable operation", ["def gives a function a name, parameters, and a body.", "Call it with arguments to reuse the behavior."]),
        ("Return a result", ["return sends a value back to the caller; print only displays text.", "Use parameters for inputs and return values for outputs."]),
        ("Keep scope clear", ["Local names belong to a function call unless explicitly returned or shared.", "Prefer small functions with one purpose and test them with representative inputs."]),
    ]),
    ("Python Programming", "Lists, Tuples and Dictionaries", [
        ("Select a collection", ["Lists are ordered and mutable; tuples are ordered and immutable.", "Dictionaries map unique keys to values for lookup by meaning."]),
        ("Access and update", ["Use list[index] for positional access and dict[key] for a mapping.", "Check whether a key exists before reading it, or use get() with a suitable default."]),
        ("Choose by operation", ["Use a list for a sequence you may change and a tuple for fixed grouped values.", "Use a dictionary when labels make lookups clearer than numeric positions."]),
    ]),
    ("Python Programming", "Object-Oriented Programming", [
        ("Model with classes", ["A class defines behavior and data; an object is an instance of that class.", "Methods operate on instance state through self."]),
        ("Encapsulate behavior", ["Keep related state and operations together behind a clear interface.", "Use composition when one object can use another without inheriting its identity."]),
        ("Use inheritance sparingly", ["A subclass can specialize a base class when the relationship is genuinely an is-a relationship.", "Prefer simple designs that are easy to test and extend."]),
    ]),
    ("Python Programming", "File Handling and Exceptions", [
        ("Use a context manager", ["with open(path, encoding=\"utf-8\") as file closes the file reliably.", "Choose a mode that matches whether you are reading, writing, or appending."]),
        ("Handle expected failures", ["try and except handle specific errors such as FileNotFoundError.", "Do not hide errors with a broad empty except block."]),
        ("Validate file content", ["Treat file data as untrusted input and validate its structure.", "Report useful context while preserving the original exception when a failure cannot be recovered."]),
    ]),
    ("Python Programming", "Python Mini Project", [
        ("Plan a small application", ["Define the user's task, required inputs, output, and success conditions.", "Split the work into functions for input, processing, and display."]),
        ("Implement and validate", ["Store records in appropriate collections and reject invalid input early.", "Test normal cases, empty data, and malformed values."]),
        ("Review the result", ["Run the project from a clean start and verify each expected behavior.", "Improve names, handle errors, and document limitations before adding optional features."]),
    ]),
    ("AI & Machine Learning", "Introduction to Machine Learning", [
        ("Learn patterns from examples", ["Machine learning fits a model to data so it can make predictions on new inputs.", "The target task determines what examples and labels are needed."]),
        ("Separate learning from testing", ["Training examples fit model parameters; validation helps choose settings.", "A held-out test set estimates performance on examples not used during selection."]),
        ("Check generalization", ["A model should perform on relevant unseen data, not merely memorize training examples.", "Compare it with a simple baseline and inspect its errors."]),
    ]),
    ("AI & Machine Learning", "Types of Machine Learning", [
        ("Supervised learning", ["Supervised learning uses examples paired with target labels or values.", "Classification predicts categories; regression predicts numeric values."]),
        ("Unsupervised learning", ["Unsupervised methods find structure without a supplied target.", "Clustering groups similar examples; dimensionality reduction summarizes features."]),
        ("Other feedback settings", ["Reinforcement learning learns actions from rewards and environment feedback.", "Choose a learning setup based on the data and the decision the system must make."]),
    ]),
    ("AI & Machine Learning", "Data Preparation", [
        ("Inspect before modeling", ["Check row counts, feature types, missing values, duplicates, and label quality.", "Look for leakage that would reveal information unavailable at prediction time."]),
        ("Transform consistently", ["Impute missing values, encode categories, and scale numeric features when the model needs it.", "Fit transformations on training data only."]),
        ("Split with care", ["Create train, validation, and test partitions that reflect how the model will be used.", "For time-dependent data, preserve chronological order."]),
    ]),
    ("AI & Machine Learning", "Linear Regression", [
        ("Predict a numeric value", ["Linear regression models a target as a weighted sum of input features.", "For one feature, the line is y equals intercept plus slope times x."]),
        ("Fit the coefficients", ["Training selects coefficients that reduce a chosen loss, often squared error.", "Feature scale and outliers can strongly affect the fitted result."]),
        ("Interpret and test", ["A coefficient describes an association under the model, not automatic proof of causation.", "Evaluate residuals and test error on data kept separate from fitting."]),
    ]),
    ("AI & Machine Learning", "Classification", [
        ("Predict a category", ["A classifier estimates a class or a score for each class.", "A decision threshold converts a score into a predicted label."]),
        ("Choose useful metrics", ["Accuracy can hide rare-class failures.", "Precision measures the share of positive predictions that are correct; recall measures the share of actual positives found."]),
        ("Set thresholds deliberately", ["A false positive and a false negative can have different costs.", "Choose a threshold using validation data and the intended use, then report the trade-off."]),
    ]),
    ("AI & Machine Learning", "Decision Trees", [
        ("Split feature space", ["A decision tree asks a feature question at each internal node.", "A path of answers ends at a leaf prediction."]),
        ("Select a split", ["Training can choose splits that reduce impurity, such as Gini impurity or entropy.", "Deeper trees can fit more detail but may overfit."]),
        ("Control complexity", ["Limit depth, require enough samples per leaf, or prune weak branches.", "Tune these choices on validation data and inspect the resulting rules."]),
    ]),
    ("AI & Machine Learning", "Clustering", [
        ("Group without labels", ["Clustering groups examples by a chosen notion of similarity.", "The method does not know whether its groups match a useful real-world category."]),
        ("Choose representation and distance", ["Feature scaling can change which examples appear close.", "K-means uses distances to centroids and requires the number of clusters in advance."]),
        ("Inspect the groups", ["Compare cluster sizes, representative examples, and stability under reasonable settings.", "Treat a cluster label as a summary, not a causal explanation."]),
    ]),
    ("AI & Machine Learning", "Model Evaluation", [
        ("Protect the test set", ["Use training data to fit, validation data to select, and test data for a final estimate.", "Repeatedly tuning on the test set makes the estimate optimistic."]),
        ("Choose task metrics", ["Use error measures for regression and class-sensitive metrics for classification.", "Report the baseline, metric definition, and evaluation population."]),
        ("Inspect failure modes", ["Break down errors by time period, subgroup, and important input conditions.", "A single score cannot establish fairness, safety, or deployment readiness."]),
    ]),
    ("AI & Machine Learning", "Feature Engineering", [
        ("Represent useful signals", ["Features convert raw data into inputs that expose patterns a model can use.", "Domain knowledge can guide units, categories, and meaningful combinations."]),
        ("Transform without leakage", ["Encode categories and scale numeric values using transformations fit on training data.", "Keep preprocessing inside the training pipeline."]),
        ("Validate each feature", ["Check whether a feature is available at prediction time and is permitted for its use.", "Compare validation performance and simplicity before keeping it."]),
    ]),
    ("AI & Machine Learning", "Machine Learning Mini Project", [
        ("Define the task", ["Write down the target, prediction time, users, and error costs.", "Choose an evaluation metric before comparing models."]),
        ("Build a reproducible pipeline", ["Split data first, fit preprocessing on training examples, then train a baseline model.", "Record the data version and settings used."]),
        ("Communicate responsibly", ["Evaluate once on held-out data and inspect errors, not only the headline score.", "State limitations and the evidence still needed before deployment."]),
    ]),
    ("Full Stack Development", "HTML Fundamentals", [
        ("Structure a document", ["HTML elements describe content and its meaning.", "A document typically contains metadata in head and visible content in body."]),
        ("Use semantic elements", ["Use headings in a logical hierarchy, and elements such as nav, main, and footer for page regions.", "Labels and alt text help accessible navigation."]),
        ("Connect content safely", ["Use links for navigation and buttons for actions.", "Associate form labels with inputs and validate submitted values on the server too."]),
    ]),
    ("Full Stack Development", "CSS Fundamentals", [
        ("Select and style elements", ["CSS rules pair selectors with declarations.", "A selector targets elements; properties such as color and padding set presentation."]),
        ("Understand the cascade", ["Specificity, source order, and importance determine which declarations apply.", "The box model includes content, padding, border, and margin."]),
        ("Organize styles", ["Use reusable classes and a consistent spacing scale.", "Inspect computed styles in developer tools when a rule is not applied as expected."]),
    ]),
    ("Full Stack Development", "Responsive Web Design", [
        ("Design for flexible space", ["Use fluid widths, flexible layouts, and content that can wrap.", "Set the viewport meta tag so mobile browsers use the device width."]),
        ("Add breakpoints when needed", ["Media queries adapt a layout when the content no longer fits.", "Choose breakpoints from the design, not from a fixed list of device models."]),
        ("Test real constraints", ["Check keyboard use, readable text, overflow, and touch targets at narrow widths.", "Responsive design should preserve content and functionality across screen sizes."]),
    ]),
    ("Full Stack Development", "JavaScript Fundamentals", [
        ("Work with values", ["JavaScript includes strings, numbers, booleans, arrays, objects, and functions.", "Use const by default and let when a binding must be reassigned."]),
        ("Control program flow", ["Conditions choose branches; loops repeat; functions package reusable behavior.", "Use strict equality when comparing values to avoid unexpected type coercion."]),
        ("Handle asynchronous work", ["Promises represent results that may arrive later.", "async and await make promise-based flows easier to read; handle rejected operations."]),
    ]),
    ("Full Stack Development", "DOM and Events", [
        ("Find and update elements", ["The DOM represents a document as objects that JavaScript can inspect and change.", "Use querySelector to select an element."]),
        ("Respond to events", ["addEventListener connects an event type with a handler.", "The handler can read input state and update the interface."]),
        ("Keep interactions safe", ["Prefer textContent for plain user-provided text instead of inserting it as HTML.", "Test keyboard interaction and remove listeners when component lifetimes require it."]),
    ]),
    ("Full Stack Development", "Node.js Fundamentals", [
        ("Run JavaScript on the server", ["Node.js provides a JavaScript runtime and APIs for files, networking, and processes.", "A package manifest describes dependencies and scripts."]),
        ("Understand asynchronous I/O", ["The event loop coordinates callbacks and promise continuations.", "Use asynchronous APIs for I/O instead of blocking the process."]),
        ("Structure a service", ["Split code into focused modules and handle configuration through environment variables.", "Validate input and return clear errors at application boundaries."]),
    ]),
    ("Full Stack Development", "Express.js", [
        ("Define routes", ["Express routes pair an HTTP method and path with a handler.", "Use route parameters for resource identifiers and query parameters for filters."]),
        ("Compose middleware", ["Middleware can validate input, authenticate a request, or add shared behavior.", "Call next only when control should continue, and handle errors centrally."]),
        ("Return a clear API response", ["Choose an appropriate status code and a consistent JSON shape.", "Protect private routes with server-side authorization checks."]),
    ]),
    ("Full Stack Development", "MongoDB and Mongoose", [
        ("Store documents", ["MongoDB stores flexible BSON documents inside collections.", "Model related data according to access patterns and consistency needs."]),
        ("Use Mongoose schemas", ["A Mongoose schema defines document paths, validation, defaults, and indexes.", "Models provide methods for creating and querying documents."]),
        ("Protect data integrity", ["Validate at the application boundary and in the schema where appropriate.", "Use indexes for common queries and avoid exposing private fields in API responses."]),
    ]),
    ("Full Stack Development", "REST API Development", [
        ("Model resources", ["A REST-style API exposes resources at stable URLs.", "Use HTTP methods to express read, create, update, and delete operations."]),
        ("Use status and data consistently", ["Return JSON with meaningful status codes and predictable error details.", "Validate identifiers and request fields before accessing stored data."]),
        ("Secure the boundary", ["Authenticate the caller and authorize each operation on the server.", "Document limits, pagination, and validation rules; never trust a client-side check alone."]),
    ]),
    ("Full Stack Development", "Full Stack Final Project", [
        ("Plan the application", ["Define user journeys, data entities, and API boundaries before implementation.", "Separate the user interface, server logic, and persistence responsibilities."]),
        ("Build one complete path", ["Implement a form, a validated API operation, and its database change.", "Handle loading, success, and error states in the interface."]),
        ("Verify the system", ["Test authorization, validation, persistence, and responsive behavior.", "Review logs and failure paths before presenting the project."]),
    ]),
    ("Cloud Architecture", "Lesson 1: Cloud Architecture Fundamentals", [
        ("Design around workloads", ["Cloud architecture combines compute, storage, networking, identity, and operations.", "Start with workload requirements, expected load, and data sensitivity."]),
        ("Choose managed building blocks", ["Managed services can reduce operational work but do not remove design responsibility.", "Set least-privilege access, observability, and resource boundaries."]),
        ("Balance trade-offs", ["Evaluate reliability, security, cost, and performance together.", "Document assumptions and test failure behavior before production."]),
    ]),
    ("Cloud Architecture", "Lesson 2: Containerization & Microservices", [
        ("Package an application", ["A container image packages an application with its runtime dependencies.", "A deployment runs that image with configuration supplied separately."]),
        ("Decompose with purpose", ["Microservices separate capabilities behind explicit interfaces.", "A service boundary can improve independent change but adds network and operations complexity."]),
        ("Operate safely", ["Version images, scan dependencies, restrict secrets, and monitor service health.", "Use timeouts and controlled retries to limit cascading failures."]),
    ]),
    ("Cloud Architecture", "Lesson 3: High Availability Databases", [
        ("Identify failure modes", ["High availability reduces service interruption during component or zone failures.", "List dependencies, recovery objectives, and acceptable data loss first."]),
        ("Replicate and recover", ["Replication can provide failover, while backups support recovery from corruption or deletion.", "Test restore procedures; a backup that has never been restored is unproven."]),
        ("Verify consistency and failover", ["Understand replication lag, write behavior, and failover impact on clients.", "Monitor health and rehearse recovery against the required recovery time and point objectives."]),
    ]),
]


def slug(value):
    value = value.lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value


def load_font(size, bold=False):
    candidates = [
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def wrap_text(draw, text, font, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and draw.textbbox((0, 0), candidate, font=font)[2] > max_width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def render_scene(course, lesson, lesson_number, lesson_total, scene_number, scene_title, bullets, frame_number):
    image = Image.new("RGB", (WIDTH, HEIGHT), "#071321")
    draw = ImageDraw.Draw(image)
    draw.ellipse((690, -220, 1110, 200), fill="#102b48")
    draw.ellipse((-260, 380, 160, 800), fill="#0b2238")
    draw.rounded_rectangle((38, 32, WIDTH - 38, 94), radius=16, fill="#0c1d30", outline="#1c3853", width=2)
    label_font = load_font(19, True)
    small_font = load_font(16)
    heading_font = load_font(31, True)
    draw.text((60, 49), course.upper(), font=label_font, fill="#38bdf8")
    lesson_label = f"LESSON {lesson_number:02d} / {lesson_total:02d}"
    label_width = draw.textbbox((0, 0), lesson_label, font=small_font)[2]
    draw.text((WIDTH - 62 - label_width, 53), lesson_label, font=small_font, fill="#94a3b8")

    draw.text((54, 118), lesson, font=heading_font, fill="#f8fafc")
    draw.rounded_rectangle((54, 166, WIDTH - 54, 468), radius=22, fill="#0b1c2d", outline="#203b56", width=2)
    draw.text((82, 190), f"{scene_number}. {scene_title}", font=load_font(25, True), fill="#a78bfa")

    available_height = 468 - 247 - 16
    gap = 18
    for font_size, line_height in ((24, 34), (22, 31), (20, 28), (18, 25), (16, 23)):
        body_font = load_font(font_size)
        wrapped_bullets = [wrap_text(draw, bullet, body_font, WIDTH - 202) for bullet in bullets]
        required_height = sum(len(lines) * line_height for lines in wrapped_bullets) + gap * (len(bullets) - 1)
        if required_height <= available_height:
            break

    reveal = min(len(bullets), 1 + (frame_number % (FPS * SCENE_SECONDS)) // (FPS * 2))
    y = 247
    for index, bullet in enumerate(bullets[:reveal]):
        draw.rounded_rectangle((84, y + 6, 96, y + 18), radius=6, fill="#38bdf8")
        for line in wrapped_bullets[index]:
            draw.text((118, y), line, font=body_font, fill="#e2e8f0")
            y += line_height
        y += gap

    draw.text((58, 488), "EDUTECH NEXUS  |  ORIGINAL EDUCATIONAL VIDEO  |  CC BY 4.0", font=small_font, fill="#94a3b8")
    bar_left, bar_right = 58, WIDTH - 58
    draw.rounded_rectangle((bar_left, 522, bar_right, 529), radius=3, fill="#183149")
    progress = ((scene_number - 1) + (frame_number % (FPS * SCENE_SECONDS)) / (FPS * SCENE_SECONDS)) / 3
    draw.rounded_rectangle((bar_left, 522, int(bar_left + (bar_right - bar_left) * progress), 529), radius=3, fill="#38bdf8")
    return np.asarray(image)


def create_video(entry, lesson_number):
    course, title, scenes = entry
    lesson_total = sum(1 for item in LESSONS if item[0] == course)
    relative_file = Path(slug(course)) / f"lesson-{lesson_number:02d}-{slug(title)}.mp4"
    destination = VIDEO_ROOT / relative_file
    destination.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg_path = None
    try:
        import imageio_ffmpeg
        ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as error:
        raise RuntimeError("Install imageio-ffmpeg to encode browser-compatible H.264 MP4 files.") from error

    process = subprocess.Popen(
        [
            ffmpeg_path, "-hide_banner", "-loglevel", "error", "-y",
            "-f", "rawvideo", "-pixel_format", "rgb24", "-video_size", f"{WIDTH}x{HEIGHT}",
            "-framerate", str(FPS), "-i", "pipe:0", "-an",
            "-c:v", "libx264", "-preset", "fast", "-crf", "27",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(destination),
        ],
        stdin=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    try:
        for scene_number, (scene_title, bullets) in enumerate(scenes, 1):
            for frame_number in range(FPS * SCENE_SECONDS):
                frame = render_scene(
                    course, title, lesson_number, lesson_total, scene_number, scene_title, bullets, frame_number
                )
                process.stdin.write(frame.tobytes())
        process.stdin.close()
        stderr = process.stderr.read().decode("utf-8", errors="replace")
        result = process.wait()
        if result != 0:
            raise RuntimeError(f"ffmpeg failed for {title}: {stderr.strip()}")
    except Exception:
        if process.poll() is None:
            process.kill()
            process.wait()
        raise

    if not destination.exists() or destination.stat().st_size < 5000:
        raise RuntimeError(f"Encoded file is missing or unexpectedly small: {destination}")
    return relative_file.as_posix(), destination.stat().st_size


def verify_video(path):
    cap = cv2.VideoCapture(str(path))
    try:
        if not cap.isOpened():
            return False, "OpenCV could not open the generated MP4"
        ok, frame = cap.read()
        if not ok or frame is None or frame.size == 0:
            return False, "No decodable video frame"
        duration = cap.get(cv2.CAP_PROP_FRAME_COUNT) / max(cap.get(cv2.CAP_PROP_FPS), 1)
        if duration < 10:
            return False, f"Unexpected duration: {duration:.2f}s"
        return True, f"Decodable video-only MP4, {duration:.1f}s"
    finally:
        cap.release()


def write_map_and_report(entries, generated):
    by_course = {}
    report_rows = []
    lesson_number = 0
    for course in dict.fromkeys(entry[0] for entry in entries):
        course_entries = [entry for entry in entries if entry[0] == course]
        by_course[course] = {}
        for number, entry in enumerate(course_entries, 1):
            lesson_number += 1
            _, title, _ = entry
            record = generated.get((course, title))
            if record and record["verified"]:
                record_data = {
                    "lessonTitle": title,
                    "videoFile": f"/videos/{record['file']}",
                    "license": LICENSE,
                    "licenseUrl": LICENSE_URL,
                    "licenseVerified": True,
                    "attribution": "EDUTECH NEXUS (original instructional outlines and locally rendered visuals)",
                    "sourcePage": "/videos/VIDEO-REPORT.md",
                    "changes": "Original instructional text and animated visuals rendered locally; no third-party video or footage.",
                    "status": "available",
                }
            else:
                record_data = {
                    "lessonTitle": title,
                    "videoFile": None,
                    "license": None,
                    "licenseUrl": None,
                    "licenseVerified": False,
                    "attribution": None,
                    "sourcePage": None,
                    "changes": None,
                    "status": "unavailable",
                }
            by_course[course][str(number)] = record_data
            if record and record["verified"]:
                status = "Generated; local H.264 file verified; browser playback pending"
                file_name = f"`{record['file']}` ({record['bytes']:,} bytes)"
                media_test = "Local decode passed; browser test pending"
            else:
                status = "Generation or local decode failed"
                file_name = "None"
                media_test = record.get("verification", "Not available") if record else "Not generated"
            report_rows.append(
                f"| {html.escape(course)} | {number} | {html.escape(title)} | "
                f"Original animated micro-lesson: {html.escape(title)} | "
                f"{html.escape(file_name)} | {LICENSE}; EDUTECH NEXUS | {status} | {media_test} |"
            )

    js = (
        "(function () {\n"
        f"  const generatedVideos = {json.dumps(by_course, ensure_ascii=False, indent=2)};\n"
        "  window.EDUTECH_LESSON_VIDEO_MAP = Object.freeze(\n"
        "    Object.fromEntries(Object.entries(generatedVideos).map(([course, lessons]) => [\n"
        "      course, Object.freeze(Object.fromEntries(Object.entries(lessons).map(([number, video]) => [\n"
        "        number, Object.freeze(video)\n"
        "      ])))\n"
        "    ]))\n"
        "  );\n"
        "})();\n"
    )
    MAP_PATH.write_text(js, encoding="utf-8")
    REPORT_PATH.write_text(
        "# EDUTECH NEXUS Lesson Video Report\n\n"
        f"Generated lesson videos: {sum(item['verified'] for item in generated.values())} / {len(entries)}. "
        "These are original, text-and-diagram animated micro-lessons rendered locally from the "
        "instructional outlines in `scripts/generate_lesson_videos.py`; they are not third-party source videos "
        "or voice-narrated lectures. Each video has three topic-specific visual scenes, is silent, and contains "
        "no narration. Review the content style before treating these concise explainers as a substitute for a "
        "full instructor-led lesson.\n\n"
        f"**License and attribution:** {LICENSE} ({LICENSE_URL}), assigned to these project-produced materials; "
        "EDUTECH NEXUS, original instructional outlines and locally rendered visuals. No external video footage, "
        "YouTube media, or downloaded third-party video is included.\n\n"
        "**Source-discovery note:** An exact-title Wikimedia Commons video search was attempted. Its API "
        "returned HTTP 429 after the initial requests, and no third-party file was integrated from that incomplete "
        "search. The generated originals are used instead; they do not represent web-discovered lectures.\n\n"
        "| Course | Lesson | Lesson title | Video title | Local file | License and attribution | Integration status | Playback test |\n"
        "|---|---:|---|---|---|---|---|---|\n"
        + "\n".join(report_rows)
        + "\n",
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser(description="Generate original course micro-lesson videos.")
    parser.add_argument("--course", help="Generate one course only.")
    parser.add_argument("--lesson", type=int, help="Generate one lesson number within --course.")
    args = parser.parse_args()

    if args.lesson and not args.course:
        parser.error("--lesson requires --course")

    counts = {}
    for course, title, scenes in LESSONS:
        counts[course] = counts.get(course, 0) + 1
        if len(scenes) != 3 or any(not bullets for _, bullets in scenes):
            raise RuntimeError(f"Each lesson needs three non-empty scenes: {course} / {title}")
    if len(LESSONS) != 43 or sorted(counts.values()) != [3, 10, 10, 10, 10]:
        raise RuntimeError(f"Expected 43 lessons across 5 courses; found {counts}")
    if len({(course, title) for course, title, _ in LESSONS}) != 43:
        raise RuntimeError("Course and lesson title pairs must be unique.")

    selected = []
    course_positions = {}
    for entry in LESSONS:
        course_positions[entry[0]] = course_positions.get(entry[0], 0) + 1
        number = course_positions[entry[0]]
        if args.course and entry[0] != args.course:
            continue
        if args.lesson and number != args.lesson:
            continue
        selected.append((number, entry))
    if args.course and args.course not in counts:
        parser.error(f"Unknown course: {args.course}")
    if args.lesson and not selected:
        parser.error(f"Lesson {args.lesson} was not found in {args.course}")

    generated = {}
    for number, entry in selected:
        relative_file, size = create_video(entry, number)
        path = VIDEO_ROOT / relative_file
        valid, verification = verify_video(path)
        generated[(entry[0], entry[1])] = {
            "file": relative_file,
            "bytes": size,
            "verified": valid,
            "verification": verification,
        }
        print(f"{entry[0]} | {number}. {entry[1]} | {size:,} bytes | {verification}", flush=True)

    if len(selected) == len(LESSONS):
        write_map_and_report(LESSONS, generated)
        print(f"Updated {MAP_PATH} and {REPORT_PATH}", flush=True)
    elif len(selected) == 1:
        print("Single-lesson generation check completed; manifest and report were not changed.", flush=True)
    else:
        print("Partial run: manifest and report were not changed.", flush=True)


if __name__ == "__main__":
    main()
