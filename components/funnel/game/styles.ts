import type { StyleId } from "@/lib/game/engine";

/*
  The four obstacle styles, ported from docs/week6/mockup/game-art.html.

  Cosmetic only: the engine decides every opening and hitbox, and each drawer
  just paints the wall piece it is handed. `edge` says which side faces the
  gap ("top": the gap is above this piece; "bottom": below it; "both": a
  gate's middle wall), and that side carries the detail: the paper invoice,
  the calendar page, the spike tip or the unread badge. Red marks only
  overdue pieces, as everywhere else on the site.

  Details that vary (an amount, a day) come from the piece's y and height,
  never its x, so they don't flicker as the column scrolls.
*/

export type Edge = "top" | "bottom" | "both";
export type WallDrawer = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  edge: Edge,
  overdue: boolean,
) => void;

const RED = "#ef4444";
const PAPER = "#e9e6df";
const pick = <T,>(items: readonly T[], y: number, h: number) => items[Math.abs(Math.round(y * 7 + h)) % items.length];

function paperLines(ctx: CanvasRenderingContext2D, x: number, y: number, widths: number[], gap: number) {
  ctx.strokeStyle = "rgba(0,0,0,0.33)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  widths.forEach((w, i) => {
    ctx.moveTo(x, y + i * gap);
    ctx.lineTo(x + w, y + i * gap);
  });
  ctx.stroke();
}

const invoices: WallDrawer = (ctx, x, y, w, h, edge, overdue) => {
  if (h <= 0) return;
  ctx.save();
  ctx.fillStyle = "#151515";
  ctx.fillRect(x, y, w, h);
  for (let yy = y + 2, i = 0; yy < y + h - 6; yy += 7, i++) {
    const off = ((i * 37) % 7) - 3;
    ctx.fillStyle = i % 2 ? "#202020" : "#1b1b1b";
    ctx.strokeStyle = "#2c2c2c";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(x + 2 + off, yy, w - 4, 6, 1);
    ctx.fill();
    ctx.stroke();
  }
  if (h >= 26) {
    const ey = edge === "top" ? y : edge === "bottom" ? y + h - 26 : y + h / 2 - 13;
    ctx.fillStyle = PAPER;
    ctx.beginPath();
    ctx.roundRect(x - 2, ey, w + 4, 26, 2);
    ctx.fill();
    paperLines(ctx, x + 6, ey + 9, [w - 20, w - 28], 6);
    ctx.fillStyle = "#000";
    ctx.font = "700 8px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`$${pick([300, 450, 650, 800, 1200], y, h)}`, x + w - 6, ey + 21);
  }
  if (overdue && h > 40) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((-18 * Math.PI) / 180);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-30, -9, 60, 18, 3);
    ctx.stroke();
    ctx.fillStyle = RED;
    ctx.font = "800 9px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("OVERDUE", 0, 0.5);
  }
  ctx.restore();
};

