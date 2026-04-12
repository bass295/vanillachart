const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d', {
	alpha: false
});

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

async function loadBTCData() {
	try {
		const response = await fetch(`btc-data.json?timestamp=${Date.now()}`);
		if (!response.ok) throw new Error('Could not load BTC data');

		const data = await response.json();
		const dailyChange = data.bitcoin.daily_change_percent;

		btcTrend = dailyChange > 0 ? 'up' : 'down';

		if (dailyChange === 0) {
			btcTrend = 'easter';
		}

		// Calculate intensity (0 to 1) based on how far from 0
		// Cap at 5% for max intensity (can adjust this threshold)
		btcIntensity = Math.min(Math.abs(dailyChange) / 5, 1);
		btcIntensity = Math.max(btcIntensity, 0.1); // Floor at 10% minimum

		console.log(`BTC: ${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}% - Intensity: ${(btcIntensity * 100).toFixed(0)}%`);
	} catch (error) {
		console.warn('BTC data not loaded. Using default trend.', error);
		btcTrend = 'up';
	}
}

let btcTrend = 'up';
let btcIntensity = 0.5; // Default 50% intensity

// Load BTC data on page load
loadBTCData();

// ===== CANDLE ENGINE =====
const MAX_CANDLES = 40;
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

for (let i = 0; i < MAX_CANDLES; i++) {
	candles.push(createCandle());
}

// ===== RENDER LOOP =====
function render() {
	ctx.fillStyle = '#0a0a0a';
	ctx.fillRect(0, 0, width, height);

	// Color gets brighter based on intensity
	let color;
	if (btcTrend === 'up') {
		const saturation = 20 + btcIntensity * 80;
		color = `hsl(140, ${saturation}%, 45%)`;
	} else if (btcTrend === 'down') {
		const saturation = 20 + btcIntensity * 80;
		color = `hsl(0, ${saturation}%, 45%)`;
	} else {
		color = `#a855f7`;
	}

	for (let i = 0; i < candles.length; i++) {
		const c = candles[i];

		c.y -= c.speedY;
		c.wobble += c.wobbleSpeed;
		c.x += c.speedX + Math.sin(c.wobble) * 0.5;

		if (c.y < -150) {
			candles[i] = createCandle();
			candles[i].y = height + 100;
			continue;
		}

		if (c.x < -50) c.x = width + 50;
		if (c.x > width + 50) c.x = -50;

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

		// Glow
		ctx.shadowColor = color;
		ctx.shadowBlur = 12;
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

window.addEventListener('beforeunload', () => {
	if (animationId) cancelAnimationFrame(animationId);
});