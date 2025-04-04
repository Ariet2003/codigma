interface Parameter {
  name: string;
  type: string;
}

interface TaskMetadata {
  task_name: string;
  difficulty: string;
  description: string;
  function_name: string;
  inputs: Parameter[];
  outputs: Parameter[];
}

class BaseParser {
  protected problemName: string;
  protected functionName: string;
  protected inputFields: Parameter[];
  protected outputFields: Parameter[];
  protected difficulty: string;
  protected description: string;

  constructor(metadata: TaskMetadata) {
    this.problemName = metadata.task_name;
    this.functionName = metadata.function_name;
    this.inputFields = metadata.inputs;
    this.outputFields = metadata.outputs;
    this.difficulty = metadata.difficulty;
    this.description = metadata.description;
  }

  protected mapTypeToCpp(typeStr: string): string {
    const mapping: { [key: string]: string } = {
      "int": "int",
      "float": "float",
      "string": "std::string",
      "bool": "bool",
      "list<int>": "std::vector<int>",
      "list<float>": "std::vector<float>",
      "list<string>": "std::vector<std::string>",
      "list<bool>": "std::vector<bool>",
      "list<list<int>>": "std::vector<std::vector<int>>",
      "list<list<float>>": "std::vector<std::vector<float>>",
      "list<list<string>>": "std::vector<std::vector<std::string>>",
      "list<list<bool>>": "std::vector<std::vector<bool>>",
    };
    return mapping[typeStr] || "unknown";
  }

  protected mapTypeToRust(typeStr: string): string {
    const mapping: { [key: string]: string } = {
      "int": "i32",
      "float": "f64",
      "string": "String",
      "bool": "bool",
      "list<int>": "Vec<i32>",
      "list<float>": "Vec<f64>",
      "list<string>": "Vec<String>",
      "list<bool>": "Vec<bool>",
    };
    return mapping[typeStr] || "unknown";
  }

  protected mapTypeToJava(typeStr: string): string {
    const mapping: { [key: string]: string } = {
      "int": "int",
      "float": "float",
      "string": "String",
      "bool": "boolean",
      "list<int>": "List<Integer>",
      "list<float>": "List<Float>",
      "list<string>": "List<String>",
      "list<bool>": "List<Boolean>",
    };
    return mapping[typeStr] || "unknown";
  }
}

class ProblemDefinitionParser extends BaseParser {
  generateCpp(): string {
    const inputs = this.inputFields
      .map(field => `${this.mapTypeToCpp(field.type)} ${field.name}`)
      .join(", ");
    return `${this.mapTypeToCpp(this.outputFields[0].type)} ${this.functionName}(${inputs}) {
    // Здесь будет реализована логика
    return result;
}`;
  }

  generateJs(): string {
    const inputs = this.inputFields.map(field => field.name).join(", ");
    return `function ${this.functionName}(${inputs}) {
    // Здесь будет реализована логика
    return result;
}`;
  }

  generateRust(): string {
    const inputs = this.inputFields
      .map(field => `${field.name}: ${this.mapTypeToRust(field.type)}`)
      .join(", ");
    const outputType = this.mapTypeToRust(this.outputFields[0].type);
    return `fn ${this.functionName}(${inputs}) -> ${outputType} {
    // Здесь будет реализована логика
    result
}`;
  }

  generateJava(): string {
    const inputs = this.inputFields
      .map(field => `${this.mapTypeToJava(field.type)} ${field.name}`)
      .join(", ");
    return `public static ${this.mapTypeToJava(this.outputFields[0].type)} ${this.functionName}(${inputs}) {
    // Здесь будет реализована логика
    return result;
}`;
  }
}

class FullProblemDefinitionParser extends BaseParser {
  generateCpp(): string {
    const inputReads = this.inputFields.map((field, i) => {
      if (field.type.startsWith("list<list<")) {
        return `std::string line_${i};
std::getline(std::cin, line_${i});
std::istringstream iss_${i}(line_${i});
int outer_size_${field.name}; iss_${i} >> outer_size_${field.name};
${this.mapTypeToCpp(field.type)} ${field.name}(outer_size_${field.name});
for (int k_${i} = 0; k_${i} < outer_size_${field.name}; k_${i}++) {
    std::string inner_line_${i};
    std::getline(std::cin, inner_line_${i});
    std::istringstream inner_iss_${i}(inner_line_${i});
    int inner_size_${field.name}; inner_iss_${i} >> inner_size_${field.name};
    ${field.name}[k_${i}].resize(inner_size_${field.name});
    std::string elems_line_${i};
    std::getline(std::cin, elems_line_${i});
    std::istringstream elems_${i}(elems_line_${i});
    for (int j_${i} = 0; j_${i} < inner_size_${field.name}; j_${i}++) elems_${i} >> ${field.name}[k_${i}][j_${i}];
}`;
      } else if (field.type.startsWith("list<")) {
        return `std::string line_${i};
std::getline(std::cin, line_${i});
std::istringstream iss_${i}(line_${i});
int size_${field.name}; iss_${i} >> size_${field.name};
${this.mapTypeToCpp(field.type)} ${field.name}(size_${field.name});
std::string elems_line_${i};
std::getline(std::cin, elems_line_${i});
std::istringstream elems_${i}(elems_line_${i});
for (int j_${i} = 0; j_${i} < size_${field.name}; j_${i}++) elems_${i} >> ${field.name}[j_${i}];`;
      } else {
        return `std::string line_${i};
std::getline(std::cin, line_${i});
std::istringstream iss_${i}(line_${i});
${this.mapTypeToCpp(field.type)} ${field.name};
iss_${i} >> ${field.name};`;
      }
    }).join("\n  ");

    const outputType = this.mapTypeToCpp(this.outputFields[0].type);
    const funcCall = `${outputType} result = ${this.functionName}(${this.inputFields.map(field => field.name).join(", ")});`;
    const hasMatrixOutput = outputType.startsWith("std::vector<std::vector<");

    const matrixToStringFunc = hasMatrixOutput ? `
std::string matrixToString(const std::vector<std::vector<int>>& matrix) {
    std::ostringstream oss;
    for (const auto& row : matrix) {
        for (const auto& elem : row) {
            oss << elem << " ";
        }
        oss << "\\n";
    }
    return oss.str();
}` : "";

    return `#include <iostream>
#include <sstream>
#include <vector>
#include <string>
#include <algorithm>
${matrixToStringFunc}
##USER_CODE_HERE##

int main() {
  ${inputReads}
  ${funcCall}
  ${hasMatrixOutput ? "std::cout << matrixToString(result) << std::endl;" : "std::cout << result << std::endl;"}
  return 0;
}`;
  }

