/*
  Canvas drawing for the Answer gates game, in world units (the component
  scales the canvas). Ported from the approved art mockup,
  docs/week6/mockup/game-art.html: character D, the little freelancer riding
  an open laptop, faceless on purpose so anyone can see themselves in it.

  Nothing here touches window or document at import time, so node can import
  it in the tests.
*/

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Faint contour lines, as on the rest of /demo. `still` freezes the drift. */
export function drawContours(ctx: CanvasRenderingContext2D, w: number, h: number, tMs: number, still: boolean) {
  const t = still ? 0 : tMs / 1000;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 1;
  for (let k = 0; k < 6; k++) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      const y = 50 + k * (h / 6) + Math.sin((x + t * 30 * (k % 2 ? 1 : -1)) / 90 + k) * 12;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The little freelancer, centred on (x, y), tilted by vertical speed.
 * `still` stops the scarf (reduced motion); `dim` draws it faded (blinking).
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vy: number,
  accent: string,
  tMs: number,
  opts: { still: boolean; dim: boolean },
) {
  const wave = opts.still ? 0 : Math.sin(tMs / 90) * 3;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(clamp(vy / 600, -0.5, 1.1) * 0.6);
  ctx.scale(0.9, 0.9);
  ctx.globalAlpha = opts.dim ? 0.45 : 1;

  // Scarf, blowing behind.
  ctx.fillStyle = accent;
  ctx.globalAlpha *= 0.85;
  ctx.beginPath();
  ctx.moveTo(-10, -14);
  ctx.bezierCurveTo(-22, -16, -26, -8 + wave, -40, -12 + wave);
  ctx.bezierCurveTo(-32, -4 + wave, -22, -6, -10, -9);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = opts.dim ? 0.45 : 1;

  // Laptop: base, then the screen tilted back.
  ctx.fillStyle = "#cfcfcf";
  ctx.beginPath();
  ctx.roundRect(-24, 10, 46, 5, 2);
  ctx.fill();
  ctx.save();
  ctx.translate(20, 12);
  ctx.rotate((-12 * Math.PI) / 180);
  ctx.translate(-20, -12);
  ctx.fillStyle = "#9a9a9a";
  ctx.beginPath();
  ctx.roundRect(18, -16, 5, 28, 2);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.globalAlpha *= 0.7;
  ctx.fillRect(16.5, -14, 2, 24);
  ctx.restore();

  // Hoodie and typing arm.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.roundRect(-14, -10, 18, 20, 7);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(2, -2);
  ctx.lineTo(16, 2);
  ctx.stroke();

  // Head and hood.
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(-5, -18, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-13, -20);
  ctx.quadraticCurveTo(-5, -30, 3, -20);
  ctx.closePath();
  ctx.fill();

  // Air under the laptop.
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, 19);
  ctx.lineTo(-10, 19);
  ctx.moveTo(-6, 21);
  ctx.lineTo(6, 21);
  ctx.stroke();
  ctx.restore();
}

/** A payment: white, with a dark "$", so it never matches a job colour. */
export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0a0a0a";
  ctx.font = "700 12px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", x, y + 0.5);
  ctx.restore();
}

/** The dashed accent outline that makes a gate read as a question. */
export function drawGateFrame(ctx: CanvasRenderingContext2D, x: number, w: number, h: number, accent: string) {
  ctx.save();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.07;
  ctx.fillRect(x - 8, 0, w + 16, h);
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = accent;
  ctx.setLineDash([4, 5]);
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 7.5, 0.5, w + 15, h - 1);
  ctx.restore();
}

/** An answer label in the middle of a gate opening. */
export function drawGateLabel(ctx: CanvasRenderingContext2D, cx: number, cy: number, label: string, accent: string) {
  ctx.save();
  ctx.font = "700 14px ui-sans-serif, system-ui, sans-serif";
  const tw = Math.max(44, ctx.measureText(label).width + 18);
  ctx.fillStyle = "#0b0f17";
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - tw / 2, cy - 13, tw, 26, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f5f5f5";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy + 0.5);
  ctx.restore();
}
