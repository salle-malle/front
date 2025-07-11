import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold mb-4">MyApp</h3>
            <p className="text-slate-400 mb-4">Next.js App Router를 사용한 모던 웹 애플리케이션</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">빠른 링크</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  소개
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  서비스
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  연락처
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">리소스</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/docs" className="hover:text-white transition-colors">
                  문서
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  블로그
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  지원
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">연락처</h4>
            <ul className="space-y-2 text-slate-400">
              <li>이메일: contact@myapp.com</li>
              <li>전화: 02-1234-5678</li>
              <li>주소: 서울시 강남구</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 MyApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
