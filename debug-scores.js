// Debug script to check scores structure
// Run this in browser console

console.log('=== CHECKING SCORES STRUCTURE ===');

const scores = localStorage.getItem('hr_scores');
const employees = localStorage.getItem('hr_employees');

if (scores) {
  const parsedScores = JSON.parse(scores);
  console.log('Full scores object:', parsedScores);
  
  // Check structure
  const employeeIds = Object.keys(parsedScores);
  console.log('Employee IDs in scores:', employeeIds);
  
  if (employeeIds.length > 0) {
    const firstEmpId = employeeIds[0];
    console.log(`\nFirst employee (${firstEmpId}) scores:`, parsedScores[firstEmpId]);
    
    const days = Object.keys(parsedScores[firstEmpId] || {});
    console.log('Days with scores:', days);
    
    if (days.length > 0) {
      console.log(`First day (${days[0]}) data:`, parsedScores[firstEmpId][days[0]]);
    }
  }
}

if (employees) {
  const parsedEmployees = JSON.parse(employees);
  console.log('\nEmployees (products):', parsedEmployees.map(e => ({
    id: e.id,
    name: e.name,
    category: e.category
  })));
}

// Check if we're in Creative tab (products)
console.log('\n=== CHECKING PRODUCT SCORES ===');
const products = JSON.parse(localStorage.getItem('hr_employees') || '[]');
const productScores = JSON.parse(localStorage.getItem('hr_scores') || '{}');

products.forEach(product => {
  if (productScores[product.id]) {
    console.log(`Product "${product.name}" (${product.id}) has scores:`, 
      Object.keys(productScores[product.id]).length, 'days');
  }
});