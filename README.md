# 🔗 BacklinkSpy - Competitor Backlink Analysis Tool

A modern, premium web application for analyzing competitor backlink profiles. Built with vanilla HTML, CSS, and JavaScript, featuring a sleek dark theme with glassmorphism effects.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- **Domain Analysis** - Enter any competitor domain to analyze their backlink profile
- **Real-time Statistics** - View total backlinks, referring domains, average DA, and dofollow ratio
- **Detailed Results Table** - See source domains, anchor texts, domain authority scores, and link types
- **CSV Export** - Export analysis results to CSV for further analysis
- **Filtering Options** - Filter by dofollow/nofollow links and include/exclude subdomains
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI** - Dark theme with glassmorphism effects and smooth animations

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/competitor-backlink-analysis-tool.git
   ```

2. Open `Index.html` in your browser

3. Enter a competitor domain and click "Analyze Backlinks"

## 📁 Project Structure

```
competitor-backlink-analysis-tool/
├── Index.html      # Main HTML structure
├── style.css       # Styling with CSS variables and animations
├── app.js          # Core application logic
└── README.md       # Documentation
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup structure
- **CSS3** - Custom properties, Flexbox, Grid, animations
- **JavaScript (ES6+)** - Modern vanilla JS with no dependencies
- **Font Awesome** - Icon library via CDN
- **Google Fonts** - Poppins font family

## 🎨 Design Features

- Dark theme with deep blue/purple gradients
- Glassmorphism card effects with backdrop blur
- Animated statistics counters
- Staggered row animations in results table
- Color-coded domain authority badges
- Toast notifications for user feedback
- Smooth hover transitions throughout

## 📊 How It Works

1. **Input Validation** - Validates domain format before processing
2. **Data Generation** - Simulates backlink data for demonstration (replace with real API)
3. **Statistics Calculation** - Calculates and displays key metrics
4. **Table Rendering** - Displays detailed backlink information with sorting
5. **Export Functionality** - Generates CSV download of results

## 🔧 Customization

### Adding Real API Integration

Replace the `generateBacklinkData()` function in `app.js` with actual API calls:

```javascript
async function fetchBacklinkData(domain) {
    const response = await fetch(`YOUR_API_ENDPOINT?domain=${domain}`);
    return await response.json();
}
```

### Changing Color Scheme

Modify CSS variables in `:root` selector in `style.css`:

```css
:root {
    --primary: #your-color;
    --secondary: #your-color;
    /* ... other variables */
}
```