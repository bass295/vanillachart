// ===== CANVAS SETUP =====
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

let width, height;
let animationId;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

// ===== BTC TREND STATE =====
let btcTrend = 'up'; // Default to bullish

// Fetch BTC data from local JSON file (updated 3x daily by GitHub Actions)
async function loadBTCData() {
    try {
        const response = await fetch('./btc-data.json');
        if (!response.ok) throw new Error('Could not load BTC data');
        
        const data = await response.json();
        const dailyChange = data.bitcoin.daily_change_percent;
        
        // Update trend based on daily candle change (open vs close)
        btcTrend = dailyChange >= 0 ? 'up' : 'down';
        
        // Update UI with price and daily change
        const statusEl = document.getElementById('btc-status');
        const price = data.bitcoin.usd;
        
        statusEl.classList.add('show');
        statusEl.className = `btc-status show ${btcTrend}`;
        statusEl.innerHTML = `₿ $${price.toLocaleString('en-US', { maximumFractionDigits: 0 })} <br><small>${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}%</small>`;
        
        console.log(`BTC loaded: $${price} (${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}%) Daily - Trend: ${btcTrend}`);
    } catch (error) {
        console.warn('BTC data not available yet. Using default trend.', error);
        btcTrend = 'up';
    }
}

// Load BTC data on page load
loadBTCData();

// ===== CANDLE ENGINE =====
const MAX_CANDLES = 40; // Dense layer of movement
const candles = [];

function createCandle() {
    return {
        x: Math.random() * width,
        y: Math.random() * height * 1.5,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() * 1) + 1,
        bodyWidth: (Math.random() * 10) + 5,
        bodyHeight: (Math.random() * 50) + 25,
        wickHeight: (Math.random() * 100) + 50,
        opacity: (Math.random() * 0.7) + 0.25,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: (Math.random() * 0.03) + 0.01,
        phase: Math.random()
    };
}

// Initialize candles
for (let i = 0; i < MAX_CANDLES; i++) {
    candles.push(createCandle());
}

// ===== RENDER LOOP =====
function render() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    // Color based on BTC trend
    const color = btcTrend === 'up' ? '#10b981' : '#ef4444';
    
    for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        
        // Update position - always move upward
        c.y -= c.speedY;
        c.wobble += c.wobbleSpeed;
        c.x += c.speedX + Math.sin(c.wobble) * 0.5;
        
        // Recycle when off-screen top
        if (c.y < -150) {
            candles[i] = createCandle();
            candles[i].y = height + 100;
            continue;
        }
        
        // Wrap sides
        if (c.x < -50) c.x = width + 50;
        if (c.x > width + 50) c.x = -50;
        
        // ===== DRAW CANDLE =====
        
        // Wick
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = c.opacity * 0.7;
        ctx.lineWidth = 2.5;
        
        const wickTop = c.y - (c.wickHeight / 2);
        const wickBottom = c.y + (c.wickHeight / 2);
        
        ctx.moveTo(c.x, wickTop);
        ctx.lineTo(c.x, wickBottom);
        ctx.stroke();
        
        // Body
        ctx.fillStyle = color;
        ctx.globalAlpha = c.opacity * 0.95;
        const bodyTop = c.y - (c.bodyHeight / 2);
        ctx.fillRect(c.x - c.bodyWidth / 2, bodyTop, c.bodyWidth, c.bodyHeight);
        
        // Glow layers
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = c.opacity * 0.4;
        ctx.fillRect(c.x - c.bodyWidth / 2 - 2, bodyTop - 2, c.bodyWidth + 4, c.bodyHeight + 4);
        
        ctx.shadowBlur = 24;
        ctx.globalAlpha = c.opacity * 0.15;
        ctx.fillRect(c.x - c.bodyWidth / 2 - 4, bodyTop - 4, c.bodyWidth + 8, c.bodyHeight + 8);
        
        ctx.shadowBlur = 0;
    }
    
    ctx.globalAlpha = 1;
    animationId = requestAnimationFrame(render);
}

render();

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
});