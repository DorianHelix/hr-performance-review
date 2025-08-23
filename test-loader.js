// Test data loader for Creative Performance
(function() {
  // Initialize test types
  const testTypes = [
    {
      id: 'video-creative-test',
      key: 'VCT',
      name: 'Video Creative Test',
      short: 'Video',
      description: 'Video ad performance testing',
      iconName: 'Film',
      color: 'purple',
      allowedPlatforms: ['meta', 'tiktok', 'youtube'],
      order: 1
    },
    {
      id: 'static-creative-test',
      key: 'SCT',
      name: 'Static Creative Test',
      short: 'Static',
      description: 'Static image ad testing',
      iconName: 'Image',
      color: 'blue',
      allowedPlatforms: ['meta'],
      order: 2
    },
    {
      id: 'add-copy-test',
      key: 'ACT',
      name: 'Add Copy Test',
      short: 'Copy',
      description: 'Ad copy and text testing',
      iconName: 'FileText',
      color: 'green',
      allowedPlatforms: ['meta'],
      order: 3
    }
  ];

  // Initialize platform types
  const platformTypes = [
    {
      id: 'meta',
      name: 'Meta',
      description: 'Facebook & Instagram Ads',
      iconName: 'Facebook',
      color: 'blue',
      order: 1
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'TikTok Ads',
      iconName: 'Music',
      color: 'pink',
      order: 2
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'YouTube Ads',
      iconName: 'Youtube',
      color: 'red',
      order: 3
    }
  ];

  // Generate test scores for products
  const products = ['product_1', 'product_2', 'product_3', 'product_4', 'product_5', 'product_6', 'product_7', 'product_8', 'product_9', 'product_10'];
  
  const scores = {};

  // Generate random scores for each product/test/platform/date combination
  products.forEach(function(productId) {
    scores[productId] = {};
    
    testTypes.forEach(function(testType) {
      scores[productId][testType.id] = {};
      
      testType.allowedPlatforms.forEach(function(platformId) {
        scores[productId][testType.id][platformId] = {};
        
        // Generate scores for last 30 days
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateKey = year + '-' + month + '-' + day;
          
          // Random score between 3-10 (70% chance of having a score)
          if (Math.random() > 0.3) {
            scores[productId][testType.id][platformId][dateKey] = {
              score: Math.floor(Math.random() * 8) + 3,
              date: date.toISOString()
            };
          }
        }
      });
    });
  });

  // Save to localStorage
  localStorage.setItem('creativeTestTypes', JSON.stringify(testTypes));
  localStorage.setItem('creativePlatformTypes', JSON.stringify(platformTypes));
  localStorage.setItem('creativeScores', JSON.stringify(scores));

  console.log('SUCCESS: Test data loaded!');
  console.log('Test Types:', testTypes);
  console.log('Platform Types:', platformTypes);
  console.log('Sample scores loaded for products:', products);
  console.log('');
  console.log('IMPORTANT: Refresh the page (F5) to see the data!');
  
  return 'Data loaded! Press F5 to refresh the page!';
})();