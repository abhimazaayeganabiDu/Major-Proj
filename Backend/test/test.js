const codeSnippet = {
  "JAVASCRIPT": `const readline = require('readline');\n
    \nfunction addTwoNumbers(a, b) {\n
        // Write your code here\n


        // Return the sum of a and b\n
    }\n

    \nconst rl = readline.createInterface({\n
        input: process.stdin,\n
        output: process.stdout\n
    });\n
    \nlet inputLines = [];\n
    \nrl.on('line', (line) => {\n
        inputLines = line.split(' ');\n
        rl.close();\n}).on('close', () => {\n
            const a = parseInt(inputLines[0], 10);\n
            const b = parseInt(inputLines[1], 10);\n
            console.log(addTwoNumbers(a, b));
        \n});`,


  "PYTHON":
    "def add_two_numbers(a, b):\n    # Write your code here\n    # Return the sum of a and b\n    pass\n\nimport sys\ninput_line = sys.stdin.read()\na, b = map(int, input_line.split())\nprint(add_two_numbers(a, b))",


  "JAVA": "import java.util.Scanner;\n\npublic class Main {\n    public static int addTwoNumbers(int a, int b) {\n        // Write your code here\n        // Return the sum of a and b\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(addTwoNumbers(a, b));\n    }\n}",


  "C++": 
        `
        #include <stdc++.h>
        using namespace std;

        class solution {
            public:
                int addTwoNumbers(int a, int b) {\n
                    // Write your code here\n
                }
        };
    `
};
