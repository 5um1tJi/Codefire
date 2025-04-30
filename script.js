document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const languageSelect = document.getElementById('language-select');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const newSnippetBtn = document.getElementById('new-snippet-btn');
    const codeDisplay = document.getElementById('code-display');
    const codeInput = document.getElementById('code-input');
    const wpmElement = document.getElementById('wpm');
    const accuracyElement = document.getElementById('accuracy');
    const timerElement = document.getElementById('timer');
    const errorsElement = document.getElementById('errors');
    const scoreElement = document.getElementById('score');
    const progressElement = document.getElementById('level-progress');
    const comboCounter = document.getElementById('combo-counter');
    const themeBtn = document.getElementById('theme-btn');
    const helpBtn = document.getElementById('help-btn');
    const resultsModal = document.getElementById('results-modal');
    const helpModal = document.getElementById('help-modal');
    const idleModal = document.getElementById('idle-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const closeHelpBtn = document.getElementById('close-help-btn');
    const closeIdleBtn = document.getElementById('close-idle-modal-btn');
    const finalWpmElement = document.getElementById('final-wpm');
    const finalAccuracyElement = document.getElementById('final-accuracy');
    const finalTimeElement = document.getElementById('final-time');
    const finalScoreElement = document.getElementById('final-score');
    const performanceComment = document.getElementById('performance-comment');
    const keys = document.querySelectorAll('.key');
    const typingContainer = document.getElementById('typing-container');

    // Audio Elements
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const completeSound = document.getElementById('complete-sound');

    // State variables
    let currentSnippet = '';
    let typedChars = 0;
    let correctChars = 0;
    let errors = 0;
    let startTime = null;
    let timerInterval = null;
    let idleTimer = null;
    let isPracticing = false;
    let currentTheme = localStorage.getItem('theme') || 'light';
    let currentPosition = 0;
    let combo = 0;
    let score = 0;
    let idleTimeout = 8000; // 8 seconds

    // Initialize the app
    init();

    // Event Listeners
    startBtn.addEventListener('click', startPractice);
    stopBtn.addEventListener('click', stopPractice);
    newSnippetBtn.addEventListener('click', loadNewSnippet);
    codeInput.addEventListener('input', checkTyping);
    codeInput.addEventListener('keydown', handleKeyDown);
    themeBtn.addEventListener('click', toggleTheme);
    helpBtn.addEventListener('click', showHelp);
    closeModalBtn.addEventListener('click', closeResultsModal);
    closeHelpBtn.addEventListener('click', closeHelpModal);
    closeIdleBtn.addEventListener('click', closeIdleModal);
    languageSelect.addEventListener('change', loadNewSnippet);

    // Initialize the app
    function init() {
        // Set the initial theme
        applyTheme(currentTheme);
        
        // Load the first snippet
        loadNewSnippet();
    }

    // Apply theme settings
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeBtn.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', theme);
    }

    // Toggle between light and dark theme
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
        
        // Force redraw of keyboard to update theme colors
        highlightNextKey();
    }

    // Load a new code snippet
    async function loadNewSnippet() {
        const language = languageSelect.value;
        
        // Hardcoded snippets for demo purposes
        const snippets = {
            javascript: [
                "function greetUser(username) {\n  if (!username) {\n    throw new Error('Username is required');\n  }\n  return `Hello, ${username}!`;\n}",
                "const fruits = ['apple', 'banana', 'cherry'];\nfruits.forEach(fruit => console.log(fruit));",
                "class Car {\n  constructor(brand) {\n    this.brand = brand;\n  }\n\n  honk() {\n    console.log(`${this.brand} goes beep!`);\n  }\n}",
                "async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}",
                "const user = {\n  name: 'Alice',\n  age: 30,\n  greet() {\n    console.log(`Hi, I'm ${this.name}`);\n  }\n};",
                "export function multiply(a, b) {\n  return a * b;\n}",
                "import { readFile } from 'fs/promises';\nconst content = await readFile('file.txt', 'utf-8');",
                "const settings = {\n  theme: 'dark',\n  notifications: true,\n  language: 'en'\n};",
                "document.querySelectorAll('button').forEach(btn => btn.disabled = false);",
                "const numbers = [5, 10, 15];\nconst total = numbers.reduce((sum, n) => sum + n, 0);",
                "function* idGenerator() {\n  let id = 0;\n  while (true) {\n    yield id++;\n  }\n}",
                "const regex = /^[a-z0-9]+@[a-z]+\\.[a-z]{2,3}$/;\nconsole.log(regex.test('user@example.com'));",
                "setTimeout(() => {\n  console.log('Time\'s up!');\n}, 2000);",
                "const map = new Map();\nmap.set('key', 'value');\nconsole.log(map.get('key'));",
                "(() => {\n  const message = 'Immediately Invoked Function Expression';\n  console.log(message);\n})();"
              ],
            python: [
                "def greet(name):\n    return f\"Hello, {name}!\"",
                "numbers = [1, 2, 3, 4]\nsquares = [n ** 2 for n in numbers]",
                "class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        print(f\"{self.name} makes a sound\")",
                "try:\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    print(\"Cannot divide by zero:\", e)",
                "import math\narea = math.pi * (5 ** 2)",
                "with open('data.txt', 'r') as file:\n    content = file.read()",
                "def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a, end=' ')\n        a, b = b, a + b",
                "names = {'Alice': 25, 'Bob': 30}\nfor name, age in names.items():\n    print(f\"{name} is {age} years old\")",
                "def factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n - 1)",
                "lambda_func = lambda x: x * 2\nprint(lambda_func(4))",
                "from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int",
                "def decorator(func):\n    def wrapper(*args, **kwargs):\n        print(\"Before function call\")\n        result = func(*args, **kwargs)\n        print(\"After function call\")\n        return result\n    return wrapper",
                "nums = [3, 6, 9, 12]\nfiltered = list(filter(lambda x: x % 3 == 0, nums))",
                "class CustomError(Exception):\n    pass\n\nraise CustomError(\"Something went wrong\")",
                "def generator():\n    yield 1\n    yield 2\n    yield 3\n\nfor value in generator():\n    print(value)"
              ],
            cpp: [
                "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}",
                "class Rectangle {\n    int width, height;\npublic:\n    Rectangle(int w, int h) : width(w), height(h) {}\n    int area() { return width * height; }\n};",
                "template <typename T>\nT max(T a, T b) {\n    return (a > b) ? a : b;\n}",
                "#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> nums {1, 2, 3};\n    std::sort(nums.begin(), nums.end());\n    return 0;\n}",
                "class Animal {\npublic:\n    virtual void speak() = 0;\n};\n\nclass Dog : public Animal {\npublic:\n    void speak() override { std::cout << \"Woof!\" << std::endl; }\n};",
                "#include <memory>\n\nint main() {\n    auto ptr = std::make_unique<int>(42);\n    std::cout << *ptr << std::endl;\n    return 0;\n}",
                "constexpr int factorial(int n) {\n    return (n <= 1) ? 1 : n * factorial(n - 1);\n}",
                "#include <string>\n#include <regex>\n\nbool validate_email(const std::string& email) {\n    const std::regex pattern(\"(\\\\w+)(\\\\.|_)?(\\\\w*)@(\\\\w+)(\\\\.(\\\\w+))+\");\n    return std::regex_match(email, pattern);\n}",
                "namespace Math {\n    constexpr double PI = 3.141592653589793;\n    \n    double circle_area(double radius) {\n        return PI * radius * radius;\n    }\n}"
            ],
            golang: [
                "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, Go!\")\n}",
                "func add(a int, b int) int {\n    return a + b\n}",
                "var name string = \"Gopher\"\nvar age int = 10",
                "numbers := []int{1, 2, 3, 4}\nfor i, num := range numbers {\n    fmt.Println(i, num)\n}",
                "type Person struct {\n    Name string\n    Age  int\n}",
                "func (p Person) Greet() {\n    fmt.Printf(\"Hi, I'm %s and I'm %d years old.\\n\", p.Name, p.Age)\n}",
                "if x := 10; x > 5 {\n    fmt.Println(\"x is greater than 5\")\n}",
                "m := map[string]int{\"Alice\": 30, \"Bob\": 25}\nfmt.Println(m[\"Alice\"])",
                "defer fmt.Println(\"This will run last\")\nfmt.Println(\"Start\")",
                "result, err := divide(10, 2)\nif err != nil {\n    fmt.Println(\"Error:\", err)\n}",
                "func divide(a, b int) (int, error) {\n    if b == 0 {\n        return 0, fmt.Errorf(\"division by zero\")\n    }\n    return a / b, nil\n}",
                "ch := make(chan int)\ngo func() {\n    ch <- 42\n}()\nfmt.Println(<-ch)",
                "for i := 0; i < 5; i++ {\n    fmt.Println(\"Counting:\", i)\n}",
                "const Pi = 3.1415\nconst Greeting = \"Hello\"",
                "switch day := \"Monday\"; day {\ncase \"Monday\":\n    fmt.Println(\"Start of the week\")\ncase \"Friday\":\n    fmt.Println(\"Weekend is near\")\ndefault:\n    fmt.Println(\"Just another day\")\n}"
              ],
            html: [
                "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n</body>\n</html>",
                "<h1>Welcome to My Website</h1>",
                "<a href=\"https://example.com\" target=\"_blank\">Visit Example</a>",
                "<img src=\"image.jpg\" alt=\"Sample Image\" width=\"300\" height=\"200\">",
                "<p>This is a <strong>paragraph</strong> with <em>emphasis</em>.</p>",
                "<ul>\n  <li>Item One</li>\n  <li>Item Two</li>\n  <li>Item Three</li>\n</ul>",
                "<ol>\n  <li>First</li>\n  <li>Second</li>\n</ol>",
                "<form action=\"/submit\" method=\"POST\">\n  <input type=\"text\" name=\"username\" placeholder=\"Enter name\">\n  <input type=\"submit\" value=\"Submit\">\n</form>",
                "<input type=\"checkbox\" id=\"agree\">\n<label for=\"agree\">I agree to the terms</label>",
                "<table>\n  <tr><th>Name</th><th>Age</th></tr>\n  <tr><td>Alice</td><td>25</td></tr>\n</table>",
                "<div class=\"container\">\n  <p>Content goes here</p>\n</div>",
                "<header>\n  <h1>Site Title</h1>\n</header>",
                "<nav>\n  <a href=\"#home\">Home</a>\n  <a href=\"#about\">About</a>\n</nav>",
                "<section>\n  <h2>About Us</h2>\n  <p>We build cool stuff.</p>\n</section>",
                "<video width=\"320\" height=\"240\" controls>\n  <source src=\"movie.mp4\" type=\"video/mp4\">\n  Your browser does not support the video tag.\n</video>"
              ],
            java: [
                "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}",
                "public class Calculator {\n    public int add(int a, int b) {\n        return a + b;\n    }\n}",
                "import java.util.ArrayList;\n\npublic class Example {\n    public static void main(String[] args) {\n        ArrayList<String> list = new ArrayList<>();\n        list.add(\"Java\");\n        System.out.println(list.get(0));\n    }\n}",
                "public abstract class Animal {\n    public abstract void makeSound();\n}\n\nclass Dog extends Animal {\n    public void makeSound() {\n        System.out.println(\"Woof!\");\n    }\n}",
                "interface Drawable {\n    void draw();\n}\n\nclass Circle implements Drawable {\n    public void draw() {\n        System.out.println(\"Drawing circle\");\n    }\n}",
                "import java.util.stream.IntStream;\n\npublic class StreamExample {\n    public static void main(String[] args) {\n        IntStream.range(1, 5).forEach(System.out::println);\n    }\n}",
                "public class Fibonacci {\n    public static int fib(int n) {\n        if (n <= 1) return n;\n        return fib(n-1) + fib(n-2);\n    }\n}",
                "import java.util.HashMap;\n\npublic class MapExample {\n    public static void main(String[] args) {\n        HashMap<String, Integer> map = new HashMap<>();\n        map.put(\"one\", 1);\n        System.out.println(map.get(\"one\"));\n    }\n}",
                "public class Singleton {\n    private static Singleton instance;\n    \n    private Singleton() {}\n    \n    public static Singleton getInstance() {\n        if (instance == null) {\n            instance = new Singleton();\n        }\n        return instance;\n    }\n}"
            ],
            php: [
                "<?php\n$name = 'Alice';\necho \"Hello, $name!\";\n?>",
                "<?php\nfunction factorial($n) {\n    return ($n <= 1) ? 1 : $n * factorial($n - 1);\n}\n?>",
                "<?php\nclass User {\n    private $name;\n    \n    public function __construct($name) {\n        $this->name = $name;\n    }\n    \n    public function greet() {\n        return \"Hello, \" . $this->name;\n    }\n}\n?>",
                "<?php\n$numbers = [1, 2, 3, 4, 5];\n$squared = array_map(function($n) { return $n * $n; }, $numbers);\n?>",
                "<?php\ntry {\n    $db = new PDO('mysql:host=localhost;dbname=test', 'user', 'pass');\n} catch (PDOException $e) {\n    die('Connection failed: ' . $e->getMessage());\n}\n?>",
                "<?php\ninterface Logger {\n    public function log($message);\n}\n\nclass FileLogger implements Logger {\n    public function log($message) {\n        file_put_contents('log.txt', $message, FILE_APPEND);\n    }\n}\n?>",
                "<?php\n$users = [\n    ['name' => 'Alice', 'age' => 25],\n    ['name' => 'Bob', 'age' => 30]\n];\n\nusort($users, function($a, $b) {\n    return $a['age'] <=> $b['age'];\n});\n?>",
                "<?php\n$router->get('/users', function() {\n    return User::all();\n});\n\n$router->post('/users', function($request) {\n    return User::create($request->getBody());\n});\n?>",
                "<?php\n$client = new GuzzleHttp\\Client();\n$response = $client->request('GET', 'https://api.example.com/users');\n$users = json_decode($response->getBody());\n?>"
            ],
            ruby: [
                "class Greeter\n    def initialize(name)\n        @name = name\n    end\n    \n    def greet\n        puts \"Hello, #{@name}!\"\n    end\nend",
                "5.times do |i|\n    puts \"Iteration #{i}\"\nend",
                "numbers = [1, 2, 3, 4, 5]\nsquares = numbers.map { |n| n ** 2 }",
                "def fibonacci(n)\n    n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2)\nend",
                "class Animal\n    def speak\n        puts \"Animal sound\"\n    end\nend\n\nclass Dog < Animal\n    def speak\n        puts \"Woof!\"\n    end\nend",
                "person = { name: 'Alice', age: 25 }\nputs person[:name]",
                "module MathHelper\n    def self.square(x)\n        x * x\n    end\nend",
                "require 'json'\n\njson_string = '{\"name\":\"Alice\"}'\ndata = JSON.parse(json_string)",
                "RSpec.describe Calculator do\n    describe '#add' do\n        it 'returns sum of two numbers' do\n            expect(Calculator.new.add(2, 3)).to eq(5)\n        end\n    end\nend",
                "class ApiClient\n    include HTTParty\n    base_uri 'api.example.com'\n    \n    def get_users\n        self.class.get('/users')\n    end\nend"
            ],
            rust: [
                "fn main() {\n    println!(\"Hello, Rust!\");\n}",
                "let x: i32 = 42;\nlet y = x + 8;\nprintln!(\"{}\", y);",
                "fn add(a: i32, b: i32) -> i32 {\n    a + b\n}",
                "let nums = vec![1, 2, 3];\nfor num in &nums {\n    println!(\"{}\", num);\n}",
                "struct Point {\n    x: f64,\n    y: f64,\n}",
                "impl Point {\n    fn distance(&self) -> f64 {\n        (self.x * self.x + self.y * self.y).sqrt()\n    }\n}",
                "enum Direction {\n    North,\n    South,\n    East,\n    West,\n}",
                "fn print_direction(dir: Direction) {\n    match dir {\n        Direction::North => println!(\"Up\"),\n        Direction::South => println!(\"Down\"),\n        _ => println!(\"Left or Right\"),\n    }\n}",
                "let name = String::from(\"Rustacean\");\nlet greeting = format!(\"Hello, {}!\", name);",
                "fn takes_ownership(s: String) {\n    println!(\"{}\", s);\n}",
                "fn gives_ownership() -> String {\n    String::from(\"Owned\")\n}",
                "fn borrow_str(s: &str) {\n    println!(\"{}\", s);\n}",
                "fn largest<T: PartialOrd>(list: &[T]) -> &T {\n    let mut largest = &list[0];\n    for item in list {\n        if item > largest {\n            largest = item;\n        }\n    }\n    largest\n}",
                "use std::fs::File;\nuse std::io::Error;\n\nfn open_file() -> Result<File, Error> {\n    File::open(\"data.txt\")\n}",
                "#[derive(Debug)]\nstruct User {\n    username: String,\n    email: String,\n}"
              ],
            sql: [
                "SELECT * FROM users WHERE age > 18;",
                "INSERT INTO products (name, price) VALUES ('Laptop', 999.99);",
                "UPDATE employees SET salary = salary * 1.1 WHERE department = 'Engineering';",
                "CREATE TABLE users (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    username VARCHAR(50) NOT NULL,\n    email VARCHAR(100) UNIQUE NOT NULL\n);",
                "SELECT u.username, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.id;",
                "BEGIN TRANSACTION;\nINSERT INTO accounts (user_id, balance) VALUES (1, 1000);\nUPDATE accounts SET balance = balance - 100 WHERE user_id = 2;\nCOMMIT;",
                "CREATE INDEX idx_user_email ON users(email);",
                "WITH ranked_products AS (\n    SELECT \n        product_id,\n        name,\n        price,\n        RANK() OVER (ORDER BY price DESC) as price_rank\n    FROM products\n)\nSELECT * FROM ranked_products WHERE price_rank <= 5;",
                "ALTER TABLE employees ADD COLUMN hire_date DATE;",
                "EXPLAIN ANALYZE SELECT * FROM orders WHERE created_at > '2023-01-01';"
            ]

            // ... other languages ...
        };

        if (snippets[language] && snippets[language].length > 0) {
            currentSnippet = snippets[language][Math.floor(Math.random() * snippets[language].length)];
            renderCodeDisplay(currentSnippet);
            resetPractice();
        } else {
            codeDisplay.textContent = "No snippets available for this language yet.";
        }
    }

    // Render the code display with the current snippet
    function renderCodeDisplay(snippet) {
        codeDisplay.innerHTML = '';
        snippet.split('').forEach(char => {
            const span = document.createElement('span');
            // Replace special characters with visible symbols
            span.textContent = char === '\n' ? '\n' : 
                             char === '\t' ? '⇥' : 
                             char === ' ' ? ' ' : char;
            codeDisplay.appendChild(span);
        });
    }

    // Start the typing practice
    function startPractice() {
        if (isPracticing) return;
        
        isPracticing = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        newSnippetBtn.disabled = true;
        codeInput.disabled = false;
        codeInput.value = '';
        
        // Auto-scroll to typing area
        typingContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        codeInput.focus();
        
        currentPosition = 0;
        combo = 0;
        score = 0;
        
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
        startIdleTimer();
        
        // Reset stats
        typedChars = 0;
        correctChars = 0;
        errors = 0;
        updateStats();
        updateCodeDisplay();
        highlightNextKey();
        
        // Visual feedback
        typingContainer.classList.add('zoom');
        setTimeout(() => typingContainer.classList.remove('zoom'), 300);
    }

    // Stop the practice session
    function stopPractice() {
        if (!isPracticing) return;
        finishPractice();
    }

    // Reset the practice session
    function resetPractice() {
        isPracticing = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        newSnippetBtn.disabled = false;
        codeInput.disabled = true;
        codeInput.value = '';
        
        clearInterval(timerInterval);
        clearTimeout(idleTimer);
        timerInterval = null;
        
        // Reset stats display
        wpmElement.textContent = '0';
        accuracyElement.textContent = '100%';
        timerElement.textContent = '0:00';
        errorsElement.textContent = '0';
        scoreElement.textContent = '0';
        comboCounter.classList.remove('show');
        
        // Reset code display highlighting
        const spans = codeDisplay.querySelectorAll('span');
        spans.forEach(span => {
            span.className = '';
        });
        
        // Reset keyboard highlights
        keys.forEach(key => {
            key.classList.remove('next-key');
            key.classList.remove('active');
        });
    }

    // Check the user's typing
    function checkTyping() {
        if (!isPracticing) return;
        
        resetIdleTimer();
        
        const inputText = codeInput.value;
        typedChars = inputText.length;
        currentPosition = typedChars;
        
        // Calculate correct characters and errors
        let currentCorrectChars = 0;
        let currentErrors = 0;
        
        for (let i = 0; i < typedChars; i++) {
            if (inputText[i] === currentSnippet[i]) {
                currentCorrectChars++;
            } else {
                currentErrors++;
            }
        }
        
        // Update combo counter
        if (currentErrors > 0) {
            combo = 0;
            comboCounter.classList.remove('show');
            if (wrongSound) wrongSound.play().catch(e => console.log("Audio error:", e));
        } else if (typedChars > correctChars) {
            combo++;
            if (combo > 3) {
                comboCounter.textContent = `${combo}x Combo!`;
                comboCounter.classList.add('show');
            }
            if (correctSound) correctSound.play().catch(e => console.log("Audio error:", e));
            
            // Add floating notification for combos
            if (combo % 5 === 0 && combo > 0) {
                createFloatingNotification(`${combo}x Combo!`, 'var(--success-color)');
            }
        }
        
        correctChars = currentCorrectChars;
        errors = currentErrors;
        
        // Update score (more points for longer combos)
        score = Math.floor(correctChars * (1 + combo/10));
        scoreElement.textContent = score;
        
        // Update progress
        const progress = Math.round((typedChars / currentSnippet.length) * 100);
        progressElement.style.width = `${progress}%`;
        
        // Update stats
        updateStats();
        updateCodeDisplay();
        highlightNextKey();
        
        // Check if practice is complete
        if (typedChars === currentSnippet.length) {
            finishPractice();
        }
    }

    // Handle keydown events for additional feedback
    function handleKeyDown(e) {
        if (!isPracticing) return;
        
        // Add visual feedback to the pressed key
        keys.forEach(key => {
            if (key.dataset.key === e.key || 
                (e.key === ' ' && key.dataset.key === ' ') ||
                (e.key === 'Tab' && key.dataset.key === '\t') ||
                (e.key === 'Enter' && key.dataset.key === '\n')) {
                key.classList.add('active');
                setTimeout(() => key.classList.remove('active'), 100);
            }
        });
    }

    // Update the statistics display
    function updateStats() {
        // Calculate WPM (5 characters = 1 word)
        const timeElapsed = (new Date() - startTime) / 60000; // in minutes
        const wpm = Math.round((correctChars / 5) / (timeElapsed || 0.0167)); // Prevent division by zero
        wpmElement.textContent = isNaN(wpm) ? '0' : wpm;
        
        // Calculate accuracy
        const accuracy = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 100;
        accuracyElement.textContent = `${accuracy}%`;
        
        // Update errors
        errorsElement.textContent = errors;
    }

    // Update the timer display
    function updateTimer() {
        const timeElapsed = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Update the code display with highlighting
    function updateCodeDisplay() {
        const inputText = codeInput.value;
        const spans = codeDisplay.querySelectorAll('span');
        
        spans.forEach((span, index) => {
            span.className = '';
            
            if (index < inputText.length) {
                if (inputText[index] === currentSnippet[index]) {
                    span.classList.add('correct');
                } else {
                    span.classList.add('incorrect');
                }
                
                if (index === inputText.length - 1) {
                    span.classList.add('current');
                } else {
                    span.classList.add('completed');
                }
            } else if (index === inputText.length) {
                span.classList.add('current');
            }
        });
    }

    // Highlight the next key to press on the virtual keyboard
    function highlightNextKey() {
        if (!isPracticing || currentPosition >= currentSnippet.length) return;
        
        const nextChar = currentSnippet[currentPosition];
        
        // Reset all keys
        keys.forEach(key => {
            key.classList.remove('next-key');
        });
        
        // Find and highlight the key
        keys.forEach(key => {
            if (key.dataset.key === nextChar || 
                (key.textContent.includes('Space') && nextChar === ' ') ||
                (key.textContent.includes('⇥') && nextChar === '\t') ||
                (key.textContent.includes('↵') && nextChar === '\n')) {
                key.classList.add('next-key');
            }
        });
    }

    // Finish the practice session
    function finishPractice() {
        clearInterval(timerInterval);
        clearTimeout(idleTimer);
        isPracticing = false;
        codeInput.disabled = true;
        
        if (completeSound) completeSound.play().catch(e => console.log("Audio error:", e));
        
        // Calculate final stats
        const timeElapsed = (new Date() - startTime) / 60000;
        const finalWpm = Math.round((correctChars / 5) / timeElapsed) || 0;
        const finalAccuracy = Math.round((correctChars / typedChars) * 100) || 0;
        const finalTime = timerElement.textContent;
        
        // Show results modal
        finalWpmElement.textContent = finalWpm;
        finalAccuracyElement.textContent = `${finalAccuracy}%`;
        finalTimeElement.textContent = finalTime;
        finalScoreElement.textContent = score;
        
        // Add performance comment
        let comment = "";
        if (finalWpm > 60) comment = "Legendary typing speed! 🤩";
        else if (finalWpm > 40) comment = "Great job! You're getting faster! 🚀";
        else if (finalWpm > 20) comment = "Good work! Keep practicing! 👍";
        else comment = "Practice makes perfect! Keep going! 💪";
        
        if (finalAccuracy < 80) comment += " Try to focus on accuracy next time!";
        
        performanceComment.textContent = comment;
        resultsModal.style.display = 'flex';
    }

    // Idle timer functions
    function startIdleTimer() {
        idleTimer = setTimeout(() => {
            if (isPracticing) {
                idleModal.style.display = 'flex';
                resetPractice();
            }
        }, idleTimeout);
    }

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        startIdleTimer();
    }

    // Modal functions
    function closeResultsModal() {
        resultsModal.style.display = 'none';
        loadNewSnippet();
    }

    function closeIdleModal() {
        idleModal.style.display = 'none';
        loadNewSnippet();
    }

    function showHelp() {
        helpModal.style.display = 'flex';
    }

    function closeHelpModal() {
        helpModal.style.display = 'none';
    }

    // Create floating notification
    function createFloatingNotification(text, color) {
        const notification = document.createElement('div');
        notification.className = 'floating-notification';
        notification.textContent = text;
        notification.style.color = color;
        notification.style.left = `${Math.random() * 80 + 10}%`;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 1000);
    }
});
