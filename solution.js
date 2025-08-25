const fs = require('fs');

// Convert from any base to decimal using BigInt for large numbers
function bigBaseToDecimal(value, base) {
    let result = 0n;  // BigInt zero
    const bigBase = BigInt(base);
    
    for (let i = 0; i < value.length; i++) {
        const digit = value[i];
        let digitValue;
        
        // Handle hex digits (a-f)
        if (digit >= 'a' && digit <= 'f') {
            digitValue = BigInt(digit.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
        } else if (digit >= 'A' && digit <= 'F') {
            digitValue = BigInt(digit.charCodeAt(0) - 'A'.charCodeAt(0) + 10);
        } else {
            digitValue = BigInt(digit);
        }
        
        result = result * bigBase + digitValue;
    }
    
    return result;
}

// Lagrange interpolation using BigInt
function lagrangeInterpolationBig(points) {
    let secret = 0n;
    
    for (let i = 0; i < points.length; i++) {
        const xi = points[i].x;
        const yi = points[i].y;
        
        let numerator = 1n;
        let denominator = 1n;
        
        for (let j = 0; j < points.length; j++) {
            if (i !== j) {
                const xj = points[j].x;
                numerator *= (0n - xj);    // (0 - xj)
                denominator *= (xi - xj);  // (xi - xj)
            }
        }
        
        // Calculate yi * numerator / denominator
        secret += yi * numerator / denominator;
    }
    
    return secret;
}

// Main function to solve with BigInt
function findSecretBig(filename) {
    try {
        console.log(`\n=== Processing ${filename} ===`);
        
        // Read JSON
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        const n = data.keys.n;
        const k = data.keys.k;
        
        console.log(`n = ${n}, k = ${k}`);
        
        // Extract and decode points
        const points = [];
        
        for (let key in data) {
            if (key !== 'keys') {
                const x = BigInt(key);
                const base = parseInt(data[key].base);
                const encodedValue = data[key].value;
                
                // Use BigInt conversion
                const y = bigBaseToDecimal(encodedValue, base);
                
                points.push({ x: x, y: y });
                console.log(`Point: (${x}, ${y}) from "${encodedValue}" base ${base}`);
            }
        }
        
        // Sort by x and take first k points
        points.sort((a, b) => a.x < b.x ? -1 : 1);
        const selectedPoints = points.slice(0, k);
        
        console.log(`\nUsing ${k} points for interpolation:`);
        selectedPoints.forEach(p => console.log(`(${p.x}, ${p.y})`));
        
        // Find secret
        const secret = lagrangeInterpolationBig(selectedPoints);
        
        console.log(`\n🔑 Constant (c): ${secret}`);
        console.log('='.repeat(50));
        
        return secret;
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

// Test the base conversion first
console.log("=== Testing BigInt Base Conversion ===");
console.log("Test 1: '111' base 2 =", bigBaseToDecimal("111", 2));
console.log("Test 2: '213' base 4 =", bigBaseToDecimal("213", 4)); 
console.log("Test 3: Large number from test case 2:");
console.log("'13444211440455345511' base 6 =", bigBaseToDecimal("13444211440455345511", 6));

// Solve both test cases
const secret1 = findSecretBig('input1.json');
const secret2 = findSecretBig('input2.json');

// Write output
const output = `SHAMIR SECRET SHARING RESULTS
=============================

Test Case 1:
Constant (c) (constant c): ${secret1}

Test Case 2: 
Constant (c) (constant c): ${secret2}

Note: Used BigInt for precision with large numbers
Algorithm: Lagrange Interpolation
Time: ${new Date().toISOString()}
`;

fs.writeFileSync('output.txt', output);
console.log('\n📝 Results saved to output.txt');

console.log('\n✅ FINAL RESULTS:');
console.log(`Test Case 1 Constant (c): ${secret1}`);
console.log(`Test Case 2 Constant (c): ${secret2}`);