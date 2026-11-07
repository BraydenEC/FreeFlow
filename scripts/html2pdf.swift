import Cocoa
import WebKit
// usage: html2pdf <in.html> <out.pdf>
let a = CommandLine.arguments
let inURL = URL(fileURLWithPath: a[1]), outURL = URL(fileURLWithPath: a[2])
class D: NSObject, WKNavigationDelegate {
  var win: NSWindow!
  func webView(_ v: WKWebView, didFinish n: WKNavigation!) {
    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
      let pi = NSPrintInfo.shared.copy() as! NSPrintInfo
      pi.paperSize = NSSize(width: 612, height: 792)
      pi.topMargin = 40; pi.bottomMargin = 40; pi.leftMargin = 40; pi.rightMargin = 40
      pi.horizontalPagination = .fit; pi.verticalPagination = .automatic
      pi.isHorizontallyCentered = false; pi.isVerticallyCentered = false
      pi.jobDisposition = .save
      pi.dictionary()[NSPrintInfo.AttributeKey.jobSavingURL] = outURL
      let op = v.printOperation(with: pi)
      op.showsPrintPanel = false; op.showsProgressPanel = false
      op.view?.frame = v.bounds
      op.runModal(for: self.win, delegate: self, didRun: #selector(self.done(_:success:ctx:)), contextInfo: nil)
    }
  }
  @objc func done(_ op: NSPrintOperation, success: Bool, ctx: UnsafeMutableRawPointer?) { print(success ? "ok" : "fail"); exit(success ? 0 : 1) }
}
let app = NSApplication.shared
let win = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 816, height: 1056), styleMask: [.titled], backing: .buffered, defer: false)
let wv = WKWebView(frame: win.contentView!.bounds)
win.contentView!.addSubview(wv)
let d = D(); d.win = win; wv.navigationDelegate = d
wv.loadFileURL(inURL, allowingReadAccessTo: inURL.deletingLastPathComponent())
DispatchQueue.main.asyncAfter(deadline: .now() + 120) { print("timeout"); exit(2) }
app.run()