from pathlib import Path

path = Path(r"src/app/(auth)/register/page.tsx")
text = path.read_text(encoding="utf-8")
old_start = '                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">'
start = text.index(old_start)
end = text.index('                  </div>', start) + len('                  </div>')
replacement = '''                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kimlik Turu *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick=lambda: None
                          className=""
                        >
                        </button>
                      </div>
                    </div>
                  </div>'''
text = text[:start] + replacement + text[end:]
path.write_text(text, encoding="utf-8")