  generateJs(): string {
    const inputReads = this.inputFields.map(field => {
      if (field.type.startsWith("list<")) {
        return `const ${field.name} = (function() {
    const line = inputLines.shift();
    const size = parseInt(line.trim());
    const elems = inputLines.shift().trim().split(/\\s+/).map(Number);
    return elems.slice(0, size);
})();`;
      } else {
        return `const ${field.name} = parseInt(inputLines.shift().trim());`;
      }
    }).join("\n  ");

    const funcCall = `const result = ${this.functionName}(${this.inputFields.map(field => field.name).join(", ")});`;

    return `##USER_CODE_HERE##

const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const inputLines = input.trim().split('\\n');
${inputReads}
${funcCall}
console.log(result);`;
  }

  generateRust(): string {
    const inputReads = this.inputFields.map(field => {
      if (field.type.startsWith("list<")) {
        return `let mut input_line = String::new();
std::io::stdin().read_line(&mut input_line).expect("Failed to read line");
let size_${field.name}: usize = input_line.trim().parse().unwrap();
input_line.clear();
std::io::stdin().read_line(&mut input_line).expect("Failed to read line");
let ${field.name}: ${this.mapTypeToRust(field.type)} = input_line.trim()
    .split_whitespace()
    .take(size_${field.name})
    .map(|s| s.parse().unwrap())
    .collect();`;
      } else {
        return `let mut input_line = String::new();
std::io::stdin().read_line(&mut input_line).expect("Failed to read line");
let ${field.name}: ${this.mapTypeToRust(field.type)} = input_line.trim().parse().unwrap();`;
      }
    }).join("\n  ");

    const funcCall = `let result = ${this.functionName}(${this.inputFields.map(field => field.name).join(", ")});`;

    return `use std::io;

##USER_CODE_HERE##

fn main() {
    ${inputReads}
    ${funcCall}
    println!("{}", result);
}`;
  }

  generateJava(): string {
    const inputReads = this.inputFields.map(field => {
      if (field.type.startsWith("list<")) {
        const javaType = this.mapTypeToJava(field.type);
        return `int size_${field.name} = Integer.parseInt(scanner.nextLine().trim());
${javaType} ${field.name} = new ArrayList<>();
if(size_${field.name} > 0) {
    String[] parts = scanner.nextLine().trim().split("\\s+");
    for (String part : parts) {
        ${field.name}.add(Integer.parseInt(part));
    }
}`;
      } else {
        const javaType = this.mapTypeToJava(field.type);
        if (javaType === "int") {
          return `int ${field.name} = Integer.parseInt(scanner.nextLine().trim());`;
        } else {
          return `${javaType} ${field.name} = ${javaType}.valueOf(scanner.nextLine().trim());`;
        }
      }
    }).join("\n        ");

    const funcCall = `${this.mapTypeToJava(this.outputFields[0].type)} result = ${this.functionName}(${this.inputFields.map(field => field.name).join(", ")});`;

    return `import java.util.*;

public class Main {

    ##USER_CODE_HERE##

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        ${inputReads}
        ${funcCall}
        System.out.println(result);
        scanner.close();
    }
}`;
  }
}

export function generateProblemTemplates(metadata: TaskMetadata) {
  const parser = new ProblemDefinitionParser(metadata);
  const fullParser = new FullProblemDefinitionParser(metadata);

  return {
    cppTemplate: parser.generateCpp(),
    jsTemplate: parser.generateJs(),
    rustTemplate: parser.generateRust(),
    javaTemplate: parser.generateJava(),
    fullCpp: fullParser.generateCpp(),
    fullJs: fullParser.generateJs(),
    fullRust: fullParser.generateRust(),
    fullJava: fullParser.generateJava()
  };
} 