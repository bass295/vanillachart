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

// ===== CANDLE ENGINE =====
const MAX_CANDLES = 40; // Dense layer of movement
const candles = [];

function createCandle() {
    return {
        x: Math.random() * width,
        y: Math.random() * height * 1.5, // Can start slightly off-screen
        speedX: (Math.random() - 0.5) * 0.8, // Wider horizontal variation
        speedY: (Math.random() * 1) + 1, // Fast vertical movement
        bodyWidth: (Math.random() * 10) + 5,
        bodyHeight: (Math.random() * 50) + 25,
        wickHeight: (Math.random() * 100) + 50,
        opacity: (Math.random() * 0.7) + 0.25, // Much brighter
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: (Math.random() * 0.03) + 0.01,
        phase: Math.random() // For staggered effects
    };
}

// Initialize with random spread across entire viewport
for (let i = 0; i < MAX_CANDLES; i++) {
    candles.push(createCandle());
}

// ===== RENDER LOOP =====
function render() {
    // Clear background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    const color = '#10b981'; // Always green
    
    for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        
        // Update position - upward movement with wobble
        c.y -= c.speedY;
        c.wobble += c.wobbleSpeed;
        c.x += c.speedX + Math.sin(c.wobble) * 0.5; // Sine wave horizontal drift
        
        // Recycle when off-screen top
        if (c.y < -150) {
            candles[i] = createCandle();
            candles[i].y = height + 100;
            continue;
        }
        
        // Wrap sides for infinite horizontal loop
        if (c.x < -50) c.x = width + 50;
        if (c.x > width + 50) c.x = -50;
        
        // ===== DRAW CANDLE =====
        
        // Draw wick (thin vertical line - extends from top to bottom)
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = c.opacity * 0.7;
        ctx.lineWidth = 2.5;
        
        const wickTop = c.y - (c.wickHeight / 2);
        const wickBottom = c.y + (c.wickHeight / 2);
        
        ctx.moveTo(c.x, wickTop);
        ctx.lineTo(c.x, wickBottom);
        ctx.stroke();
        
        // Draw body (main rectangle)
        ctx.fillStyle = color;
        ctx.globalAlpha = c.opacity * 0.95;
        const bodyTop = c.y - (c.bodyHeight / 2);
        ctx.fillRect(c.x - c.bodyWidth / 2, bodyTop, c.bodyWidth, c.bodyHeight);
        
        // Bright glow for more visibility
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = c.opacity * 0.4;
        ctx.fillRect(c.x - c.bodyWidth / 2 - 2, bodyTop - 2, c.bodyWidth + 4, c.bodyHeight + 4);
        
        // Second glow layer for intensity
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
