import Cocoa
import WebKit
// usage: swift scripts/snap.swift <in.html> <out.png> [width] [scale]
// Renders a local HTML file in WebKit at the given CSS width (default 1280)
// and writes a full-page PNG at the given pixel scale (default 1, so a 1280 px
// page is a 1280 px image even on a Retina screen; pass 2 for a sharper, heavier file).
// WebKit only: headless Chrome hangs on this machine.
let a = CommandLine.arguments
guard a.count >= 3 else { print("usage: snap <in.html> <out.png> [width]"); exit(64) }
let inURL = URL(fileURLWithPath: a[1]), outURL = URL(fileURLWithPath: a[2])
let width = a.count > 3 ? (Double(a[3]) ?? 1280) : 1280
let scale = a.count > 4 ? (Double(a[4]) ?? 1) : 1
class D: NSObject, WKNavigationDelegate {
  var win: NSWindow!
  func webView(_ v: WKWebView, didFinish n: WKNavigation!) {
    // Wait for web fonts, then give layout a moment to settle.
    v.callAsyncJavaScript("await document.fonts.ready; return document.fonts.status", arguments: [:], in: nil, in: .page) { r in
      if case .success(let s) = r { print("fonts: \(s)") }
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { self.measure(v) }
    }
  }
  func measure(_ v: WKWebView) {
    v.evaluateJavaScript("Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))") { h, _ in
      let height = CGFloat((h as? NSNumber)?.doubleValue ?? 800)
      self.win.setContentSize(NSSize(width: width, height: height))
      v.frame = NSRect(x: 0, y: 0, width: width, height: height)
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { self.shoot(v, height) }
    }
  }
  func shoot(_ v: WKWebView, _ height: CGFloat) {
    let cfg = WKSnapshotConfiguration()
    cfg.rect = NSRect(x: 0, y: 0, width: width, height: height)
    cfg.afterScreenUpdates = true
    v.takeSnapshot(with: cfg) { img, err in
      guard let img = img, let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print("snapshot failed: \(err?.localizedDescription ?? "unknown")"); exit(1)
      }
      // Redraw at exactly width x height x scale pixels, whatever the screen's backing scale.
      let pw = Int((width * scale).rounded()), ph = Int((Double(height) * scale).rounded())
      guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: pw, pixelsHigh: ph, bitsPerSample: 8,
        samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0),
        let ctx = NSGraphicsContext(bitmapImageRep: rep) else { print("bitmap failed"); exit(1) }
      ctx.imageInterpolation = .high
      ctx.cgContext.draw(cg, in: CGRect(x: 0, y: 0, width: pw, height: ph))
      guard let png = rep.representation(using: .png, properties: [:]) else { print("encode failed"); exit(1) }
      do { try png.write(to: outURL) } catch { print("write failed: \(error)"); exit(1) }
      print("ok \(pw)x\(ph) -> \(outURL.path)")
      exit(0)
    }
  }
}
let app = NSApplication.shared
let win = NSWindow(contentRect: NSRect(x: 0, y: 0, width: width, height: 900), styleMask: [.titled], backing: .buffered, defer: false)
let wv = WKWebView(frame: win.contentView!.bounds)
win.contentView!.addSubview(wv)
let d = D(); d.win = win; wv.navigationDelegate = d
wv.loadFileURL(inURL, allowingReadAccessTo: inURL.deletingLastPathComponent())
DispatchQueue.main.asyncAfter(deadline: .now() + 120) { print("timeout"); exit(2) }
app.run()
