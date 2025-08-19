// Script to populate localStorage with sample scoring data
// Paste this into browser console to add sample scores

console.log('🎯 Starting to populate scores...');

// Get existing data
const employees = JSON.parse(localStorage.getItem('hr_employees') || '[]');
const existingScores = JSON.parse(localStorage.getItem('hr_scores') || '{}');

// Generate scores for the last 30 days
const today = new Date();
const scores = { ...existingScores };

// Categories
const categories = ['VCT', 'ACT', 'RCT'];

// Generate scores for each product/employee
employees.forEach((employee, empIndex) => {
  console.log(`Adding scores for: ${employee.name}`);
  
  if (!scores[employee.id]) {
    scores[employee.id] = {};
  }
  
  // Generate scores for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Skip some days randomly to make it realistic
    if (Math.random() > 0.7) continue;
    
    if (!scores[employee.id][dateKey]) {
      scores[employee.id][dateKey] = {};
    }
    
    // Generate scores for each category
    categories.forEach(cat => {
      // Create realistic score patterns
      let baseScore = 6 + Math.sin((i + empIndex) / 5) * 2;
      
      // Add some variation per category
      if (cat === 'VCT') baseScore += 0.5;
      if (cat === 'ACT') baseScore -= 0.3;
      if (cat === 'RCT') baseScore += Math.random() - 0.5;
      
      // Add trend - scores improve over time
      baseScore += (30 - i) / 30;
      
      const score = Math.min(10, Math.max(1, Math.round(baseScore + Math.random())));
      
      scores[employee.id][dateKey][cat] = {
        score: score,
        performanceReport: `Sample performance data for ${date.toLocaleDateString()}:\n- Metric 1: ${Math.round(Math.random() * 100)}%\n- Metric 2: ${Math.round(Math.random() * 1000)} units\n- Metric 3: $${Math.round(Math.random() * 10000)}`,
        mediaBuyerReview: score >= 7 ? 'Excellent performance, exceeding targets' : score >= 5 ? 'Meeting expectations' : 'Needs improvement'
      };
    });
  }
});

// Save to localStorage
localStorage.setItem('hr_scores', JSON.stringify(scores));

console.log('✅ Scores populated successfully!');
console.log('Added scores for', employees.length, 'products');
console.log('Date range: last 30 days');
console.log('Categories: VCT, ACT, RCT');

// Show sample of what was added
const firstEmp = employees[0];
if (firstEmp) {
  const empScores = scores[firstEmp.id];
  const days = Object.keys(empScores).sort().slice(0, 5);
  console.log(`\nSample scores for "${firstEmp.name}":`);
  days.forEach(day => {
    const dayScores = empScores[day];
    console.log(`  ${day}: VCT=${dayScores.VCT?.score}, ACT=${dayScores.ACT?.score}, RCT=${dayScores.RCT?.score}`);
  });
}

console.log('\n🔄 Please refresh the page to see the new scores in the chart!');