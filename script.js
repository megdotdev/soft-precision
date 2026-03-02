let currentInput = "";
const display = document.getElementById("display");

function updateDisplay(value) {
    display.innerText = value || "0";
}

function appendNumber(num) {
    // Only allow one decimal
    if (num === '.' && currentInput.endsWith('.')) return;

    currentInput += num;
    updateDisplay(currentInput);
}

function appendOperator(op) {
    if (currentInput === "" && op !== "(") return;
    currentInput += ` ${op} `;
    updateDisplay(currentInput);
}

function clearDisplay() {
    currentInput = "";
    updateDisplay("0");
}

function calculate() {
    try {
        const tokens = tokenize(currentInput);
        if (!tokens) return;

        const rpn = shuntingYard(tokens);
        const result = evaluateRPN(rpn);

        if (isNaN(result) || !isFinite(result)) {
            throw new Error("Math Error");
        }

        updateDisplay(result);
        currentInput = result.toString();
    } catch (e) {
        updateDisplay("ERROR");
        currentInput = ""; 
    }
}

function toggleSign() {
    if (currentInput === "" || currentInput === "0") return;

    let tokens = currentInput.trim().split(" ");
    let lastToken = tokens[tokens.length - 1];

    if (!isNaN(lastToken) && lastToken !== "") {
        if (lastToken.startsWith("-")) {
            tokens[tokens.length - 1] = lastToken.substring(1);
        } else {
            tokens[tokens.length - 1] = "-" + lastToken;
        }
        
        currentInput = tokens.join(" ");
        updateDisplay(currentInput);
    }
}

function tokenize(str) {
    return str.match(/-?\d+\.?\d*|[+\-*/()]/g); // RegEx
}

function shuntingYard(tokens) {
    const outputQueue = [];
    const operatorStack = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

    tokens.forEach(token => {
        if (!isNaN(parseFloat(token))) {
			outputQueue.push(token);
		} else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.pop(); // Remove '('
        } else {
            while (operatorStack.length && 
                   operatorStack[operatorStack.length - 1] !== '(' &&
                   precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        }
    });

    while (operatorStack.length) {
        outputQueue.push(operatorStack.pop());
    }
    return outputQueue;
}

function evaluateRPN(tokens) {
    const stack = [];
    tokens.forEach(token => {
        if (!isNaN(token)) {
            stack.push(parseFloat(token));
        } else {
            const b = stack.pop();
            const a = stack.pop();
            switch (token) {
                case '+': stack.push(a + b); break;
                case '-': stack.push(a - b); break;
                case '*': stack.push(a * b); break;
                case '/': 
                    if (b === 0) throw new Error("DivByZero");
                    stack.push(a / b); 
                    break;
            }
        }
    });
    return stack[0];
}

// Keyboard Support (Recommended)

document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (/[0-9]/.test(key)) {
        appendNumber(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendOperator(key);
    } else if (key === '(' || key === ')') {
        appendOperator(key);
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === '.') {
        appendNumber('.');
    } else if (key === 'Backspace') {
        currentInput = currentInput.trim().slice(0, -1);
        updateDisplay(currentInput);
    }
});