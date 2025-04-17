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
                "function greet(name) {\n  return `Hello, ${name}!`;\n}",
                "const numbers = [1, 2, 3];\nconst doubled = numbers.map(n => n * 2);",
                "class Person {\n  constructor(name) {\n    this.name = name;\n  }\n\n  greet() {\n    console.log(`Hello, ${this.name}`);\n  }\n}"
            ],
            python: [
                "def greet(name):\n    return f\"Hello, {name}!\"",
                "numbers = [1, 2, 3]\nsquared = [x**2 for x in numbers]",
                "class Person:\n    def __init__(self, name):\n        self.name = name\n\n    def greet(self):\n        print(f\"Hello, {self.name}\")"
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
                "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}",
                "type Person struct {\n    Name string\n    Age  int\n}\n\nfunc (p Person) Greet() {\n    fmt.Printf(\"Hello, my name is %s\\n\", p.Name)\n}",
                "func factorial(n int) int {\n    if n == 0 {\n        return 1\n    }\n    return n * factorial(n-1)\n}",
                "func main() {\n    nums := []int{1, 2, 3, 4, 5}\n    for i, num := range nums {\n        fmt.Printf(\"%d: %d\\n\", i, num)\n    }\n}",
                "func fetchData(url string) (string, error) {\n    resp, err := http.Get(url)\n    if err != nil {\n        return \"\", err\n    }\n    defer resp.Body.Close()\n    body, _ := io.ReadAll(resp.Body)\n    return string(body), nil\n}"
            ],
            html: [
                "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n  <h1>Welcome</h1>\n  <p>This is a paragraph.</p>\n</body>\n</html>",
                "<div class=\"container\">\n  <header>\n    <nav>\n      <ul>\n        <li><a href=\"#home\">Home</a></li>\n        <li><a href=\"#about\">About</a></li>\n      </ul>\n    </nav>\n  </header>\n</div>",
                "<form action=\"/submit\" method=\"post\">\n  <label for=\"username\">Username:</label>\n  <input type=\"text\" id=\"username\" name=\"username\">\n  <button type=\"submit\">Submit</button>\n</form>",
                "<table>\n  <tr>\n    <th>Name</th>\n    <th>Age</th>\n  </tr>\n  <tr>\n    <td>Alice</td>\n    <td>25</td>\n  </tr>\n</table>",
                "<article>\n  <h2>Blog Post</h2>\n  <p>Published on <time datetime=\"2023-05-15\">May 15</time></p>\n  <p>Content goes here...</p>\n</article>"
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
                "fn main() {\n    println!(\"Hello, world!\");\n}",
                "struct Point {\n    x: i32,\n    y: i32,\n}\n\nimpl Point {\n    fn new(x: i32, y: i32) -> Self {\n        Self { x, y }\n    }\n}",
                "fn factorial(n: u32) -> u32 {\n    match n {\n        0 => 1,\n        _ => n * factorial(n - 1),\n    }\n}",
                "let numbers = vec![1, 2, 3, 4, 5];\nlet squared: Vec<_> = numbers.iter().map(|n| n * n).collect();",
                "trait Greet {\n    fn greet(&self);\n}\n\nstruct Person;\n\nimpl Greet for Person {\n    fn greet(&self) {\n        println!(\"Hello!\");\n    }\n}"
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
            span.textContent = char === '\n' ? '↵\n' : 
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
