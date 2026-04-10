const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// --- STATE ---
// Change this to 'down' to see them turn red and fall!
let currentTrend = 'up'; 

const colors = {
    up: '#10B981',   // Bullish Green
    down: '#EF4444'  // Bearish Red
};

// --- OPTIMIZED CANDLE ENGINE (Object Pooling) ---
const MAX_CANDLES = 60; // Enough to fill the screen, lightweight for the GPU
const candles = [];

// Create a single candle with random properties
function createCandle(randomizeY = false) {
    return {
        x: Math.random() * width,
        // If randomizeY is true (on load), scatter them everywhere.
        // Otherwise, spawn them just off-screen based on the trend.
        y: randomizeY ? Math.random() * height : (currentTrend === 'up' ? height + 50 : -50),
        speed: (Math.random() * 1.2) + 0.3, // Varying speeds for depth
        bodyHeight: (Math.random() * 25) + 10,
        wickHeight: (Math.random() * 60) + 30,
        opacity: (Math.random() * 0.3) + 0.05 // Keep them faded and subtle
    };
}

// Initialize the pool once
for (let i = 0; i < MAX_CANDLES; i++) {
    candles.push(createCandle(true));
}

function drawChart() {
    ctx.clearRect(0, 0, width, height);
    
    const color = colors[currentTrend];

    for (let i = 0; i < candles.length; i++) {
        let c = candles[i];

        // 1. Move the candle based on the trend
        if (currentTrend === 'up') {
            c.y -= c.speed; // Float up
            // Recycle to bottom if it goes off top
            if (c.y < -100) candles[i] = createCandle(false); 
        } else {
            c.y += c.speed; // Fall down
            // Recycle to top if it goes off bottom
            if (c.y > height + 100) candles[i] = createCandle(false);
        }

        // 2. Draw the Wick
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = c.opacity;
        ctx.lineWidth = 1.5;
        
        // Center the wick
        const wickTop = c.y - (c.wickHeight / 2);
        const wickBottom = c.y + (c.wickHeight / 2);
        
        ctx.moveTo(c.x, wickTop);
        ctx.lineTo(c.x, wickBottom);
        ctx.stroke();

        // 3. Draw the Body
        ctx.fillStyle = color;
        const bodyTop = c.y - (c.bodyHeight / 2);
        
        // The body sits exactly in the middle of the wick
        ctx.fillRect(c.x - 3, bodyTop, 6, c.bodyHeight);
    }

    requestAnimationFrame(drawChart);
}

// Start the engine
drawChart();

// --- DEV TESTING TOGGLE ---
// Click the screen to instantly flip the trend and watch the physics reverse
document.body.addEventListener('click', () => {
    currentTrend = currentTrend === 'up' ? 'down' : 'up';
});