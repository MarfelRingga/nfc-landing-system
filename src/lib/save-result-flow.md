```javascript
// Pseudo Code Flow: Simpan Hasil Photobooth dari Scan QR

function handleQRScan(event_id, user_id, file_url_from_qr) {
  
  // 1. Pastikan input tidak kosong
  if (!file_url_from_qr || !event_id || !user_id) {
    return { success: false, error: "Data tidak lengkap" };
  }

  // 2. Simpan original URL ke database
  const insertData = {
    event_id: event_id,
    user_id: user_id,
    file_url: file_url_from_qr,
    // created_at digenerate otomatis oleh DB
  };
  
  const savedRecord = database.table('results').insert(insertData);

  // 3. Generate link baru untuk diakses user
  const user_link = `/pb/${event_id}/result/${user_id}`;

  // 4. Return respon sukses
  return {
    success: true,
    data: {
      result_id: savedRecord.id,
      shareable_link: user_link
    }
  };
}
```
