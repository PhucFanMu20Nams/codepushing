/**
 * Comprehensive Testing Suite for Dynamic Filter Configuration
 * Tests API endpoints, caching, error handling, and performance
 */

class FilterSystemTester {
  constructor() {
    this.testResults = [];
    this.baseURL = 'http://localhost:5000/api';
    this.frontendURL = 'http://localhost:5174';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    this.testResults.push(logEntry);
    
    const emoji = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'performance': '⚡'
    };
    
    console.log(`${emoji[type]} ${message}`);
  }

  async runAllTests() {
    this.log('🧪 Starting Comprehensive Filter System Testing...', 'info');
    
    try {
      await this.testBackendAPI();
      await this.testFrontendAPI();
      await this.testPerformance();
      await this.testErrorHandling();
      await this.testCaching();
      await this.generateReport();
    } catch (error) {
      this.log(`Fatal error during testing: ${error.message}`, 'error');
    }
  }

  // **Phase 6.1: Backend API Testing**
  async testBackendAPI() {
    this.log('📡 Testing Backend API Endpoints...', 'info');
    
    const endpoints = [
      { 
        name: 'All Category Options', 
        url: `${this.baseURL}/products/category-options`,
        method: 'GET'
      },
      {
        name: 'Clothes Category Options',
        url: `${this.baseURL}/products/category-options/Clothes`,
        method: 'GET'
      },
      {
        name: 'Footwear Category Options',
        url: `${this.baseURL}/products/category-options/Footwear`,
        method: 'GET'
      },
      {
        name: 'Accessories Category Options',
        url: `${this.baseURL}/products/category-options/Accessories`,
        method: 'GET'
      },
      {
        name: 'Service Category Options',
        url: `${this.baseURL}/products/category-options/Service`,
        method: 'GET'
      },
      {
        name: 'Invalid Category (Error Test)',
        url: `${this.baseURL}/products/category-options/NonExistentCategory`,
        method: 'GET',
        expectEmpty: true
      }
    ];

    for (const endpoint of endpoints) {
      try {
        const startTime = performance.now();
        const response = await fetch(endpoint.url);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (response.ok) {
          const data = await response.json();
          
          // Validate response structure
          if (data.success && data.data) {
            this.log(`✅ ${endpoint.name}: ${response.status} (${responseTime.toFixed(2)}ms)`, 'success');
            
            // Log data details
            if (endpoint.expectEmpty) {
              const isEmpty = this.validateEmptyResponse(data.data);
              this.log(`   Empty response validation: ${isEmpty ? 'PASS' : 'FAIL'}`, isEmpty ? 'success' : 'warning');
            } else {
              this.validateResponseData(endpoint.name, data.data);
            }
          } else {
            this.log(`⚠️ ${endpoint.name}: Invalid response structure`, 'warning');
          }
        } else {
          this.log(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`, 'error');
        }
      } catch (error) {
        this.log(`❌ ${endpoint.name}: ${error.message}`, 'error');
      }
    }
  }

  validateEmptyResponse(data) {
    if (data.category) {
      const isEmpty = (!data.brands || data.brands.length === 0) &&
                      (!data.types || data.types.length === 0) &&
                      (!data.colors || data.colors.length === 0);
      return isEmpty;
    }
    return false;
  }

  validateResponseData(endpointName, data) {
    if (endpointName.includes('All Category')) {
      // Validate all category options structure
      if (data.categories && data.categoryOptions) {
        this.log(`   Categories found: ${data.categories.join(', ')}`, 'info');
        Object.entries(data.categoryOptions).forEach(([category, options]) => {
          const optionCount = (options.brands?.length || 0) + (options.types?.length || 0) + (options.colors?.length || 0);
          this.log(`   ${category}: ${optionCount} filter options`, 'info');
        });
      }
    } else {
      // Validate single category options
      const optionCounts = {
        brands: data.brands?.length || 0,
        types: data.types?.length || 0,
        colors: data.colors?.length || 0,
        styles: data.styles?.length || 0,
        subcategories: data.subcategories?.length || 0
      };
      
      this.log(`   Filter options: ${JSON.stringify(optionCounts)}`, 'info');
    }
  }

  // **Phase 6.2: Frontend API Testing**
  async testFrontendAPI() {
    this.log('💻 Testing Frontend API Service...', 'info');
    
    // Test if apiService is available
    if (typeof window !== 'undefined' && window.apiService) {
      const apiService = window.apiService;
      
      try {
        // Test category-specific options
        const categories = ['Clothes', 'Footwear', 'Accessories', 'Service'];
        
        for (const category of categories) {
          const startTime = performance.now();
          const response = await apiService.getCategorySpecificOptions(category);
          const endTime = performance.now();
          
          if (response.success) {
            this.log(`✅ Frontend API - ${category}: ${(endTime - startTime).toFixed(2)}ms`, 'success');
          } else {
            this.log(`❌ Frontend API - ${category}: ${response.error}`, 'error');
          }
        }
        
        // Test multiple category options
        const multiResponse = await apiService.getMultipleCategoryOptions(categories);
        if (multiResponse.success) {
          this.log(`✅ Frontend API - Multiple categories: Success`, 'success');
        }
        
      } catch (error) {
        this.log(`❌ Frontend API testing failed: ${error.message}`, 'error');
      }
    } else {
      this.log(`⚠️ Frontend API service not available in this context`, 'warning');
    }
  }

  // **Phase 6.3: Performance Testing**
  async testPerformance() {
    this.log('⚡ Testing Performance Metrics...', 'performance');
    
    const performanceTests = [
      {
        name: 'Cold Cache - All Category Options',
        test: () => fetch(`${this.baseURL}/products/category-options`)
      },
      {
        name: 'Single Category - Clothes',
        test: () => fetch(`${this.baseURL}/products/category-options/Clothes`)
      },
      {
        name: 'Single Category - Footwear',
        test: () => fetch(`${this.baseURL}/products/category-options/Footwear`)
      }
    ];

    for (const perfTest of performanceTests) {
      const times = [];
      const iterations = 3;
      
      for (let i = 0; i < iterations; i++) {
        try {
          const startTime = performance.now();
          const response = await perfTest.test();
          const endTime = performance.now();
          
          if (response.ok) {
            await response.json(); // Parse response
            times.push(endTime - startTime);
          }
        } catch (error) {
          this.log(`Performance test failed: ${error.message}`, 'error');
        }
      }
      
      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        this.log(`${perfTest.name}: avg ${avgTime.toFixed(2)}ms, min ${minTime.toFixed(2)}ms, max ${maxTime.toFixed(2)}ms`, 'performance');
      }
    }
  }

  // **Phase 6.4: Error Handling Testing**
  async testErrorHandling() {
    this.log('🚨 Testing Error Handling...', 'info');
    
    const errorTests = [
      {
        name: 'Invalid Category',
        url: `${this.baseURL}/products/category-options/InvalidCategory123`,
        expectStatus: 200, // Should return success with empty data
        shouldHaveEmptyData: true
      },
      {
        name: 'Malformed URL',
        url: `${this.baseURL}/products/category-options/`,
        expectStatus: 404
      },
      {
        name: 'Non-existent Endpoint',
        url: `${this.baseURL}/products/invalid-endpoint`,
        expectStatus: 404
      }
    ];

    for (const errorTest of errorTests) {
      try {
        const response = await fetch(errorTest.url);
        
        if (response.status === errorTest.expectStatus) {
          if (errorTest.shouldHaveEmptyData && response.ok) {
            const data = await response.json();
            const isEmpty = this.validateEmptyResponse(data.data);
            this.log(`✅ ${errorTest.name}: Handled correctly (empty data: ${isEmpty})`, 'success');
          } else {
            this.log(`✅ ${errorTest.name}: Expected status ${errorTest.expectStatus}`, 'success');
          }
        } else {
          this.log(`⚠️ ${errorTest.name}: Got ${response.status}, expected ${errorTest.expectStatus}`, 'warning');
        }
      } catch (error) {
        this.log(`❌ ${errorTest.name}: ${error.message}`, 'error');
      }
    }
  }

  // **Phase 6.5: Caching Testing**
  async testCaching() {
    this.log('🗄️ Testing Caching System...', 'info');
    
    try {
      // Test cold cache
      const startCold = performance.now();
      const coldResponse = await fetch(`${this.baseURL}/products/category-options/Clothes`);
      const coldTime = performance.now() - startCold;
      
      if (coldResponse.ok) {
        await coldResponse.json();
        this.log(`Cold cache request: ${coldTime.toFixed(2)}ms`, 'performance');
        
        // Test subsequent requests (should be faster if cached)
        const startWarm = performance.now();
        const warmResponse = await fetch(`${this.baseURL}/products/category-options/Clothes`);
        const warmTime = performance.now() - startWarm;
        
        if (warmResponse.ok) {
          await warmResponse.json();
          this.log(`Warm cache request: ${warmTime.toFixed(2)}ms`, 'performance');
          
          const improvement = ((coldTime - warmTime) / coldTime * 100);
          if (improvement > 0) {
            this.log(`Cache improvement: ${improvement.toFixed(1)}%`, 'success');
          }
        }
      }
    } catch (error) {
      this.log(`Cache testing failed: ${error.message}`, 'error');
    }
  }

  // **Generate Test Report**
  generateReport() {
    this.log('📊 Generating Test Report...', 'info');
    
    const summary = {
      total: this.testResults.length,
      success: this.testResults.filter(r => r.type === 'success').length,
      errors: this.testResults.filter(r => r.type === 'error').length,
      warnings: this.testResults.filter(r => r.type === 'warning').length,
      performance: this.testResults.filter(r => r.type === 'performance').length
    };
    
    this.log(`\n🎯 TEST SUMMARY:`, 'info');
    this.log(`   Total Tests: ${summary.total}`, 'info');
    this.log(`   Successful: ${summary.success}`, 'success');
    this.log(`   Errors: ${summary.errors}`, summary.errors > 0 ? 'error' : 'success');
    this.log(`   Warnings: ${summary.warnings}`, summary.warnings > 0 ? 'warning' : 'success');
    this.log(`   Performance Tests: ${summary.performance}`, 'performance');
    
    const successRate = (summary.success / (summary.total - summary.performance) * 100).toFixed(1);
    this.log(`   Success Rate: ${successRate}%`, parseFloat(successRate) > 90 ? 'success' : 'warning');
    
    return {
      summary,
      successRate: parseFloat(successRate),
      testResults: this.testResults
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FilterSystemTester;
} else if (typeof window !== 'undefined') {
  window.FilterSystemTester = FilterSystemTester;
}

console.log('🔧 Filter System Tester loaded. Run new FilterSystemTester().runAllTests() to execute comprehensive tests.');
