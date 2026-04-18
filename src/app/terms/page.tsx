import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F4F3EE] font-sans text-[#0c0e0b] selection:bg-[#a299af]/30">
      <nav className="w-full flex items-center justify-between py-6 px-6 md:px-12 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
            <img 
              src="https://i.ibb.co.com/20WNbGMp/favicon-192x192.png" 
              alt="rifelo Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight">rifelo</span>
        </Link>
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm font-medium text-[#0c0e0b]/70 hover:text-[#0c0e0b] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-24">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Syarat dan Ketentuan (Terms of Service)</h1>
        <p className="text-[#0c0e0b]/60 mb-12">Terakhir Diperbarui: 17 April 2026</p>

        <div className="space-y-10 leading-relaxed text-[#0c0e0b]/80">
          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">1. Penerimaan Syarat</h2>
            <p>
              Dengan mengakses dan menggunakan platform digital Rifelo, termasuk perangkat keras (hardware) gelang pintar NFC kami serta dashboard event, Anda secara tegas menyatakan telah membaca, memahami, dan menyetujui untuk terikat dengan seluruh syarat dan ketentuan penggunaan ini.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">2. Akun dan Keamanan</h2>
            <p className="mb-2">
              Layanan kami didesain untuk ranah privasi acara eksklusif. Oleh karena itu pengguna wajib:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Memberikan informasi pendaftaran (terutama nomor telepon) yang aktif, jujur, dan menjadi milik Anda yang sah guna proses autentikasi sistem kami.</li>
              <li>Menjaga kerahasiaan kata sandi/OTP dan tidak membagikan sesi akun kepada pihak ketiga mana pun.</li>
              <li>Melaporkan apabila terjadi kehilangan gelang nirkabel NFC Anda agar tim penyelenggara dapat cepat memblokir akses digital yang menautkannya kepada profil Anda.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">3. Penggunaan Gelang NFC (Hardware)</h2>
            <p>
              Produk fisik berupa gelang/smartband Rifelo disediakan "sebagaimana adanya" (<i>as is</i>). Pengguna dilarang keras mencoba membuka paksa sirkuit internal, menggandakan protokol transmisi sinyal, atau merekayasa balik (<i>reverse engineer</i>) identitas ID peranti nirkabel guna manipulasi akses acara. Segala kerusakan fisik eksternal, selain cacat pabrik pada penerimaan awal, tidak menjadi tanggung jawab Rifelo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">4. Batasan Tanggung Jawab (Limitation of Liability)</h2>
            <p>
              Meskipun platform Rifelo dirancang untuk <i>high-throughput scaling</i> untuk menyukseskan operasional Anda, kami tidak memberikan jaminan waktu-nyala server (<i>uptime</i>) bebas cacat secara mutlak (100%).
            </p>
            <p className="mt-2">
              Dalam hal terjadi kegagalan jaringan internet berskala masif, kendala konektivitas *cloud*, atau force majeure pada hari acara, Rifelo secara legal tidak dapat dimintai pertanggungjawaban atas potensi kerugian finansial tidak langsung, hilangnya data pengguna sementara, keterlambatan <i>check-in</i>, atau ketidaknyamanan operasional pihak penyelenggara (<i>Event Organizer</i>).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">5. Penggunaan yang Diperbolehkan</h2>
            <p>
              Layanan platform ini tidak boleh digunakan untuk merencanakan acara yang bertentangan dengan hukum dan perundang-undangan di negara penggunanya, aktivitas pembajakan, mengemis dana, ancaman siber, spam, pembentukan <i>Circle</i> fiktif untuk memindai port sistem, atau mengirim materi yang tidak etis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">6. Perubahan Layanan dan Regulasi</h2>
            <p>
              Kami memiliki hak penuh secara diskresioner untuk memodifikasi atau sekadar memperbarui fungsionalitas aplikasi dan pedoman kebijakan dari waktu ke waktu — baik via perbaikan perangkat lunak secara langsung atau via e-mail resmi (jika berstatus perubahan material) kepada para klien prioritas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">7. Hubungi Kami</h2>
            <p>
              Apabila terdapat pertanyaan khusus tentang rincian klausul layanan di atas, Anda dapat berdiskusi maupun berkirim surat elektronik melalui tim hukum dan dukungan kami pada alamat: <strong>support@rifelo.com</strong>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
