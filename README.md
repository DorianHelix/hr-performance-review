# HR Weekly Performance Evaluation System

A modern React application for tracking employee performance with weekly evaluations, AI-powered insights, and comprehensive reporting.

## Features

- **Weekly Performance Tracking**: Score employees across multiple categories with weighted averages
- **Interactive Matrix View**: Visual performance matrix with expandable category details
- **AI-Powered Reviews**: Generate automated performance reviews based on scores and reports
- **Comprehensive Reporting**: Support for daily, weekly, and monthly reports
- **Data Export**: Export all data in JSON format for analysis
- **Local Storage**: All data persists locally in the browser
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd hr-performance-review
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Adding Employees

1. Use the "Add Employee" section in the right sidebar
2. Enter the employee name and click "Add"
3. For bulk additions, click "Quick bulk add..." and enter multiple names

### Setting Up Employee Details

1. Click the settings icon next to an employee name
2. Fill in department, role, seniority, and start date
3. New employees (first 3 months) will require daily reports

### Evaluating Performance

1. Click on any cell in the performance matrix to open the evaluation modal
2. Set scores for each category using sliders
3. Add reports (daily, weekly, monthly)
4. Write manager reviews
5. Generate AI-powered performance reviews

### Quick Scoring

1. Expand an employee row to see category details
2. Click on individual category cells for quick scoring
3. Use keyboard shortcuts: 1-9 for scores, 0 for 10, Backspace to delete

### Managing Categories

1. Click the settings icon in the "Evaluation Categories" section
2. Add, edit, or remove performance categories
3. Adjust category weights (must total 100%)

### Date Range and Filtering

1. Use the date pickers to set evaluation period
2. Use preset buttons for quick month navigation
3. Filter by performance tier to focus on specific performance levels
4. Adjust cell size for better visibility

## Performance Scale

- **Exceptional (9-10)**: Outstanding performance
- **Exceeds (7-8)**: Above expectations
- **Meets (5-6)**: Satisfactory performance
- **Needs Improvement (3-4)**: Below expectations
- **Unsatisfactory (1-2)**: Immediate action required

## Data Management

### Local Storage
All data is stored locally in your browser using localStorage. Data includes:
- Employee information
- Performance evaluations
- Category configurations
- Performance reviews

### Export Data
Click the "Export" button to download all data as a JSON file for backup or analysis.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Local Storage** - Data persistence

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please check the documentation or create an issue in the repository.