const calendar: WallDrawer = (ctx, x, y, w, h, edge, overdue) => {
  if (h <= 0) return;
  ctx.save();
  ctx.fillStyle = "#141414";
  ctx.strokeStyle = "#2c2c2c";
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.strokeStyle = "#222";
  ctx.beginPath();
  for (let yy = y + 5; yy < y + h - 4; yy += 5) {
    ctx.moveTo(x + 3, yy);
    ctx.lineTo(x + w - 3, yy);
  }
  ctx.stroke();
  const ph = Math.min(44, h);
  if (ph >= 30) {
    const py = edge === "top" ? y : edge === "bottom" ? y + h - ph : y + (h - ph) / 2;
    const d = Math.abs(Math.round(y * 7 + h)) % 5;
    ctx.fillStyle = PAPER;
    ctx.beginPath();
    ctx.roundRect(x - 2, py, w + 4, ph, 3);
    ctx.fill();
    ctx.fillStyle = overdue ? RED : "#3a3a3a";
    ctx.beginPath();
    ctx.roundRect(x - 2, py, w + 4, 12, [3, 3, 0, 0]);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 8px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(["MON", "TUE", "WED", "THU", "FRI"][d], x + w / 2, py + 9.5);
    ctx.fillStyle = "#111";
    ctx.font = "700 20px ui-serif, Georgia, serif";
    ctx.fillText(String(10 + d), x + w / 2, py + Math.min(35, ph - 6));
    if (overdue) {
      ctx.strokeStyle = RED;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + w / 2, py + Math.min(28, ph - 12), 13, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#777";
    for (const rx of [x + 12, x + w - 12]) {
      ctx.beginPath();
      ctx.arc(rx, py + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
};

const spikes: WallDrawer = (ctx, x, y, w, h, edge, overdue) => {
  if (h <= 0) return;
  const cx = x + w / 2;
  ctx.save();
  if (edge === "both") {
    ctx.fillStyle = "#151515";
    ctx.strokeStyle = "#2c2c2c";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#cfcfcf";
    ctx.beginPath();
    ctx.moveTo(cx, y - 8);
    ctx.lineTo(cx - 5, y + 4);
    ctx.lineTo(cx + 5, y + 4);
    ctx.moveTo(cx, y + h + 8);
    ctx.lineTo(cx - 5, y + h - 4);
    ctx.lineTo(cx + 5, y + h - 4);
    ctx.fill();
    ctx.restore();
    return;
  }
  const tipY = edge === "top" ? y : y + h;
  const baseY = edge === "top" ? y + h : y;
  const towardGap = edge === "top" ? -1 : 1;
  ctx.fillStyle = "#5a5a5a";
  ctx.beginPath();
  ctx.roundRect(x - 4, edge === "top" ? baseY - 6 : baseY, w + 8, 6, 2);
  ctx.fill();
  ctx.strokeStyle = "#bdbdbd";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  ctx.lineTo(cx, tipY);
  ctx.stroke();
  ctx.fillStyle = "#e5e5e5";
  ctx.beginPath();
  ctx.moveTo(cx, tipY + towardGap * 10);
  ctx.lineTo(cx - 4, tipY - towardGap * 2);
  ctx.lineTo(cx + 4, tipY - towardGap * 2);
  ctx.fill();
  const n = Math.max(0, Math.floor((h - 26) / 15));
  for (let i = 0; i < n; i++) {
    const ry = edge === "top" ? y + 20 + i * 15 : y + h - 30 - i * 15;
    ctx.save();
    ctx.translate(cx, ry);
    ctx.rotate(((((i * 53) % 15) - 7) * Math.PI) / 180);
    ctx.fillStyle = PAPER;
    ctx.beginPath();
    ctx.roundRect(-w / 2 - 2, -6, w + 4, 12, 1);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.33)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 4, -1.5);
    ctx.lineTo(w / 2 - 14, -1.5);
    ctx.moveTo(-w / 2 + 4, 2.5);
    ctx.lineTo(w / 2 - 22, 2.5);
    ctx.stroke();
    if (overdue && i === 0) {
      ctx.fillStyle = RED;
      ctx.font = "800 7px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("OVERDUE", w / 2 - 4, 3.5);
    }
    ctx.restore();
  }
  ctx.restore();
};

const inbox: WallDrawer = (ctx, x, y, w, h, edge, overdue) => {
  if (h <= 0) return;
  const bh = 20;
  const gap = 4;
  const n = Math.max(1, Math.floor((h + gap) / (bh + gap)));
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 12, y, w + 24, h);
  ctx.clip();
  for (let i = 0; i < n; i++) {
    const by = edge === "top" || edge === "both" ? y + i * (bh + gap) : y + h - bh - i * (bh + gap);
    const atEdge = i === 0 && edge !== "both";
    ctx.fillStyle = atEdge ? "#1f1f1f" : "#171717";
    ctx.strokeStyle = atEdge && overdue ? RED : "#2c2c2c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, by, w, bh, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(x + 10, by + bh / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 19, by + 7.5);
    ctx.lineTo(x + w - 9, by + 7.5);
    ctx.moveTo(x + 19, by + 12.5);
    ctx.lineTo(x + w - 17, by + 12.5);
    ctx.stroke();
  }
  if (overdue && edge !== "both") {
    const by = edge === "top" ? y : y + h - bh;
    const bx = x + w - 2;
    const cy = edge === "top" ? by + 9 : by + bh - 9;
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(bx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "800 9px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("47", bx, cy + 0.5);
  }
  ctx.restore();
};

export const STYLE_DRAWERS: Record<StyleId, WallDrawer> = { invoices, calendar, spikes, inbox };

export const STYLE_LABELS: Record<StyleId, string> = {
  invoices: "Invoice stacks",
  calendar: "Calendar pillars",
  spikes: "Bill spikes",
  inbox: "Notification towers",
};
