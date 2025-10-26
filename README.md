# Wallchain-Tracker

A simple and elegant web application to track user points across different projects on the Wallchain platform.

## Features

- 🔍 Search users by nickname
- 📊 View total points and project count
- 🏆 See user ranking
- 📋 Detailed breakdown of points per project
- 📱 Responsive design for mobile and desktop

## How to Use

1. Open `index.html` in a web browser
2. Enter your Wallchain nickname in the search box
3. Click "Search" or press Enter
4. View your detailed report with points breakdown for each project

## API

This tracker uses the Wallchain API:
```
https://api.wallchain.xyz/voices/points/paginated?pageSize=10&page=1
```

## Deployment

### GitHub Pages
1. Go to your repository settings
2. Navigate to "Pages" section
3. Select the branch (usually `main` or `master`)
4. Select `/ (root)` as the folder
5. Click "Save"
6. Your site will be available at `https://[username].github.io/Wallchain-Tracker/`

### Local Development
Simply open `index.html` in your web browser. No build process or dependencies required!

## File Structure

```
.
├── index.html    # Main HTML structure
├── style.css     # Styling and layout
├── script.js     # JavaScript functionality and API integration
├── demo.html     # Demo page with sample data
└── README.md     # Documentation
```

## Technologies Used

- HTML5
- CSS3 (with modern gradients and animations)
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## License

MIT